

(function(window) {

    // -------------------------------------------
    // Net setup
    //--------------------------------------------

    Acorn = {
        socket_: null,
        ready: false,
        callbacks_: [],

        init: function() {
            // Start network connection
            console.log("Acorn: Trying to set up socket....");
            this.socket_ = io.connect();
            this.socket_.on('serverUpdate', function(data) {
                for (var i = 0; i < data.length;i++){   
                    if(Acorn.callbacks_[data[i].call]) {
                        Acorn.callbacks_[data[i].call](data[i].data);
                    }
                }
            });


            Acorn.on('connInfo', function (data) {
                console.log('Connected to server: Info Received');
                Acorn.ready = true;
                console.log(data);
                window.playerID = data.id;
            });
            Acorn.on('editMap', function (data) {
                console.log(data);
                if (data.found){
                  mainObj.game.scene.getScene('MapGen').data = data;
                  mainObj.game.scene.stop('MainMenu');
                  mainObj.game.scene.start('MapGen');
                }else{
                    Graphics.showLoadingMessage(false);
                }
            });

             Acorn.on('confirmMapSave', function (data) {
                if (confirm('Overwrite map "' + data.name + '"?') == true) {
                    Acorn.socket_.emit('confirmMapSave',{name:data.name,c:true});
                }else{
                    Acorn.socket_.emit('confirmMapSave',{c:false});
                }
            });
             
        },
        on: function(key, callback) {
            if(callback && typeof callback === 'function') {
                this.callbacks_[key] = callback;
            }
            //console.log(this.callbacks_);
        }
    };

    window.Acorn = Acorn;
})(window);