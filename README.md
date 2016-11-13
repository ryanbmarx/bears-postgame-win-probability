# Bears 2016 postgame Win Prob

A [Tarbell](http://tarbell.io) project that publishes to a P2P HTML Story.

THE SHORT VERSION OF WHAT YOU NEED TO DO
----------------------------------------

1. `npm run build` which will download all available game data. If the data doesn't come through this way, try running 'node buildstats.js'
2. For now, generate the top plays manually using the command `node generateTopPlays.js id=gameid` obviously swapping in the game id.
3. Set the game to "publish" in the games tab of the spreadsheet
4. Add a blurb about the game to the games tab
5. Update the headline to reference the proper teams.
6. Change the thumbnail in p2p.
7. CHeck the asset's related items. Make sure they all are relevant to THIS game (i.e. not last week's gallery).
8. Publish as normal.


TODO
----

- Fix tooltip
- Fix SVGs dropping out
- Massage type styles in NGUX

Assumptions
-----------
  
* Python 2.7
* Tarbell 1.0.\*
* Node.js
* grunt-cli (See http://gruntjs.com/getting-started#installing-the-cli)
* Sass
* [virtualenvwrapper](https://virtualenvwrapper.readthedocs.org/en/latest/)


WHAT IS THIS???
---------------

This is a repurposed version of the [realtime win probability tracker](https://tribune.unfuddle.com/a#/repositories/383/browse) developed for the 2015-16 season. This version is more of a post-game analysis, placing emphasis on the plays resulting in the largest swings in win prob.

HOW DO I INSTALL IT?
--------------------

Boy, where to begin .... I'll copy-and-paste from the aforementioned project's [README](https://tribune.unfuddle.com/a#/repositories/383/file?path=%2FREADME.md&commit=6388abf30dc14bc3800eeb3f02a309d4968f973d) (You do have virtualenvwrapper installed, don't you?):

> Installation
> ------------
>   
> Since this project has Python dependencies beyond Tarbell, you should create a virtualenv for this project:
>   
>     mkvirtualenv bears-win-probability
>   
> Then install Tarbell and other project dependencies into the virtualenv:
>   
>     workon bears-win-probability
>     pip install -r requirements.txt 
>   

THE DATA
--------

The data is provided by [SportsDirect Inc. (SDI)](https://sdixmlfeeds.sportsdirectinc.com:8443/login.action?os_destination=%2Findex.action) and is baked into project-specific JSON using get_game_stats.py, which is a slightly modified version of the daemon used in 2015-16. For the real gritty details, go that repo. The data feed are authenticated by IP address, so if you get 403 errors, it means you aren't in the tower.

BUILDING THE DATA
-----------------

`npm run build` will not only trigger all the grunt stuff we're used to in tarbell projects, but also a node script `buildStats.js`. You need to be in the bears virtualenv you created above for this to work. That script contains an array of all the SDI game IDs for the Bears. It goes through each one in turn. If it **does not** find game data, then it skips. If it **does** find game data, it calls the win probability generator, `get_game_stats.py`. It then calls the `generateTopPlays.js` which outputs a seperate file of just the most impactful plays (currently a total of ten). These files are used by the page's javascript to make the chart.

Again, a simple `npm run build` should take care of everything, but please be patient. The game stats thing might take a while to run, especially later in the season.

UPDATING THE SPREADSHEET
------------------------

The app pretty much runs automatically with Javascript, but there is a dropdown generated with Jinja to allow users to click back through other games. This is done by changing the url variable on which the JS depends. When a game is complete, change that game's publish value to "1" ... otherwise it won't show up in the menu. 

Also, you need to add 2-3 sentences about the game to the same games tab.

PREVIEWING LOCALLY
------------------

THere is some conflict between the tarbell in the virtualenv and the one we use normally. In the tab where you will run `tarbell serve`, do so as you would any other project (outside the virtual env).

PUBLISHING
----------

The usual and customary `tarbell publish` should do the trick.

Custom configuration
--------------------

You should define the following keys in either the `values` worksheet of the Tarbell spreadsheet or the `DEFAULT_CONTEXT` setting in your `tarbell_config.py`:

* p2p\_slug
* headline 
* seotitle
* seodescription
* keywords
* byline

Note that these will clobber any values set in P2P each time the project is republished.  

Building front-end assets
-------------------------

This blueprint creates configuration to use [Grunt](http://gruntjs.com/) to build front-end assets.

When you create a new Tarbell project using this blueprint with `tarbell newproject`, you will be prompted about whether you want to use [Sass](http://sass-lang.com/) to generate CSS and whether you want to use  [Browserify](http://browserify.org/) to bundle JavaScript from multiple files.  Based on your input, the blueprint will generate a `package.json` and `Gruntfile.js` with the appropriate configuration.

After creating the project, run:

    npm install

to install the build dependencies for our front-end assets.

When you run:

    grunt

Grunt will compile `sass/styles.scss` into `css/styles.css` and bundle/minify `js/src/app.js` into `js/app.min.js`.

If you want to recompile as you develop, run:

    grunt && grunt watch

This blueprint simply sets up the the build tools to generate `styles.css` and `js/app.min.js`, you'll have to explicitly update your templates to point to these generated files.  The reason for this is to make you think about whether you're actually going to use an external CSS or JavaScript file and avoid a request for an empty file if you don't end up putting anything in your custom stylesheet or JavaScript file.

To add `app.min.js` to your template file:

    
    <script src="js/app.min.js"></script>
    