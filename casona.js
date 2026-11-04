/* Casona de Andes Electrónica (Benjamin, 2026-11-03): componente <andes-casona> hecho con ChatGPT (casona-andes-noche-v14.html,
   que suma la versión de noche a la v10), sin dependencias ni conexiones externas. Dibuja la casona en WebGL (o en canvas 2D
   si no hay WebGL) y la cámara da la vuelta según el scroll. Atributos: theme ("night" para la de noche; el sitio lo pone
   según su tema, abajo), scroll-target, progress (0–1, fijo), strength (0–2) y, agregados aquí, rango ("a,b": el scroll
   recorre sólo esa parte de la vuelta) y escala. Con movimiento reducido queda en la vista del medio. Las ilustraciones
   fijas de respaldo están en img/casona.svg y img/casona-noche.svg. */
/* Andes Casona — standalone component, no external dependencies. */
(()=>{
/* Casona Andes. Geometry reconstructed from the supplied facade photographs and
 * oblique aerial references. The front garden is intentionally kept open.
 * World axes: X horizontal, Y vertical, +Z toward the garden. Units are relative.
 * Side and rear dimensions are approximate; the camera stays near the facade. */
const PALETTE = {
  paper: '#eef1ec', wall: '#eef0eb', side: '#d1dbd5', top: '#f6f7f2', underside: '#c5d1cc',
  navy: '#18354f', fine: '#697c88', copper: '#9a663f', metal: '#466779',
  glass: '#dce6e5', glassAlt: '#e5ece8', green: '#7e9180', ground: '#e7ece4',
  paving: '#e1e5de', dark: '#c6d0cd', light: '#f1f3ee',
  roof: '#e3e8df', stone: '#ebece4', stoneShade: '#d5dbd2',
  hardware: '#4d6267', bloom: '#b18570', glassBlue: '#d7e3e6', glassMint: '#dfe8de',
  entryGlass: '#d1dbd5', windowBlue: '#d7e3e6', windowMint: '#dfe8de',
  water: '#dce6e5', vent: '#dce6e5', gate: '#dce6e5', bulb: '#f1f3ee'
};
const NIGHT_PALETTE = {
  paper:'#0a1321',wall:'#24364b',side:'#14263a',top:'#3b5165',underside:'#142338',
  navy:'#a5b9c8',fine:'#688397',copper:'#c99b6c',metal:'#8da6b7',
  glass:'#967348',glassAlt:'#ab8753',green:'#66867c',ground:'#11232b',
  paving:'#213139',dark:'#16263a',light:'#3a5062',roof:'#23394b',
  stone:'#72828b',stoneShade:'#405566',hardware:'#718794',bloom:'#bb927b',
  glassBlue:'#284555',glassMint:'#28483f',entryGlass:'#9d7c50',
  windowBlue:'#8d7756',windowMint:'#a28a5f',water:'#355967',vent:'#31495b',
  gate:'#122538',bulb:'#fff0c9'
};
const NIGHT_LIGHT_GAIN=.62;
const rgb = hex => {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255];
};
function makeScene(theme='day',{flatLighting=false}={}) {
  const night=theme==='night',palette=night?NIGHT_PALETTE:PALETTE;
  const faces = [], lines = [], animated = [], lights=[],glows=[];
  const emissive=new Set(['glass','glassAlt','entryGlass','windowBlue','windowMint','bulb']);
  const lightsForward=.8;
  const color = key => {
    const hex=palette[key]||key;
    if(!night||!emissive.has(key))return hex;
    return '#'+rgb(hex).map(c=>Math.round(c*255*Math.sqrt(NIGHT_LIGHT_GAIN)).toString(16).padStart(2,'0')).join('');
  };
  function light(position,reach,power,radius=0,strength=.65,target=null,inner=24,outer=42) {
    if(!night)return;
    const delta=target?.map((v,i)=>v-position[i]),length=delta?Math.hypot(...delta):1;
    lights.push({position,reach,power,...(target?{target,direction:delta.map(v=>v/length),
      innerCos:Math.cos(inner*Math.PI/180),outerCos:Math.cos(outer*Math.PI/180)}:{})});
    if(radius)glows.push({position,radius,color:'#ffd39a',strength:strength*NIGHT_LIGHT_GAIN});
  }
  function line(a, b, ink = 'navy', width = 1, alpha = .88) {
    lines.push({ a, b, color: color(ink), width, alpha });
  }
  function path(points, ink = 'navy', width = 1, alpha = .88, close = false) {
    for (let i = 1; i < points.length; i++) line(points[i - 1], points[i], ink, width, alpha);
    if (close) line(points.at(-1), points[0], ink, width, alpha);
  }
  function face(points, fill = 'wall', outline = false, ink = 'navy', width = 1) {
    faces.push({ points, color: color(fill),...(night&&emissive.has(fill)?{emissive:true}:{}) });
    if (outline) path(points, ink, width, .87, true);
  }
  function box(x0, y0, z0, x1, y1, z1, fill = 'wall', ink = 'navy', weight = 1, frontHole = null) {
    const p = [[x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],
      [x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1]];
    const side = fill === 'wall' ? 'side' : fill;
    const top = fill === 'wall' ? 'top' : fill;
    for (const [ids, c] of [[[0,3,2,1],side],[[0,4,7,3],side],[[1,2,6,5],side],
      [[0,1,5,4],side],[[3,7,6,2],top]]) face(ids.map(i=>p[i]),c);
    if(frontHole){
      const {x,y,w,h}=frontHole,q=(a,b)=>[a,b,z1];
      face([q(x0,y0),q(x,y0),q(x,y1),q(x0,y1)],fill);
      face([q(x+w,y0),q(x1,y0),q(x1,y1),q(x+w,y1)],fill);
      face([q(x,y0),q(x+w,y0),q(x+w,y),q(x,y)],fill);
      face([q(x,y+h),q(x+w,y+h),q(x+w,y1),q(x,y1)],fill);
    }else face([p[4],p[5],p[6],p[7]],fill);
    for (const [a,b] of [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]])
      line(p[a],p[b],ink,weight,.84);
  }
  function extrude(plan, y0, y1, fill = 'wall', ink = 'navy', width = 1) {
    const upper = plan.map(([x,z])=>[x,y1,z]);
    const lower = plan.map(([x,z])=>[x,y0,z]);
    face(upper,fill==='wall'?'top':fill); face(lower,fill==='wall'?'underside':fill);
    for(let i=0;i<plan.length;i++) {
      const j=(i+1)%plan.length;
      face([lower[i],lower[j],upper[j],upper[i]],fill==='wall'?'side':fill);
      line(lower[i],lower[j],ink,width); line(upper[i],upper[j],ink,width);
      // Keep curved slab edges continuous without drawing tessellation seams.
      if(i===0 || i===plan.length-1) line(lower[i],upper[i],ink,width);
    }
  }
  function opening(x,y,w,h,z,cols=1,rows=1,ink='metal',bars=0,glazing='glass') {
    const q=(xx,yy)=>[xx,yy,z+.035];
    face([q(x,y),q(x+w,y),q(x+w,y+h),q(x,y+h)],glazing);
    for(let i=0;i<cols;i++) if(i%2===0&&(glazing==='glass'||(!night&&glazing==='gate'))) {
      const a=x+i*w/cols+.012,b=x+(i+1)*w/cols-.012;
      face([q(a,y+.01),q(b,y+.01),q(b,y+h-.01),q(a,y+h-.01)],'glassAlt');
    }
    path([q(x,y),q(x+w,y),q(x+w,y+h),q(x,y+h)],ink,1.1,.9,true);
    const inset=.055;
    path([q(x+inset,y+inset),q(x+w-inset,y+inset),q(x+w-inset,y+h-inset),q(x+inset,y+h-inset)],'fine',.57,.68,true);
    for(let i=1;i<cols;i++) line(q(x+w*i/cols,y),q(x+w*i/cols,y+h),ink,.88);
    for(let i=1;i<rows;i++) line(q(x,y+h*i/rows),q(x+w,y+h*i/rows),ink,.7);
    for(let i=1;i<bars;i++) line([x+w*i/bars,y-.045,z+.095],[x+w*i/bars,y+h+.045,z+.095],ink,.62,.78);
    line([x-.055,y-.04,z+.07],[x+w+.055,y-.04,z+.07],'navy',.9);
    // Solid jambs sit in front of the glass, so the frame reads as a volume.
    const frame=.052,front=z+.14,back=z+.012;
    box(x-frame,y-frame,back,x,y+h+frame,front,'wall','fine',.57);
    box(x+w,y-frame,back,x+w+frame,y+h+frame,front,'wall','fine',.57);
    box(x,y-frame,back,x+w,y,front,'wall','fine',.57);
    box(x,y+h,back,x+w,y+h+frame,front,'wall','fine',.57);
  }
  function inwardWindow(x,y,w,h,wallZ) {
    const hingeZ=wallZ+.065,backZ=wallZ-.84,frame=.052;
    // A real aperture and interior reveals keep inward-moving leaves visible.
    face([[x,y,backZ],[x+w,y,backZ],[x+w,y+h,backZ],[x,y+h,backZ]],'side');
    face([[x,y,wallZ],[x,y,backZ],[x,y+h,backZ],[x,y+h,wallZ]],'underside');
    face([[x+w,y,backZ],[x+w,y,wallZ],[x+w,y+h,wallZ],[x+w,y+h,backZ]],'stoneShade');
    face([[x,y,wallZ],[x+w,y,wallZ],[x+w,y,backZ],[x,y,backZ]],'stoneShade');
    face([[x,y+h,backZ],[x+w,y+h,backZ],[x+w,y+h,wallZ],[x,y+h,wallZ]],'underside');
    box(x-frame,y-frame,wallZ-.01,x,y+h+frame,hingeZ+.075,'wall','metal',.75);
    box(x+w,y-frame,wallZ-.01,x+w+frame,y+h+frame,hingeZ+.075,'wall','metal',.75);
    box(x,y-frame,wallZ-.01,x+w,y,hingeZ+.075,'wall','metal',.75);
    box(x,y+h,wallZ-.01,x+w,y+h+frame,hingeZ+.075,'wall','metal',.75);
    const cellW=w/4,cellH=h/4,mullion=.027,gap=.018;
    // The 4×4 grid remains fixed. Letters run down from the top; numbers run
    // left to right. Only the two central panes in row B have moving frames.
    for(let col=1;col<4;col++){
      const xx=x+col*cellW;
      box(xx-mullion/2,y,hingeZ-.018,xx+mullion/2,y+h,hingeZ+.018,'light','metal',.63);
    }
    for(let row=1;row<4;row++){
      const yy=y+row*cellH;
      box(x,yy-mullion/2,hingeZ-.018,x+w,yy+mullion/2,hingeZ+.018,'light','metal',.60);
    }
    for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const left=x+col*cellW+gap,right=x+(col+1)*cellW-gap;
      const leafY=y+h-(row+1)*cellH+gap,leafH=cellH-gap*2;
      const glazing=(row+col)%2?'glass':'glassAlt';
      if(row!==1||(col!==1&&col!==2)){
        face([[left,leafY,hingeZ],[right,leafY,hingeZ],[right,leafY+leafH,hingeZ],[left,leafY+leafH,hingeZ]],glazing);
        continue;
      }
      const firstFace=faces.length,firstLine=lines.length,border=.014;
      const direction=col===1?1:-1,pivotX=direction===1?left:right;
      face([[left+border,leafY+border,hingeZ],[right-border,leafY+border,hingeZ],
        [right-border,leafY+leafH-border,hingeZ],[left+border,leafY+leafH-border,hingeZ]],glazing);
      for(const xx of [left,right-border])
        box(xx,leafY,hingeZ-.012,xx+border,leafY+leafH,hingeZ+.012,'light','metal',.62);
      for(const yy of [leafY,leafY+leafH-border])
        box(left,yy,hingeZ-.012,right,yy+border,hingeZ+.012,'light','metal',.62);
      const handleX=direction===1?right-.025:left+.025;
      line([handleX,leafY+leafH*.40,hingeZ+.028],[handleX,leafY+leafH*.60,hingeZ+.028],'navy',.65,.88);
      for(const yy of [leafY+leafH*.2,leafY+leafH*.8])
        box(pivotX-.009,yy-.015,hingeZ-.012,pivotX+.009,yy+.015,hingeZ+.022,'metal','metal',.40);
      animated.push({id:`window-B${col+1}`,pivot:[pivotX,leafY,hingeZ],direction,
        freeEdge:[direction===1?right:left,leafY+leafH/2,hingeZ],
        faces:faces.splice(firstFace),lines:lines.splice(firstLine)});
    }
  }
  function cylinder(x,y,z,r,h,fill='wall',n=12) {
    const plan=Array.from({length:n},(_,i)=>[x+r*Math.cos(i/n*Math.PI*2),z+r*Math.sin(i/n*Math.PI*2)]);
    extrude(plan,y,y+h,fill,'fine',.55);
  }
  function tint(hex,factor) {
    return '#'+rgb(color(hex)).map(v=>Math.max(0,Math.min(255,Math.round(v*factor*255))).toString(16).padStart(2,'0')).join('');
  }
  function ring(x,y,z,rx,rz,ink='fine',width=.6,alpha=.8,n=20) {
    path(Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [x+Math.cos(a)*rx,y,z+Math.sin(a)*rz];}),ink,width,alpha,true);
  }
  function lathe(x,y,z,profile,fill='stone',n=16,rings=[]) {
    const levels=profile.map(([height,radius])=>Array.from({length:n},(_,i)=>{
      const a=i/n*Math.PI*2;return [x+Math.cos(a)*radius,y+height,z+Math.sin(a)*radius];
    }));
    for(let k=1;k<levels.length;k++)for(let j=0;j<n;j++){
      const next=(j+1)%n,a=(j+.5)/n*Math.PI*2;
      face([levels[k-1][j],levels[k-1][next],levels[k][next],levels[k][j]],tint(fill,.92+.07*Math.cos(a+1.1)));
    }
    face(levels[0],fill);face(levels.at(-1),fill);
    for(const index of rings)path(levels[index],'fine',.65,.85,true);
    for(const j of [1,Math.floor(n/2)+1])path(levels.map(level=>level[j]),'fine',.5,.55);
  }
  function tube(a,b,r0=.025,r1=r0,fill='hardware',n=7) {
    const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d),axis=d.map(v=>v/len);
    const ref=Math.abs(axis[1])>.9?[1,0,0]:[0,1,0];
    const u=[axis[1]*ref[2]-axis[2]*ref[1],axis[2]*ref[0]-axis[0]*ref[2],axis[0]*ref[1]-axis[1]*ref[0]];
    const ul=Math.hypot(...u);for(let i=0;i<3;i++)u[i]/=ul;
    const v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]];
    const points=(p,r)=>Array.from({length:n},(_,i)=>{const t=i/n*Math.PI*2;return p.map((c,k)=>c+r*(Math.cos(t)*u[k]+Math.sin(t)*v[k]));});
    const p=points(a,r0),q=points(b,r1);
    for(let i=0;i<n;i++)face([p[i],p[(i+1)%n],q[(i+1)%n],q[i]],tint(fill,.92+.06*Math.cos(i/n*Math.PI*2)));
    face(p,fill);face(q,fill);
  }
  function ellipsoid(x,y,z,rx,ry,rz,fill='stone',n=10,bands=5) {
    const rows=Array.from({length:bands+1},(_,j)=>{
      const latitude=-Math.PI/2+Math.PI*j/bands;
      return Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2;return [x+Math.cos(a)*Math.cos(latitude)*rx,y+Math.sin(latitude)*ry,z+Math.sin(a)*Math.cos(latitude)*rz];});
    });
    for(let j=0;j<bands;j++)for(let i=0;i<n;i++)face([rows[j][i],rows[j][(i+1)%n],rows[j+1][(i+1)%n],rows[j+1][i]],tint(fill,.91+.08*Math.cos(i/n*Math.PI*2+1)));
  }
  function leaf(origin, angle, size=.22, pitch=.35, ink='green') {
    const [x,y,z]=origin,points=[];
    for(const side of [1,-1])for(let i=0;i<=5;i++){
      const t=side===1?i/5:1-i/5,along=t*size,across=Math.sin(t*Math.PI)*size*.23*side;
      points.push([x+Math.cos(angle)*along-Math.sin(angle)*across,y+pitch*along,z+Math.sin(angle)*along+Math.cos(angle)*across]);
    }
    path(points,ink,.5,.74,true);
  }
  function plant(x,y,z,scale=1,seed=0) {
    for(let k=0;k<5;k++) {
      const a=k*2.399+seed, r=.12*scale;
      const end=[x+Math.cos(a)*r,y+(.32+(k%3)*.1)*scale,z+Math.sin(a)*r];
      line([x,y,z],end,'green',.65,.83);
      leaf([x+(end[0]-x)*.6,y+scale*.18,z+(end[2]-z)*.6],a+.6,.26*scale,.6);
      leaf(end,a+2.4,.19*scale,.5);
    }
  }
  function flower(x,y,z,r=.055) {
    const petals=Array.from({length:15},(_,i)=>{const a=i/15*Math.PI*2,s=r*(.8+.2*Math.cos(a*5));return [x+Math.cos(a)*s,y+Math.sin(a)*s,z];});
    face(petals,'bloom');path(petals,'copper',.42,.65,true);
  }
  function geranium(x,y,z,scale=1,seed=0) {
    for(let j=0;j<5;j++){
      const a=j*2.4+seed,px=x+Math.cos(a)*.21*scale,pz=z+Math.sin(a)*.16*scale;
      const py=y+(.14+(j%3)*.075)*scale;
      line([x,y,z],[px,py,pz],'green',.48,.78);
      const points=Array.from({length:12},(_,k)=>{const t=k/12*Math.PI*2,r=(.10+.012*Math.cos(t*5))*scale;return [px+Math.cos(t)*r,py+Math.sin(t)*r*.65,pz+Math.sin(t)*r*.35];});
      face(points,'glassMint');path(points,'green',.43,.75,true);
      if(j%2===0){const fy=py+.20*scale;line([px,py,pz],[px+.035,fy,pz],'green',.43,.8);flower(px+.035,fy,pz+.03,.052*scale);}
    }
  }
  function canopy(x,y,z,rx,ry,seed=0) {
    // Open, unfilled crowns preserve the window and entrance silhouettes.
    const outline=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2,r=1+.075*Math.sin(a*5+seed)+.045*Math.cos(a*9);return [x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r,z+Math.sin(a*3)*.12];});
    path(outline,'green',.56,.53,true);
    for(let j=0;j<7;j++){
      const a=j*2.4+seed,r=.25+.06*(j%3);
      leaf([x+Math.cos(a)*rx*r,y+Math.sin(a)*ry*r,z+.08],a,.24,.65,'green');
    }
  }
  function multiStemTree(x,z) {
    const tips=[[-.65,4.1,-.25],[-.32,4.8,.1],[.12,5.05,-.1],[.52,4.55,.2],[.96,4.05,.1],[.8,3.45,-.1]];
    for(let i=0;i<tips.length;i++){
      const [tx,ty,tz]=tips[i],base=[x+(i-2.5)*.055,.04,z],mid=[x+tx*.27,1.6+(i%2)*.15,z+tz*.3],top=[x+tx,ty,z+tz];
      tube(base,mid,.046,.028,'fine',6);tube(mid,top,.028,.012,'fine',6);
      path([base,mid,top],'fine',.7,.8);
      const branch=[top[0]+(i%2?-.4:.4),top[1]-.1,top[2]+.13];
      line([x+tx*.6,ty*.69,z+tz*.7],branch,'fine',.55,.68);
      canopy(top[0]+.2,top[1]-.05,top[2],.65+(i%2)*.18,.48+(i%3)*.06,i*.8);
    }
  }
  function modernLamp(x,z,h=3.7) {
    lathe(x,0,z,[[0,.10],[.08,.10],[.1,.055]],'paving',10,[0,1]);
    tube([x,.08,z],[x,h-.1,z],.029,.023,'hardware');
    line([x,.09,z+.025],[x,h-.08,z+.025],'navy',1.1,.9);
    lathe(x,h-.19,z,[[0,.045],[.09,.17],[.12,.33],[.17,.35],[.19,.32]],'hardware',16,[2,4]);
    if(night){
      lathe(x,h-.195,z,[[0,.21],[.02,.25],[.035,.21]],'bulb',16);
      light([x,h-.20,z+.025],7.4,3.7,.43,.96,[x+.15,.02,z+.2],22,43);
    }
  }
  function doubleLamp(x,z,h=3.85) {
    lathe(x,0,z,[[0,.17],[.08,.17],[.14,.12]],'stone',12,[0,1]);
    tube([x,.1,z],[x,h-.35,z],.033,.025,'hardware');
    for(const side of [-1,1]){
      const offset=side===-1?-.13:0;
      const curve=[];
      for(let i=0;i<=14;i++){
        const t=i/14,s=1-t;
        curve.push([x+side*(s*s*s*.015+3*s*s*t*.02+3*s*t*t*.47+t*t*t*.47),h+offset+s*s*s*(-.49)+3*s*s*t*.25+3*s*t*t*.24+t*t*t*(-.44),z]);
      }
      path(curve,'hardware',1.65,.97);
      const bx=x+side*.47,by=h+offset-.48;
      lathe(bx,by-.06,z,[[0,.12],[.04,.14],[.08,.065],[.13,.035]],'hardware',12,[0,2]);
      lathe(bx,by-.35,z,[[0,.045],[.06,.085],[.18,.072],[.26,.042],[.29,.042]],night?'bulb':'light',12,[0,2]);
      light([bx,by-.20,z+.04],6.7,2.8,.36,.95,[bx+side*.25,.02,z+.2],23,44);
    }
  }
  function fountain(x,z) {
    // Turned stone pedestal, open bowl and a small classical draped figure.
    lathe(x,0,z,[[0,.37],[.06,.39],[.11,.30],[.20,.24],[.48,.21],[.57,.33]],'stone',20,[0,1,3,5]);
    lathe(x,0,z,[[.55,.31],[.63,.43],[.74,.58],[.85,.66],[.93,.69],[.97,.70],[1.0,.69],[1.0,.63],[.92,.59],[.82,.43],[.80,.30]],'stone',24,[0,3,5,7]);
    const water=Array.from({length:24},(_,i)=>{const a=i/24*Math.PI*2;return [x+Math.cos(a)*.57,.915,z+Math.sin(a)*.57];});
    face(water,'water');ring(x,.925,z,.58,.58,'fine',.55,.65,24);
    lathe(x,.96,z,[[-.12,.18],[0,.23],[.07,.26],[.12,.22]],'stone',12,[1,2]);
    const figureFaceStart=faces.length,figureLineStart=lines.length;
    const robe=[[1.06,.20,.15,-.04],[1.17,.18,.14,-.05],[1.32,.155,.12,-.015],[1.48,.115,.105,.035],[1.62,.16,.1,.02],[1.71,.12,.085,0]];
    const rings=robe.map(([y,rx,rz,dx])=>Array.from({length:12},(_,i)=>{const a=i/12*Math.PI*2,r=1+.075*Math.cos(a*5);return [x+dx+Math.cos(a)*rx*r,y,z+Math.sin(a)*rz*r];}));
    for(let k=1;k<rings.length;k++)for(let i=0;i<12;i++)face([rings[k-1][i],rings[k-1][(i+1)%12],rings[k][(i+1)%12],rings[k][i]],tint('stone',.92+.075*Math.cos(i/12*Math.PI*2+1)));
    path(rings[0],'fine',.6,.82,true);
    for(const i of [2,3,4,5])path(rings.map((r,k)=>[r[i][0],r[i][1],r[i][2]+.018+(k%2)*.012]),'fine',.46,.7);
    tube([x,1.67,z],[x-.025,1.77,z+.012],.055,.055,'stone',8);
    ellipsoid(x-.045,1.85,z+.015,.10,.135,.10,'stone',12,5);
    ellipsoid(x-.025,1.88,z-.035,.105,.11,.085,'stoneShade',10,4);
    const arms=[[[x-.12,1.65,z+.025],[x-.22,1.48,z+.12],[x-.03,1.52,z+.22]],[[x+.12,1.65,z+.01],[x+.24,1.49,z+.07],[x+.1,1.42,z+.2]]];
    for(const [a,b,c]of arms){tube(a,b,.045,.035,'stone',8);tube(b,c,.035,.029,'stone',8);ellipsoid(...c,.038,.046,.035,'stone',8,4);path([a,b,c],'fine',.48,.7);}
    // A few facial and robe marks remain readable at the small illustration size.
    path([[x-.09,1.88,z+.10],[x-.10,1.84,z+.13],[x-.065,1.82,z+.115]],'fine',.43,.75);
    path([[x-.17,1.63,z+.05],[x-.10,1.53,z+.15],[x+.04,1.46,z+.13],[x-.02,1.15,z+.17]],'fine',.5,.77);
    ellipsoid(x-.15,1.08,z+.09,.12,.08,.1,'stoneShade',8,4);
    const elongate=p=>[x+(p[0]-x)*1.08,1.04+(p[1]-1.04)*1.4,z+(p[2]-z)*1.08];
    for(let i=figureFaceStart;i<faces.length;i++)faces[i].points=faces[i].points.map(elongate);
    for(let i=figureLineStart;i<lines.length;i++){lines[i].a=elongate(lines[i].a);lines[i].b=elongate(lines[i].b);}
  }

  function roofDeck(x0,z0,x1,z1,y) {
    face([[x0,y-.12,z0],[x1,y-.12,z0],[x1,y-.12,z1],[x0,y-.12,z1]],'roof');
    const cap=.075;
    box(x0-cap,y-.15,z0-cap,x1+cap,y,z0,'light','fine',.68);
    box(x0-cap,y-.15,z1,x1+cap,y,z1+cap,'light','navy',.82);
    box(x0-cap,y-.15,z0,x0,y,z1,'light','fine',.65);
    box(x1,y-.15,z0,x1+cap,y,z1,'light','fine',.65);
    for(let x=x0+.65;x<x1;x+=.72)line([x,y-.108,z0+.1],[x,y-.108,z1-.1],'fine',.4,.48);
    line([x0+.1,y-.107,z0+(z1-z0)*.6],[x1-.1,y-.107,z0+(z1-z0)*.6],'fine',.4,.45);
  }
  // A soft island of front garden, with enough depth for the fountain and lamps.
  const garden=Array.from({length:48},(_,i)=>{
    const a=i/48*Math.PI*2;
    return [Math.cos(a)*8.85,-.055,1.35+Math.sin(a)*4.95+Math.max(0,Math.sin(a))**2*lightsForward*1.25];
  });
  face(garden,'ground');
  const ellipse=Array.from({length:32},(_,i)=>{
    const a=i/32*Math.PI*2; return [Math.cos(a)*6.8,-.045,-.2+Math.sin(a)*2.25];
  });
  face(ellipse,'paving');
  // Keep the right jamb fixed; double the doorway toward the left and leave
  // another half of the previous door width between its edge and the wall end.
  const previousDoorWidth=1.18,doorWidth=previousDoorWidth*2,doorRight=-5.02;
  const doorLeft=doorRight-doorWidth,entryLeft=doorLeft-previousDoorWidth/2;
  // The approach opens gently onto the widened entrance threshold.
  face([[-7.05,-.025,5.6],[-5.65,-.025,5.6],[doorRight+.09,-.025,-.2],[doorLeft-.21,-.025,-.2]],'light');
  path([[-7.05,-.016,5.6],[-7.28,-.016,2.0],[doorLeft-.21,-.016,-.2]],'fine',.58,.52);
  path([[-5.65,-.016,5.6],[-5.32,-.016,2.0],[doorRight+.09,-.016,-.2]],'fine',.58,.52);
  line([-6.85,-.014,3.5],[-5.54,-.014,3.5],'fine',.4,.36);

  // The left entrance is single-storey, with its own low roof over the porch.
  box(entryLeft,.12,-4.85,-4.55,3.04,-1.78,'underside','navy',1.0);
  box(entryLeft-.02,.12,-1.78,entryLeft+.25,3.15,.04,'wall','navy',.87);
  box(-4.83,.12,-1.78,-4.55,3.15,.04,'wall','navy',.87);
  box(entryLeft-.12,3.04,-4.90,-4.43,3.23,.30,'wall','navy',.9);
  box(entryLeft+.17,.06,-1.72,-4.74,.16,.40,'paving','fine',.6);
  // Left glazed bay and the taller main parapet, as seen in the new photographs.
  box(-4.55,.12,-5.35,-1.73,6.03,-.32,'wall','navy',1.1,{x:-3.94,y:.62,w:1.12,h:1.19});
  box(-1.73,.12,-5.85,5.02,3.02,-.03,'wall','navy',1.16);
  box(-1.73,3.02,-5.85,5.02,6.36,-.12,'wall','navy',1.16);
  box(5.02,.12,-5.0,5.65,5.57,-.37,'wall','navy',.94);
  roofDeck(entryLeft,-4.85,-4.55,.30,3.24);
  roofDeck(-4.55,-5.35,-1.73,-.32,6.16);
  roofDeck(-1.73,-5.85,5.02,-.12,6.50);
  roofDeck(5.02,-5.0,5.65,-.37,5.67);
  for(let y=5.89;y<6.31;y+=.14)line([-1.77,y,-.25],[-1.94,y,-.42],'fine',.65,.77);
  // A slender side wall seam visible in the photographs.
  line([-1.73,3.25,.001],[-1.73,6.19,.001],'fine',.6,.65);

  opening(doorLeft,.17,doorWidth,2.60,-1.75,2,2,'copper',0,'entryGlass');
  for(let y=.46;y<2.55;y+=.42)line([doorLeft+.06,y,-1.68],[doorRight-.06,y,-1.68],'copper',.65,.72);
  line([-5.20,1.20,-1.60],[-5.20,1.48,-1.60],'navy',.9);
  path([[doorLeft-.03,.15,-.56],[doorRight+.02,.15,-.56],[doorRight+.02,2.86,-.56],[doorLeft-.03,2.86,-.56]],'metal',.85,.85,true);
  for(let x=doorLeft+.1;x<doorRight-.02;x+=.18)line([x,.16,-.54],[x,2.85,-.54],'metal',.55,.78);
  line([doorLeft-.03,1.27,-.53],[doorRight+.02,1.27,-.53],'metal',.6,.8);
  // The blue/green vertical glass panel is a characteristic part of the house.
  opening(-3.94,2.10,1.12,3.13,-.29,2,6,'metal');
  for(let row=0;row<6;row++)for(let col=0;col<2;col++){
    const x=-3.94+col*.56,y=2.1+row*3.13/6;
    face([[x+.025,y+.025,-.245],[x+.535,y+.025,-.245],[x+.535,y+3.13/6-.025,-.245],[x+.025,y+3.13/6-.025,-.245]],(row+col)%3===0?'windowMint':'windowBlue');
  }
  inwardWindow(-3.94,.62,1.12,1.19,-.32);
  box(-4.04,1.88,-.36,-2.73,1.98,-.10,'light','fine',.65);
  // Low plinth, pipework and a quiet outline of the garden hose.
  for(const [x0,x1,z]of [[-4.55,-1.73,-.28],[-1.73,5.02,.012]]){
    line([x0,.48,z],[x1,.48,z],'fine',.58,.6);
    line([x0,.23,z],[x1,.23,z],'fine',.5,.5);
  }
  path([[-4.14,.55,-.25],[-4.23,.55,-.25],[-4.23,1.67,-.25],[-4.10,1.67,-.25]],'fine',.46,.63);
  for(let k=0;k<3;k++){
    const pts=Array.from({length:18},(_,i)=>{const a=i/18*Math.PI*2;return [-4.30+Math.cos(a)*(.13+k*.025),1.12+Math.sin(a)*(.23+k*.024),-.17];});
    path(pts,'green',.5,.62,true);
  }

  // Main windows: upper sliding glazing and barred ground-floor opening.
  opening(1.20,3.22,3.30,2.16,-.1,4,1,'metal');
  box(1.07,5.40,-.18,4.61,5.54,.08,'wall','navy',.78);
  opening(1.08,.36,2.72,2.29,-.01,3,1,'metal',12);
  for(const y of [1.13,1.31])line([1.02,y,.105],[3.86,y,.105],'metal',.58,.85);
  for(let x=1.21;x<3.78;x+=.225){
    const loop=Array.from({length:10},(_,i)=>{const a=i/10*Math.PI*2;return [x+Math.cos(a)*.052,1.22+Math.sin(a)*.052,.115];});
    path(loop,'metal',.44,.75,true);
  }
  // Small horizontal vent and the upper slit vent.
  face([[-1.49,2.06,.02],[-.28,2.06,.02],[-.28,2.55,.02],[-1.49,2.55,.02]],'vent');
  path([[-1.49,2.06,.035],[-.28,2.06,.035],[-.28,2.55,.035],[-1.49,2.55,.035]],'metal',.65,.85,true);
  for(let y=2.17;y<2.55;y+=.12) line([-1.46,y,.055],[-.31,y,.055],'metal',.75,.86);
  opening(-.35,4.98,.25,.36,-.09,2,1,'fine');

  // Shallow striped canopy. It is geometry, not a texture.
  const aw0=.02,aw1=5.18;
  for(let i=0;i<24;i++) {
    const a=aw0+(aw1-aw0)*i/24,b=aw0+(aw1-aw0)*(i+1)/24;
    const fill=i%2?'light':'dark';
    face([[a,6.12,-.08],[b,6.12,-.08],[b,5.98,.80],[a,5.98,.80]],fill);
    face([[a,5.98,.80],[b,5.98,.80],[b,5.80,.80],[a,5.80,.80]],fill);
    line([a,6.12,-.075],[a,5.98,.81],'fine',.47,.6);
    line([a,5.98,.81],[a,5.80,.81],'fine',.47,.6);
  }
  path([[aw0,6.12,-.075],[aw1,6.12,-.075],[aw1,5.98,.81],[aw0,5.98,.81]],'navy',.9,.9,true);
  line([aw0,5.80,.81],[aw1,5.80,.81],'navy',.85);

  // Rounded balcony, a strong identifying feature of the house.
  const leftCurve=Array.from({length:9},(_,i)=>{const a=Math.PI-i/8*Math.PI/2;return [-2.2+Math.cos(a)*.77,.72+Math.sin(a)*.83];});
  const rightCurve=Array.from({length:7},(_,i)=>{const a=Math.PI/2-i/6*Math.PI/2;return [4.92+Math.cos(a)*.49,.94+Math.sin(a)*.61];});
  const balcony=[[-2.97,-.16],...leftCurve,...rightCurve,[5.41,-.22]];
  extrude(balcony,2.86,3.16,'wall','navy',1.07);
  const rail=balcony.slice(0,-1);
  for(const [height,ink,w] of [[3.29,'metal',.7],[3.69,'metal',.68],[4.07,'copper',.96]])
    path(rail.map(([x,z])=>[x,height,z+.015]),ink,w,.86);
  const posts=[rail[0],leftCurve[3],leftCurve[7],[-1.35,1.55],[-.05,1.55],[1.25,1.55],[2.55,1.55],[3.85,1.55],rightCurve[1],rightCurve[4],rightCurve[6]];
  for(const [x,z] of posts)line([x,3.17,z+.02],[x,4.09,z+.02],'metal',.76,.87);
  for(const x of [-1.95,-.55,.85,2.25,3.65,4.65]) {
    box(x-.42,3.17,1.01,x+.42,3.32,1.32,'copper','fine',.47);
    geranium(x,3.33,1.16,.65,x);
  }

  // Rounded low steps and the long blue planter are visible in all three photos.
  for(const [y0,y1,spread]of [[.02,.11,.4],[.11,.21,.2],[.21,.31,0]]){
    const left=Array.from({length:7},(_,i)=>{const a=Math.PI-i/6*Math.PI/2;return [-1.86+Math.cos(a)*(.58+spread),.7+Math.sin(a)*(.62+spread)];});
    extrude([[-2.44-spread,-.06],...left,[3.85,1.32+spread],[3.85,-.06]],y0,y1,'paving','fine',.66);
  }
  box(1.30,.02,1.54,6.35,.48,2.11,'glassBlue','fine',.76);
  for(let i=0;i<10;i++)geranium(1.55+i*.50,.49,1.86,.93,i*.7);
  cylinder(-.62,.31,.57,.23,.35,'copper');plant(-.62,.66,.57,1.6,.8);
  cylinder(-4.18,.04,.24,.21,.30,'paving');plant(-4.18,.34,.24,1.1,1.3);
  box(-2.91,.03,.40,-2.48,.22,.81,'paving','fine',.52);geranium(-2.70,.23,.61,.85,.5);
  // Small right return, side gate and the familiar red-roof garden kennel.
  opening(5.79,.30,.70,2.26,-.74,1,1,'metal',5,'gate');
  box(5.64,.10,-1.5,5.77,2.84,-.67,'wall','fine',.65);
  box(6.48,.10,-1.5,6.59,2.84,-.67,'wall','fine',.65);
  box(5.24,.16,.45,5.88,.70,.98,'stone','fine',.51);
  face([[5.18,.72,.40],[5.56,1.0,.40],[5.56,1.0,1.04],[5.18,.72,1.04]],'bloom',true,'copper',.55);
  face([[5.56,1.0,.40],[5.95,.72,.40],[5.95,.72,1.04],[5.56,1.0,1.04]],'bloom',true,'copper',.55);
  const kennelArch=Array.from({length:9},(_,i)=>{const a=Math.PI-i/8*Math.PI;return [5.56+Math.cos(a)*.11,.48+Math.sin(a)*.13,1.005];});
  face([[5.45,.16,1.005],...kennelArch,[5.67,.16,1.005]],'hardware');
  // User-selected garden landmarks. Tree crowns remain outside the main glazing.
  multiStemTree(7.30,.40);
  canopy(-7.00,2.80,.22,.48,.52,.5);
  path([[-7.12,.02,.2],[-7.08,1.5,.18],[-7.00,2.9,.22]],'fine',.8,.68);
  modernLamp(-.83,3.18+lightsForward,3.72);
  modernLamp(-5.55,3.15+lightsForward,3.65);
  doubleLamp(5.25,4.24+lightsForward,3.85);
  fountain(.85,4.70+lightsForward*2);
  ellipsoid(2.98,.33,3.18,.67,.37,.52,'glassMint',12,4);
  canopy(2.98,.39,3.62,.67,.30,.8);
  for(let i=0;i<21;i++) {
    const x=-6.8+(i%8)*1.78,z=2.5+Math.floor(i/8)*1.35+Math.sin(i*2.4)*.25;
    line([x,-.015,z],[x+.055,.055,z+.02],'green',.43,.4);
    if(i%3===0){line([x-.045,.04,z+.025],[x+.045,.04,z+.025],'fine',.4,.35);line([x,.002,z+.025],[x,.08,z+.025],'fine',.4,.35);}
  }
  for(const [x,z0,target,reach,power]of [
    [-6.4,4.6,[-6.5,2.1,-1.1],10.8,4.1],
    [4.35,3.6,[2.7,2.5,.15],8.7,3.6],
    [6.35,2.78,[.85,1.45,6.3],10.2,4.4]
  ]){
    const z=z0+lightsForward;
    tube([x,.01,z],[x,.23,z],.018,.018,'hardware',6);
    tube([x,.20,z],[x-.04,.34,z-.02],.06,.065,'hardware',7);
    if(night){
      ellipsoid(x-.045,.34,z+.025,.045,.044,.035,'bulb',8,4);
      light([x-.045,.34,z+.04],reach,power,.10,.90,target,13,27);
    }
  }
  if(night){
    // Interior spill and the porch light share the same world-space scene as
    // the exterior fixtures. Their surface illumination is baked only once.
    light([doorLeft+doorWidth*.5,1.6,-1.35],3.8,.22);
    light([-3.38,1.35,.03],2.2,.10);
    light([-3.38,3.6,.05],2.5,.10);
    for(const x of [1.75,3.6]){
      light([x,4.2,.30],3.1,.14);
      light([x,1.35,.35],3.5,.15);
    }
    lathe(doorLeft+doorWidth*.5,2.96,-.80,[[0,.13],[.025,.15]],'bulb',12);
    light([doorLeft+doorWidth*.5,2.95,-.80],4.8,2.0,.24,.90,[doorLeft+doorWidth*.5,.12,-.65],22,43);
    return {faces:illuminateFaces(faces,lights,flatLighting),lines,glows,lights,
      animated:animated.map(part=>({...part,faces:illuminateFaces(part.faces,lights,flatLighting)}))};
  }
  return { faces, lines, animated };
}

