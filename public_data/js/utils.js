
(function(window) {
    //A collection of utility functions
    Utils = {
        numbers: {},
        letters: {},
        operators: {},
        init: function(){
            var n = '1234567890';
            var l = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            var o = '+-/*.';
            for (var i = 0; i < n.length;i++){
                this.numbers[n.charAt(i)] = true;
            }
            for (var i = 0; i < l.length;i++){
                this.letters[l.charAt(i)] = true;
            }
            for (var i = 0; i < o.length;i++){
                this.operators[o.charAt(i)] = true;
            }
        },


        udCheck: function(val,tVal,fVal) {
            var result = typeof val == 'undefined' ? tVal : fVal;
            return result;
        },

        _udCheck: function(val) {
            return (typeof val == 'undefined');
        },

        uniqueCopy: function(obj){
            var newObj = {}
            for (var key in obj){
                newObj[key] = obj[key];
            }
            return newObj;
        }
    };
    window.Utils = Utils;
})(window);