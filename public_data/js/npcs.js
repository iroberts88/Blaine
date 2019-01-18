
(function(window) {
    NPCS = {
    	npcs: null,
        
        init: function(data){
        	this.npcs = {};
        },

        update: function(dt){
            for (var i in this.npcs){
                this.npcs[i]._update(dt);
            }
        },

        addNPC: function(data){
            var char = Unit();
            char._init(data);
            char.cRadius = 2;
            char.hb.r = 2;
            this.npcs[char.id] = char;
            Game.allUnits[char.id] = char;
            Graphics.worldContainer.addChild(char.targetCircle);
            Graphics.unitContainer.addChild(char.sprite);
            Graphics.unitContainer2.addChild(char.sprite2);
            Graphics.unitContainer2.addChild(char.spriteMask);
            Graphics.unitContainer2.addChild(char.nameTag);
            Graphics.unitContainer2.addChild(char.hitBox);
        },

        removeNPC: function(data){
            if (typeof this.npcs[data[Enums.ID]] == 'undefined'){
                console.log('NPC deosnt exist')
                return;
            }
            if (Player.currentTarget == this.npcs[data[Enums.ID]]){
                Player.clearTarget();
            }
            Graphics.unitContainer.removeChild(this.npcs[data[Enums.ID]].sprite);
            Graphics.worldContainer.removeChild(this.npcs[data[Enums.ID]].targetCircle);
            Graphics.unitContainer2.removeChild(this.npcs[data[Enums.ID]].sprite2);
            Graphics.unitContainer2.removeChild(this.npcs[data[Enums.ID]].spriteMask);
            Graphics.unitContainer2.removeChild(this.npcs[data[Enums.ID]].nameTag);
            Graphics.unitContainer2.removeChild(this.npcs[data[Enums.ID]].hitBox);
            delete this.npcs[data[Enums.ID]];
            Game.allUnits[data[Enums.ID]] = null;
        },

        getNPC: function(id){
            if (typeof this.npcs[id] == 'undefined'){
                console.log('NPC doesnt exist')
                return false;
            }
            return this.npcs[id];
        },
        updateNPCPos: function(data){
            this.npcs[data[Enums.ID]].moveVector.x = data[Enums.MOVEVECTOR][0];
            this.npcs[data[Enums.ID]].moveVector.y = data[Enums.MOVEVECTOR][1];
            this.npcs[data[Enums.ID]].hb.pos.x = data[Enums.POSITION][0];
            this.npcs[data[Enums.ID]].hb.pos.y = data[Enums.POSITION][1];
        },

        updateNPCStats: function(data){

        }
    }
    window.NPCS = NPCS;
})(window);