// Subdivide broad surfaces for soft pools of light without introducing mesh
// outlines, textures, a render loop, or a different camera for the night view.
function illuminateFaces(faces,lights,flatLighting=false) {
  const result=[],warm=rgb('#ffd49b');
  const midpoint=(a,b)=>a.map((v,i)=>(v+b[i])*.5);
  function touchesLight(points){
    const min=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...points.map(p=>p[i])));
    const center=min.map((v,i)=>(v+max[i])*.5),radius=Math.hypot(...max.map((v,i)=>(v-min[i])*.5));
    return lights.some(light=>{
      if(Math.hypot(...light.position.map((v,i)=>Math.max(min[i]-v,0,v-max[i])))>=light.reach)return false;
      if(!light.direction)return true;
      const d=center.map((v,i)=>v-light.position[i]),along=d.reduce((s,v,i)=>s+v*light.direction[i],0);
      const across=Math.sqrt(Math.max(0,d.reduce((s,v)=>s+v*v,0)-along*along));
      const tangent=Math.sqrt(1-light.outerCos**2)/light.outerCos;
      return along+radius>=0&&across<=Math.max(0,along)*tangent+radius/light.outerCos;
    });
  }
  function shade(points,base,at){
    const center=at||points[0].map((_,i)=>points.reduce((s,p)=>s+p[i],0)/points.length);
    const u=points[1].map((v,i)=>v-points[0][i]),v=points[2].map((c,i)=>c-points[0][i]);
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;
    let amount=0;
    for(const light of lights){
      const d=light.position.map((c,i)=>c-center[i]),distance=Math.hypot(...d);
      if(distance>=light.reach)continue;
      const cone=spotlightWeight(light,center);if(!cone)continue;
      const facing=Math.abs(n.reduce((s,c,i)=>s+c*d[i],0))/(length*Math.max(.1,distance));
      amount+=light.power*(1-distance/light.reach)**2*(.32+.68*facing)*cone;
    }
    amount=Math.min(.68,amount)*NIGHT_LIGHT_GAIN;
    return '#'+base.map((c,i)=>Math.round(255*(c+(warm[i]-c)*amount)).toString(16).padStart(2,'0')).join('');
  }
  function triangle(a,b,c,base,depth=0){
    if(!touchesLight([a,b,c])){result.push({points:[a,b,c],color:'#'+base.map(c=>Math.round(c*255).toString(16).padStart(2,'0')).join('')});return;}
    const edges=[[a,b,c],[b,c,a],[c,a,b]].map(p=>({p,length:Math.hypot(...p[0].map((v,i)=>v-p[1][i]))}));
    const longest=edges.sort((a,b)=>b.length-a.length)[0];
    if(longest.length>1.15&&depth<6){
      const [p,q,r]=longest.p,m=midpoint(p,q);
      triangle(p,m,r,base,depth+1);triangle(m,q,r,base,depth+1);
    }else{
      const points=[a,b,c];
      result.push({points,color:shade(points,base),vertexColors:points.map(p=>rgb(shade(points,base,p)))});
    }
  }
  for(const face of faces){
    if(face.emissive){result.push(face);continue;}
    const base=rgb(face.color);
    if(flatLighting){result.push({...face,color:shade(face.points,base)});continue;}
    if(!touchesLight(face.points)){result.push(face);continue;}
    const size=Math.max(...face.points.map(p=>Math.hypot(...p.map((v,i)=>v-face.points[0][i]))));
    if(size<=1.15){result.push({...face,color:shade(face.points,base),vertexColors:face.points.map(p=>rgb(shade(face.points,base,p)))});continue;}
    for(let i=1;i<face.points.length-1;i++)triangle(face.points[0],face.points[i],face.points[i+1],base);
  }
  return result;
}

