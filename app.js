window.addEventListener("error",function (msg, url, line, col, error){
    console.log(msg, url, line, col, error);
    alert(msg);
})


var line=-1;
var points =[];
var ui =[];
var time = 0;
var direction=1;
var barWidth=500;
var barHeight=60;
var step = 10;
var running = false;
var basey=740;
var stageNumber = 1;
var initialInterval = 40;
var combo=0;

var colors={
    bar: "#BB0",
    combo: "#0A0"
}
var gradients={
    bar: {type:"linear",colors:["#ff0","#a90"]},
    combo: {type:"linear",colors:["#3D2","#2a1"]},
}


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
    y: 70,
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
    text: "Click to Start",
    visible: true
});
var stageNum=new Sprite({
    id:"rect",
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
    id:"rect",
    x: 30,
    y: 70,
    w: 120,
    h: 30,
    fontColor: "#C00",
    textAlign: "left",
    text: "Max Stage "+storeRecord("towers.max_stage",1),
    visible: true
});

ui.push(score);
ui.push(maxScore);
ui.push(stageNum);
ui.push(stageMax);
ui.push(stageClear);


function keyCanvas(scene, key){
    console.log("key",key);
    clickCanvas(scene);
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
                if (newWidth==bar0.w){
                    bar.fill=gradients.combo;
                    bar0.fill=gradients.combo;
                    bar.border=colors.combo;
                    bar0.border=colors.combo;
                    combo++;
                    bar0.text=newWidth + " x"+combo;
                }else{
                    combo=0;
                }
            }
        }
        console.log("new",newX0,newX1,newWidth);
        if (newWidth==0){
            bar.fill="red";
            bar.border="black";
        }else{
            bar.x=newX0;
            bar.w=newWidth;
            if (combo>0){
                bar.text=""+newWidth+" x"+(combo+1);
            }else{
                bar.text=""+newWidth;
            }
            bar.fontSize=Math.min(30,Math.max(newWidth/10,12));
        }
        score.text=(+score.text)+newWidth; 
        var maxsc=storeRecord("towers.max_score",+score.text);
        if (maxsc>+maxScore.text){
            maxScore.fontColor="#FF0";
            maxScore.text=maxsc;
        }
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
                var maxst=storeRecord("towers.max_stage",stageNumber);
                stageMax.text="Max Stage "+maxst;
                return;
            }
        }
        var offset=Math.round(Math.random()*5)*10;
        var px=0-offset;
        if (direction==-1){
            px=1000-pw+offset;
        }
        points.push(new Sprite({id: "rect", x: px, y:basey-py, w:pw, h:barHeight, fill: gradients.bar, border: colors.bar, fontColor:"#800"}))    
    }else if(line>0){
        points[line].x+=direction*step;
        if (points[line].x+points[line].w>1000){
            direction=-1;
        }
        if (points[line].x<0){
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
    points.splice(0,points.length);
    points.push(new Sprite({id: "rect", x: 250, y:basey, w:barWidth, h:barHeight, fill: gradients.bar, border: colors.bar})) 
    running=true;
}


(function(){
    canvas = document.getElementById("scene");
    window.scene=new Scene(canvas, {
        ratio: 4/3,
        onTick: tick,
        onClick: clickCanvas,
        interval: initialInterval,
        onKeyDown: keyCanvas,
    });
    scene.points=points;
    scene.ui=ui;
    scene.init();
    scene.start();
    
})();





