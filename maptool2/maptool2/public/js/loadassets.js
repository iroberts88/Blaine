class LoadAssets extends Phaser.Scene {

    constructor ()
    {
        super('LoadAssets');
    }

    preload ()
    {  
        //todo should NOT load everything at once, especially music
        let that = this;
        this.fileNum = 0;
        this.fileLoaded = 0;
        this.load.on('progress', function (value) {
        });
        this.load.on('complete', function () {
            //console.log('complete')
        });
        this.load.on('filecomplete', function (key) {
            that.fileLoaded += 1;
            var percent = (Math.floor((that.fileLoaded/that.fileNum)*100));
            that.percentText.text = percent + '%';
            if (percent == 100){
                that.scene.start('MainMenu');
            }
        });
        this.load.on('addfile', function (key) {
            that.fileNum += 1;
        });
        this.loadText = this.add.text(960, 1080/2-50, 'LOADING...', {fontFamily: mainObj.fonts[2],  fontSize: 48, color: mainObj.palette[4][1] }).setShadow(5, 5, mainObj.palette[3][1], 2, false, true);
        this.loadText.setOrigin(0.5,0.5);
        this.percentText = this.add.text(960, 1080/2+50, '0%', {fontFamily: mainObj.fonts[2],  fontSize: 48, color: mainObj.palette[0][1] }).setShadow(5, 5, mainObj.palette[3][1], 2, false, true);
        this.percentText.setOrigin(0.5,0.5);
        this.load.multiatlas('sprites', 'img/mapSprites.json', 'img');

        this.input.gamepad.once('down', function (pad, button, index) {
            console.log('Playing with ' + pad.id);
            mainObj.currentGamePad = pad;
        }, this);

        this.load.plugin('rexglowfilterpipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilterpipelineplugin.min.js', true);
        this.load.plugin('rexglowfilter2pipelineplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexglowfilter2pipelineplugin.min.js', true);

    }

    create ()
    {   
        let framerate = 2.5;
        const br_flower = {
            key: 'br_flower_',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'br_flower_', start: 1, end: 4,suffix: '.png'}),
            frameRate: framerate,
            repeat: -1
        };
        this.anims.create(br_flower);

        const tl_flower = {
            key: 'tl_flower_',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'tl_flower_', start: 1, end: 4,suffix: '.png'}),
            frameRate: framerate,
            repeat: -1
        };
        this.anims.create(tl_flower);

        const deep_water = {
            key: 'deep_water',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'deep_water', start: 1, end: 6,suffix: '.png'}),
            frameRate: framerate,
            repeat: -1
        };
        this.anims.create(deep_water);
        const water = {
            key: 'water',
            frames: this.anims.generateFrameNames('sprites', { prefix: 'water', start: 1, end: 6,suffix: '.png'}),
            frameRate: framerate,
            repeat: -1
        };
        this.anims.create(water);
    }

}