const clamp = (v,min=0,max=1) => Math.min(max,Math.max(min,v));
const smooth = t => t*t*(3-2*t);
function spotlightWeight(light,point) {
  if(!light.direction)return 1;
  const d=point.map((v,i)=>v-light.position[i]),length=Math.hypot(...d);
  if(length<1e-8)return 1;
  const cosine=d.reduce((s,v,i)=>s+v*light.direction[i],0)/length;
  return smooth(clamp((cosine-light.outerCos)/(light.innerCos-light.outerCos)));
}
function windowAngle(progress) {
  return smooth(clamp((progress-.12)/.68))*75*Math.PI/180;
}
function hingeMatrix(part,progress) {
  const a=windowAngle(progress)*part.direction,c=Math.cos(a),s=Math.sin(a),[x,,z]=part.pivot;
  return new Float32Array([c,0,-s,0,0,1,0,0,s,0,c,0,x-c*x-s*z,0,z+s*x-c*z,1]);
}
function transformPoint(p,m) {
  const [x,y,z]=p;
  return [m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];
}
function posedScene(scene,progress) {
  const faces=[...scene.faces],lines=[...scene.lines];
  for(const part of scene.animated||[]){
    const matrix=hingeMatrix(part,progress);
    for(const f of part.faces)faces.push({...f,points:f.points.map(p=>transformPoint(p,matrix))});
    for(const l of part.lines)lines.push({...l,a:transformPoint(l.a,matrix),b:transformPoint(l.b,matrix)});
  }
  return {faces,lines};
}
function advanceProgress(current,target,elapsedMs=1000/60) {
  const delta=target-current;
  if(Math.abs(delta)<.00001)return target;
  const dt=clamp(elapsedMs,0,50),alpha=-Math.expm1(-dt/300);
  // Limit each frame to a small camera increment, even after a wheel/page jump.
  const maxStep=.008*dt/(1000/60);
  return current+clamp(delta*alpha,-maxStep,maxStep);
}
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(...a);return a.map(v=>v/l);};
let framingPoints;
let orbitFrame;
function multiply(a,b) {
  const out=new Float32Array(16);
  for(let c=0;c<4;c++) for(let r=0;r<4;r++)
    out[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];
  return out;
}
function orbitPose(progress,strength,distance=24,coverage=2,tiltDistance=distance) {
  const p=smooth(clamp(progress)), rad=Math.PI/180;
  const yaw=(-23+(p-.5)*20*strength*coverage)*rad;
  // Bound actual camera height independently of viewport-dependent distance.
  const eyeHeight=2.325+3.2*p*strength;
  const baseTargetY=2.55+(p-.5)*.45*strength;
  const baseTilt=Math.asin(clamp((eyeHeight-baseTargetY)/tiltDistance,-.85,.85));
  const centerTilt=Math.asin(clamp((2.325+1.6*strength-2.55)/tiltDistance,-.85,.85));
  // Expand pitch around the accepted middle view by moving the aim point,
  // rather than lifting the camera higher. Framing cannot shrink this arc.
  const elevation=centerTilt+(baseTilt-centerTilt)*coverage;
  const target=[-.24+(p-.5)*-1.2*strength*coverage,eyeHeight-distance*Math.sin(elevation),.18];
  return {yaw,elevation,target,eyeHeight};
}
function fitDistance(progress,aspect,strength,tangent,distanceEstimate,coverage,tiltDistance) {
  const {yaw,elevation,target}=orbitPose(progress,strength,distanceEstimate,coverage,tiltDistance);
  const forward=[Math.sin(yaw)*Math.cos(elevation),Math.sin(elevation),Math.cos(yaw)*Math.cos(elevation)];
  const right=norm(cross([0,1,0],forward)),up=cross(forward,right);
  if(!framingPoints){const scene=makeScene();framingPoints=[...scene.faces.flatMap(f=>f.points),...scene.lines.flatMap(l=>[l.a,l.b])];}
  let distance=0;
  for(const point of framingPoints){
    const dx=point[0]-target[0],dy=point[1]-target[1],dz=point[2]-target[2];
    const cx=dx*right[0]+dy*right[1]+dz*right[2],cy=dx*up[0]+dy*up[1]+dz*up[2],cz=dx*forward[0]+dy*forward[1]+dz*forward[2];
    distance=Math.max(distance,cz+Math.abs(cx)/(tangent*aspect),cz+Math.abs(cy)/tangent);
  }
  return distance;
}
// encuadre (Andes, 2026-11-03): la distancia se ajusta sólo a la parte de la vuelta que se recorre (rango) y escala
// agranda la imagen (puede recortar un poco los bordes); el elemento lo fija antes de dibujar
let ENCUADRE={rango:[0,1],escala:1};
function camera(progress=.5,aspect=1.5,strength=1) {
  const fov=31*Math.PI/180;
  // One framing distance for the entire path prevents scale changes as the
  // closest roof corner changes. Resize and strength changes invalidate it.
  if(!orbitFrame||orbitFrame.aspect!==aspect||orbitFrame.strength!==strength||orbitFrame.clave!==ENCUADRE.rango.join()){
    const fitPath=(coverage,tiltDistance)=>{
      let fit=10;
      for(let pass=0;pass<8;pass++){
        let needed=0;
        for(let i=0;i<=8;i++)needed=Math.max(needed,fitDistance(ENCUADRE.rango[0]+(ENCUADRE.rango[1]-ENCUADRE.rango[0])*i/8,aspect,strength,Math.tan(fov/2)*.96,fit,coverage,tiltDistance??fit));
        if(needed<=fit)break;
        fit=needed*1.012;
      }
      return fit;
    };
    // Retain the previous path as the angular reference, then fit the wider
    // path without reducing its doubled pan or tilt to make it fit.
    const tiltDistance=fitPath(1);
    orbitFrame={aspect,strength,tiltDistance,distance:fitPath(2,tiltDistance),clave:ENCUADRE.rango.join()};
  }
  const distance=orbitFrame.distance;
  const {yaw,elevation,target,eyeHeight}=orbitPose(progress,strength,distance,2,orbitFrame.tiltDistance);
  const eye=[target[0]+Math.sin(yaw)*Math.cos(elevation)*distance,
    eyeHeight,target[2]+Math.cos(yaw)*Math.cos(elevation)*distance];
  const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);
  const view=new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);
  const near=.1,far=120,f=ENCUADRE.escala/Math.tan(fov/2),nf=1/(near-far);
  const projection=new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);
  return {mvp:multiply(projection,view),view,eye,target,yaw,elevation,distance};
}
function project(point,mvp,width,height) {
  const [x,y,z]=point;
  const w=mvp[3]*x+mvp[7]*y+mvp[11]*z+mvp[15];
  return [(mvp[0]*x+mvp[4]*y+mvp[8]*z+mvp[12])/w*width*.5+width*.5,
    height*.5-(mvp[1]*x+mvp[5]*y+mvp[9]*z+mvp[13])/w*height*.5,
    (mvp[2]*x+mvp[6]*y+mvp[10]*z+mvp[14])/w];
}

