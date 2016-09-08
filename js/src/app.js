var d3 = require('d3');
var $ = require('jquery');
var Backbone = require('backbone');
var _ = require('underscore');

var colorLookup = {
  '49ers': { opponent_color: "#940029", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Bears: { opponent_color: "#12182d", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Bengals: { opponent_color: "#FB4F14", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Bills: { opponent_color: "#C60C30", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Broncos: { opponent_color: "#FB4F14", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Browns: { opponent_color: "#ed7e11", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "black"},
  Buccaneers: { opponent_color: "#D60A0B", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Cardinals: { opponent_color: "#B10339", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Chargers: { opponent_color: "#05173C", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
  Chiefs: { opponent_color: "#C60024", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Colts: { opponent_color: "#00417E", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
  Cowboys: { opponent_color: "#D0D2D4", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "black"},
  Dolphins: { opponent_color: "#008D97", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "white"},
  Eagles: { opponent_color: "#004953", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "white"},
  Falcons: { opponent_color: "#231F20", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
  Giants: { opponent_color: "#003155", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Jaguars: { opponent_color: "#00839C", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Jets: { opponent_color: "#2A433A", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
  Lions: { opponent_color: "#006EA1", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Packers: { opponent_color: "#FFCC00", opponent_text_color: "white", bears_color: "#031E2F", bears_text_color: "black"},
  Panthers: { opponent_color: "#0088CE", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Patriots: { opponent_color: "#00295B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
  Raiders: { opponent_color: "#000000", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Rams: { opponent_color: "#00295B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Ravens: { opponent_color: "#2B025B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"},
  Redskins: { opponent_color: "#8C001A", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Saints: { opponent_color: "#C6A876", opponent_text_color: "black", bears_color: "#031E2F", bears_text_color: "white"},
  Seahawks: { opponent_color: "#030F1F", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Steelers: { opponent_color: "#000000", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Texans: { opponent_color: "#00133F", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Titans: { opponent_color: "#002C4B", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "black"},
  Vikings: { opponent_color: "#240A67", opponent_text_color: "black", bears_color: "#DD4814", bears_text_color: "white"}
};

function getDownAndDistance(playData, visitingTeam, homeTeam){
  var down = formatDown(playData['down']);
  var yardline_team = playData['yardline_align'] == "away" ? visitingTeam : homeTeam;
  return `${down} and ${playData['distance']} on ${yardline_team} ${playData['yardline']}`;
}


function buildTopPlays(data, meta){
  console.log('building top plays');
  var homeTeam = "", 
  visitingTeam = "";

  // Set the labels
  if(meta[0]['type'] == 'home'){
    homeTeam = meta[0]['short'];
    visitingTeam = meta[1]['short'];
  } else {
    homeTeam = meta[1]['short'];   
    visitingTeam = meta[0]['short'];
  }

  // Load the top plays
    var parsedHTML = "";
    data.forEach((value, index) => {
      parsedHTML += `
        <div class='top-play'>
          <span class='top-play__number'>${index + 1}</span>
          <div class='top-play__inner'>
            <div class='top-play__topper'>
              <span class='top-play__prob-change'>${d3.format('+.1f')(value['probabilityChangeFromPreviousPlay']*100)}</span>
              <p class='top-play__time'>${getGameClock(value)} remaining in ${formatDown(value['quarter'])} quarter</p>
              <p class='top-play__down-distance'>${getDownAndDistance(value, visitingTeam, homeTeam)}</p>
            </div>
            <p class='top-play__description'>${value['description']}</p>
            <p class='top-play__score'>${visitingTeam} ${value['score']['home']}, ${homeTeam} ${value['score']['away']}</p>
          </div>
        </div>`;
    });
    document.getElementById('biggest-plays').innerHTML = parsedHTML;
}



var INTERVAL = {},
    ISFINAL = false,
    WIN_PROB_CHANGES = {};

function drawChart(data, container, score, meta, gamechangers, dimensions) {

  container.selectAll('.quarter,.line,.play').remove();

  var tooltip = d3.select('#tooltip');

  var xScale = d3.scale.linear()
    .range([0, dimensions.chartWidth])
    .domain([1, data.length]);

  var yScale = d3.scale.linear()
    .range([dimensions.chartHeight, 0])
    .domain([0, 1]);

  if (!$('.xAxis').length) {
    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom');

    var yAxis = d3.svg.axis()
      .scale(yScale)
      .tickSize(dimensions.containerWidth)
      .tickFormat(function(d) {
        return getYLabel(d, meta);
      })
      .ticks(2)
      .orient('right');
  }

  var line = d3.svg.line()
    .x(function(d) { return xScale(d.play); })
    .y(function(d) {
      if (WIN_PROB_CHANGES[d.play].abs_diff == null) {
        var value = WIN_PROB_CHANGES[d.play].before;
      } else {
        var value = WIN_PROB_CHANGES[d.play].after;
      }
      return yScale(value);
    });

  if (!$('.svgContainer').length) {
    var chart = container.append('svg')
        .attr('width', dimensions.containerWidth)
        .attr('height', dimensions.height)
      .append('g')
        .attr('transform', 'translate(' + dimensions.margin.left + ',' + dimensions.margin.top + ')')
        .attr('class', 'svgContainer');

    var awayLogo = chart.append('svg')
        .attr('viewbox', '0 0 250 250')
      .append('use')
        .attr('height', (dimensions.chartHeight/2) + 'px')
        .attr('width', (dimensions.chartWidth/2) + 'px')
        .attr('xlink:href', `//${window.ROOT_URL}/img/nfl-logos.svg#${getTeams(meta).away.abbrv}`)
        .attr('x', xScale(1))
        .attr('y', yScale(1.05))
        .attr('opacity', .3)
        .attr('class', 'team');

    var homeLogo = chart.append('svg')
        .attr('viewbox', '0 0 250 250')
      .append('use')
        .attr('height', (dimensions.chartHeight/2))
        .attr('width', (dimensions.chartWidth/2))
        // .attr('xlink:href', 'img/nfl-logos.svg#' + getTeams(meta).home.abbrv)
        .attr('xlink:href', `//${window.ROOT_URL}/img/nfl-logos.svg#${getTeams(meta).home.abbrv}`)
        .attr('x', xScale(1))
        .attr('y', yScale(.55))
        .attr('opacity', .3)
        .attr('class', 'team');
  } else {
    var chart = d3.select('.svgContainer');
  }

  var quarterMarker = chart.selectAll('.quarter')
      .data(_.keys(score))
      .enter()
    .append('g')
      .attr('class', 'quarter')
      .attr('transform', function(d) {
        return 'translate(' + xScale(score[d].start_idx + 1) + ',0)';
      });

  quarterMarker.append('line')
      .attr('class', 'line')
      .attr('y1', function(d) { return yScale(0); })
      .attr('y2', function(d) { return yScale(1); })
      .style('stroke-width', 2)
      .style('stroke', '#ccc')
      .style('fill', 'none');

  quarterMarker.append('text')
      .attr('class', 'quarter')
      .attr('x', 5)
      .attr('y', function(d) {
        return yScale(0.015);
      })
      .text(function(d) {
        if (d > 4) {
          return "Overtime";
        }
        return getQuarter(d) + " quarter";
      });

  if (!$('.axis').length) {
    chart.append('g')
      .attr('class', 'y axis')
      .attr('transform', 'translate(-' + dimensions.margin.left + ',0)')
      .call(yAxis)
      .call(function(g){
        var ticks = g.selectAll('g');
        ticks.first().classed('major', true);
        ticks.last().classed('major', true);

        g.selectAll('text')
          .attr('x', 2)
          .attr('dy', function(d) {
            if(d == 0) {
              return 16;
            }

            return -6;
          })
          .attr('class', function(d) {
            if(d % 1 == 0) {
              return 'team-label';
            }
          });
      });
  }

  chart.append('path')
    .datum(data)
    .attr('class', 'line')
    .attr('d', line);

  /*
  var gameChanger = chart.selectAll('.gamechanger')
      .data(gamechangers).enter()
    .append('g')
      .attr('class', 'gamechanger')
      .attr('transform', function(d) {
        if (WIN_PROB_CHANGES[d.play].abs_diff == null) {
          var value = WIN_PROB_CHANGES[d.play].before;
        } else {
          var value = WIN_PROB_CHANGES[d.play].after;
        }
        return "translate(" + xScale(d.play) + "," + yScale(value) + ")";
      });

  gameChanger.append('circle')
    .attr('r', 6.5)
    .on('mouseover', function(d) {
      var tpl = _.template($('#tpl-winprob-play-info').html());
      $('#selected-play').html(tpl({play: d}));
    });

  gameChanger.append('text')
    .text(function(d,i) {
      var text = '';
      if (d.points.number == 3) {
        return 'FG';
      } else if (d.points.number == 6) {
        return 'TD';
      }
      return i + 1;
    })
    .attr('x', function(d,i) {
      if (d.points.number == 3) {
        return -5.5;
      } else if (d.points.number == 6) {
        return -5.5;
      }

      return -2.4;
    })
    .attr('y', 2.8);
  */

  chart.selectAll('circle.play')
    .data(data).enter()
    .append('circle')
    .attr('class', 'play')
    .attr('cx', function(d) { return xScale(d.play); })
    .attr('cy', function(d) {
      if (WIN_PROB_CHANGES[d.play].abs_diff == null) {
        var value = WIN_PROB_CHANGES[d.play].before;
      } else {
        var value = WIN_PROB_CHANGES[d.play].after;
      }
      return yScale(value);
    })
    .attr('r', 6.3)
    .on('mouseover', function(d) {
      var tooltipTpl = _.template($('#tpl-tooltip').html());
      var context = getTooltipContext(d, meta);

      tooltip.html(tooltipTpl(context));

      var el = d3.select(this);
      el.classed('active', true);

      return tooltip.style('visibility', 'visible');
    })
    .on('mousemove', function(d) {
      var tipWidth = parseInt(tooltip.style('width'), 10);

      if (d3.event.pageX > ((dimensions.chartWidth - tipWidth))) {
        return tooltip
          .style('top', (d3.event.pageY - 40) + 'px')
          .style('left',(d3.event.pageX - (tipWidth + 32)) + 'px');
      } else {
        return tooltip
          .style('top', (d3.event.pageY - 40) + 'px')
          .style('left',(d3.event.pageX + 10) + 'px');
      }
    })
    .on('mouseout', function(d) {
      var el = d3.select(this);
      el.classed('active', false);

      return tooltip.style('visibility', 'hidden');
    });

}

function getTooltipContext(d, meta) {
  var context = {};
  var teams = getTeams(meta);
  var gameScore = getCurrentScore(d, teams);

  context.quarter = getQuarter(d.quarter);
  context.gameClock = getGameClock(d);
  context.prob = getBearsWinProbability(d, teams);
  context.score = gameScore;
  context.play = getPlayDescription(d);
  context.down = formatDown(d.down);
  context.distance = d.distance;
  context.yardline = d.yardline;
  context.possesion = d.possessor;
  context.teams = teams;
  context.reversed = d.reversed;
  if (d.yardline_align)
    context.sideOfField = teams[d.yardline_align].abbrv;
  else
    context.sideOfField = '';

  if(d.distance != undefined) {
    context.downclass = "active";
  } else {
    context.downclass = "inactive";
  }

  return context;
}

function getGameClock(d) {
  var quarterStarts = [
    3600,
    2700,
    1800,
    900
  ];
  for(var i = 0; i < quarterStarts.length; i++) {
    if(quarterStarts[i] == d.seconds_remaining) {
      return "15:00";
    }
  }
  var minutes = Math.floor(d.seconds_remaining / 60) % 15;
  var seconds = d.seconds_remaining % 60;
  if (seconds < 10) {
    seconds = '0' + seconds;
  }
  return minutes + ":" + seconds;
}

function getTeams(meta) {
  var teams = [];
  teams.home = {};
  teams.away = {};

  for(var i = 0; i < meta.length; i++) {
    if(meta[i].type === "home") {
      teams.home.team =  meta[i].short;
      teams.home.abbrv = lookupTeamInfo(meta[i].short, 'abbrv')
    } else {
      teams.away.team =  meta[i].short;
      teams.away.abbrv = lookupTeamInfo(meta[i].short, 'abbrv')
    }
  }

  return teams;
}

function formatDown(down) {
  var formats = [
    '1st',
    '2nd',
    '3rd',
    '4th',
  ];

  return formats[down -1];
}

function getPlayDescription(d) {
  var description = '';
  if (d.description) {
    description += d.description;
  }
  _.each(d.penalties, function(penalty) {
    description += " " + penalty.type + ", " + penalty.team + "."
  });

  return $.trim(description);
}

function getCurrentScore(d, teams) {
  var score = {};

  if(d.score.home != d.score.away) {
    score.leader = d.score.home > d.score.away ? teams.home : teams.away;
    score.leaderScore = d.score.home > d.score.away ? d.score.home : d.score.away;
    score.losing = d.score.home < d.score.away ? teams.home : teams.away;
    score.losingScore = d.score.home < d.score.away ? d.score.home : d.score.away;
  } else {
    score.leader = teams.away;
    score.leaderScore = d.score.away;
    score.losing = teams.home;
    score.losingScore = d.score.home;
  }

  return score;
}

function getBearsWinProbability(d, teams) {
  if (WIN_PROB_CHANGES[d.play].abs_diff == null) {
    return '';
  }

  var prob,
      sign = '',
      diff = WIN_PROB_CHANGES[d.play].after - WIN_PROB_CHANGES[d.play].before;

  if(teams.home.team == "Bears") {
    prob = 1 - WIN_PROB_CHANGES[d.play].after;
    if (diff < 0) {
      sign = '+';
    } else {
      sign = '-';
    }
  } else if(teams.away.team == "Bears") {
    prob = WIN_PROB_CHANGES[d.play].after;
    if (diff < 0) {
      sign = '-';
    } else {
      sign = '+';
    }
  } else {
    prob = WIN_PROB_CHANGES[d.play].after;
    if (diff < 0) {
      sign = '-';
    } else {
      sign = '+';
    }
  }

  return (prob * 100).toFixed(1) + "% (" + sign + (100 * WIN_PROB_CHANGES[d.play].abs_diff).toFixed(2) + ")";
}

function getQuarter(d) {
  if (d == 5) {
    return 'OT';
  }
  var quarters = [
    '1st',
    '2nd',
    '3rd',
    '4th',
  ];
  return quarters[d - 1];
}

function lookupTeamInfo(team, field) {
  let teams = [
    { "team": "Cardinals", "abbrv": "ARZ", "sdi": "Arizona" },
    { "team": "Falcons", "abbrv": "ATL", "sdi": "Atlanta" },
    { "team": "Ravens", "abbrv": "BAL", "sdi": "Baltimore" },
    { "team": "Bills", "abbrv": "BUF", "sdi": "Buffalo" },
    { "team": "Panthers", "abbrv": "CAR", "sdi": "Carolina" },
    { "team": "Bears", "abbrv": "CHI", "sdi": "Chicago" },
    { "team": "Bengals", "abbrv": "CIN", "sdi": "Cincinnati" },
    { "team": "Browns", "abbrv": "CLE", "sdi": "Cleveland" },
    { "team": "Cowboys", "abbrv": "DAL", "sdi": "Dallas" },
    { "team": "Broncos", "abbrv": "DEN", "sdi": "Denver" },
    { "team": "Lions", "abbrv": "DET", "sdi": "Detroit" },
    { "team": "Packers", "abbrv": "GB", "sdi": "Green Bay" },
    { "team": "Texans", "abbrv": "HOU", "sdi": "Houston" },
    { "team": "Colts", "abbrv": "IND", "sdi": "Indianapolis" },
    { "team": "Jaguars", "abbrv": "JAX", "sdi": "Jacksonville" },
    { "team": "Chiefs", "abbrv": "KC", "sdi": "Kansas City" },
    { "team": "Dolphins", "abbrv": "MIA", "sdi": "Miami" },
    { "team": "Vikings", "abbrv": "MIN", "sdi": "Minnesota" },
    { "team": "Patriots", "abbrv": "NWE", "sdi": "New England" },
    { "team": "Saints", "abbrv": "NO", "sdi": "New Orleans" },
    { "team": "Jets", "abbrv": "NYJ", "sdi": "N.Y. Jets" },
    { "team": "Giants", "abbrv": "NYG", "sdi": "N.Y. Giants" },
    { "team": "Raiders", "abbrv": "OAK", "sdi": "Oakland" },
    { "team": "Eagles", "abbrv": "PHI", "sdi": "Philadelphia" },
    { "team": "Steelers", "abbrv": "PIT", "sdi": "Pittsburgh" },
    { "team": "Chargers", "abbrv": "SD", "sdi": "San Diego" },
    { "team": "49ers", "abbrv": "SF", "sdi": "San Francisco" },
    { "team": "Seahawks", "abbrv": "SEA", "sdi": "Seattle" },
    { "team": "Rams", "abbrv": "STL", "sdi": "St. Louis" },
    { "team": "Buccaneers", "abbrv": "TB", "sdi": "Tampa Bay" },
    { "team": "Titans", "abbrv": "TEN", "sdi": "Tennessee" }, 
    { "team": "Redskins", "abbrv": "WAS", "sdi": "Washington" }
  ]
  for(var i = 0; i < teams.length; i++) {
    if(team == teams[i].team || team == teams[i].sdi || team == teams[i].abbrv) {
      return teams[i][field];
    }
  }

  return undefined;

}


function getDimensions(el, h) {
  var dimensions = [];

  dimensions['margin'] = {top: 20, right: 20, bottom: 20, left: 30};
  dimensions['containerWidth'] = el.node().getBoundingClientRect().width;
  dimensions['height'] = h;
  dimensions['chartWidth'] = dimensions.containerWidth - dimensions.margin.right - dimensions.margin.left;
  dimensions['chartHeight'] = h - dimensions.margin.top - dimensions.margin.bottom;

  return dimensions;
}


function getYLabel(d, meta) {
  if(d > 0 && d < 1)
    return d * 100 + '%';


  return meta[d].short + " win";
}


d3.selection.prototype.first = function() {
  return d3.select(this[0][0]);
}


d3.selection.prototype.last = function() {
  var last = this.size() - 1;
  return d3.select(this[0][last]);
}


function updateData(JSON, gameId) {
  $.getJSON(JSON, function(results) {
    //results.plays = results.plays.slice(0, offset);
    var score = {},
        last_play_id = 1,
        meta = [
          {'type': 'home', 'short': lookupTeamInfo(results.metadata.home, 'team')},
          {'type': 'away', 'short': lookupTeamInfo(results.metadata.away, 'team')}],
        home_away = {},
        gamechangers = [];

    if (meta[0]['type'] == 'home') {
      home_away['home'] = meta[0]['short'];
      home_away['away'] = meta[1]['short'];
    } else {
      home_away['home'] = meta[1]['short'];
      home_away['away'] = meta[0]['short'];
    }

    var tinyLogoTmpl = _.template($('#tpl-tinyLogo').html());
    if (!$('#tiny-logo-away').html().length)
      $('#tiny-logo-away').html(tinyLogoTmpl({abbrv: lookupTeamInfo(results.metadata.away, 'abbrv')}));
    if (!$('#tiny-logo-home').html().length)
      $('#tiny-logo-home').html(tinyLogoTmpl({abbrv: lookupTeamInfo(results.metadata.home, 'abbrv')}));

    $('#headline').html(
      lookupTeamInfo(results.metadata.home, 'team') + ' vs. ' + lookupTeamInfo(results.metadata.away, 'team'));

    if (results.metadata.is_finished) {
      ISFINAL = true;
      clearInterval(INTERVAL);
    } else {
      ISFINAL = false;
    }

    WIN_PROB_CHANGES[1] = { before: results.plays[0].prob.away, after: 0, abs_diff: 0 };

    var tpl = _.template($('#tpl-tooltip').html());

    $('#gamechangers').empty();

    _.each(results.plays, function(el, idx, lt) {
      el.play = idx + 1;
      el.value = el.prob.away;

      if (_.keys(WIN_PROB_CHANGES).indexOf(String(last_play_id)) == -1) {
        WIN_PROB_CHANGES[last_play_id] = { before: 0, after: 0, abs_diff: null, play: el };
      }

      WIN_PROB_CHANGES[last_play_id].after = el.value;
      WIN_PROB_CHANGES[last_play_id].abs_diff = Math.abs(
        WIN_PROB_CHANGES[last_play_id].after - WIN_PROB_CHANGES[last_play_id].before);

      last_play_id = el.play;
      WIN_PROB_CHANGES[last_play_id] = { before: el.value, after: 0, abs_diff: null, play: el };

      if (_.keys(score).indexOf(String(el.quarter)) == -1) {
        score[el.quarter] = {
          home: 0,
          away: 0,
          start_idx: idx
        };
        $('#q' + el.quarter + '-select').show();
      }
      if (el.points.number > 0 && !el.reversed) {
        if (el.points.team == results.metadata.home) {
          score[el.quarter].home += el.points.number;
        } else if (el.points.team == results.metadata.away) {
          score[el.quarter].away += el.points.number;
        }
        if (el.points.number > 1)
          gamechangers.push(el);
      }
    });

    var display_plays = results.plays.slice(0, -1);
    if (ISFINAL) {
      display_plays = results.plays;
    }
    _.each(display_plays, function(el, idx, lt) {
      var context = getTooltipContext(lt[idx], meta);

      $('<div class="play q' + el.quarter + '"></div>').prependTo('#gamechangers').append(tpl(context));
    });

    $('.play').hide();
    $('.q' + results.plays[results.plays.length - 1].quarter).show();
    $('#q' + results.plays[results.plays.length - 1].quarter + '-select').addClass('active');

    //var gamechangers = _.sortBy(
    //  _.values(WIN_PROB_CHANGES).slice(0, -1), function(wpc) { return wpc.abs_diff; }).reverse().slice(0, 10);
    // gamechanger_tmpl = _.template($('#tpl-gamechanger').html());

    // _.each(gamechangers, function(changer, idx) {
    //   $('#gamechangers').append(gamechanger_tmpl({
    //     play: changer.play,
    //     before: changer.before,
    //     after: changer.after,
    //     idx: idx + 1
    //   }));
    // });

    var clock_tmpl = _.template($('#tpl-gameclock').html()),
        length_offset = 2;
    if (ISFINAL) {

      $('#game-time').html('FINAL');
      length_offset = 1;
    } else {
      $('#game-time').html(clock_tmpl({
        gameClock: getGameClock(results.plays[results.plays.length - length_offset]),
        period: results.plays[results.plays.length - length_offset].quarter
      }));
    }

    _.each(_.keys(score), function(quarter) {
      $('#away-score-' + quarter).html(score[quarter].away);
      $('#home-score-' + quarter).html(score[quarter].home);
      if (quarter == 5) {
        $('.ot-score').show();
      }
    });
    $('#away-score-final').html(results.plays[results.plays.length - length_offset].score.away);
    $('#home-score-final').html(results.plays[results.plays.length - length_offset].score.home);
    $('#play-description').html(results.plays[results.plays.length - length_offset].description);

    _.each(meta, function(meta_el) {
      $('#' + meta_el['type'] + '-team-name').html(meta_el['short']);
    });

    var el = d3.select('#line-chart');
    drawChart(display_plays, el, score, meta, gamechangers, getDimensions(el, 450));
    $(window).on(
      'resize',
      _.throttle(_.bind(function() {
        drawChart(display_plays, el, score, meta, gamechangers, getDimensions(el, 450));
      }, this), 250));
    // *******
    // UPDATE THE TOP PLAYS SECTION
    // *******
    d3.json(`data/top_plays/top_plays_${gameId}.json`, (error, data) => {
      if (error) return console.warn(error);
      buildTopPlays(data, meta)
    });
  });
}


$(document).ready(function() {
  var search = Backbone.history.location.search;
  if (search.length && search.indexOf('game') != -1) {
    var gameId = search.replace('?', '').replace('game=', '');
  } else {
    var gameId = 46932;
    // New game is 46952
  }
  $('#game-select').val(gameId);
  var JSON = 'data/winprobability__' + gameId + '.json';
  updateData(JSON, gameId);
  if (!ISFINAL) {
    INTERVAL = setInterval(function() {
      updateData(JSON, gameId);
    }, 10000);
  }
  $('#game-select').change(function() {
    var lastPos = window.location.href.lastIndexOf('/');
    window.location.href = window.location.href.substr(0, lastPos) + '/?game=' + $('#game-select').val();
  });

  // $('.quarter-select').tap(function() {
  //   $('.play').hide();
  //   $('.quarter-select').removeClass('active');
  //   $('.q' + $(this).data('quarter')).show();
  //   $('#q' + $(this).data('quarter') + '-select').addClass('active');
  // });

});