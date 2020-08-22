window.addEventListener("error",function (msg, url, line, col, error){
    console.log(msg, url, line, col, error);
    alert(msg);
})


var line=0;
var points =[];
var ui =[];
var time = 0;
var direction=1;
var barWidth=500;
var barHeight=60;
var score=new Sprite({
    id:"rect",
    x: 880,
    y: 30,
    w: 90,
    h: 30,
    fontColor: "#fff",
    textAlign: "right",
    text: "0"
});
var maxScore=new Sprite({
    id:"rect",
    x: 880,
    y: 60,
    w: 90,
    h: 30,
    fontColor: "#888",
    textAlign: "right",
    text: storeRecord("towers.max_score",0)
});
var stageClear=new Sprite({
    id:"rect",
    x: 0,
    y: 0,
    w: 1000,
    h: 750,
    fill: "rgba(0,0,0,0.5)",
    fontColor: "#fff",
    text: "Stage Cleared",
    visible: false
});
var stageNum=new Sprite({
    id:"rect",
    x: 30,
    y: 30,
    w: 90,
    h: 30,
    fontColor: "#fff",
    text: "Stage 1",
    visible: true
});
ui.push(score);
ui.push(maxScore);
ui.push(stageNum);
ui.push(stageClear);

var step = 10;
var running = false;
var basey=740;
var stageNumber = 1;
var initialInterval = 40;




function clickCanvas(scene, nx,ny){
    if (stageClear.text=="Game Over"){
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
        var bar =points[line];
        var bar0 = points[line-1];
        var bw = (bar.w?bar.w:0);
        var newX0=Math.max(bar.x,0);
        var newX1=Math.min(bar.x+bw,1000);
        var newWidth=Math.max(0,newX1-newX0);

        if (line>0){
            if (bar0){
                newX0=Math.max(bar.x,points[line-1].x);
                newX1=Math.min(bar.x+bw,points[line-1].x+(bar0.w?bar0.w:0));
                newWidth=Math.max(0,newX1-newX0);
            }
        }
        console.log("new",newX0,newX1,newWidth);
        if (newWidth==0){
            bar.fill="red";
            bar.border="black";
        }else{
            bar.x=newX0;
            bar.w=newWidth;
            bar.text=""+newWidth;
            bar.fontSize=Math.min(30,Math.max(newWidth/10,12));
        }
        score.text=(+score.text)+newWidth; 
        var maxsc=storeRecord("towers.max_score",+score.text);
        if (maxsc>+maxScore.text){
            maxScore.fontColor="#FF0";
            maxScore.text=maxsc;
        }
        console.log(points[line].x);
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
    if (line>=points.length){
        var prev=points[line-1];
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
                running = false;
                stageClear.visible=true;
                stageClear.text="Stage "+stageNumber+" cleared";
                return;
            }
        }
        var px=0;
        if (direction==-1){
            px=1000-pw;
        }
        points.push(new Sprite({id: "rect", x: px, y:basey-py, w:pw, h:barHeight, fill: "#FF0", border: "#DD0", fontColor:"#800"}))    
    }else if(line>0){
        points[line].x+=direction*step;
        if (points[line].x+points[line].w>1000){
            direction=-1;
        }
        if (points[line].x<0){
            direction=1;
        }
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
    points.splice(0,points.length);
    points.push(new Sprite({id: "rect", x: 250, y:basey, w:barWidth, h:barHeight, fill: "#FF0", border: "#CC0"})) 
    running=true;
}


(function(){
    canvas = document.getElementById("scene");
    window.scene=new Scene(canvas, {
        ratio: 4/3,
        onTick: tick,
        onClick: clickCanvas,
        interval: initialInterval
    });
    scene.init();
    startStage(scene);
    scene.start();
    
})();