const FALLBACK_URL = "img/casona.svg";
const FALLBACK_NIGHT_URL = "img/casona-noche.svg";

const VERTEX = `
attribute vec3 aPosition; attribute vec3 aColor;
uniform mat4 uMVP; varying vec4 vColor;
void main(){gl_Position=uMVP*vec4(aPosition,1.0);vColor=vec4(aColor,1.0);}`;
const FRAGMENT = `precision mediump float;varying vec4 vColor;void main(){gl_FragColor=vColor;}`;
const GLOW_VERTEX = `
attribute vec3 aPosition;attribute float aRadius;attribute vec4 aColor;
uniform mat4 uMVP;uniform float uScale;varying vec4 vGlow;
void main(){vec4 p=uMVP*vec4(aPosition,1.0);p.z-=.00011*p.w;
gl_Position=p;gl_PointSize=2.0*aRadius*uScale/p.w;vGlow=aColor;}`;
const GLOW_FRAGMENT = `precision mediump float;varying vec4 vGlow;
void main(){float r=length(gl_PointCoord*2.0-1.0);if(r>1.0)discard;
float a=(pow(1.0-r,2.0)+.45*exp(-r*r*90.0))*vGlow.a;
gl_FragColor=vec4(mix(vGlow.rgb,vec3(1.0,.96,.82),exp(-r*r*60.0)),a);}`;
const LINE_VERTEX = `
attribute vec3 aStart;attribute vec3 aEnd;attribute vec2 aCorner;attribute vec4 aColor;
attribute float aWidth;uniform mat4 uMVP;uniform vec2 uResolution;uniform float uDPR;
varying vec4 vColor;
void main(){
 vec4 p0=uMVP*vec4(aStart,1.0),p1=uMVP*vec4(aEnd,1.0);
 vec2 d=(p1.xy/p1.w-p0.xy/p0.w)*uResolution;
 float len=length(d);vec2 n=len>0.001?vec2(-d.y,d.x)/len:vec2(0.0);
 vec4 p=mix(p0,p1,aCorner.x);
 p.xy+=n*aCorner.y*aWidth*uDPR/uResolution*p.w;
 p.z-=0.000025*p.w;
 gl_Position=p;vColor=aColor;
}`;
function program(gl,vs,fs) {
  const compile=(type,source)=>{
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const p=gl.createProgram(),a=compile(gl.VERTEX_SHADER,vs),b=compile(gl.FRAGMENT_SHADER,fs);
  gl.attachShader(p,a);gl.attachShader(p,b);gl.linkProgram(p);
  gl.deleteShader(a);gl.deleteShader(b);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}
class Drawing {
  constructor(canvas,scene) {
    const gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
    if(!gl) throw new Error('WebGL unavailable');
    this.gl=gl;this.canvas=canvas;
    this.fillProgram=program(gl,VERTEX,FRAGMENT);this.lineProgram=program(gl,LINE_VERTEX,FRAGMENT);
    this.groups=[{part:null,...this.geometry(scene)},...(scene.animated||[]).map(part=>({part,...this.geometry(part)}))];
    this.glows=scene.glows||[];
    if(this.glows.length){
      this.glowProgram=program(gl,GLOW_VERTEX,GLOW_FRAGMENT);
      this.glowBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,this.glowBuffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.glows.flatMap(g=>[...g.position,g.radius,...rgb(g.color),g.strength])),gl.STATIC_DRAW);
    }
    gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.clearColor(0,0,0,0);
    this.attributes=[];
  }
  geometry(scene) {
    const gl=this.gl;
    const triangles=[];
    for(const f of scene.faces) for(let i=1;i<f.points.length-1;i++)
      for(const j of [0,i,i+1]) triangles.push(...f.points[j],...(f.vertexColors?.[j]||rgb(f.color)));
    const segments=[];
    for(const l of scene.lines) for(const corner of [[0,-1],[1,-1],[1,1],[0,-1],[1,1],[0,1]])
      segments.push(...l.a,...l.b,...corner,...rgb(l.color),l.alpha,l.width);
    const fillBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,fillBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(triangles),gl.STATIC_DRAW);
    const lineBuffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(segments),gl.STATIC_DRAW);
    return {fillBuffer,lineBuffer,fillCount:triangles.length/6,lineCount:segments.length/13};
  }
  attribute(p,name,size,stride,offset) {
    const gl=this.gl,loc=gl.getAttribLocation(p,name);
    gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,stride*4,offset*4);
    this.attributes.push(loc);
  }
  resetAttributes() {for(const loc of this.attributes)this.gl.disableVertexAttribArray(loc);this.attributes=[];}
  render(progress,strength=1) {
    const gl=this.gl,canvas=this.canvas;
    const width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width||!height)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.round(width*dpr),h=Math.round(height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    gl.viewport(0,0,w,h);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const cam=camera(progress,width/height,strength);
    const groups=this.groups.map(g=>({...g,mvp:g.part?multiply(cam.mvp,hingeMatrix(g.part,progress)):cam.mvp}));
    gl.useProgram(this.fillProgram);
    gl.disable(gl.BLEND);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
    for(const g of groups){
      gl.bindBuffer(gl.ARRAY_BUFFER,g.fillBuffer);this.resetAttributes();
      this.attribute(this.fillProgram,'aPosition',3,6,0);this.attribute(this.fillProgram,'aColor',3,6,3);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.fillProgram,'uMVP'),false,g.mvp);
      gl.drawArrays(gl.TRIANGLES,0,g.fillCount);
    }
    gl.disable(gl.POLYGON_OFFSET_FILL);gl.useProgram(this.lineProgram);
    gl.uniform2f(gl.getUniformLocation(this.lineProgram,'uResolution'),w,h);
    gl.uniform1f(gl.getUniformLocation(this.lineProgram,'uDPR'),dpr);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
    for(const g of groups){
      gl.bindBuffer(gl.ARRAY_BUFFER,g.lineBuffer);this.resetAttributes();
      for(const [name,size,offset] of [['aStart',3,0],['aEnd',3,3],['aCorner',2,6],['aColor',4,8],['aWidth',1,12]])
        this.attribute(this.lineProgram,name,size,13,offset);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.lineProgram,'uMVP'),false,g.mvp);
      gl.drawArrays(gl.TRIANGLES,0,g.lineCount);
    }
    if(this.glowProgram){
      gl.useProgram(this.glowProgram);gl.bindBuffer(gl.ARRAY_BUFFER,this.glowBuffer);this.resetAttributes();
      this.attribute(this.glowProgram,'aPosition',3,8,0);this.attribute(this.glowProgram,'aRadius',1,8,3);
      this.attribute(this.glowProgram,'aColor',4,8,4);
      gl.uniformMatrix4fv(gl.getUniformLocation(this.glowProgram,'uMVP'),false,cam.mvp);
      gl.uniform1f(gl.getUniformLocation(this.glowProgram,'uScale'),h/(2*Math.tan(31*Math.PI/360)));
      gl.drawArrays(gl.POINTS,0,this.glows.length);
    }
    gl.depthMask(true);
    this.camera=cam;
  }
  destroy() {
    const g=this.gl;this.resetAttributes();for(const group of this.groups){g.deleteBuffer(group.fillBuffer);g.deleteBuffer(group.lineBuffer);}
    g.deleteProgram(this.fillProgram);g.deleteProgram(this.lineProgram);
    if(this.glowProgram){g.deleteProgram(this.glowProgram);g.deleteBuffer(this.glowBuffer);}
  }
}

