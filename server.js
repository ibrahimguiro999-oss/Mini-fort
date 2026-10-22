// Serveur multijoueur Mini Fort BR : relais WebSocket + sert le jeu (index.html)
const http=require('http'),fs=require('fs'),path=require('path');const {WebSocketServer}=require('ws');
const PORT=process.env.PORT||8080,MAXR=100;
const srv=http.createServer((q,r)=>{if(q.url==='/health'){r.end('ok');return}
 if(q.url==='/'||q.url.startsWith('/?')){if(!q.url.includes('srv=')){r.writeHead(302,{Location:'/?srv=auto'});r.end();return}
  fs.readFile(path.join(__dirname,'index.html'),(e,d)=>{if(e){r.writeHead(404);r.end('index.html manquant');return}r.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});r.end(d)});return}
 r.writeHead(404);r.end()});
const wss=new WebSocketServer({server:srv,maxPayload:2048}),rooms=new Map();let n=0;
function bc(room,o,ex){const s=JSON.stringify(o);for(const c of room)if(c!==ex&&c.readyState===1)c.send(s)}
wss.on('connection',ws=>{let room=null;ws.id=++n;ws.on('message',d=>{let m;try{m=JSON.parse(d)}catch(e){return}
  if(m.t==='j'&&!room){const rn=String(m.r||'public').slice(0,20);room=rooms.get(rn)||new Set();if(room.size>=MAXR){ws.send(JSON.stringify({t:'f'}));ws.close();return}rooms.set(rn,room);
   ws.nm=String(m.n||'Joueur').slice(0,14);ws.sk=m.sk|0;ws.send(JSON.stringify({t:'w',id:ws.id,l:[...room].map(c=>({id:c.id,n:c.nm,sk:c.sk}))}));room.add(ws);bc(room,{t:'j',id:ws.id,n:ws.nm,sk:ws.sk},ws);return}
  if(!room)return;if(m.t==='p'||m.t==='s'||m.t==='d'){m.id=ws.id;bc(room,m,ws)}});
 ws.on('close',()=>{if(room){room.delete(ws);bc(room,{t:'l',id:ws.id});if(!room.size)for(const[k,v]of rooms)if(v===room)rooms.delete(k)}})});
srv.listen(PORT,()=>console.log('Mini Fort BR serveur sur le port '+PORT));
