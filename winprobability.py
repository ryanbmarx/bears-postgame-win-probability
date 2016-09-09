from csv import DictReader
import json
import math
import os.path

import scipy.stats

from sportsdirect.base import Competition
from sportsdirect.boxscore import BoxScoreFeed
from sportsdirect.fetch import HTTPFetcher
from sportsdirect.odds import OddsFeed, get_odds
from sportsdirect.playbyplay import FootballPlayByPlayFeed


DATA_DIR = os.path.join(os.path.realpath(os.path.dirname(__file__)), 'data')
EP_DATA_PATH = os.path.join(DATA_DIR, 'football_ep_values.csv')


class WinProbabilityFootballPlayByPlayFeed(FootballPlayByPlayFeed):
    """
    Version of FootballPlayByPlayFeed with some additional utility methods
    for calculating win probability.
    """
    def get_distance_to_endzone_at_play(self, play_id):
        play = next(p for p in self.plays if p.play_id == play_id)
        if ((play.yard_line_align == 'home' and self.home_team.name == play.possession.team.name) or
                (play.yard_line_align == 'away' and
                    self.away_team.name == play.possession.team.name)):
            return 50 - play.yard_line + 50
        else:
            return play.yard_line

    def get_expected_points_from_signature(self, down, distance, yardline):
        """
        Load ep data as dict, look for this exact signature. If not found, look
        for closest match (presumably there will be 2 candidates for yardline).
        If a tie on yardline (1 3 yards too short; the other 3 yards too long, say)
        arbitrarily pick one to use. If no exact down/distance candidates exist,
        or they're more than 20 yards off, fuzz the distance value as well and look
        for best candidates with fuzzy distance and fuzzy yardline.
        """
        if not yardline:
            yardline = 0
        if not distance:
            distance = 0
        score_to_use = 'Markov EP'  # 'Markov EP', Recursive EP', 'Regressive EP'
        signature = '%s-%s-%s' % (down, distance, yardline)
        states = {}
        max_fuzz_distance = 15
        max_fuzz_yardline = 50
        with open(EP_DATA_PATH) as fh:
            reader = DictReader(fh)
            for line in reader:
                if line['State'] == signature:
                    return float(line[score_to_use])
                line_signature = '%s-%s-%s' % (line['Down'], line['DTG'], line['Ydline'])
                states[line_signature] = line
            # Fuzz both yardline and distance.
            # Should probably find best candidates independently of each other
            fuzz_distance = 1
            fuzz_yardline = 1
            while fuzz_distance <= max_fuzz_distance:
                while fuzz_yardline <= max_fuzz_yardline:
                    farther_farther_signature = '%s-%s-%s' % (
                        down,
                        int(distance + fuzz_distance),
                        int(yardline + fuzz_yardline))
                    farther_closer_signature = '%s-%s-%s' % (
                        down,
                        int(distance + fuzz_distance),
                        int(yardline - fuzz_yardline))
                    closer_farther_signature = '%s-%s-%s' % (
                        down,
                        int(distance - fuzz_distance),
                        int(yardline + fuzz_yardline))
                    closer_closer_signature = '%s-%s-%s' % (
                        down,
                        int(distance - fuzz_distance),
                        int(yardline - fuzz_yardline))
                    signatures = [
                        farther_farther_signature, farther_closer_signature,
                        closer_farther_signature, closer_closer_signature]
                    for sig in signatures:
                        if sig in states:
                            return float(states[sig][score_to_use])
                    fuzz_yardline += 1
                fuzz_distance += 1
        return 0

    def calculate_ep_adjusted_score_at_play(self, play_id):
        play = next(p for p in self.plays if p.play_id == play_id)
        score = self.calculate_score_at_play(play_id)
        yardline = self.get_distance_to_endzone_at_play(play_id)
        if play.yards_to_go is None:
            play.yards_to_go = yardline
        ep = self.get_expected_points_from_signature(play.down, play.yards_to_go, yardline)
        if play.possession.team.name == self.home_team.name:
            score['home'] += ep
        else:
            score['away'] += ep
        return score


