

function Sprite(options) {
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
    this.onClick=options.onClick;

    var tickId=0;
    
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

    this.clickCanvas=function(x,y){
        if (this.onClick){
            this.onClick(self,x,y);
            this.repaint();
        }
    }

    this.tick=function(){
        if (this.onTick){
            this.onTick(this);
        }
        this.repaint();
    }
    
    this.handleClick=function(ev){
        if (ev.target===canvas){
            const unit = this.getViewport()[2];
            var nx=ev.offsetX/unit;
            var ny=ev.offsetY/unit;
            this.clickCanvas(nx,ny);
        }
    }

    this.handleTouch=function(ev){
        if (ev.target===canvas){
            var unit = this.getViewport()[2];
            var element  = ev.target;
            var rect=element.getBoundingClientRect();
            console.log(ev.touches[0],rect);
            var nx=(ev.touches[0].pageX-rect.left)/unit;
            var ny=(ev.touches[0].pageY-rect.top)/unit;
            this.clickCanvas(nx,ny);
        }
    }


    this.drawItem=function(item){
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



    this.repaint=function(){
        var unit = this.getViewport()[2];
        if (ctx){
            ctx.fillStyle="#000";
            ctx.fillRect(0,0,1000*unit,750*unit);
            for(var idx in points){
                var pt=points[idx];
                this.drawItem(pt, unit);
            }
            for(var idx in ui){
                var pt=ui[idx];
                this.drawItem(pt, unit);
            }
        }
    }
    
    
    var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints;
    if (isTouch){
        window.addEventListener("touchstart",function(ev){
            self.handleTouch(ev);
        });
    }else{
        window.addEventListener("click",function(ev){
            self.handleClick(ev);
        });
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