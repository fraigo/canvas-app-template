(function(){
    var scene=document.getElementById("scene");
    var ctx=scene.getContext("2d");
    var unit=1;
    var PI=Math.PI;
    var PI2=2*Math.PI;
    var w=window.innerWidth;
    var h=window.innerHeight;

    window.radial=function(ctx,x,y,radius,color1,color2){
        x*=unit;
        y*=unit;
        radius*=unit;
        var grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        grd.addColorStop(0, color1);
        grd.addColorStop(1, color2);
        return grd;
    }

    window.fillStyle=function(fill){
        if (fill[0]=="radial"){
            ctx.fillStyle=radial(ctx, fill[1],fill[2],fill[3],fill[4],fill[5])
        }else{
            ctx.fillStyle=fill;
        }
    }

    window.rect = function(x,y,width,height,border,fill){
        var ctx=scene.getContext("2d");
        x*=unit;
        y*=unit;
        width*=unit;
        height*=unit;
        if (border){
            ctx.strokeStyle=border;
        }
        if (fill){
            ctx.fillStyle=fillStyle(fill);
        }
        if (border){
            ctx.drawRect(x,y,width,height);
        }
        if (fill){
            ctx.fillRect(x,y,width,height);
        }
    }

    window.circle=function(x,y,radio,border,fill){
        window.arc(x,y,radio,0,2*Math.PI,border,fill);
    }

    window.arc=function(x,y,radio,start,end,border,fill){
        var ctx=scene.getContext("2d");
        x=x*unit;
        y=y*unit;
        radio*=unit;
        if (border){
            ctx.strokeStyle=border;
        }
        if (fill){
            ctx.fillStyle=fillStyle(fill);
        }
        ctx.beginPath();
        ctx.arc(x,y,radio,start, end)
        if (border){
            ctx.stroke();
        }
        if (fill){
            ctx.fill();
        }
    }

    window.ellipse=function(x,y,radiusX,radiusY,start,end,border,fill){
        var ctx=scene.getContext("2d");
        x=x*unit;
        y=y*unit;
        radiusX*=unit;
        radiusY*=unit;
        if (border){
            ctx.strokeStyle=border;
        }
        if (fill){
            ctx.fillStyle=fillStyle(fill);
        }
        ctx.beginPath();
        ctx.ellipse(x,y,radiusX,radiusY,0,start,end);
        if (border){
            ctx.stroke();
        }
        if (fill){
            ctx.fill();
        }
    }   

    window.eye=function(cx,cy,dx,dy){
        if (!dx) dx=0;
        if (!dy) dy=10;                
        drawItems([
            ["ellipse",cx,cy,60,40,0,PI2,"#EEEE00",["radial",cx,cy,40,"#ffffff","#eeeeee"]],
            ["circle",cx+dx,cy+dy,30,null,["radial",cx+dx,cy+dy,20,"#884400","#663300"]],
            ["circle",cx+dx,cy+dy,10,null,"black"],
        ])
    }

    window.mouth=function(cx,cy, height){
        if (!height) height=180;
        drawItems([
            //mouth
            ["ellipse",cx,cy,200,height,0,PI,null,["radial",cx,cy,120,"#600000","#C00000"]],
            //teeth
            ["ellipse",cx-150,cy,50,40,0,PI,null,"white"],
            ["ellipse",cx-50,cy,50,40,0,PI,null,"white"],
            ["ellipse",cx+50,cy,50,40,0,PI,null,"white"],
            ["ellipse",cx+150,cy,50,40,0,PI,null,"white"],
            //tongue
            ["ellipse",cx,cy+height-50,80,40,0,PI,null,["radial",cx,cy+height-50,80,"#F00000","#D00000"]],
        ])
    }

    var eye1 = ["eye",400,220,0,10];
    var eye2 = ["eye",600,220,0,10];
    var mouth1 = ["mouth",500,420,160];
    var nose1 = ["ellipse",500,350,30,50,PI,PI2,null,"#CC8844"];
    var grad = ["radial",500,360,350,"#eecc00","#ffff00"];
    

    scene.addEventListener("mousemove",function(ev){
        var dx=ev.offsetX/w-0.5;
        var dy=ev.offsetY/h-0.5;
        //console.log(Math.round(50*dx),Math.round(50*dy));
        eye1[3]=50*dx;
        eye2[3]=50*dx;
        eye1[4]=25*dy;
        eye2[4]=25*dy;
        mouth1[3]=140+40*dy;
        nose1[2]=350+10*dy;
        nose1[4]=40+5*dy;
        update();
    })

    scene.addEventListener("mousedown",function(ev){
        update();
    });

    scene.addEventListener("mouseup",function(ev){
        update();
    });

    var data=[
        ["rect",0,0,1000,750,null,"#222"],
        //face
        ["ellipse",500,360,300,310,0,PI2,"#EEEE00",grad],
        //eye
        eye1,
        //eye
        eye2,
        //nose
        nose1,
        //mouth
        mouth1,
    ]

    function resize(){
        var ratio=4/3;
        var dw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
        var dh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
        w=dw;
        h=dh;
        if (w/ratio>h){
            w=h*ratio;
        }else{
            h=w/ratio;
        }
        console.log(dw,dh,w,h,w/h);
        scene.setAttribute("width",w);
        scene.setAttribute("height",h);
        unit=w/1000;
        update();
    }

    function drawItems(items){
        for(var index in items){
            var item=items[index];
            drawItem(item);
        }
    }

    function drawItem(item){
        if (typeof(window[item[0]])!="function"){
            console.error("Unknown function",item[0]);
            return;
        }
        window[item[0]](item[1],item[2],item[3],item[4],item[5],item[6],item[7],item[8]);
    }

    function update(){
        drawItems(data);
    }

    window.addEventListener("resize",resize);
    resize();


    
})();


function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) { /* Firefox */
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE/Edge */
        elem.msRequestFullscreen();
    }
}


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