def calculate_winprobability(game_feed, play, home_handicap):
    """
    Calculation taken from http://www.pro-football-reference.com/about/win_prob.htm, with
    Expected Points data from http://www.drivebyfootball.com/2012/08/modifying-markov-model.html

    In Excel-speak, the formula (for the home team) is:

    (1 -
        NORMDIST(
            ((away_margin) + 0.5),
            (-home_vegas_line * (minutes_remaining / 60)),
            (13.45 / SQRT((60 / minutes_remaining))),
            TRUE
        )
    )
    +
    (0.5 * (
        NORMDIST(
            ((away_margin) + 0.5),
            (-home_vegas_line * (minutes_remaining / 60)),
            (13.45 / SQRT((60 / minutes_remaining))),
            TRUE
        ) - NORMDIST(
            ((away_margin) - 0.5),
            (-home_vegas_line * (minutes_remaining / 60)),
            (13.45 / SQRT((60 / minutes_remaining))),
            TRUE
        ))
    )

    This represents the probability the home team wins by 1 point or more, plus the probability a
    tie occurs (in which case they have a 50% chance to win, which seems sketchy to me but hey...)

    However, we first need to adjust the away_margin to account for the current set of in-game
    circumstances (down, field possession, ball, etc). To do that, use those circumstances to
    find the best-fitting expected-points situation and the resulting EP value, and add or
    subtract that to the current margin as necessary.

    Note that we'll only need to calculate win probability for the home team, since that will
    also give us the probability for the away team.
    """
    pat_play_types = ['failed_one_point_conversion', 'failed_two_point_conversion',
                      'one_point_conversion', 'two_point_conversion']
    kickoff_play_types = ['kickoff_by']
    if play.seconds_remaining_in_game < 1:
        return None

    calculate_simple = False
    for pe in play.play_events:
        if pe.event_type in pat_play_types or pe.event_type in kickoff_play_types:
            calculate_simple = True

    if not play.down or calculate_simple:
        score = game_feed.calculate_score_at_play(play.play_id)
    else:
        score = game_feed.calculate_ep_adjusted_score_at_play(play.play_id)
    away_margin = score['away'] - score['home']
    #print score

    if home_handicap is None:
        home_handicap = 0

    total_minutes = 60
    if play.period_number not in [1, 2, 3, 4]:
        total_minutes = 15
    minutes_remaining = math.ceil(float(play.seconds_remaining_in_game)/float(60))

    p_win = 1 - scipy.stats.norm(
        -home_handicap * (minutes_remaining / total_minutes),
        (13.45 / math.sqrt((total_minutes / minutes_remaining)))
    ).cdf(away_margin + 0.5)

    p_tie = scipy.stats.norm(
        -home_handicap * (minutes_remaining / total_minutes),
        (13.45 / math.sqrt((total_minutes / minutes_remaining)))
    ).cdf(away_margin + 0.5) - scipy.stats.norm(
        -home_handicap * (minutes_remaining / total_minutes),
        (13.45 / math.sqrt((total_minutes / minutes_remaining)))
    ).cdf(away_margin - 0.5)

    #print 'Calculated', 1 - (p_win + (0.5 * p_tie))

    return {'home': p_win + (0.5 * p_tie), 'away': 1 - (p_win + (0.5 * p_tie))}


if __name__ == '__main__':
    game_id = 46931
    season = '2015-2016'
    competition = None

    boxscore_feed = BoxScoreFeed(sport='football', league='NFL', season=season, competition=game_id)
    boxscore_feed.load()
    home_handicap = boxscore_feed.home_handicap

    feed = WinProbabilityFootballPlayByPlayFeed(
        sport='football', league='NFL', season=season, competition=game_id)
    fetcher = HTTPFetcher(feed.get_url())
    feed.fetcher = fetcher
    feed.load()
    results = []
    for play in feed.plays:
        #print '---------------'
        #print play.description
        results.append({
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
            'seconds_remaining': play.seconds_remaining_in_game
        })
    with open('data/winprobability__46931.json', 'w+') as FH:
        FH.write(json.dumps({'plays': results}))
