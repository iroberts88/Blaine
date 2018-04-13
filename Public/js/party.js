//client side Party pokemon
(function(window) {
    Party = {
        pokemon: {},
        init: function(data){
        	this.pokemon = {
                '1': '',
                '2': '',
                '3': '',
                '4': '',
                '5': '',
                '6': ''
            }
            if (data.pokemon){
                for (var i = 0; i < data.pokemon.length;i++){
                    this.setPokemon(data.pokemon[i].slot,data.pokemon[i]);
                }
            }
        },

        setPokemon: function(slot,pokemon){
            this.pokemon[slot] = pokemon;
            Game.resetPokemon(slot);
        }
    }

    window.Party = Party;
})(window);
