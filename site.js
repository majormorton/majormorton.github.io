/* shared: grids + lightbox for Motion, Stills, Sound */
var Site=(function(){
var D,kind,items,cur=-1,lb,lbin,lbcap;
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
function tile(it,i){var a=document.createElement('a');a.href='#'+(kind==='g-stills'?i+1:it.id);a.dataset.i=i;
 var src=kind==='g-motion'?'thumbs/'+it.id+'.jpg':kind==='g-sound'?it.a:it.file;
 a.innerHTML='<img loading="lazy" alt="">'+(kind!=='g-stills'?'<span class="cap">'+esc(it.t)+'</span>':'');
 a.querySelector('img').src=src;
 a.addEventListener('click',function(e){e.preventDefault();open(i)});return a}
function open(i){cur=i;var it=items[i];lb.hidden=false;document.body.classList.add('lbopen');
 if(kind==='g-motion'){lbin.innerHTML='<div class="v"><iframe src="https://player.vimeo.com/video/'+it.id+'?autoplay=1&dnt=1" allow="autoplay; fullscreen; picture-in-picture" title="'+esc(it.t)+'"></iframe></div>';lbcap.textContent=it.t;history.replaceState(null,'','#'+it.id)}
 else if(kind==='g-sound'){lbin.innerHTML='<div class="s"><img src="'+it.a+'" alt=""><iframe src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/'+it.id+'&auto_play=true&visual=false&show_comments=false&show_user=false&show_reposts=false&hide_related=true&color=%23d84624" allow="autoplay" title="'+esc(it.t)+'"></iframe></div>';lbcap.textContent=it.t;history.replaceState(null,'','#'+it.id)}
 else{lbin.innerHTML='<img src="'+it.file+'" alt="">';lbcap.textContent=it.caption||'';history.replaceState(null,'','#'+(i+1))}}
function close(){lb.hidden=true;lbin.innerHTML='';document.body.classList.remove('lbopen');history.replaceState(null,'',location.pathname)}
function step(d){if(cur<0)return;open((cur+d+items.length)%items.length)}
function init(k){kind=k;D=JSON.parse(document.getElementById('data').textContent);items=D;
 var g=document.getElementById('grid');items.forEach(function(it,i){g.appendChild(tile(it,i))});
 var c=document.getElementById('count');if(c)c.textContent=items.length;
 lb=document.getElementById('lb');lbin=document.getElementById('lbin');lbcap=document.getElementById('lbcap');
 document.getElementById('lbx').addEventListener('click',close);document.getElementById('lbp').addEventListener('click',function(){step(-1)});document.getElementById('lbn').addEventListener('click',function(){step(1)});
 lb.addEventListener('click',function(e){if(e.target===lb)close()});
 addEventListener('keydown',function(e){if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)});
 var h=location.hash.slice(1);if(h){var i=kind==='g-stills'?parseInt(h,10)-1:items.findIndex(function(x){return String(x.id)===h});if(i>=0&&i<items.length)open(i)}}
return {init:init}})();
