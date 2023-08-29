class LoadFonts extends Phaser.Scene {

    constructor ()
    {
        super('LoadFonts');
    }

    init ()
    {
        //  Inject our CSS
        var element = document.createElement('style');

        document.head.appendChild(element);

        var sheet = element.sheet;

        var styles = '@font-face { font-family: "Pokemon"; src: url("pokemon_generation_1.woff") format("truetype"); }\n';

        sheet.insertRule(styles, 0);

    }
    preload ()
    {  
        var that = this;
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create ()
    {   
        var that = this;
        WebFont.load({
            custom: {
                families: [ 'Pokemon']
            },
            active: function ()
            {
                that.scene.start('LoadAssets');
            }
        });
    }

}