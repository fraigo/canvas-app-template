window.addEventListener("error",function (msg, url, line, col, error){
    console.log(msg, url, line, col, error);
    alert(msg);
})

function Command(options) {
    this.id=options.id;
    this.x=options.x;
    this.y=options.y;
    this.w=options.w;
    this.h=options.h;
    this.border=options.border;
    this.fill=options.fill;
    this.text=options.text;
    this.start=options.start;
    this.end=options.end;
    this.fontColor=options.fontColor;
    this.fontSize=options.fontSize;
    this.textAlign=options.textAlign?options.textAlign:"center";
    this.visible='visible' in options? options.visible : true;
}

var line=0;
var points =[];
var ui =[];
var time = 0;
var direction=1;
var barWidth=500;
var barHeight=60;
var score=new Command({
    id:"rect",
    x: 880,
    y: 30,
    w: 90,
    h: 30,
    fontColor: "#fff",
    textAlign: "right",
    text: "0"
});
var maxScore=new Command({
    id:"rect",
    x: 880,
    y: 60,
    w: 90,
    h: 30,
    fontColor: "#888",
    textAlign: "right",
    text: storeRecord("towers.max_score",0)
});
var stageClear=new Command({
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
var stageNum=new Command({
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
var tickId=0;
var canvas = null;
var interval = 40;
var step = 10;
var running = false;
var basey=740;
var stageNumber = 1;


function drawItem(ctx,item, unit){
    if (!item.visible){
        return;
    }
    if (item.fill){
        ctx.fillStyle=item.fill;
    }
    if (item.border){
        ctx.strokeStyle =item.border;
    }
    var x=item.x*unit;
    var y=item.y*unit;
    var w=item.w?item.w*unit:0;
    var h=item.h?item.h*unit:0;
    var start=item.start?item.start:0;
    var end=item.end?item.end:2*Math.PI;

    if (item.id==="rect" && item.fill){
        ctx.fillRect(x,y,w,h);
    }
    if (item.id==="rect" && item.border && w>0){
        ctx.strokeRect(x,y,w,h);
    }
    if (item.id==="ellipse" && w>0){
        ctx.beginPath();
        ctx.ellipse(x,y,w/2,h/2,0,start,end);
        if (item.fill){
            ctx.fill();
        }
        if (item.border){
            ctx.stroke();
        }
    }
    if (item.text){
        var fh=Math.round((item.fontSize?item.fontSize*unit:30*unit));
        ctx.font=fh+"px Arial";
        ctx.textAlign = item.textAlign?item.textAlign:"center";
        var textX=x+w/2;
        if (ctx.textAlign=="left"){
            textX=x+2;
        }
        if (ctx.textAlign=="right"){
            textX=x+w-2;
        }
        if (item.border || item.fontColor){
            ctx.fillStyle =item.fontColor ? item.fontColor : item.border;
        }
        ctx.fillText(item.text,textX,y+h/2+fh/3,w);
    }
}

function repaint(){
    if (canvas){
        const unit = getViewport()[2];
        var ctx=canvas.getContext("2d");
        if (ctx){
            ctx.fillStyle="#000";
            ctx.fillRect(0,0,1000*unit,750*unit);
            for(var idx in points){
                var pt=points[idx];
                drawItem(ctx, pt, unit);
            }
            for(var idx in ui){
                var pt=ui[idx];
                drawItem(ctx, pt, unit);
            }
        }
    }
}
function getViewport(){
    var ratio=4/3;
    var unit=1;
    var dw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    var dh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    var w=dw;
    var h=dh;
    if (w/ratio>h){
        w=h*ratio;
    }else{
        h=w/ratio;
    }
    var pixelRatio=1;
    if (window.devicePixelRatio && window.devicePixelRatio>1){
        w*=window.devicePixelRatio;
        h*=window.devicePixelRatio; 
        pixelRatio=window.devicePixelRatio; 
        console.log(pixelRatio);
    }
    unit=w/1000;
    return [w,h,unit,pixelRatio];
}

function handleClick(ev){
    if (ev.target===canvas){
        const unit = getViewport()[2];
        var nx=ev.offsetX/unit;
        var ny=ev.offsetY/unit;
        clickCanvas(nx,ny);
    }
}
function handleTouch(ev){
    if (ev.target===canvas){
        const unit = getViewport()[2];
        var element  = ev.target;
        var rect=element.getBoundingClientRect();
        console.log(ev.touches[0],rect);
        var nx=(ev.touches[0].pageX-rect.left)/unit;
        var ny=(ev.touches[0].pageY-rect.top)/unit;
        clickCanvas(nx,ny);
    }
}

function  clickCanvas(nx,ny){
    if (stageClear.text=="Game Over"){
        stageClear.text="";
        score.text="0";
        stageNumber=1;
        barHeight=60;
        stageNum.text="Stage "+stageNumber;
        interval=40;
        startStage();
        return;
    }
    console.log(line,points);
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
        bar.x=newX0;
        bar.w=newWidth;   
        bar.text=""+newWidth;
        bar.fontSize=Math.min(30,Math.max(newWidth/10,12));
        score.text=(+score.text)+newWidth; 
        var maxsc=storeRecord("towers.max_score",+score.text);
        if (maxsc>+maxScore.text){
            maxScore.fontColor="#FF0";
            maxScore.text=maxsc;
        }
        console.log(points[line].x);
    }
    repaint();
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

function tick(){
    if (line>=points.length){
        var prev=points[line-1];
        var pw=barWidth;
        var py=line*barHeight;
        direction=Math.round(Math.random())==0?1:-1;
        if (prev){
            pw=prev.w;
            if (pw<2){
                running = false;
                stageClear.visible=true;
                stageClear.text="Game Over";
                repaint();
                return;
            }
            if ((basey-py)<barHeight){
                running = false;
                stageClear.visible=true;
                stageClear.text="Stage "+stageNumber+" cleared";
                repaint();
                setTimeout(function(){
                    storeRecord("towers.max_score",+score.text);
                    storeRecord("towers.max_stage",+stageNumber);
                    stageNumber++;
                    stageNum.text="Stage "+stageNumber;
                    startStage();
                },3000);
                return;
            }
        }
        var px=0;
        if (direction==-1){
            px=1000-pw;
        }
        points.push(new Command({id: "rect", x: px, y:basey-py, w:pw, h:barHeight, fill: "#FF0", border: "#DD0", fontColor:"#800"}))    
    }else if(line>0){
        points[line].x+=direction*step;
        if (points[line].x+points[line].w>1000){
            direction=-1;
        }
        if (points[line].x<0){
            direction=1;
        }
    }
    repaint();
    if (tickId){
        window.clearTimeout(tickId);
    }
    tickId=window.setTimeout(tick,interval);
}    


function startStage(){
    line=0;
    barWidth=500;
    barHeight-=2;
    if (interval<=20){
        interval-=2
    }else{
        interval-=5;
    }
    direction=Math.round(Math.random())==0?1:-1;
    stageClear.visible=false;
    points.splice(0,points.length);
    points.push(new Command({id: "rect", x: 250, y:basey, w:barWidth, h:barHeight, fill: "#FF0", border: "#CC0"})) 
    console.log("start",points);
    repaint();
    if (tickId){
        window.clearTimeout(tickId);
    }
    tickId=window.setTimeout(tick,50);
    running=true;
}


var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
if (isTouch){
    window.addEventListener("touchstart",handleTouch);
}else{
    window.addEventListener("click",handleClick);
}

(function(){
    var vp= getViewport();
    canvas = document.getElementById("scene");
    canvas.setAttribute("width",vp[0]);
    canvas.setAttribute("height",vp[1]);    
    canvas.setAttribute("ratio",vp[3]); 
    canvas.style.width=   (vp[0]/vp[3])+"px";
    repaint();
    window.addEventListener('resize', function(){ clearTimeout(time); time=window.setTimeout(handleResize,500) });
    if (!running){
        startStage();
    }
    
})();


(function(doc) {

    var addEvent = 'addEventListener',
        type = 'gesturestart',
        qsa = 'querySelectorAll',
        scales = [1, 1],
        meta = qsa in doc ? doc[qsa]('meta[name=viewport]') : [];

    function fix() {
        meta.content = 'width=device-width,minimum-scale=' + scales[0] + ',maximum-scale=' + scales[1];
        doc.removeEventListener(type, fix, true);
    }

    if ((meta = meta[meta.length - 1]) && addEvent in doc) {
        fix();
        scales = [.25, 1.6];
        doc[addEvent](type, fix, true);
    }

}(document));


