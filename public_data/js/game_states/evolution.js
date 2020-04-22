/*
-   evolution.js
-   a pokemon is evolving
-   can cancel the evolution here
*/

(function(window) {
    Evolution = {

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
    window.Evolution = Evolution;
})(window);
