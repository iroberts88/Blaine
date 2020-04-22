/*
-   caught.js
-   a pokemon is caught!
-   view stats, pokedex, and nickname here
*/

(function(window) {
    Caught = {

        init: function() { 
        	Battle.ready = false;
        	Game.battleActive = false;

            Graphics.uiPrimitives1.clear();
            Graphics.uiPrimitives2.clear();
            Graphics.uiContainer2.removeChildren();
        },

        update: function(dt){ 
           
        }

    }
    window.Caught = Caught;
})(window);
