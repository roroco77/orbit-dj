/* Orbit DJ — Myspoti extension API v1.1 */
var MOODS={chill:{label:"Chill",query:"chill downtempo ambient indie"},focus:{label:"Focus",query:"instrumental focus lo-fi minimal"},happy:{label:"Happy",query:"feel good upbeat indie pop"},romantic:{label:"Romantic",query:"romantic soul r&b intimate indie"},party:{label:"Party",query:"dance pop house party anthems"},gym:{label:"Workout",query:"high energy workout electronic rock"},night:{label:"Night Drive",query:"night drive synthwave trip hop"},nostalgic:{label:"Nostalgic",query:"90s alternative nostalgic classics"},discover:{label:"Discover",query:"new alternative indie electronic discoveries"}};
var state={mood:"chill",prompt:"",tracks:[],notice:"Pulsa «Crear mi mix» para usar tus escuchas recientes.",voiceText:"¡Hola! Soy Orbit, tu DJ personal. Voy a preparar música para ti.",source:""};
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c];});}
function titleOf(t){return t&&(t.name||t.title)||"Canción sin título";}
function artistsOf(t){if(Array.isArray(t&&t.artists))return t.artists.map(function(a){return typeof a==="string"?a:a.name;}).filter(Boolean).join(", ");return t&&(t.artist||t.subtitle)||"Artista desconocido";}
function duration(ms){var n=Math.max(0,Math.floor((Number(ms)||0)/1000));return Math.floor(n/60)+":"+String(n%60).padStart(2,"0");}
function render(){
 var cards=state.tracks.map(function(t,i){return '<div class="track"><div class="num">'+(i+1)+'</div><div class="tracktext"><b>'+esc(titleOf(t))+'</b><span>'+esc(artistsOf(t))+'</span></div><small>'+duration(t.durationMs)+'</small></div>';}).join("");
 var moods=Object.keys(MOODS).map(function(k){return '<button class="mood '+(state.mood===k?"selected":"")+'" data-mood="'+k+'">'+esc(MOODS[k].label)+'</button>';}).join("");
 var bridge='<script>(function(){function send(x){try{MyspotiPage.postMessage(JSON.stringify(x))}catch(e){}}function speak(t){try{if("speechSynthesis"in window){window.speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(t);u.lang="es-ES";u.rate=1.02;window.speechSynthesis.speak(u);}}catch(e){}}document.addEventListener("click",function(e){var b=e.target.closest("button");if(!b)return;if(b.dataset.mood){send({type:"mood",mood:b.dataset.mood});return;}var a=b.dataset.action;if(a==="generate")send({type:"generate",prompt:(document.getElementById("prompt").value||"")});if(a==="queue")send({type:"queue"});if(a==="current")send({type:"current"});if(a==="clear")send({type:"clear"});if(a==="voice")send({type:"voice"});});window.addEventListener("message",function(e){var d=e.data;if(typeof d==="string"){try{d=JSON.parse(d)}catch(_){return;}}if(!d)return;if(d.type==="speak"){speak(d.text||"Tu mix está preparado.");return;}if(d.type==="render"&&typeof d.html==="string"){document.open();document.write(d.html);document.close();}});})();</script>';
 return '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}body{margin:0;background:#0b0d12;color:#f4f5f7;font:15px system-ui,-apple-system,sans-serif;padding:20px}.wrap{max-width:760px;margin:auto}.brand{color:#a9f36d;font-weight:800;letter-spacing:.12em;font-size:12px}h1{font-size:34px;margin:8px 0}.panel{background:#151922;border:1px solid #252b37;border-radius:18px;padding:16px;margin:14px 0}p{color:#a4a9b5;line-height:1.5}.moods,.row{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.mood,.btn{border:1px solid #333b4a;background:#1d2330;color:#f4f5f7;padding:10px 13px;border-radius:12px;font-weight:650}.mood.selected,.btn{background:#c6ff92;color:#111;border-color:#c6ff92}.btn.secondary{background:#293140;color:#fff;border-color:#414a5b}input{width:100%;background:#0e1118;border:1px solid #343c4a;color:white;border-radius:12px;padding:13px;font:inherit;margin-top:9px}.track{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #282e39}.num{width:26px;color:#a9f36d;font-weight:800}.tracktext{flex:1;min-width:0}.tracktext b,.tracktext span{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.tracktext span,small,.fine{color:#a4a9b5;font-size:12px}.status{color:#c6ff92;font-size:13px;margin-top:10px}</style></head><body><div class="wrap"><div class="brand">PERSONAL MUSIC INTELLIGENCE</div><h1>Orbit DJ<span style="color:#c6ff92">.</span></h1><p>Tu DJ personal: aprende de lo que escuchas, encuentra sonidos afines y te cuenta qué viene después.</p><section class="panel"><b>Tu sesión, basada en tus escuchas</b><p>Usa las canciones que has reproducido recientemente para buscar temas parecidos y preparar una selección nueva.</p><div class="moods">'+moods+'</div><input id="prompt" placeholder="Dile qué te apetece: indie para conducir, electrónica suave..." value="'+esc(state.prompt)+'"><div class="row"><button class="btn" data-action="generate">Crear mi mix</button><button class="btn secondary" data-action="voice">▶ Escuchar al DJ</button></div><div class="status">'+esc(state.notice)+'</div></section><section class="panel"><b>Tu mix</b>'+ (cards||'<p>Tu selección aparecerá aquí después de crear el mix.</p>')+'<div class="row"><button class="btn" data-action="queue"'+(state.tracks.length?"":" disabled")+'>Añadir a la cola</button><button class="btn secondary" data-action="clear">Limpiar</button><button class="btn secondary" data-action="current">Qué está sonando</button></div></section><p class="fine">La voz usa la síntesis de voz disponible en Android WebView y se escucha al abrir esta página. Si el sistema no ofrece síntesis de voz, la selección musical sigue funcionando. El mix no hace crossfade ni mezcla el audio físicamente.</p></div>'+bridge+'</body></html>';
}
function say(text){state.voiceText=text;try{myspoti.page.post({type:"speak",text:text});}catch(_){}}
function recentTracks(){
 var page=myspoti.spotify.recents.recentEntries(0,50);
 var items=page&&page.items?page.items:[];
 return items.filter(function(e){return e&&e.music&&e.item&&e.item.kind==="TRACK"&&e.item.uri;}).map(function(e){return e.item;});
}
function createMix(prompt){
 state.prompt=String(prompt||"").slice(0,180);
 var recent=[];
 try{recent=recentTracks();}catch(e){state.notice="No he podido leer tu historial. Comprueba los permisos de Spotify/Myspoti: "+String(e.message||e).slice(0,100);return;}
 var seeds=recent.slice(0,8).map(function(t){return t.title+" "+(t.subtitle||"");}).filter(Boolean);
 var query=(state.prompt?state.prompt+" ":"")+MOODS[state.mood].query+(seeds.length?" "+seeds.slice(0,3).join(" "):"");
 var result=myspoti.spotify.search.tracks(query,0,30);
 var found=result&&result.items?result.items:[];
 var seen={};recent.forEach(function(t){seen[t.uri]=true;});
 state.tracks=found.filter(function(t){if(!t||!t.uri||seen[t.uri])return false;seen[t.uri]=true;return true;}).slice(0,20);
 if(!state.tracks.length&&recent.length){state.tracks=recent.slice(0,12);state.notice="No he encontrado suficientes recomendaciones nuevas; te propongo una selección de tus escuchas recientes.";}
 else state.notice="Mix listo: "+state.tracks.length+" canciones nuevas, inspirado en "+recent.length+" reproducciones recientes.";
 var intro=state.tracks.length?"He revisado tus reproducciones recientes y he preparado una selección de "+state.tracks.length+" canciones para tu mood "+MOODS[state.mood].label+". "+(state.tracks[0]?"Empezamos con "+titleOf(state.tracks[0])+" de "+artistsOf(state.tracks[0])+".":"¡Vamos allá!"):"No he podido crear un mix todavía. Prueba otro mood o revisa los permisos.";
 say(intro);
}
myspoti.provide("home",function(){
 return [{type:"section",title:"Orbit DJ",subtitle:"Tu DJ personal, basado en lo que escuchas",blocks:[
 {type:"text",text:"Activa tu mix personalizado y descubre música que encaja con tus gustos.",style:"body"},
 {type:"button",label:"Activar mi DJ",icon:"music",action:"orbitdj.start"},
 {type:"button",label:"Recomendaciones",icon:"radio",action:"orbitdj.recommend"}
 ]}];
});
myspoti.provide("tap",function(e){
 if(!e||!e.action||e.action.indexOf("orbitdj.")!==0)return;
 try{
  if(e.action==="orbitdj.start"||e.action==="orbitdj.recommend"){
   state.mood=e.action==="orbitdj.recommend"?"discover":state.mood;
   createMix("");
   if(state.tracks.length){myspoti.spotify.player.addToQueue(state.tracks.map(function(t){return t.uri;}));state.notice+=" Canciones añadidas a la cola.";}
   try{myspoti.notify("Orbit DJ: "+state.notice);}catch(_){}
   say(state.voiceText);
  }
 }catch(err){try{myspoti.notify("Orbit DJ: "+String(err.message||err).slice(0,120));}catch(_){}}
});
myspoti.provide("page",function(){return {title:"Orbit DJ",html:render()};});
myspoti.provide("message",function(msg){
 if(typeof msg==="string"){try{msg=JSON.parse(msg);}catch(_){return null;}}
 if(!msg||!msg.type)return null;
 try{
  if(msg.type==="mood"&&MOODS[msg.mood]){state.mood=msg.mood;state.notice="Mood seleccionado: "+MOODS[msg.mood].label;}
  else if(msg.type==="generate")createMix(msg.prompt);
  else if(msg.type==="voice")say(state.voiceText);
  else if(msg.type==="queue"){var uris=state.tracks.map(function(t){return t.uri;}).filter(Boolean);if(!uris.length)state.notice="Primero genera una sesión.";else{myspoti.spotify.player.addToQueue(uris);state.notice="Se han añadido "+uris.length+" canciones a la cola.";try{myspoti.notify("Orbit DJ: "+uris.length+" canciones añadidas a la cola");}catch(_){}}}
  else if(msg.type==="current"){var p=myspoti.spotify.player.state();state.notice=p&&p.item?"Ahora suena: "+(p.item.name||"canción")+" — "+((p.item.artists||[]).map(function(a){return a.name;}).join(", ")):"No se ha podido leer la reproducción actual.";}
  else if(msg.type==="clear"){state.tracks=[];state.notice="Selección vaciada.";}
 }catch(e){state.notice="Myspoti/Spotify: "+String(e&&e.message||e).slice(0,180);}
 var html=render();try{myspoti.page.post({type:"render",html:html});}catch(_){}
 return {type:"render",html:html};
});
