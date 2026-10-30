/* Productos: exploración 3D del tacógrafo con el scroll.
   Origen: la animación que Benjamin hizo con ChatGPT (2026-10-27, tacografo_scroll.html). Este archivo es su motor,
   adaptado al sitio: el modelo viene de datos/tacografo-modelo.js (window.TACOGRAFO_MODELO, JSON con gzip y base64),
   los textos de cada etapa vienen del HTML (data-etiqueta, data-titulo y data-texto de cada enlace de .taco-nav), los
   colores siguen el tema (data-tema de <html>) y no dibuja mientras la sección está fuera de pantalla.
   Reconstrucción visual basada en fotografías: medidas y distribución interna aproximadas. */

/* Respaldo en canvas 2D para equipos sin GPU ni WebGL: mismas mallas y transformaciones, biseles y luz más simples. */
function createSoftwareGL(canvas,data){
  const ctx=canvas.getContext('2d',{alpha:true});
  if(!ctx)throw new Error('El navegador no permite dibujar el modelo 3D.');
  const positions=[-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1];
  const cubeFaces=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,3,7,6,3,6,2,0,4,7,0,7,3,1,2,6,1,6,5];
  data.meshes.forEach(m=>{
    if(m.name!=='rounded_box')return;
    const lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
    m.p.forEach(p=>p.forEach((v,k)=>{lo[k]=Math.min(lo[k],v);hi[k]=Math.max(hi[k],v);}));
    const corners=[];for(let i=0;i<8;i++)corners.push(positions.slice(i*3,i*3+3).map((x,k)=>x<0?lo[k]:hi[k]));
    const p=[],n=[],indices=[];
    for(let t=0;t<cubeFaces.length;t+=3){
      const a=corners[cubeFaces[t]],b=corners[cubeFaces[t+1]],c=corners[cubeFaces[t+2]];
      const u=b.map((v,k)=>v-a[k]),v=c.map((x,k)=>x-a[k]);
      const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
      const len=Math.hypot(...normal)||1;normal.forEach((x,k)=>normal[k]=x/len);
      for(const point of [a,b,c]){indices.push(p.length);p.push(point);n.push(normal);}
    }
    m.p=p;m.n=n;m.i=indices;
  });
  const api={__software:true,ARRAY_BUFFER:1,ELEMENT_ARRAY_BUFFER:2,STATIC_DRAW:3,TRIANGLES:4,LINES:5,FLOAT:6,UNSIGNED_SHORT:7,COLOR_BUFFER_BIT:8,DEPTH_BUFFER_BIT:16,DEPTH_TEST:17,CULL_FACE:18,BLEND:19,SRC_ALPHA:20,ONE_MINUS_SRC_ALPHA:21,VERTEX_SHADER:22,FRAGMENT_SHADER:23,COMPILE_STATUS:24,LINK_STATUS:25};
  let program=null,bound={},attrib={},jobs=[],vp=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],dimensions=[1,1];
  const mul=(m,x,y,z)=>[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14],m[3]*x+m[7]*y+m[11]*z+m[15]];
  const unit=v=>{const l=Math.hypot(...v)||1;return v.map(x=>x/l);};
  const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
  const lights=[unit([-.7,1.1,1.2]),unit([1,.65,-.5]),unit([0,1,-1])];
  api.createShader=()=>({});api.shaderSource=()=>{};api.compileShader=()=>{};api.getShaderParameter=()=>true;api.getShaderInfoLog=()=>'';
  api.createProgram=()=>({uniforms:{}});api.attachShader=()=>{};api.linkProgram=()=>{};api.getProgramParameter=()=>true;api.getProgramInfoLog=()=>'';
  api.getUniformLocation=(p,name)=>({p,name});api.getAttribLocation=(_p,name)=>name==='aPosition'?0:name==='aNormal'?1:2;
  api.createBuffer=()=>({});api.bindBuffer=(target,b)=>{bound[target]=b;};api.bufferData=(target,values)=>{bound[target].data=values;};
  api.useProgram=p=>{program=p;};api.uniform3fv=(loc,v)=>{loc.p.uniforms[loc.name]=Array.from(v);};api.uniform1f=(loc,v)=>{loc.p.uniforms[loc.name]=v;};
  api.uniformMatrix4fv=(loc,_transpose,m)=>{loc.p.uniforms[loc.name]=Array.from(m);};
  api.vertexAttribPointer=index=>{attrib[index]=bound[api.ARRAY_BUFFER];};
  api.enableVertexAttribArray=()=>{};api.disableVertexAttribArray=()=>{};api.enable=()=>{};api.disable=()=>{};api.depthMask=()=>{};api.blendFunc=()=>{};api.clearColor=()=>{};
  api.viewport=(_x,_y,w,h)=>{dimensions=[w,h];};
  api.clear=()=>{jobs=[];ctx.clearRect(0,0,canvas.width,canvas.height);};api.drawArrays=()=>{};
  api.drawElements=(_mode,count)=>{
    const u=program.uniforms;if(!u.uColor)return;
    const p=attrib[0].data,n=attrib[1].data,index=bound[api.ELEMENT_ARRAY_BUFFER].data,m=u.uModel,vp=u.uViewProjection;
    const verts=[],norms=[],world=[];
    for(let i=0;i<p.length;i+=3){
      const w=mul(m,p[i],p[i+1],p[i+2]),c=mul(vp,w[0],w[1],w[2]);world.push(w);
      verts.push([(c[0]/c[3]*.5+.5)*dimensions[0],(-c[1]/c[3]*.5+.5)*dimensions[1],c[2]/c[3],c[3]]);
      norms.push([m[0]*n[i]+m[4]*n[i+1]+m[8]*n[i+2],m[1]*n[i]+m[5]*n[i+1]+m[9]*n[i+2],m[2]*n[i]+m[6]*n[i+1]+m[10]*n[i+2]]);
    }
    const base=u.uColor.map(x=>x**2.2),eye=u.uEye,metal=u.uMetal,rough=u.uRough;
    for(let i=0;i<count;i+=3){
      const ia=index[i],ib=index[i+1],ic=index[i+2],a=verts[ia],b=verts[ib],c=verts[ic];
      if(a[3]<=0||b[3]<=0||c[3]<=0)continue;
      const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(Math.abs(area)<.05)continue;
      if(Math.max(a[0],b[0],c[0])<0||Math.min(a[0],b[0],c[0])>dimensions[0]||Math.max(a[1],b[1],c[1])<0||Math.min(a[1],b[1],c[1])>dimensions[1])continue;
      const center=world[ia].slice(0,3).map((v,k)=>(v+world[ib][k]+world[ic][k])/3),view=unit(eye.map((v,k)=>v-center[k]));
      let normal=unit(norms[ia].map((v,k)=>v+norms[ib][k]+norms[ic][k]));if(dot(normal,view)<0)normal=normal.map(x=>-x);
      const color=base.map(x=>x*(.74+.30*Math.max(normal[1],0)));
      for(let li=0;li<3;li++){
        const l=lights[li],strength=[1.30,.65,.42][li],nd=Math.max(dot(normal,l),0),half=unit(l.map((v,k)=>v+view[k]));
        const spec=Math.max(dot(normal,half),0)**(8+150*(1-rough)**2);
        color.forEach((value,k)=>color[k]=value+base[k]*nd*strength+(.045*(1-metal)+(base[k]*.65+.02)*metal)*spec*strength*2.3);
      }
      const rgb=color.map(v=>Math.round(255*(Math.max(v,0)/(Math.max(v,0)+.72))**(1/2.2)));
      jobs.push({a,b,c,color:(0xff000000|(rgb[2]<<16)|(rgb[1]<<8)|rgb[0])>>>0});
    }
  };
  let pixels=null,zbuffer=null,packed=null;
  api.flush=()=>{
    const w=canvas.width,h=canvas.height;
    if(!pixels||pixels.width!==w||pixels.height!==h){pixels=ctx.createImageData(w,h);packed=new Uint32Array(pixels.data.buffer);zbuffer=new Float32Array(w*h);}
    packed.fill(0);zbuffer.fill(Infinity);
    for(const t of jobs){
      const a=t.a,b=t.b,c=t.c;
      const minX=Math.max(0,Math.floor(Math.min(a[0],b[0],c[0]))),maxX=Math.min(w-1,Math.ceil(Math.max(a[0],b[0],c[0])));
      const minY=Math.max(0,Math.floor(Math.min(a[1],b[1],c[1]))),maxY=Math.min(h-1,Math.ceil(Math.max(a[1],b[1],c[1])));
      const inv=1/((b[1]-c[1])*(a[0]-c[0])+(c[0]-b[0])*(a[1]-c[1]));
      const dx0=(b[1]-c[1])*inv,dy0=(c[0]-b[0])*inv,dx1=(c[1]-a[1])*inv,dy1=(a[0]-c[0])*inv;
      let row0=((b[1]-c[1])*(minX+.5-c[0])+(c[0]-b[0])*(minY+.5-c[1]))*inv;
      let row1=((c[1]-a[1])*(minX+.5-c[0])+(a[0]-c[0])*(minY+.5-c[1]))*inv;
      const za=a[2]-c[2],zb=b[2]-c[2];
      for(let y=minY;y<=maxY;y++,row0+=dy0,row1+=dy1){
        let u=row0,v=row1,index=y*w+minX;
        for(let x=minX;x<=maxX;x++,index++,u+=dx0,v+=dx1){
          if(u<0||v<0||u+v>1)continue;
          const depth=c[2]+za*u+zb*v;
          if(depth<zbuffer[index]){zbuffer[index]=depth;packed[index]=t.color;}
        }
      }
    }
    ctx.putImageData(pixels,0,0);
  };
  return api;
}