// The same 3D scene and camera also work when WebGL is unavailable. A small
// software depth buffer hides rear edges while Canvas draws antialiased lines.
// This keeps the scroll effect functional in restricted browsers, too.
class SoftwareDrawing {
  constructor(canvas,scene){
    this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:true});
    if(!this.ctx)throw new Error('Canvas unavailable');
    this.scene=scene;
  }
  render(progress,strength=1){
    const canvas=this.canvas,ctx=this.ctx,width=canvas.clientWidth,height=canvas.clientHeight;
    if(!width||!height)return;
    const dpr=Math.min(devicePixelRatio||1,2),w=Math.round(width*dpr),h=Math.round(height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
    const cam=camera(progress,width/height,strength),mvp=cam.mvp;
    const scene=posedScene(this.scene,progress);
    const night=Boolean(this.scene.glows?.length);
    const scale=Math.min(1,(night?1000:800)/width),dw=Math.ceil(width*scale),dh=Math.ceil(height*scale);
    if(this.depth?.length!==dw*dh)this.depth=new Float32Array(dw*dh);
    const depth=this.depth;depth.fill(Infinity);
    if(night&&(!this.fillImage||this.fillImage.width!==dw||this.fillImage.height!==dh)){
      this.fillImage=ctx.createImageData(dw,dh);this.fillCanvas=document.createElement('canvas');
      this.fillCanvas.width=dw;this.fillCanvas.height=dh;this.fillContext=this.fillCanvas.getContext('2d');
    }
    const pixels=night?this.fillImage.data:null;if(pixels)pixels.fill(0);
    const faces=scene.faces.map(f=>{
      const p=f.points.map(v=>project(v,mvp,width,height));
      const base=night?rgb(f.color):null;
      return {p,color:f.color,colors:night?(f.vertexColors||p.map(()=>base)):null,z:p.reduce((s,v)=>s+v[2],0)/p.length};
    });
    for(const face of faces)for(let i=1;i<face.p.length-1;i++){
      const a=face.p[0],b=face.p[i],c=face.p[i+1];
      const ax=a[0]*scale,ay=a[1]*scale,bx=b[0]*scale,by=b[1]*scale,cx=c[0]*scale,cy=c[1]*scale;
      const dx1=bx-ax,dy1=by-ay,dx2=cx-ax,dy2=cy-ay,det=dx1*dy2-dx2*dy1;
      if(Math.abs(det)<1e-7)continue;
      const sign=Math.sign(det),zx=((b[2]-a[2])*dy2-(c[2]-a[2])*dy1)/det;
      const zy=(dx1*(c[2]-a[2])-dx2*(b[2]-a[2]))/det;
      const channels=pixels?[0,1,2].map(k=>{
        const start=face.colors[0][k]*255,d1=(face.colors[i][k]-face.colors[0][k])*255,d2=(face.colors[i+1][k]-face.colors[0][k])*255;
        return {start,x:(d1*dy2-d2*dy1)/det,y:(dx1*d2-dx2*d1)/det};
      }):null;
      const x0=Math.max(0,Math.floor(Math.min(ax,bx,cx))),x1=Math.min(dw-1,Math.ceil(Math.max(ax,bx,cx)));
      const y0=Math.max(0,Math.floor(Math.min(ay,by,cy))),y1=Math.min(dh-1,Math.ceil(Math.max(ay,by,cy)));
      for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
        const px=x+.5,py=y+.5;
        if(sign*((bx-ax)*(py-ay)-(by-ay)*(px-ax))<-.01 ||
          sign*((cx-bx)*(py-by)-(cy-by)*(px-bx))<-.01 ||
          sign*((ax-cx)*(py-cy)-(ay-cy)*(px-cx))<-.01)continue;
        const z=a[2]+zx*(px-ax)+zy*(py-ay),idx=y*dw+x;
        if(z<=depth[idx]+(night?1e-7:0)){
          depth[idx]=z;
          if(pixels){const n=idx*4;for(let k=0;k<3;k++)pixels[n+k]=channels[k].start+channels[k].x*(px-ax)+channels[k].y*(py-ay);pixels[n+3]=255;}
        }
      }
    }
    if(pixels){
      this.fillContext.putImageData(this.fillImage,0,0);ctx.drawImage(this.fillCanvas,0,0,width,height);
    }else{
      faces.sort((a,b)=>b.z-a.z);
      for(const f of faces){ctx.beginPath();ctx.moveTo(f.p[0][0],f.p[0][1]);for(let i=1;i<f.p.length;i++)ctx.lineTo(f.p[i][0],f.p[i][1]);ctx.closePath();ctx.fillStyle=f.color;ctx.fill();}
    }
    const groups=new Map();
    for(const l of scene.lines){
      const key=[l.color,l.width,l.alpha].join('|');
      if(!groups.has(key))groups.set(key,[]);groups.get(key).push(l);
    }
    ctx.lineCap='round';ctx.lineJoin='round';
    for(const [key,segments]of groups){
      const [ink,weight,alpha]=key.split('|');ctx.strokeStyle=ink;ctx.lineWidth=Number(weight);ctx.globalAlpha=Number(alpha);ctx.beginPath();
      for(const line of segments){
        const a=project(line.a,mvp,width,height),b=project(line.b,mvp,width,height);
        const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],steps=Math.max(2,Math.ceil(Math.hypot(dx,dy)*scale));
        let drawing=false;
        for(let i=0;i<=steps;i++){
          const t=i/steps,px=a[0]+dx*t,py=a[1]+dy*t;
          const ix=Math.floor(px*scale),iy=Math.floor(py*scale),z=a[2]+dz*t;
          let surface=Infinity;
          if(ix>0&&ix<dw-1&&iy>0&&iy<dh-1){const n=iy*dw+ix;surface=Math.max(depth[n],depth[n-1],depth[n+1],depth[n-dw],depth[n+dw]);}
          const visible=ix>=0&&ix<dw&&iy>=0&&iy<dh&&z<=surface+.000060;
          if(visible){if(!drawing)ctx.moveTo(px,py);else ctx.lineTo(px,py);drawing=true;}
          else drawing=false;
        }
      }
      ctx.stroke();
    }
    ctx.globalAlpha=1;
    for(const glow of this.scene.glows||[]){
      const p=project(glow.position,mvp,width,height),q=project([glow.position[0],glow.position[1]+glow.radius,glow.position[2]],mvp,width,height);
      const ix=Math.floor(p[0]*scale),iy=Math.floor(p[1]*scale);
      if(ix<0||ix>=dw||iy<0||iy>=dh||p[2]>depth[iy*dw+ix]+.00014)continue;
      const radius=Math.max(glow.radius<=.1?1:2,Math.abs(q[1]-p[1])),gradient=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],radius);
      gradient.addColorStop(0,'#fff0cf');gradient.addColorStop(.13,glow.color+'c0');
      gradient.addColorStop(.45,glow.color+'48');gradient.addColorStop(1,glow.color+'00');
      ctx.globalAlpha=glow.strength;ctx.fillStyle=gradient;ctx.beginPath();ctx.arc(p[0],p[1],radius,0,Math.PI*2);ctx.fill();
    }
    ctx.globalAlpha=1;this.camera=cam;
  }
  destroy(){this.depth=null;this.fillImage=null;this.fillCanvas=null;this.fillContext=null;}
}

