

function Sprite(options) {
    this.type=options.type;
    this.x=options.x;
    this.y=options.y;
    this.w=options.w;
    this.h=options.h;
    this.border=options.border;
    this.borderRadius=options.borderRadius;
    this.fill=options.fill;
    this.text=options.text;
    this.start=options.start;
    this.end=options.end;
    this.fontColor=options.fontColor;
    this.fontSize=options.fontSize;
    this.fontName=options.fontName?options.fontName:"Arial";
    this.textAlign=options.textAlign?options.textAlign:"center";
    this.visible='visible' in options? options.visible : true;
    this.onclick=options.onclick;
}




function Scene(canvas, options){

    var self=this;
    var ratio=options.ratio?options.ratio:1;
    this.interval=options.interval?options.interval:40;

    if (!ratio) ratio=1;
    var w;
    var h;
    var pixelRatio=1;
    var unit=1;
    var time=0;
    var ctx=canvas.getContext("2d");

    this.onTick=options.onTick;
    this.onPointerDown=options.onPointerDown;
    this.onPointerUp=options.onPointerUp;
    this.onKeyDown=options.onKeyDown;
    this.onKeyUp=options.onKeyUp;

    var tickId=0;
    this.items=[];
    this.ui=[];
    
    this.getViewport=function(){
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


    this.linearGradient=function(x1,y1,x2,y2,colors){
        var grd = ctx.createLinearGradient(x1,y1,x2,y2);
        grd.addColorStop(0, colors[0]);
        var step=1/(colors.length-1);
        for(var idx=1;idx<colors.length;idx++){
            grd.addColorStop(Math.min(1.0,step*idx), colors[idx]);
        }
        return grd;
    }

    this.borderRadius=function(radius, unit){
        if (typeof unit === 'undefined') {
            unit = 1;
        }
        if (typeof radius === 'undefined') {
            radius = 5;
        }
        var rad = {tl: radius, tr: radius, br: radius, bl: radius};
        if (typeof radius === 'object') {
            for (var side in rad) {
                rad[side] = radius[side]*unit || rad[side]*unit;
            }
        }
        return rad;
    }

    this.roundRect=function(x, y, width, height, radius, fill, border) {
        var rad=this.borderRadius(radius);
        ctx.beginPath();
        ctx.moveTo(x + rad.tl, y);
        ctx.lineTo(x + width - rad.tr, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + rad.tr);
        ctx.lineTo(x + width, y + height - rad.br);
        ctx.quadraticCurveTo(x + width, y + height, x + width - rad.br, y + height);
        ctx.lineTo(x + rad.bl, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - rad.bl);
        ctx.lineTo(x, y + rad.tl);
        ctx.quadraticCurveTo(x, y, x + rad.tl, y);
        if (fill) {
          ctx.fill();
        }
        if (border) {
          ctx.stroke();
        }
        ctx.closePath();
      
      }

    this.handleResize=function(){
        var vp= this.getViewport();
        canvas.setAttribute("width",vp[0]);
        canvas.setAttribute("height",vp[1]);    
        canvas.setAttribute("ratio",vp[3]); 
        canvas.style.width=   (vp[0]/vp[3])+"px";
        this.repaint();
    }

    this.init=function(){
        this.handleResize();
        window.addEventListener('resize', function(){ 
            if (time) clearTimeout(time); 
            time=window.setTimeout(function(){
                self.handleResize();
            },500) 
        });    
    }

    this.setInterval=function(interval){
        this.interval=interval;
        if(tickId){
            clearTimeout(tickId);
        }
        tickId=setInterval(function(){
            self.tick();
        },this.interval);
    }

    this.start=function(){
        this.setInterval(this.interval);
    }

    this.clickCanvas=function(type,x,y){
        if (type=="down" && this.onPointerDown){
            this.onPointerDown(self,x,y);
            this.repaint();
        }
        if (type=="up" && this.onPointerUp){
            this.onPointerUp(self,x,y);
            this.repaint();
        }
    }

    this.tick=function(){
        if (this.onTick){
            this.onTick(this);
        }
        this.repaint();
    }
    
    this.handleClick=function(type,ev){
        if (ev.target===canvas){
            const unit = this.getViewport()[2];
            var nx=ev.offsetX/unit;
            var ny=ev.offsetY/unit;
            this.clickCanvas(type,nx,ny);
        }
    }

    this.handleKey=function(type,ev){
        if (type=="keydown"){
            this.isDown=true;
        }
        if (type=="keyup"){
            this.isDown=false;
        }
        //console.log("key",ev.keyCode,this.isDown)
        if (this.onKeyDown && !this.isDown){
            this.onKeyDown(self,ev.keyCode,ev);
        }
        if (this.onKeyUp){
            this.onKeyUp(self,ev.keyCode,ev);
        }
    }

    this.handleTouch=function(type,ev){
        if (ev.target===canvas){
            var unit = this.getViewport()[2];
            var element  = ev.target;
            var rect=element.getBoundingClientRect();
            console.log(ev.touches[0],rect);
            var nx=(ev.touches[0].pageX-rect.left)/unit;
            var ny=(ev.touches[0].pageY-rect.top)/unit;
            this.clickCanvas(type,nx,ny);
        }
    }


    this.drawItem=function(item){
        if (!item.visible){
            return;
        }
        if (item.fill){
            if (item.fill.type=="linear"){
                ctx.fillStyle=this.linearGradient(item.x,item.y,item.x+item.w,item.y+item.h,item.fill.colors);
            }else{
                ctx.fillStyle=item.fill;
            }
        }
        if (item.border){
            ctx.strokeStyle =item.border;
        }
        var x=item.x*unit;
        var y=item.y*unit;
        var w=item.w?item.w*unit:0;
        var h=item.h?item.h*unit:0;
        var br=item.borderRadius?item.borderRadius:5;
        var rad=this.borderRadius(br,unit);
        if (typeof br=="object"){
            br*=unit;
            br.tl
        }
        var start=item.start?item.start:0;
        var end=item.end?item.end:2*Math.PI;

        if (item.type==="rect" && item.fill){
            ctx.fillRect(x,y,w,h);
        }
        if (item.type==="round" && item.border && w>0){
            ctx.strokeRect(x,y,w,h);
        }
        if (item.type==="roundrect"){
            this.roundRect(x,y,w,h,rad,item.fill,item.border);
        }
        if (item.type==="ellipse" && w>0){
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
            ctx.font=fh+"px "+item.fontName;
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



    this.repaint=function(){
        var unit = this.getViewport()[2];
        if (ctx){
            ctx.fillStyle="#000";
            ctx.clearRect(0,0,1000*unit,750*unit);
            for(var idx in this.items){
                var pt=this.items[idx];
                this.drawItem(pt, unit);
            }
            for(var idx in this.ui){
                var pt=this.ui[idx];
                this.drawItem(pt, unit);
            }
        }
    }
    
    
    var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    if (isTouch){
        window.addEventListener("touchstart",function(ev){
            self.handleTouch("up",ev);
        });
        window.addEventListener("touchend",function(ev){
            self.handleTouch("down",ev);
        });
    }else{
        window.addEventListener("mousedown",function(ev){
            self.handleClick("down",ev);
        });
        window.addEventListener("mouseup",function(ev){
            self.handleClick("up",ev);
        });
    }
    window.addEventListener("keydown",function(ev){
        self.handleKey("keydown",ev);
    });
    window.addEventListener("keyup",function(ev){
        self.handleKey("keyup",ev);
    });

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