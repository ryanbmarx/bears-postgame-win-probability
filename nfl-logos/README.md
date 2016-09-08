nfl-logos
=========

Logos for NFL teams as of 2015 season.

Usage
-----

### SVG sprites

#### HTML

    <svg viewBox="0 0 250 200" class="nfl-logo">
        <use xlink:href="http://media.apps.chicagotribune.com/nfl-logos/nfl-logos.svg#CHI"></use>
    </svg>


    <script src="http://media.apps.chicagotribune.com/js/svg4everybody.min.js"></script>
    <script>
    svg4everybody();
    </script>

#### CSS

    .nfl-logo {
        display: inline-block;
        width: 100px;
        height: 100px;
    }


### PNG

#### HTML

    <img src="http://media.apps.chicagotribune.com/nfl-logos/nfl-logos-200x200/CHI-logo-200x200.png">

Assumptions
-----------

These are only for development/deployment.

* Node.js
* Grunt
* AWS credentials in the appropriate environment variables

Deployment
----------

Deployment uses Grunt, so before you deploy for the first time, you'll need to install the dependencies:

    npm install

To deploy to production:

    grunt deploy

To deploy to staging:

    grunt deploy --target=staging

Contributors
------------

* Alex Bordens <abordens@tribpub.com>: Logo wrangling, sprite creation
* Geoff Hing <ghing@tribpub.com>: SVG sprite examples, deployment scripts