(async function(){
  'use strict';
  const root=document.getElementById('tacografo');
  if(!root||!window.TACOGRAFO_MODELO||typeof window.TACOGRAFO_MODELO!=='object')return;   // sin modelo: queda la foto
  const canvas=root.querySelector('canvas'),status=root.querySelector('[data-status]');
  try{
    const data=window.TACOGRAFO_MODELO;   // datos legibles (datos/tacografo-modelo.js), sin descomprimir (2026-10-30)
    let gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,preserveDrawingBuffer:true});
    if(!gl)gl=createSoftwareGL(canvas,data);
    const TAMANO=0.5;   // tamaño en pantalla respecto del original (Benjamin, 2026-10-27: «hazlo 50 % más chico»)
    const state={explode:0,door:0,printerOpen:1,yaw:.42,pitch:.30,distance:445,target:[0,-1,-67]};
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const identity=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
    const m4=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;};
    const norm=v=>{let l=Math.hypot(...v)||1;return v.map(x=>x/l);};
    const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0);
    const translate=p=>{const m=identity();m[12]=p[0];m[13]=p[1];m[14]=p[2];return m;};
    const rotY=a=>new Float32Array([Math.cos(a),0,-Math.sin(a),0,0,1,0,0,Math.sin(a),0,Math.cos(a),0,0,0,0,1]);
    const rotX=a=>new Float32Array([1,0,0,0,0,Math.cos(a),Math.sin(a),0,0,-Math.sin(a),Math.cos(a),0,0,0,0,1]);
    const rotate=(v,r)=>{let [x,y,z]=v;let c=Math.cos(r[0]),s=Math.sin(r[0]);[y,z]=[c*y-s*z,s*y+c*z];c=Math.cos(r[1]);s=Math.sin(r[1]);[x,z]=[c*x+s*z,-s*x+c*z];c=Math.cos(r[2]);s=Math.sin(r[2]);return[c*x-s*y,s*x+c*y,z];};
    function perspective(fovy,aspect,near,far){let f=1/Math.tan(fovy/2),nf=1/(near-far);return new Float32Array([f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0]);}
    function lookAt(eye,target){const z=norm(eye.map((x,i)=>x-target[i])),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
    function program(vs,fs){
      function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
      const p=gl.createProgram();gl.attachShader(p,shader(gl.VERTEX_SHADER,vs));gl.attachShader(p,shader(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;
    }
    const prog=program(`
      attribute vec3 aPosition; attribute vec3 aNormal;
      uniform mat4 uViewProjection; uniform mat4 uModel;
      varying vec3 vNormal; varying vec3 vPosition;
      void main(){vec4 p=uModel*vec4(aPosition,1.0);vPosition=p.xyz;vNormal=mat3(uModel)*aNormal;gl_Position=uViewProjection*p;}
    `,`
      precision highp float;
      varying vec3 vNormal; varying vec3 vPosition;
      uniform vec3 uEye; uniform vec3 uColor; uniform float uMetal; uniform float uRough;
      uniform float uRelleno; uniform float uBorde;   // tema oscuro: más luz de relleno y un borde azulado (Fresnel)
      vec3 illuminate(vec3 n,vec3 v,vec3 l,vec3 base,float strength){
        float nd=max(dot(n,l),0.0); vec3 h=normalize(l+v);
        float exponent=8.0+150.0*pow(1.0-uRough,2.0);
        float s=pow(max(dot(n,h),0.0),exponent);
        vec3 f=mix(vec3(.045),base*.65+vec3(.02),uMetal);
        return base*nd*strength+f*s*strength*2.3;
      }
      void main(){
        vec3 n=normalize(vNormal),v=normalize(uEye-vPosition);
        if(!gl_FrontFacing)n=-n;
        vec3 base=pow(uColor,vec3(2.2));
        vec3 color=base*(.74*uRelleno+.30*max(n.y,0.0));
        color+=illuminate(n,v,normalize(vec3(-.7,1.1,1.2)),base,1.30);
        color+=illuminate(n,v,normalize(vec3(1.0,.65,-.5)),base,.65);
        color+=illuminate(n,v,normalize(vec3(.0,1.0,-1.0)),base,.42);
        vec3 reflected=reflect(-v,n);
        float softbox=pow(max(dot(reflected,normalize(vec3(-.6,1.0,1.2))),0.0),10.0);
        color+=vec3(.022)*softbox*(.2+uMetal);
        color+=vec3(.004)*pow(1.0-max(dot(n,v),0.0),4.0);
        color+=vec3(.55,.66,1.0)*uBorde*pow(1.0-max(dot(n,v),0.0),3.0);
        color=color/(color+vec3(.72));
        gl_FragColor=vec4(pow(color,vec3(1.0/2.2)),1.0);
      }
    `);
    const attrs={p:gl.getAttribLocation(prog,'aPosition'),n:gl.getAttribLocation(prog,'aNormal')};
    const uniforms={};['uViewProjection','uModel','uEye','uColor','uMetal','uRough','uRelleno','uBorde'].forEach(k=>uniforms[k]=gl.getUniformLocation(prog,k));
    const buckets=new Map();
    data.objects.forEach(o=>{
      let key=o.group+'-'+o.mat,b=buckets.get(key);
      const m=data.meshes[o.mesh];
      if(b && b.p.length/3+m.p.length>60000){key+='-'+buckets.size;b=null;}
      if(!b){b={p:[],n:[],i:[],group:o.group,mat:o.mat};buckets.set(key,b);}
      const offset=b.p.length/3;
      m.p.forEach((p,j)=>{
        const pp=rotate(p.map((v,k)=>v*o.scale[k]),o.rot);b.p.push(...pp.map((v,k)=>v+o.pos[k]));
        const nn=norm(rotate(m.n[j].map((v,k)=>v/o.scale[k]),o.rot));b.n.push(...nn);
      });
      m.i.forEach(i=>b.i.push(i+offset));
    });
    function buffer(target,values){const b=gl.createBuffer();gl.bindBuffer(target,b);gl.bufferData(target,values,gl.STATIC_DRAW);return b;}
    const draws=Array.from(buckets.values()).map(b=>({p:buffer(gl.ARRAY_BUFFER,new Float32Array(b.p)),n:buffer(gl.ARRAY_BUFFER,new Float32Array(b.n)),i:buffer(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(b.i)),count:b.i.length,group:b.group,mat:data.materials[b.mat]}));
    const flat=program(`attribute vec3 aPosition;attribute float aAlpha;uniform mat4 uViewProjection;varying float vAlpha;void main(){gl_Position=uViewProjection*vec4(aPosition,1.0);vAlpha=aAlpha;}`,`precision mediump float;uniform vec3 uInk;uniform float uInkAlpha;varying float vAlpha;void main(){gl_FragColor=vec4(uInk,vAlpha*uInkAlpha);}`);
    const flatp=gl.getAttribLocation(flat,'aPosition'),flata=gl.getAttribLocation(flat,'aAlpha'),flatvp=gl.getUniformLocation(flat,'uViewProjection'),flatink=gl.getUniformLocation(flat,'uInk'),flatalpha=gl.getUniformLocation(flat,'uInkAlpha');
    const shadowp=[],shadowa=[];
    for(let j=0;j<64;j++){
      const a=j*Math.PI*2/64,b=(j+1)*Math.PI*2/64;
      shadowp.push(0,-29.15,-67,Math.cos(a)*132,-29.15,-67+Math.sin(a)*112,Math.cos(b)*132,-29.15,-67+Math.sin(b)*112);shadowa.push(.17,0,0);
    }
    const ground={p:buffer(gl.ARRAY_BUFFER,new Float32Array(shadowp)),a:buffer(gl.ARRAY_BUFFER,new Float32Array(shadowa)),count:shadowa.length};
    // tema: claro como el original; oscuro con más relleno, borde azulado y sombra negra más marcada
    const TEMAS={claro:{relleno:1,borde:0,sombra:[0,.063,.31],alfa:1},oscuro:{relleno:1.55,borde:.32,sombra:[0,0,0],alfa:2.4}};
    let width=0,height=0,tema=TEMAS.claro,visible=true;
    function readTheme(){tema=document.documentElement.getAttribute('data-tema')==='oscuro'?TEMAS.oscuro:TEMAS.claro;draw();}
    function groupMatrix(i,memo){
      if(memo[i])return memo[i];
      const g=data.groups[i],p=g.pos.slice();
      if(g.kind==='lid')p[1]+=62*state.explode;
      if(g.kind==='board')p[1]+=10*state.explode;
      if(g.kind==='battery')p[1]+=29*state.explode;
      if(g.kind==='front')p[2]+=13*state.explode;
      let m=translate(p);if(g.rot&&g.rot[1])m=m4(m,rotY(g.rot[1]));if(g.rot&&g.rot[0])m=m4(m,rotX(g.rot[0]));
      if(g.kind==='door')m=m4(m,rotY(-110*Math.PI/180*state.door));
      if(g.kind==='printerDoor')m=m4(m,rotX((g.motion?.degrees??-45)*Math.PI/180*state.printerOpen));
      if(g.parent!==null)m=m4(groupMatrix(g.parent,memo),m);
      return memo[i]=m;
    }
    function draw(){
      if(!visible)return;
      const ratio=gl.__software?1:Math.min(window.devicePixelRatio||1,2),rect=canvas.getBoundingClientRect();
      if(!rect.width||!rect.height)return;
      const w=Math.round(rect.width*ratio),h=Math.round(rect.height*ratio);
      if(width!==w||height!==h){canvas.width=w;canvas.height=h;width=w;height=h;}
      gl.viewport(0,0,width,height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      const aspect=rect.width/rect.height;
      const target=[0,-1+22*state.explode,-67],distance=Math.max(state.distance,125/(Math.tan(33*Math.PI/360)*aspect))/TAMANO;
      const eye=[target[0]+Math.sin(state.yaw)*Math.cos(state.pitch)*distance,target[1]+Math.sin(state.pitch)*distance,target[2]+Math.cos(state.yaw)*Math.cos(state.pitch)*distance];
      const vp=m4(perspective(33*Math.PI/180,width/height,1,2000),lookAt(eye,target));
      gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
      gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
      gl.useProgram(flat);gl.uniformMatrix4fv(flatvp,false,vp);gl.uniform3fv(flatink,tema.sombra);gl.uniform1f(flatalpha,tema.alfa);
      function flatDraw(obj,mode){gl.bindBuffer(gl.ARRAY_BUFFER,obj.p);gl.enableVertexAttribArray(flatp);gl.vertexAttribPointer(flatp,3,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,obj.a);gl.enableVertexAttribArray(flata);gl.vertexAttribPointer(flata,1,gl.FLOAT,false,0,0);gl.drawArrays(mode,0,obj.count);}
      flatDraw(ground,gl.TRIANGLES);gl.disableVertexAttribArray(flatp);gl.disableVertexAttribArray(flata);
      gl.disable(gl.BLEND);gl.depthMask(true);gl.useProgram(prog);
      gl.uniformMatrix4fv(uniforms.uViewProjection,false,vp);gl.uniform3fv(uniforms.uEye,eye);
      gl.uniform1f(uniforms.uRelleno,tema.relleno);gl.uniform1f(uniforms.uBorde,tema.borde);
      const memo={};
      draws.forEach(d=>{
        gl.uniformMatrix4fv(uniforms.uModel,false,groupMatrix(d.group,memo));gl.uniform3fv(uniforms.uColor,d.mat.color);gl.uniform1f(uniforms.uMetal,d.mat.metal);gl.uniform1f(uniforms.uRough,d.mat.rough);
        gl.bindBuffer(gl.ARRAY_BUFFER,d.p);gl.enableVertexAttribArray(attrs.p);gl.vertexAttribPointer(attrs.p,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER,d.n);gl.enableVertexAttribArray(attrs.n);gl.vertexAttribPointer(attrs.n,3,gl.FLOAT,false,0,0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,d.i);gl.drawElements(gl.TRIANGLES,d.count,gl.UNSIGNED_SHORT,0);
      });
      gl.disableVertexAttribArray(attrs.p);gl.disableVertexAttribArray(attrs.n);if(gl.__software)gl.flush();
    }
    const clamp=x=>Math.max(0,Math.min(1,x));
    const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
    const segment=(p,a,b)=>ease((p-a)/(b-a));
    const progressBar=root.querySelector('[data-progress]');
    const navLinks=Array.from(root.querySelectorAll('[data-seek]'));
    const phaseInfo=navLinks.map(a=>({caption:a.dataset.etiqueta,title:a.dataset.titulo,description:a.dataset.texto}));
    let lastPhase=-1,lastProgress=0,scheduled=0,contextLost=false;

    function setProgress(value){
      const p=clamp(value);lastProgress=p;
      const rotateP=segment(p,0.035,.40),openP=segment(p,.37,.51),printP=segment(p,.48,.68),explodeP=segment(p,.68,.96);
      if(reduced){
        state.yaw=.55;state.pitch=.44;state.door=p>=.45?1:0;state.printerOpen=p>=.57?1:0;state.explode=p>=.79?1:0;
        state.distance=state.explode?500:435;
      }else{
        state.yaw=.55+2*Math.PI*rotateP-.25*segment(p,.40,.58)+.34*segment(p,.62,1);
        state.pitch=.34+.23*segment(p,.51,.92);
        state.door=openP;state.printerOpen=printP;state.explode=explodeP;state.distance=420+85*segment(p,.65,.96);
      }
      const phase=p<.075?0:p<.40?1:p<.70?2:3;
      if(lastPhase!==phase){
        const info=phaseInfo[phase];root.querySelector('[data-title]').textContent=info.title;
        root.querySelector('[data-description]').textContent=info.description;
        root.querySelector('[data-step-number]').textContent=String(phase+1).padStart(2,'0')+' / 04';
        root.querySelector('[data-step-caption]').textContent=info.caption;
        navLinks.forEach(a=>{if(Number(a.dataset.phase)===phase)a.setAttribute('aria-current','step');else a.removeAttribute('aria-current');});
        root.dataset.phase=String(phase);lastPhase=phase;
      }
      progressBar.value=p;root.style.setProperty('--scroll-progress',String(p));
      root.querySelector('[data-hint]').textContent=p>.94?'Siga bajando: los periféricos':'Desplácese para explorar';
      if(!contextLost&&visible)draw();
    }

    function scrollProgress(){
      const rect=root.getBoundingClientRect();
      const range=Math.max(1,root.offsetHeight-root.querySelector('.taco-stage').offsetHeight);
      return clamp(-rect.top/range);
    }
    function updateFromScroll(){scheduled=0;setProgress(scrollProgress());}
    function schedule(){if(!scheduled)scheduled=requestAnimationFrame(updateFromScroll);}
    function seek(p){
      const top=root.getBoundingClientRect().top+window.scrollY;
      const range=Math.max(1,root.offsetHeight-root.querySelector('.taco-stage').offsetHeight);
      window.scrollTo({top:top+clamp(p)*range,behavior:reduced?'auto':'smooth'});
    }
    navLinks.forEach(a=>a.addEventListener('click',e=>{e.preventDefault();seek(Number(a.dataset.seek));}));
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    canvas.addEventListener('webglcontextlost',e=>{
      e.preventDefault();contextLost=true;status.hidden=false;
      status.textContent='Se interrumpió la vista 3D. Recarga la página para continuar.';
    });
    canvas.addEventListener('webglcontextrestored',()=>window.location.reload());
    new ResizeObserver(schedule).observe(canvas);
    new IntersectionObserver(e=>{visible=e[0].isIntersecting;if(visible)schedule();}).observe(root);
    new MutationObserver(readTheme).observe(document.documentElement,{attributes:true,attributeFilter:['data-tema']});
    status.hidden=true;readTheme();setProgress(scrollProgress());
    root.dataset.ready='true';root.dataset.parts=String(data.objects.length);
    // API mínima para controlar el mismo recorrido desde otro script local.
    window.TacografoScroll={setProgress,getProgress:()=>lastProgress};
  }catch(error){status.hidden=false;status.textContent=error.message;root.dataset.error=error.message;}
})();

