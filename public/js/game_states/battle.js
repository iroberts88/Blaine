
(function(window) {
    Battle = {
        init: function() {
          console.log("init!");
        },
       
        update: function(dt){
            Graphics.uiPrimitives2.clear();
        }
    }
    window.Battle = Battle;
})(window);
