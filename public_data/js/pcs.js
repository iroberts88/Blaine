
(function(window) {
    PCS = {
    	pcs: null,
        
        init: function(data){
        	this.pcs = {};
        },

        update: function(dt){
            for (var i in this.pcs){
                this.pcs[i].update(dt);
            }
        },

        addPC: function(data){
            var pc = new PlayerCharacter();
            pc.init(data);
            this.pcs[data[CENUMS.ID]] = pc;
        },

        removePC: function(data){
            try{
                var pc = this.pcs[data[CENUMS.ID]];
                pc.remove = true;
            }catch(e){
                console.log(e);
            }
        },

        _removePC: function(data){
            try{
                var pc = this.pcs[data.id];
                Graphics.charContainer1.removeChild(pc.sprite);
                Graphics.charContainer2.removeChild(pc.sprite2);
                Graphics.charContainer2.removeChild(pc.nameTag);
                Graphics.charContainer2.removeChild(pc.playerMask);
                delete this.pcs[data.id];
            }catch(e){
                //TODO remove trycatch
            }
        },

        getPC: function(id){
            if (typeof this.pcs[id] == 'undefined'){
                console.log('PC doesnt exist')
                return false;
            }
            return this.pcs[id];
        },
        clearAll: function(){
            for (var i in this.pcs){
                this._removePC({id: i});
            }
        },
        updatePCStats: function(data){

        }
    }
    window.PCS = PCS;
})(window);
