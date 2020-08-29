window.addEventListener("error",function (msg, url, line, col, error){
    console.log(msg, url, line, col, error);
    alert(msg);
})


var line=-1;
var items =[];
var ui =[];
var time = 0;
var direction=1;
var barWidth=500;
var barHeight=60;
var step = 10;
var running = false;
var maxy=720;
var basey=maxy-10;
var stageNumber = 1;
var initialInterval = 40;
var combo=0;

var colors={
    bar: "#BB0",
    combo: "#080"
}
var gradients={
    bar: {type:"linear",colors:["#ff0","#a90"]},
    combo: {type:"linear",colors:["#3D2","#281"]},
}

var borders={tl: 10, tr: 10, br: 10, bl: 10};


var score=new Sprite({
    type:"rect",
    x: 880,
    y: 30,
    w: 90,
    h: 30,
    fontColor: "#fff",
    textAlign: "right",
    text: "0"
});
var maxScore=new Sprite({
    type:"rect",
    x: 880,
    y: 70,
    w: 90,
    h: 30,
    fontColor: "#888",
    fontSize: 20,
    textAlign: "right",
    text: storeRecord("towers.max_score",0)
});
var stageClear=new Sprite({
    type:"rect",
    x: 0,
    y: 0,
    w: 1000,
    h: 750,
    fill: "rgba(0,0,0,0.5)",
    fontColor: "#fff",
    fontSize: 50,
    text: "Click to Start",
    visible: true
});
var stageNum=new Sprite({
    type:"rect",
    x: 30,
    y: 30,
    w: 120,
    h: 30,
    fontColor: "#fff",
    text: "Stage 1",
    textAlign: "left",
    visible: true
});
var stageMax=new Sprite({
    type:"rect",
    x: 30,
    y: 70,
    w: 120,
    h: 20,
    fontSize: 20,
    fontColor: "#C00",
    textAlign: "left",
    text: "Max Stage "+storeRecord("towers.max_stage",1),
    visible: true
});

ui.push(stageClear);
ui.push(score);
ui.push(maxScore);
ui.push(stageNum);
ui.push(stageMax);


function keyCanvas(scene, key){
    console.log("key",key);
    clickCanvas(scene);
}

function addScore(value){
    score.text=(+score.text)+value; 
    var maxsc=storeRecord("towers.max_score",+score.text);
    if (maxsc>+maxScore.text){
        maxScore.fontColor="#FF0";
        maxScore.text=maxsc;
    }
}

function clickCanvas(scene){
    if (stageClear.text=="Game Over" || stageClear.text=="Click to Start"){
        stageClear.text="";
        score.text="0";
        stageNumber=1;
        barHeight=60;
        stageNum.text="Stage "+stageNumber;
        scene.setInterval(initialInterval);
        startStage(scene);
        return;
    }
    if (stageClear.text.indexOf("clear")>0){
        stageClear.text="";
        storeRecord("towers.max_score",+score.text);
        storeRecord("towers.max_stage",+stageNumber);
        stageNumber++;
        stageNum.text="Stage "+stageNumber;
        startStage(scene);
    }
    if (line>0 && running){
        var bar =items[line];
        var bar0 = items[line-1];
        var bw = (bar.w?bar.w:0);
        var newX0=Math.max(bar.x,0);
        var newX1=Math.min(bar.x+bw,1000);
        var newWidth=Math.max(0,newX1-newX0);

        if (line>0){
            if (bar0){
                newX0=Math.max(bar.x,items[line-1].x);
                newX1=Math.min(bar.x+bw,items[line-1].x+(bar0.w?bar0.w:0));
                newWidth=Math.max(0,newX1-newX0);
                if (newWidth==bar0.w){
                    playAudio("bonus");
                    bar.fill=gradients.combo;
                    bar.borderRadius.bl=1;
                    bar.borderRadius.br=1;
                    bar.border=colors.combo;
                    bar0.fill=gradients.combo;
                    bar0.border=colors.combo;
                    if (bar0.borderRadius){
                        bar0.borderRadius.tl=1;
                        bar0.borderRadius.tr=1;    
                    }
                    combo++;
                    bar0.text=newWidth + " x"+combo;
                    addScore(newWidth); 
                }else{
                    combo=0;
                }
            }
        }
        console.log("new",newX0,newX1,newWidth);
        if (newWidth==0){
            playAudio("error");
            bar.fill="red";
            bar.border="black";
        }else{
            playAudio("brick");
            bar.x=newX0;
            bar.w=newWidth;
            if (combo>0){
                bar.text=""+newWidth+" x"+(combo+1);
            }else{
                bar.text=""+newWidth;
            }
            bar.fontSize=Math.min(30,Math.max(newWidth/10,12));
        }
        addScore(newWidth); 
        var maxst=storeRecord("towers.max_stage",stageNumber);
        stageMax.text="Max Stage "+maxst;
        
    }
    if (running){
        line++;
    }
}

function storeRecord(name,value){
    var oldValue=localStorage.getItem(name);
    if (!oldValue){
        oldValue=0;
    }
    var newValue=Math.max(value,oldValue);
    localStorage.setItem(name,newValue);
    return newValue;
}

function tick(scene){
    if (line>=items.length){
        var prev=items[line-1];
        var pw=barWidth;
        var py=line*barHeight;
        direction=Math.round(Math.random())==0?1:-1;
        if (prev){
            pw=prev.w;
            if (prev.fill=="red"){
                running = false;
                stageClear.visible=true;
                stageClear.text="Game Over";
                return;
            }
            if ((basey-py)<barHeight){
                if (running){
                    playAudio("win");                
                    running = false;
                    stageClear.visible=true;
                    stageClear.text="Stage "+stageNumber+" cleared";
                    var maxst=storeRecord("towers.max_stage",stageNumber);
                    stageMax.text="Max Stage "+maxst;
                }
                return;
            }
        }
        var offset=Math.round(Math.random()*5)*10;
        var px=0-offset;
        if (direction==-1){
            px=1000-pw+offset;
        }
        items.push(new Sprite({
            type: "roundrect", 
            x: px, y:basey-py, 
            w:pw, h:barHeight, 
            fill: gradients.bar, border: colors.bar, 
            borderRadius: scene.borderRadius(borders),
            fontColor:"#800"}))    
    }else if(line>0){
        items[line].x+=direction*step;
        if (items[line].x+items[line].w>1000){
            direction=-1;
        }
        if (items[line].x<0){
            direction=1;
        }
    }else{
        
    }
}    


function startStage(scene){
    console.log("start",scene);
    line=0;
    barWidth=500;
    barHeight-=2;
    if (scene.interval<=20){
        scene.setInterval(scene.interval-2);
    }else{
        scene.setInterval(scene.interval-5);
    }
    direction=Math.round(Math.random())==0?1:-1;
    stageClear.visible=false;
    items.splice(0,items.length);
    items.push(new Sprite({type: "rect", x: 250, y:basey, w:barWidth, h:barHeight, fill: gradients.bar, border: colors.bar})) 
    running=true;
}


(function(){
    canvas = document.getElementById("scene");
    window.scene=new Scene(canvas, {
        ratio: 1000/maxy,
        onTick: tick,
        onClick: clickCanvas,
        interval: initialInterval,
        onKeyDown: keyCanvas,
    });
    scene.items=items;
    scene.ui=ui;
    scene.init();
    scene.start();
    
})();


loadAudio("error","sound/blip01.mp3");
loadAudio("brick","sound/blip02.mp3");
loadAudio("win","sound/win.mp3");
loadAudio("bonus","sound/bonus.mp3");

