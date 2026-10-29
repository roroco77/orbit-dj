/* Orbit DJ — Myspoti extension API v1. */
var MOODS = {
  chill:{label:"Chill",query:"chill downtempo ambient indie"},
  focus:{label:"Focus",query:"instrumental focus lo-fi minimal"},
  happy:{label:"Happy",query:"feel good upbeat indie pop"},
  romantic:{label:"Romantic",query:"romantic soul r&b intimate indie"},
  party:{label:"Party",query:"dance pop house party anthems"},
  gym:{label:"Workout",query:"high energy workout electronic rock"},
  night:{label:"Night Drive",query:"night drive synthwave trip hop"},
  nostalgic:{label:"Nostalgic",query:"90s alternative nostalgic classics"},
  discover:{label:"Discover",query:"new alternative indie electronic discoveries"}
};
var state={mood:"chill",prompt:"",tracks:[],notice:"Elige un mood para empezar."};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
function titleOf(t){return t&&t.name||"Canción sin título";}
function artistsOf(t){return Array.isArray(t&&t.artists)?t.artists.map(function(a){return typeof a==="string"?a:a.name;}).filter(Boolean).join(", "):(t&&t.artist||"Artista desconocido");}
function duration(ms){var n=Math.max(0,Math.floor((Number(ms)||0)/1000));return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
function render(){
 var cards=state.tracks.map(function(t,i){return '<div class="track"><div class="num">'+(i+1)+'</div><div class="tracktext"><b>'+esc(titleOf(t))+'</b><span>'+esc(artistsOf(t))+'</span></div><small>'+duration(t.durationMs)+'</small></div>';}).join("");
 var moods=Object.keys(MOODS).map(function(k){return '<button class="mood '+(state.mood===k?"selected":"")+'" data-mood="'+k+'">'+esc(MOODS[k].label)+'</button>';}).join("");
 var bridge='<script>(function(){function send(x){try{MyspotiPage.postMessage(JSON.stringify(x))}catch(e){}}document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.mood){send({type:"mood",mood:b.dataset.mood});return;}if(b.dataset.action==="generate")send({type:"generate",prompt:(document.getElementById("prompt").value||"")});if(b.dataset.action==="queue")send({type:"queue"});if(b.dataset.action==="current")send({type:"current"});if(b.dataset.action==="clear")send({type:"clear"});});window.addEventListener("message",function(e){var d=e.data;if(typeof d==="string"){try{d=JSON.parse(d)}catch(_){return;}}if(d&&d.type==="render"&&typeof d.html==="string"){document.open();document.write(d.html);document.close();}});})();</script>';
 return '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#0b0d12;color:#f4f5f7;font:15px system-ui,-apple-system,sans-serif;padding:20px}.wrap{max-width:760px;margin:auto}.brand{color:#a9f36d;font-weight:800;letter-spacing:.12em;font-size:12px}.hero{padding:20px 0 14px}h1{font-size:34px;line-height:1.05;margin:8px 0}p{color:#a4a9b5;line-height:1.5}.panel{background:#151922;border:1px solid #252b37;border-radius:18px;padding:16px;margin:14px 0}.moods{display:flex;flex-wrap:wrap;gap:8px}.mood,.btn{border:1px solid #333b4a;background:#1d2330;color:#f4f5f7;padding:10px 13px;border-radius:12px;font-weight:650}.mood.selected{background:#c6ff92;color:#111;border-color:#c6ff92}.btn{background:#c6ff92;color:#111;border:0;padding:13px 16px}.btn.secondary{background:#293140;color:#fff;border:1px solid #414a5b}.row{display:flex;gap:9px;flex-wrap:wrap;margin-top:12px}input{width:100%;background:#0e1118;border:1px solid #343c4a;color:white;border-radius:12px;padding:13px;font:inherit;margin-top:9px}.track{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #282e39}.track:last-child{border:0}.num{width:26px;color:#a9f36d;font-weight:800}.tracktext{flex:1;min-width:0}.tracktext b,.tracktext span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tracktext span,small{color:#a4a9b5;font-size:12px}.status{color:#c6ff92;font-size:13px;margin-top:10px}.fine{font-size:12px;color:#828a99}</style></head><body><div class="wrap"><div class="brand">MYSPOTI / EXTENSION</div><div class="hero"><h1>Orbit DJ<span style="color:#c6ff92">.</span></h1><p>Una sesión para cada momento. Música real de Spotify, seleccionada según tu mood.</p></div><section class="panel"><b>01 — Elige el mood</b><div class="moods" style="margin-top:12px">'+moods+'</div><label for="prompt" style="display:block;margin-top:16px;font-weight:650">Afina la sesión</label><input id="prompt" placeholder="Ej. indie electrónico para conducir de noche" value="'+esc(state.prompt)+'"><div class="row"><button class="btn" data-action="generate">Generar sesión</button><button class="btn secondary" data-action="current">Qué está sonando</button></div><div class="status">'+esc(state.notice)+'</div></section><section class="panel"><b>02 — Tu selección</b><p>Orbit busca canciones disponibles en tu cuenta y prepara una selección para la cola.</p>'+(cards||'<p class="fine">Tu selección aparecerá aquí.</p>')+'<div class="row"><button class="btn" data-action="queue"'+(state.tracks.length?"":" disabled")+'>Añadir a la cola</button><button class="btn secondary" data-action="clear">Vaciar selección</button></div></section><p class="fine">Los estilos ordenan la selección; no implican BPM/tonalidad verificados, crossfade ni mezcla de audio real. La reproducción depende de tu cuenta y de Myspoti.</p></div>'+bridge+'</body></html>';
}
myspoti.provide("page",function(){return {title:"Orbit DJ",html:render()};});
myspoti.provide("message",function(msg){
 if(typeof msg==="string"){try{msg=JSON.parse(msg);}catch(_){return null;}}
 if(!msg||!msg.type)return null;
 try{
  if(msg.type==="mood"&&MOODS[msg.mood]){state.mood=msg.mood;state.notice="Mood seleccionado: "+MOODS[msg.mood].label;}
  else if(msg.type==="generate"){
   state.prompt=String(msg.prompt||"").slice(0,180);
   var result=myspoti.spotify.search.tracks((state.prompt?state.prompt+" ":"")+MOODS[state.mood].query,0,20);
   state.tracks=(result&&result.items?result.items:[]).filter(function(t){return t&&t.uri;}).slice(0,20);
   state.notice=state.tracks.length?"Encontradas "+state.tracks.length+" canciones. Revisa la selección y añádela a la cola.":"No se encontraron canciones. Prueba otra descripción.";
  }else if(msg.type==="queue"){
   var uris=state.tracks.map(function(t){return t.uri;}).filter(Boolean);
   if(!uris.length)state.notice="Primero genera una sesión.";
   else{myspoti.spotify.player.addToQueue(uris);state.notice="Se han añadido "+uris.length+" canciones a la cola.";try{myspoti.notify("Orbit DJ: "+uris.length+" canciones añadidas a la cola");}catch(_){}}
  }else if(msg.type==="current"){
   var p=myspoti.spotify.player.state();
   state.notice=p&&p.item?"Ahora suena: "+(p.item.name||"canción")+" — "+((p.item.artists||[]).map(function(a){return a.name;}).join(", ")):"No se ha podido leer la reproducción actual.";
  }else if(msg.type==="clear"){state.tracks=[];state.notice="Selección vaciada.";}
 }catch(e){state.notice="Myspoti/Spotify: "+String(e&&e.message||e).slice(0,180);}
 var html=render();
 try{myspoti.page.post({type:"render",html:html});}catch(_){}
 return {type:"render",html:html};
});
