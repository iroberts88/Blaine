(function(window) {

//TODO put this into Acorn???

    Settings = {
        scaleToFit: null,
        mute: null,
        masterVolume: null,
        musicVolume: null,
        sfxVolume: null,

        init: function() {
        	//Working
            this.scaleToFit = true; //scale to fit screen size
            this.mute = false; 
            this.masterVolume = 1.0;
            this.musicVolume = 1.0;
            this.sfxVolume = 1.0;

            this.charScrollSpeed = 100;
            this.autoFullScreen = false;
            this.currentMap = null;
        },
        
         zoom: function(dir){
            var changed = true;
            if (dir == 'in'){
                MapGen.currentZoomSetting += 1;
                if (MapGen.currentZoomSetting == MapGen.ZOOM_SETTINGS.length){
                    MapGen.currentZoomSetting = MapGen.ZOOM_SETTINGS.length-1;
                    changed = false
                }
            }else if (dir == 'out'){
                MapGen.currentZoomSetting -= 1;
                if (MapGen.currentZoomSetting == -1){
                    MapGen.currentZoomSetting = 0;
                    changed = false
                }
            }
            if (changed){
                var t = 1;
                Graphics.worldContainer.scale.x = MapGen.ZOOM_SETTINGS[MapGen.currentZoomSetting];
                Graphics.worldContainer.scale.y = MapGen.ZOOM_SETTINGS[MapGen.currentZoomSetting];
                MapGen.map.reDraw();
            }
        },
        toggleAutoFullScreen: function(){
            if (this.autoFullScreen){
                this.autoFullScreen = false;
                Graphics.renderer.view.removeEventListener('click',Settings.requestFullScreen);
                Graphics.renderer.view.removeEventListener('touchend',Settings.requestFullScreen, {passive: false});
                Settings.exitFullScreen();
            }else{
                this.autoFullScreen = true;
                Graphics.renderer.view.addEventListener('click',Settings.requestFullScreen);
                Graphics.renderer.view.addEventListener('touchend',Settings.requestFullScreen, {passive: false});
            }
        },
        requestFullScreen: function(e){
            e.preventDefault();
            document.body.style.overflow = 'visible';
            if (!document.fullscreenElement){
                var c = document.body;
                if (c.webkitRequestFullScreen){
                    c.webkitRequestFullScreen();
                }else if (c.mozRequestFullScreen){
                    c.mozRequestFullScreen();
                }else if (c.requestFullscreen){
                    c.requestFullscreen();
                }else if (c.msRequestFullscreen){
                    c.msRequestFullscreen();
                }
            }
            if (Acorn.currentState == 'initialScreen'){
                Acorn.changeState('mainMenu');
            }
        },
        exitFullScreen: function(){
            if (document.webkitExitFullscreen){
                document.webkitExitFullscreen();
            }else if (document.mozCancelFullScreen){
                document.mozCancelFullScreen();
            }else if (document.exitFullscreen){
                document.exitFullscreen();
            }else if (document.msExitFullscreen){
                document.msExitFullscreen()
            }
            document.body.style.overflow = 'hidden';
            Graphics.resize();
        },
        toggleScaleToFit: function(){
            if (this.scaleToFit){
                this.scaleToFit = false;
            }else{
                this.scaleToFit = true;
            }
            Graphics.resize();
        },
        toggleMute: function(){
            if (this.mute){
                this.mute = false;
                this.setMasterVolume(this.masterVolume);
            }else{
                this.mute = true;
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    Acorn.Sound._sounds[i].volume = 0;
                }
            }
        },
        setSFXVolume: function(v){
            Settings.sfxVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    var snd = Acorn.Sound._sounds[i];
                    if (snd.type == 'sfx'){
                        snd.volume = snd.volumeBase*Settings.masterVolume*Settings.musicVolume;
                    }
                }
            }
        },
        setMusicVolume: function(v){
            Settings.musicVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                for (var i = 0; i < Acorn.Sound._sounds.length;i++){
                    var snd = Acorn.Sound._sounds[i];
                    if (snd.type == 'music'){
                        snd.volume = snd.volumeBase*Settings.masterVolume*Settings.musicVolume;
                    }
                }
            }
        },
        setMasterVolume: function(v){
            Settings.masterVolume = v;
            if (Settings.mute){
                Settings.toggleMute();
            }else{
                Settings.setMusicVolume(Settings.musicVolume);
                Settings.setSFXVolume(Settings.sfxVolume);
            }
        }
    };
    
    Settings.init();

    window.Settings = Settings;
})(window);