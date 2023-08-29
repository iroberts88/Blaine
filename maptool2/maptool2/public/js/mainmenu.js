class MainMenu extends Phaser.Scene {

    constructor ()
    {
        super('MainMenu');
        this.playButton;
        this.optionsButton;
        this.unlocksButton;
        this.prestigeButton;
        this.mainMenuMusic;
        this.bg;
        this.gfx;

        this.selectedItem;
        this.uiIndex;
    }

    preload ()
    {  
    }

    create ()
    {   
        this.bg = this.add.graphics();
        this.bg.fillStyle(mainObj.palette[2][0],1);
        this.bg.fillRect(0,0,1920,1080);
        
        this.uiIndex = [];
        this.selectedItem = 0;
        let add = this.add;
        let that = this;
        this.newBtn = add.text(1920/2, 1080/4, 'NEW MAP', { fontFamily: mainObj.fonts[0], fontSize: 48, color: mainObj.palette[0][1] }).setShadow(5,5, mainObj.palette[3][1], 2, false, true);
        this.newBtn.setOrigin(0.5,0.5);
        this.newBtn.setInteractive({ cursor: 'pointer' });
        this.newBtn.sceneToStart = '';
        this.newBtn.on('pointerdown', function () {
            that.scene.stop('MainMenu');
            that.scene.start('MapGen');
        }, that);
        this.uiIndex.push(this.newBtn);

        this.editBtn = add.text(1920/2, 1080*3/4, 'EDIT MAP', { fontFamily: mainObj.fonts[0], fontSize: 48, color: mainObj.palette[0][1] }).setShadow(5,5, mainObj.palette[3][1], 2, false, true);
        this.editBtn.setOrigin(0.5,0.5);
        this.editBtn.setInteractive({ cursor: 'pointer' });
        this.editBtn.sceneToStart = '';
        this.editBtn.on('pointerdown', function () {
            var s = "Enter map name: ";
            var name = prompt(s, '');
            if (name && name != ''){
                Acorn.socket_.emit('editMap',{name: name});
                MapGen.mapName = name;
            }
        }, that);
        this.uiIndex.push(this.editBtn);
    }
}