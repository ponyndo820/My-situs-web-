/* Menyesuaikan ukuran huruf dasar (rem) dengan perangkat sentuh,
   termasuk saat browser memakai "mode desktop" atau zoom out. */
(function(){
  var d=document.documentElement,
      mq=window.matchMedia?matchMedia("(pointer: coarse)"):null;
  function fit(){
    var r=1,sw=screen.width||0;
    if(mq&&mq.matches&&sw){r=Math.round(Math.min(4,innerWidth/sw)*20)/20}
    if(r<1.1)r=1;
    window.skala=r;
    d.style.fontSize=r>1?(16*r)+"px":"";
  }
  fit();
  addEventListener("resize",fit);
  addEventListener("orientationchange",function(){setTimeout(fit,250)});
})();