/** Reusable, dependency-free custom element. Set scroll-target to the section
 * whose document progress drives the camera. progress="0..1" overrides scroll. */
class AndesCasona extends HTMLElement {
  static observedAttributes=['progress','strength','scroll-target','theme','rango','escala'];
  constructor() {
    super();this.attachShadow({mode:'open'});
    this.shadowRoot.innerHTML=`<style>
      :host{display:block;position:relative;width:100%;height:100%;min-height:240px;isolation:isolate}
      :host([theme="night"]){background:transparent}
      canvas,img{display:block;width:100%;height:100%;object-fit:contain}
      img{position:absolute;inset:0}canvas{opacity:0} :host([ready]) canvas{opacity:1}
      :host([ready]) img{visibility:hidden}
    </style><img alt="Dibujo arquitectónico de la casona de Andes Electrónica y su jardín frontal, con fuente, faroles y árbol de varios troncos." draggable="false"><canvas aria-hidden="true"></canvas>`;
    this.canvas=this.shadowRoot.querySelector('canvas');this.fallback=this.shadowRoot.querySelector('img');
    this.fallback.src=FALLBACK_URL;
    this.progress=.5;this.desired=.5;this.visible=true;this.raf=0;this.active=false;this.lastFrameTime=0;
    this.onScroll=()=>{this.measure();this.request();};
    this.onMotion=()=>{this.measure();this.request();};
    this.onVisibility=()=>{if(document.hidden){cancelAnimationFrame(this.raf);this.raf=0;this.lastFrameTime=0;}else this.onScroll();};
    this.onLost=e=>{e.preventDefault();this.contextLost=true;this.removeAttribute('ready');cancelAnimationFrame(this.raf);this.raf=0;this.lastFrameTime=0;};
    this.onRestored=()=>{this.contextLost=false;this.drawing?.destroy();this.initDrawing();this.onScroll();};
  }
  connectedCallback() {
    if(this.active)return;this.active=true;
    if(!this.hasAttribute('role'))this.setAttribute('role','img');
    if(!this.hasAttribute('aria-label'))this.setAttribute('aria-label','Ilustración arquitectónica de la casona de Andes Electrónica y su jardín frontal: entrada retraída, ventana de cuatro por cuatro con apertura hacia adentro de los dos paños centrales de la segunda fila, balcón curvo, fuente con estatua, faroles y jardinera con flores.');
    this.fallback.setAttribute('aria-hidden','true');
    this.motion=window.matchMedia('(prefers-reduced-motion: reduce)');
    this.motion.addEventListener('change',this.onMotion);
    window.addEventListener('scroll',this.onScroll,{passive:true});
    window.addEventListener('resize',this.onScroll,{passive:true});
    document.addEventListener('visibilitychange',this.onVisibility);
    this.canvas.addEventListener('webglcontextlost',this.onLost);
    this.canvas.addEventListener('webglcontextrestored',this.onRestored);
    this.resizeObserver=new ResizeObserver(this.onScroll);this.resizeObserver.observe(this);
    this.intersectionObserver=new IntersectionObserver(entries=>{
      this.visible=entries[0].isIntersecting;
      if(this.visible)this.onScroll();else{cancelAnimationFrame(this.raf);this.raf=0;this.lastFrameTime=0;}
    },{rootMargin:'100px'});this.intersectionObserver.observe(this);
    this.initDrawing();this.measure();this.progress=this.desired;this.request();
  }
  initDrawing() {
    const theme=this.getAttribute('theme')==='night'?'night':'day',scene=makeScene(theme);
    this.dataset.theme=theme;this.dataset.lights=String(scene.glows?.length||0);
    this.fallback.src=theme==='night'?FALLBACK_NIGHT_URL:FALLBACK_URL;
    try{this.drawing=new Drawing(this.canvas,scene);this.failed=false;this.dataset.renderer='webgl';}
    catch(e){
      try{this.drawing=new SoftwareDrawing(this.canvas,scene);this.failed=false;this.dataset.renderer='canvas';}
      catch{this.failed=true;this.drawing=null;this.removeAttribute('ready');this.dataset.renderer='svg';}
    }
  }
  disconnectedCallback() {
    this.active=false;cancelAnimationFrame(this.raf);this.raf=0;this.lastFrameTime=0;
    window.removeEventListener('scroll',this.onScroll);window.removeEventListener('resize',this.onScroll);
    document.removeEventListener('visibilitychange',this.onVisibility);
    this.motion?.removeEventListener('change',this.onMotion);
    this.canvas.removeEventListener('webglcontextlost',this.onLost);this.canvas.removeEventListener('webglcontextrestored',this.onRestored);
    this.resizeObserver?.disconnect();this.intersectionObserver?.disconnect();this.drawing?.destroy();this.drawing=null;
  }
  attributeChangedCallback(name,oldValue,newValue){
    if(!this.active||oldValue===newValue)return;
    if(name==='theme'){this.drawing?.destroy();this.initDrawing();}
    this.onScroll();
  }
  measure() {
    if(this.motion?.matches){this.desired=.5;return;}
    const fixed=this.getAttribute('progress');
    if(fixed!==null && Number.isFinite(Number(fixed))){this.desired=clamp(Number(fixed));return;}
    let target;
    try{target=this.getAttribute('scroll-target')?document.querySelector(this.getAttribute('scroll-target')):null;}catch{}
    const r=(target||this).getBoundingClientRect(),y=window.scrollY;
    const start=Math.max(0,y+r.top-window.innerHeight*.85);
    const end=Math.min(document.documentElement.scrollHeight-window.innerHeight,y+r.bottom-window.innerHeight*.2);
    this.desired=end>start?clamp((y-start)/(end-start)):.5;
    // rango="a,b" (Andes, 2026-11-03): el scroll recorre sólo esa parte de la vuelta (p. ej. el tercio central en inicio)
    const rango=(this.getAttribute('rango')||'').split(',').map(Number);
    if(rango.length===2&&rango.every(Number.isFinite))this.desired=rango[0]+(rango[1]-rango[0])*this.desired;
  }
  request() {
    if(this.raf||!this.active||!this.visible||document.hidden||this.failed||this.contextLost)return;
    this.raf=requestAnimationFrame(now=>this.frame(now));
  }
  frame(now) {
    this.raf=0;
    const frameMs=this.lastFrameTime?now-this.lastFrameTime:1000/60;
    this.lastFrameTime=now;
    this.progress=this.motion.matches ? .5 : advanceProgress(this.progress,this.desired,frameMs);
    const raw=Number(this.getAttribute('strength')??1),strength=clamp(Number.isFinite(raw)?raw:1,0,2);
    try{
      const rg=(this.getAttribute('rango')||'').split(',').map(Number),es=Number(this.getAttribute('escala'));
      ENCUADRE={rango:rg.length===2&&rg.every(Number.isFinite)?rg:[0,1],escala:Number.isFinite(es)&&es>0?es:1};
      this.drawing.render(this.progress,strength);
      this.setAttribute('ready','');
      const angle=windowAngle(this.progress)*180/Math.PI;
      this.dataset.windowAngle=angle.toFixed(2);
      this.dataset.cameraHeight=this.drawing.camera.eye[1].toFixed(3);
      this.dispatchEvent(new CustomEvent('casona-progress',{detail:{progress:this.progress,windowAngle:angle},bubbles:true}));
    }catch(e){this.failed=true;this.removeAttribute('ready');console.warn('Andes Casona render:',e.message);}
    if(this.desired!==this.progress)this.request();else this.lastFrameTime=0;
  }
}
if(!customElements.get('andes-casona'))customElements.define('andes-casona',AndesCasona);

})();

// el tema del sitio (html[data-tema]) elige la casona de día o de noche (Andes, 2026-11-03)
(function(){
  function aplicar(){
    var noche=document.documentElement.getAttribute('data-tema')!=='claro';
    document.querySelectorAll('andes-casona').forEach(function(e){
      if(noche&&e.getAttribute('theme')!=='night')e.setAttribute('theme','night');
      else if(!noche&&e.hasAttribute('theme'))e.removeAttribute('theme');
    });
  }
  aplicar();
  new MutationObserver(aplicar).observe(document.documentElement,{attributes:true,attributeFilter:['data-tema']});
})();
