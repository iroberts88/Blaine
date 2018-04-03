
(function(window) {
    NewChar = {
        slot: null,
        prompted: false,
        init: function() {
            
        },
        
        update: function(dt){
            Graphics.uiPrimitives2.clear();
            if (Acorn.Sound.currentMusic == 'newChar' && !this.prompted && Acorn.Sound.getSound('newChar')._sound.currentTime != 0){
                //for now just prompt names
                var name = '';
                var sprite = ''
                var rival = '';
                while (name == '' || rival == ''){
                    sprite = prompt("enter sprite_name", 'ash');
                    name = prompt("enter character_name", 'ASH');
                    rival = prompt("enter rival_name", 'GARY');
                    if (rival.length <3 || rival.length > 16 || name.length < 3 || name.length > 16){
                        name = '';
                        rival = '';
                        alert("names must be between 3 and 16 characters");
                    }
                }
                this.prompted = true;
                Acorn.Net.socket_.emit('playerUpdate',{command: 'newChar',sprite: sprite,name:name,rival:rival,slot: this.slot});
            }
        }

    }
    window.NewChar = NewChar;
})(window);
