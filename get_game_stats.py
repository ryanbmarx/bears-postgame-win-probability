#!/usr/bin/env python

"""
Daemon to import play-by-play data from the SDI feeds, calculate win
probability and bake JSON to drive the front-end.

We do this in a separate process instead of just with cron because
it needs to happen more frequently than every minute.
"""

import argparse
from datetime import datetime
import gzip
import json
import logging
import lxml
import os.path
import requests
import sys
from StringIO import StringIO
import time

from boto.s3.connection import S3Connection, OrdinaryCallingFormat
from boto.s3.key import Key
from tarbell.contextmanagers import ensure_settings, ensure_project
from tarbell.s3 import S3Url

from sportsdirect.boxscore import BoxScoreFeed
from sportsdirect.fetch import HTTPFetcher
from sportsdirect.odds import OddsFeed, get_odds
from winprobability import (WinProbabilityFootballPlayByPlayFeed, calculate_winprobability)


def get_win_probability_data(feed):
    """
    Returns JSON-serializable object representing the win probability at each play
    """
    data = {
        'plays': [],
        'metadata': {}
    }
    feed.load()

    boxscore_feed = BoxScoreFeed(
        sport='football', league='NFL', season='2016-2017', competition=feed.competition)
    boxscore_feed.load()
    home_handicap = boxscore_feed.home_handicap
    print 'Setting home handicap to %s' % home_handicap

    data['metadata']['home'] = feed.home_team.name
    data['metadata']['away'] = feed.away_team.name
    data['metadata']['is_finished'] = boxscore_feed.is_finished

    for play in feed.plays:
        points = {'number': 0, 'team': None}
        for pe in play.play_events:
            if pe.points > 0:
                points['number'] = pe.points
                points['team'] = pe.team.name

        data['plays'].append({
            'description': play.description,
            'penalties': play.penalties,
            'prob': calculate_winprobability(feed, play, home_handicap),
            'score': feed.calculate_score_at_play(play.play_id),
            'quarter': play.period_number,
            'down': play.down,
            'distance': play.yards_to_go,
            'yardline': play.yard_line,
            'yardline_align': play.yard_line_align,
            'ep': feed.get_expected_points_from_signature(
                play.down, play.yards_to_go, feed.get_distance_to_endzone_at_play(play.play_id)),
            'possessor': play.possession.team.name,
            'seconds_remaining': play.seconds_remaining_in_game,
            'points': points,
            'reversed': play.play_reversed
            })
    print data['plays'][len(data['plays']) - 1]['score']
    return data


def write_output(data, path):
    """
    Write data to JSON file
    """
    with open(path, 'w+') as f:
        f.write(json.dumps(data))


def publish(output_file, target='staging'):
    """
    Publish a JSON file to an S3 bucket
    """
    with ensure_settings(None, []) as settings, ensure_project(None, []) as site:
        bucket_name = target
        try:
            bucket_url = S3Url(site.project.S3_BUCKETS[bucket_name])
        except KeyError:
            sys.stderr.write(
                "\nThere's no bucket configuration called '{0}' in "
                "tarbell_config.py.".format(bucket_name))
            sys.exit(1)

        # Get creds
        if settings.config:
            # If settings has a config section, use it
            try:
                kwargs = settings.config['s3_credentials'].get(bucket_url.root)
            except KeyError:
                kwargs = None

            if not kwargs:
                kwargs = {
                    'access_key_id': settings.config.get('default_s3_access_key_id'),
                    'secret_access_key': settings.config.get('default_s3_secret_access_key'),
                }

            if not kwargs.get('access_key_id') and not kwargs.get('secret_access_key'):
                # If no configuration exists, read from environment variables if possible
                kwargs = {
                    'access_key_id': os.environ["AWS_ACCESS_KEY_ID"],
                    'secret_access_key': os.environ["AWS_SECRET_ACCESS_KEY"],
                }

            if not kwargs.get('access_key_id') and not kwargs.get('secret_access_key'):
                sys.stderr.write('S3 access is not configured. Set up S3 with {0} to publish.\n'.format(
                    'tarbell configure'))
                sys.exit()


            upload_to_s3(output_file, bucket_url, **kwargs)



