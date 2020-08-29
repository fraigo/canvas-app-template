
var sounds={};

function loadAudio(id,url){
    var audio=document.createElement("audio");
    audio.setAttribute("preload",true);
    audio.src=url;
    sounds[id]=audio;
    return audio;
}

function playAudio(id){
    if (sounds[id]){
        sounds[id].play();
    }
}
