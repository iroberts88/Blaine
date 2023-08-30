var mainObj = this;

mainObj.setPalette = function(n){
    var palettes = [
        [
            [0xd4d4d4,'#d4d4d4'],
            [0x656464,'#656464'],
            [0x2b2a2a,'#2b2a2a'],
            [0x181717,'#181717'],
            [0x8d0000,'#8d0000']
        ],
        [
            [0xe4eff0,'#e4eff0'],
            [0x4e7988,'#4e7988'],
            [0x005066,'#005066'],
            [0x002439,'#002439'],
            [0x78cce2,'#78cce2']
        ]
    ]
    n = parseInt(n);
    if (n < 0){
        n = 0;
    }
    if (n >= palettes.length){
        n = palettes.length-1;
    }
    mainObj.palette = palettes[n];
};
mainObj.setPalette(1);
mainObj.fonts = ['Pokemon'];
Acorn.init();

var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    pixelArt: true,
    backgroundColor: mainObj.palette[2][1],
    inputActivePointers: 3,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 1080
    },
    input: {
        gamepad: true,
        activePointers: 3
    },
    scene: [LoadFonts,LoadAssets,MainMenu,MapGen]
};

let bgs = [null,null,null];

let game = new Phaser.Game(config);
mainObj.game = game;
mainObj.currentGamePad = null;


//PAUSE WHEN LOSING WINDOW FOCUS
window.addEventListener("blur", () => { 
    /*if (game.scene.isActive('MainGameScene')){
        game.scene.getScene('MainGameScene').pauseGame();
    }*/
});

window.addEventListener("focus", () => {
    /*if (game.scene.isActive('MainGameScene')){
        if (Game.scene.levelupDisplay){
            if (Game.scene.levelupDisplay.length){
                return;
            }
        }
    }
    mainObj.game.anims.resumeAll();*/
});

window.addEventListener("beforeunload", function(e){
   /*Unlocks.setUnlocksLocalStorage();
   Game.setStatsLocalStorage();
   Game.setPrestigeLocalStorage();
   window.localStorage['pt'] = '' + Game.playedTutorial;
   window.localStorage['ebs'] = '' + Game.endBossSeen;
   window.localStorage['supnum'] = '' + Game.supportShip;*/
}, false);

mainObj.uid = function(){
    //return a random ID string based on UTC time
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

initLocalStorage();

function initLocalStorage() {
    /*let ls = window.localStorage;
    Sound.masterVolume = ls['masterVolume'] ? (parseInt(ls['masterVolume']*100)/100) : 0.75;
    Sound.musicVolume = ls['musicVolume'] ? (parseInt(ls['musicVolume']*100)/100) : 0.75;
    Sound.sfxVolume = ls['sfxVolume'] ? (parseInt(ls['sfxVolume']*100)/100) : 0.75;
    if (ls['stats']){
        Game.setStatsFromLocalStorage(ls['stats'].split('>'));
    }
    if (ls['unlockables']){
        Unlocks.setUnlocksFromLocalStorage(ls['unlockables'].split('>'));
    }
    if (ls['prestigeItems']){
        Game.setPrestigeItemsFromLocalStorage(ls['prestigeItems'].split('>'));
    }
    if (ls['prestige']){
        Game.totalPrestige = parseInt(ls['prestige']);
    }
    if (ls['prestigeSpent']){
        Game.spentPrestige = parseInt(ls['prestigeSpent']);
    }
    if (ls['pt']){
         Game.playedTutorial = parseInt(ls['pt']);
    }
    if (ls['ebs']){
         Game.endBossSeen = parseInt(ls['ebs']);
    }
    if (ls['supnum']){
         Game.supportShip = parseInt(ls['supnum']);
    }*/
    return;
};

function update(){
}
//update();

/*
game.textures.getPixelsData = function(key, frame) {

        let textureFrame = this.getFrame(key, frame);

        if (textureFrame) {

            let w = textureFrame.width;
            let h = textureFrame.height;

            // have to create new as _tempCanvas is only 1x1
            let cnv = this.createCanvas('temp', w, h); // CONST.CANVAS, true);
            let ctx = cnv.getContext('2d');

            ctx.clearRect(0, 0, w, h);
            ctx.drawImage(textureFrame.source.image, 0, 0, w, h, 0, 0, w, h);

//            cnv.destroy();

            let rv = ctx.getImageData(0, 0, w, h);

            // add handy little method for converting specific pixel to Color object
            rv.getColorAt = function(x, y) {
                return new Phaser.Display.Color(
                    this.data[(x+y*this.width)*4],
                    this.data[(x+y*this.width)*4+1],
                    this.data[(x+y*this.width)*4+2],
                    this.data[(x+y*this.width)*4+3]
                );
            };

            return rv;
        }

        return null;
    };*/
console.log('By Ian Roberts\n\n   #######\n   #*,*,*#### \n   #######&,,#####\n         #/(&/((/(#######\n    <o]###*(//&&%%&%&&%((#&%###*      ==       ==\n    <o]###*(//&&%(##&%((&#&###*    ==        ==          PEW PEW!\n         #*(&((/((#######\n   #######&,,#####\n   #*,*,*####\n   #######\n\n');