def upload_to_s3(path, bucket, access_key_id, secret_access_key):
    """
    Upload a single file to S3
    """
    if '.' in bucket:
        connection = S3Connection(access_key_id,
                secret_access_key,
                calling_format=OrdinaryCallingFormat())
    else:
        connection = S3Connection(access_key_id,
                                  secret_access_key)

    bucket_connection = connection.get_bucket(bucket.root)
    filename = os.path.basename(path)
    logging.info('Uploading %s' % filename)
    with open(path) as f:
        # TODO: Set cache control headers if needed
        options = {
            'Content-Type': 'text/json',
            'Content-Encoding': 'gzip',
        }
        fgz = StringIO()
        gzip_obj = gzip.GzipFile(filename=filename+'.gz', mode='wb', fileobj=fgz)
        gzip_obj.write(f.read())
        gzip_obj.close()

        fgz.seek(0)
        key = "{0}{1}".format(bucket.path, 'data/' + filename)
        print key
        #key = 'sports/football/bears/bearsbreakdown/2015/bears-win-probability/data/winprobability__46932.json'
        k = Key(bucket_connection)
        k.key = key
        k.set_contents_from_file(fgz, options, policy='public-read')
        print 'done'


def get_archive_path(path):
    """Get timestamped version of a file path"""
    dirname = os.path.realpath(os.path.dirname(path))
    filename = os.path.basename(path)
    root, ext = os.path.splitext(filename)
    timestamp = datetime.now().strftime("%Y%m%dT%H%M%S")
    archive_filename = root + "__" + timestamp + ext

    return os.path.join(dirname, archive_filename)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update win probability data files")
    parser.add_argument('competition', help=("SDI competition ID for the game for "
        " which we're calculating win probabilities"))
    parser.add_argument('--output-file',
        default=None,
        help=("Path to output file where data will be saved"))
    parser.add_argument('--interval', type=int, default=10,
            help=("Number of seconds between fetching updates from the "
                  "play-by-play feed"))
    parser.add_argument('--cycles', type=int, default=-1,
            help=("Number of times to run before quitting. Leave alone to run forever"))
    parser.add_argument('--season', default="2016-2017",
            help=("Season slug, needed to build URL for fetching SDI feeds"))
    parser.add_argument('--archive', action='store_true',
            help=("Save a timestamped copy of the data for debugging"))
    parser.add_argument('--target', default='staging',
            help=("Tarbell target (e.g. staging or production) where we'll "
                  " publish the data. Effectively, this will be an S3 bucket"))
    parser.add_argument
    args = parser.parse_args()

    output_file = args.output_file
    if output_file == None:
        output_file = os.path.join(os.path.realpath(os.path.dirname(__file__)),
                'data', 'winprobability__' + args.competition + '.json')

    game_feed = WinProbabilityFootballPlayByPlayFeed(
        sport='football', league='NFL', season=args.season,
            competition=args.competition)

    num_cycles = args.cycles

    try:
        sys.stderr.write("Starting play-by-play daemon.\n")
        while True:
            logging.info("Calculating win probability")
            try:
                data = get_win_probability_data(game_feed)
                logging.info("Writing win probability data to {0}".format(output_file))
                write_output(data, output_file)
                logging.info("Publishing win probability data to S3")
                publish(output_file, target=args.target)
                if args.archive:
                    archive_path = get_archive_path(output_file)
                    write_output(data, archive_path)
                    logging.error("Archiving win probability data to {}".format(
                        archive_path))
            except IndexError:
                logging.error("Error fetching feed, sleeping")
            except requests.exceptions.ConnectionError:
                logging.error("HTTP connection error: %s - pausing 2x")
                time.sleep(args.interval)
            except requests.exceptions.ContentDecodingError:
                logging.error("Content decoding error")
            except lxml.etree.XMLSyntaxError:
                logging.error("LXML Syntax error")
            except Exception, e:
                logging.error("Unanticipated exception: %s" % e)

            time.sleep(args.interval)
            if args.cycles != -1:
                num_cycles -= 1
                if num_cycles < 1:
                    break

    except KeyboardInterrupt:
        sys.stderr.write("Exiting by user request.\n")
        sys.exit(0)
