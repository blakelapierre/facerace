(function(){var e=Object.defineProperty,t=(e,t,n)=>()=>{if(n)throw n[0];try{return e&&(t=e(e=0)),t}catch(e){throw n=[e],e}},n=(t,n)=>{let r={};for(var i in t)e(r,i,{get:t[i],enumerable:!0});return n||e(r,Symbol.toStringTag,{value:`Module`}),r};function r(e){let t=e>>>0||1;return()=>(t=Math.imul(1664525,t)+1013904223>>>0,t/4294967296)}function i(e,t){let n=r(t),i=[180+n()*60,120+n()*70,90+n()*60],a=[n()*90,n()*70,n()*80],o=[40+n()*80,60+n()*120,80+n()*140];e.fillStyle=`rgb(${a.map(e=>e|0).join(`,`)})`,e.fillRect(0,0,128,128),e.fillStyle=`rgb(${i.map(e=>e|0).join(`,`)})`,e.beginPath(),e.ellipse(64,70,40,48,0,0,Math.PI*2),e.fill(),e.fillStyle=`rgb(${a.map(e=>e*.85|0).join(`,`)})`,e.beginPath(),e.ellipse(64,38,42,28,0,Math.PI,Math.PI*2),e.fill();let s=t=>{e.fillStyle=`#f4efe6`,e.beginPath(),e.ellipse(t,68,10,7,0,0,Math.PI*2),e.fill(),e.fillStyle=`rgb(${o.map(e=>e|0).join(`,`)})`,e.beginPath(),e.arc(t+(n()-.5)*3,68,4.2,0,Math.PI*2),e.fill(),e.fillStyle=`#1a140f`,e.beginPath(),e.arc(t,68,2.1,0,Math.PI*2),e.fill()};s(50),s(78),e.strokeStyle=`rgb(${a.map(e=>e|0).join(`,`)})`,e.lineWidth=2.4,e.beginPath(),e.moveTo(40,56),e.quadraticCurveTo(50,52+n()*4,60,57),e.moveTo(68,57),e.quadraticCurveTo(78,52+n()*4,88,56),e.stroke(),e.strokeStyle=`rgba(90,40,40,0.85)`,e.lineWidth=2.2,e.beginPath();let c=.2+n()*.8;e.moveTo(52,92),e.quadraticCurveTo(64,92+10*c,76,92),e.stroke(),n()>.55&&(e.strokeStyle=`rgba(20,16,12,0.8)`,e.lineWidth=2,e.beginPath(),e.arc(50,68,12,0,Math.PI*2),e.stroke(),e.beginPath(),e.arc(78,68,12,0,Math.PI*2),e.stroke(),e.beginPath(),e.moveTo(62,68),e.lineTo(66,68),e.stroke())}function a(){if(typeof document>`u`){let e=new OffscreenCanvas(128,128);return{canvas:e,ctx:e.getContext(`2d`,{willReadFrequently:!0})}}let e=document.createElement(`canvas`);return e.width=128,e.height=128,{canvas:e,ctx:e.getContext(`2d`,{willReadFrequently:!0})}}function o(e,t){let{canvas:n,ctx:r}=a();if(!r)return{width:128,height:128,data:/* @__PURE__ */ new Uint8Array(65536),url:``};t?(r.save(),r.translate(128,0),r.scale(-1,1),r.drawImage(t,0,0,128,128),r.restore(),r.strokeStyle=`rgba(231,163,34,0.9)`,r.lineWidth=6,r.strokeRect(3,3,122,122)):i(r,e);let o=r.getImageData(0,0,128,128),s=``;try{`toDataURL`in n&&(s=n.toDataURL(`image/jpeg`,.72))}catch{s=``}return{width:128,height:128,data:new Uint8Array(o.data),url:s}}function s(e,t){let n=.5*Math.sin(e*.15)+.5*Math.cos(t*.13),r=.5*Math.sin((e+t)*.17+1.3)+.5,i=Math.max(0,Math.min(1,.55*n+.45*r)),a=.5+.5*Math.sin(e*.021+.6)*Math.cos(t*.018),o=i*i*d*(.78+.22*a),s=Math.exp(-((e-36)**2+(t+96)**2)/2200);o*=1-s*.55;let c=Math.exp(-((e+24)**2)/520)*Math.max(0,Math.cos(t*.02));return Math.max(0,Math.min(d,o+c*1.6))}function c(e,t,n,r,i,a){let o=Math.hypot(e-n,t-r)/(i*(.92+.08*Math.sin(e*.05+r)*Math.cos(t*.04)));if(o>=1)return 0;let s=1-o;return a*s*s*(3-2*s)}function l(e,t){return Math.hypot(e-p.x,t-p.y)>=p.radius*(.94+.06*Math.sin(e*.21))?null:p.level}function u(e,t){let n=s(e,t);n+=c(e,t,f.x,f.y,f.radius,f.height),n+=c(e,t,m.x,m.y,m.radius,m.height);let r=Math.hypot(e-m.x,t-m.y);r<m.crater&&(n-=(1-r/m.crater)*12);let i=l(e,t);if(i!=null){let r=Math.hypot(e-p.x,t-p.y),a=p.radius*(.94+.06*Math.sin(e*.21)),o=r/Math.max(a,.01);n=i-.12-p.depth*(1-o*o)}return Math.max(-2,n)}var d,f,p,m,h=t((()=>{d=5.4,f={x:-40,y:160,radius:104,height:36},p={x:70,y:96,radius:14,level:2.2,depth:1.6},m={x:-155,y:-55,radius:72,height:30,crater:14}}));function g(e){let t=(e%w+w)%w,n,r,i,a;if(t<52)n=-26+t,r=-18,i=1,a=0;else if((t-=52)<C){let e=-Math.PI/2+t/18;n=26+Math.cos(e)*18,r=Math.sin(e)*18,i=-Math.sin(e),a=Math.cos(e)}else if((t-=C)<52)n=26-t,r=18,i=-1,a=0;else{t-=52;let e=Math.PI/2+t/18;n=-26+Math.cos(e)*18,r=Math.sin(e)*18,i=-Math.sin(e),a=Math.cos(e)}return{x:n,y:r,tx:i,ty:a,yaw:Math.atan2(i,a)}}function _(e){let t=e.length,n=n=>{let r=(n%t+t)%t,i=Math.floor(r),a=r-i,o=e[(i-1+t)%t],s=e[i%t],c=e[(i+1)%t],l=e[(i+2)%t],u=a*a,d=u*a;return[.5*(2*s[0]+(-o[0]+c[0])*a+(2*o[0]-5*s[0]+4*c[0]-l[0])*u+(-o[0]+3*s[0]-3*c[0]+l[0])*d),.5*(2*s[1]+(-o[1]+c[1])*a+(2*o[1]-5*s[1]+4*c[1]-l[1])*u+(-o[1]+3*s[1]-3*c[1]+l[1])*d)]},r=/* @__PURE__ */ new Float64Array(257),i=n(0);for(let e=1;e<=256;e++){let a=n(e/256*t);r[e]=r[e-1]+Math.hypot(a[0]-i[0],a[1]-i[1]),i=a}let a=r[256];return{length:a,pointAt:e=>{let i=(e%1+1)%1*a,o=0,s=256;for(;o<s;){let e=o+s>>1;r[e]<i?o=e+1:s=e}let c=Math.max(1,o),l=c-1,u=r[c]-r[l]||1,d=(l+(i-r[l])/u)/256*t,f=n(d),p=n(d+.015),m=p[0]-f[0],h=p[1]-f[1],g=Math.hypot(m,h)||1;return m/=g,h/=g,{x:f[0],y:f[1],tx:m,ty:h,yaw:Math.atan2(m,h)}}}}function v(){return D[O]}function y(e){O=(e%D.length+D.length)%D.length,ue.clear()}function ee(e){let t=D.findIndex(t=>t.id===e);y(t<0?0:t)}function b(e){return v().pointAt(e)}function x(){return v().halfW}function te(e){return[-e.ty,e.tx]}function ne(e=160){let t=`${v().id}:${e}`,n=ue.get(t);if(n)return n;let r=new Float32Array(e*4);for(let t=0;t<e;t++){let n=b(t/e);r[t*4]=n.x,r[t*4+1]=n.y,r[t*4+2]=n.tx,r[t*4+3]=n.ty}return ue.set(t,r),r}function re(e){return((e%4+4)%4+.5)/4}function ie(e){let t=(e%4+4)%4,n=b(re(t)),[r,i]=te(n),a=t%2==0?1:-1,o=x()+1.85;return{x:n.x+r*a*o,y:n.y+i*a*o}}function ae(e,t){let n=(e%4+4)%4,r=.65+.35*Math.sin(t*1.7+n*1.3);return{wx:Math.sin(t*.37)*r,wy:Math.cos(t*.29+1.2)*r}}var S,oe,C,w,se,T,E,ce,le,D,O,ue,de=t((()=>{S=8,oe=8.2,C=Math.PI*18,w=104+C*2,se=_([[-40,-120],[70,-130],[155,-50],[165,40],[90,115],[-10,140],[-110,70],[-180,55],[-240,-30],[-200,-150],[-70,-145]]),T=_([[-85,-55],[-120,-2],[-148,-20],[-170,-38],[-186,-68],[-168,-98],[-120,-100],[-90,-78]]),E=_([[-40,64],[22,90],[48,140],[8,182],[-22,178],[-58,172],[-96,140],[-104,100],[-70,70]]),ce=_([[-70,-20],[-95,30],[-155,35],[-220,-10],[-230,-70],[-175,-120],[-100,-110],[-60,-70]]),le=_([[118,70],[130,110],[90,150],[30,145],[12,100],[28,58],[78,48],[112,52]]),D=[{id:`stadium`,name:`Stadium`,laps:3,halfW:S,length:w,pointAt:e=>g((e%1+1)%1*w+26)},{id:`ridge`,name:`Ridge`,laps:2,halfW:oe,length:se.length,pointAt:se.pointAt},{id:`lake`,name:`Lake`,laps:2,halfW:7.2,length:le.length,pointAt:le.pointAt},{id:`cinder`,name:`Cinder`,laps:2,halfW:7.4,length:ce.length,pointAt:ce.pointAt},{id:`caldera`,name:`Caldera`,laps:2,halfW:6.4,length:T.length,pointAt:T.pointAt},{id:`summit`,name:`Summit`,laps:2,halfW:6.6,length:E.length,pointAt:E.pointAt}],O=0,ue=/* @__PURE__ */ new Map}));h(),de();let k=[.91,.64,.13,1],A=[.24,.38,.2,1],j=[.42,.44,.4,1],fe=[.92,.9,.84,1],pe=null,me=``;function he(){let e=v().id;if(pe&&me===e)return pe;let t=[];t.push({type:`shape`,kind:`plane`,a:[0,0,0],b:[0,0,1],color:A,tile:`grass`,reflectivity:.02});let n=x();for(let e=0;e<18;e++){let r=b(e/18),[i,a]=te(r),o=r.x-i*(n+1.35),s=r.y-a*(n+1.35),c=u(o,s);t.push({type:`shape`,kind:`capsule`,a:[o,s,c],b:[o,s,c+1.15],r:.16,color:e%2==0?j:k,reflectivity:.08})}let r=b(0),[i,a]=te(r);for(let e of[-1,1]){let o=r.x+i*e*(n+.9),s=r.y+a*e*(n+.9),c=u(o,s);t.push({type:`shape`,kind:`capsule`,a:[o,s,c],b:[o,s,c+3.3],r:.14,color:fe,reflectivity:.1})}let o=[r.x+i*n,r.y+a*n],s=[r.x-i*n,r.y-a*n],c=Math.max(u(o[0],o[1]),u(s[0],s[1]))+3.15;return t.push({type:`shape`,kind:`capsule`,a:[o[0],o[1],c],b:[s[0],s[1],c],r:.12,color:k,reflectivity:.12,tile:`metal`}),me=e,pe=t,t}function M(e,t,n){let r=Math.cos(t),i=Math.sin(t),a=Math.cos(n),o=Math.sin(n),s=Math.sin(e),c=Math.cos(e),l=[s*r,c*r,i],u=Math.cos(e),d=-Math.sin(e),f=-s*i,p=-c*i,m=r;return{fwd:l,right:[u*a+f*o,d*a+p*o,m*o],up:[f*a-u*o,p*a-d*o,m*a]}}function N(e,t,n){let{x:r,y:i,yaw:a,color:o}=e,s=M(a,e.pitch??0,e.roll??0),c=s.fwd[0],l=s.fwd[1],d=s.fwd[2],f=s.right[0],p=s.right[1],m=s.right[2],h=s.up[0],g=s.up[1],_=s.up[2],v=[o[0],o[1],o[2],1],y=.22,ee=e.z??u(r,i)+.46,b=(e,t,n)=>[r+f*e+c*t+h*n,i+p*e+l*t+g*n,ee+m*e+d*t+_*n];t.push({type:`sphere`,origin:b(-.05,0,.56),radius:.46,color:[1,1,1,1],reflectivity:.04,...e.face?{texture:e.face}:{}});let x=b(0,-.55,0),te=b(0,.85,.06);n.push({type:`shape`,kind:`capsule`,a:x,b:te,r:.32,color:v,reflectivity:.18,tile:`metal`}),n.push({type:`sphere`,origin:b(0,.95,.02),radius:.26,color:v,reflectivity:.2});for(let[e,t]of[[.46,.5],[-.46,.5],[.46,-.42],[-.46,-.42]]){let r=b(e,t,-.28);s.up[2]>.25&&(r[2]=Math.max(r[2],u(r[0],r[1])+y)),n.push({type:`sphere`,origin:r,radius:y,color:[.08,.08,.09,1],reflectivity:.06})}(e.flame??0)>.5&&n.push({type:`sphere`,origin:b(0,-.9,.02),radius:.16,color:[1,.45,.08,1],reflectivity:.02})}function ge(e,t,n,r,i,a=[.45,.22,.86],o=0,s=[],c=0,l=0){let d=[],f=[];for(let t of e)N(t,d,f);let p=[];for(let e=0;e<s.length;e++){let t=s[e];if(t.hp<.12)continue;let n=u(t.x,t.y),r=u(t.x2,t.y2),i=(1-t.hp)*.7,a=1-t.hp,o=[.82-a*.42,.84-a*.66,.8-a*.7,1],c=e%2==0?[.9-a*.58,.2-a*.1,.12,1]:[.95-a*.67,.93-a*.77,.88-a*.76,1],l=.2+.12*t.hp;p.push({type:`shape`,kind:`capsule`,a:[t.x,t.y,n+.48-i],b:[t.x2,t.y2,r+.48-i],r:l,color:o,reflectivity:.22}),p.push({type:`shape`,kind:`capsule`,a:[t.x,t.y,n+1.02-i],b:[t.x2,t.y2,r+1.02-i],r:l*.85,color:c,reflectivity:.16})}let m=[];for(let e=0;e<4;e++){let t=ie(e),n=ae(e,c),r=e===(l%4+4)%4,i=r?.95:.72,a=r?4.6:3.3,o=r?[.98,.82,.16,1]:[.92,.32,.16,1],s=u(t.x,t.y),d=t.x,f=t.y,p=s+.12;for(let e=0;e<3;e++){let c=(e+1)/3,l=t.x+n.wx*i*c*c,u=t.y+n.wy*i*c*c,h=s+a*c;m.push({type:`shape`,kind:`capsule`,a:[d,f,p],b:[l,u,h],r:(.42-c*.06)*(r?1.05:.9),color:o,reflectivity:.2}),d=l,f=u,p=h}m.push({type:`sphere`,origin:[d+n.wx*.08,f+n.wy*.08,p+.32],radius:r?.58:.46,color:o,reflectivity:.22})}return{camera:{origin:[t.x,t.y,t.z],dir:t.dir,up:[0,0,1],fov:68,aspect:Math.max(.5,n/Math.max(1,r)),planeDistance:1},miss:[.45,.62,.82,1],sun:a,objects:[...d,...f,...he(),...p,...m],track:{half:x(),count:160,samples:ne(160)},rain:o,fovea:{x:.5,y:.42,fovea:.55,falloff:1.05,period:1,block:0,still:i}}}function _e(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function P(e,t,n){let r=t[1]*n[2]-t[2]*n[1],i=t[2]*n[0]-t[0]*n[2],a=t[0]*n[1]-t[1]*n[0];return e[0]=r,e[1]=i,e[2]=a,e}function ve(e){return Math.hypot(e[0],e[1],e[2])}var ye=t((()=>{}));function be(){return V}function F(e){if(V=0,e<1)return-1;let t=1/0,n=1/0,r=1/0,i=-1/0,a=-1/0,o=-1/0;for(let s=0;s<e;s++){let e=Re[s],c=ze[s],l=Be[s];e<t&&(t=e),e>i&&(i=e),c<n&&(n=c),c>a&&(a=c),l<r&&(r=l),l>o&&(o=l),Ue[s]=s}let s=V++;Ye[s]=Math.max(i-t,a-n,o-r)/2+1,Ke[s]=(t+i)/2,qe[s]=(n+a)/2,Je[s]=(r+o)/2,tt[s]=0,R[s]=e,z[s]=-1;let c=[s];for(;c.length;){let e=c.pop();if(R[e]<=8||Ye[e]<4||V+8>32768)continue;let t=Ye[e]/2,n=V;z[e]=n;for(let n=0;n<8;n++){let r=V++;Ye[r]=t,z[r]=-1,R[r]=0,Ke[r]=Ke[e]+(n&1?t:-t),qe[r]=qe[e]+(n&2?t:-t),Je[r]=Je[e]+(n&4?t:-t)}let r=tt[e],i=R[e],a=[0,0,0,0,0,0,0,0];for(let t=0;t<i;t++){let n=Ue[r+t],i=+(Re[n]>=Ke[e])|(ze[n]>=qe[e]?2:0)|(Be[n]>=Je[e]?4:0);a[i]+=1}let o=r;for(let e=0;e<8;e++)tt[n+e]=o,R[n+e]=a[e],o+=a[e];let s=a.slice();for(let e=0;e<8;e++)s[e]=tt[n+e]-r;for(let t=0;t<i;t++){let n=Ue[r+t],i=+(Re[n]>=Ke[e])|(ze[n]>=qe[e]?2:0)|(Be[n]>=Je[e]?4:0);We[r+s[i]]=n,s[i]+=1}for(let e=0;e<i;e++)Ue[r+e]=We[r+e];for(let e=0;e<8;e++)R[n+e]>0&&c.push(n+e)}it.length=0;let l=[s];for(;l.length;){let e=l.pop();it.push(e);let t=z[e];if(t>=0)for(let e=0;e<8;e++)R[t+e]>0&&l.push(t+e)}for(let e=it.length-1;e>=0;e--){let t=it[e],n=z[t],r=0,i=0,a=0,o=0,s=0;if(n<0)for(let e=0;e<R[t];e++){let n=Ue[tt[t]+e],c=Ve[n];r+=c,i+=Re[n]*c,a+=ze[n]*c,o+=Be[n]*c,He[n]>s&&(s=He[n])}else for(let e=0;e<8;e++){if(R[n+e]<=0)continue;let t=n+e;r+=Xe[t],i+=Ze[t]*Xe[t],a+=Qe[t]*Xe[t],o+=$e[t]*Xe[t],et[t]>s&&(s=et[t])}Xe[t]=r,et[t]=s,Ze[t]=r?i/r:Ke[t],Qe[t]=r?a/r:qe[t],$e[t]=r?o/r:Je[t]}for(let e=0;e<V;e++){if(z[e]>=0)continue;let t=tt[e],n=R[e]<8?R[e]:8;for(let r=0;r<n;r++)nt[e*8+r]=Ue[t+r]}return s}function I(e,t,n,r,i,a,o,s,c,l,u){let d=0,f=u,p=[e,t,n],m=[r,i,a],h=[o,s,c];for(let e=0;e<3;e++){let t=m[e],n=h[e]-l,r=h[e]+l;if(Math.abs(t)<1e-12){if(p[e]<n||p[e]>r)return!1;continue}let i=(n-p[e])/t,a=(r-p[e])/t;if(i>a){let e=i;i=a,a=e}if(i>d&&(d=i),a<f&&(f=a),d>f)return!1}return f>=0&&d<u}function xe(e){let t=0;for(let n=0;n<e.length;n++){let r=e[n];if(!r||r.type!==`sphere`)continue;if(t>=8192)return-1;let i=r.origin;Re[t]=i[0],ze[t]=i[1],Be[t]=i[2],Ve[t]=1,He[t]=r.radius,Ge[t]=r,t+=1}return t<32?-1:F(t)}function Se(e){return at===e?ot:at?-1:xe(e)}function Ce(e,t){let n=at,r=ot,i=Ot;at=e,ot=xe(e),Ot=je(e);try{return t()}finally{at=n,ot=n?xe(n):r,Ot=n?je(n):i}}function we(e,t,n,r){if(n<0)return null;let i=null,a=1/0,o=e[0],s=e[1],c=e[2],l=t[0],u=t[1],d=t[2],f=0;for(rt[f++]=n;f>0;){let e=rt[--f],t=Ye[e]+et[e];if(!I(o,s,c,l,u,d,Ke[e],qe[e],Je[e],t,a))continue;let n=z[e];if(n<0){let t=tt[e],n=R[e];for(let e=0;e<n;e++){let n=r(Ge[Ue[t+e]]);n&&n.t>=0&&n.t<a&&(i=n,a=n.t)}}else for(let e=0;e<8;e++)R[n+e]>0&&f<rt.length&&(rt[f++]=n+e)}return i}function Te(e,t){if(t<1||t>8192)return!1;for(let n=0;n<t;n++)Re[n]=e[n*4],ze[n]=e[n*4+1],Be[n]=e[n*4+2],He[n]=e[n*4+3],Ve[n]=1;if(F(t)<0||V>2048||V<1)return!1;for(let e=0;e<V;e++)if(z[e]<0&&R[e]>8)return!1;for(let e=0;e<V;e++){let t=e*16,n=e*8;B[t]=Ke[e],B[t+1]=qe[e],B[t+2]=Je[e],B[t+3]=Ye[e]+et[e],B[t+4]=z[e],B[t+5]=R[e],B[t+6]=z[e]<0?nt[n]:0,B[t+7]=z[e]<0?nt[n+1]:0,B[t+8]=z[e]<0?nt[n+2]:0,B[t+9]=z[e]<0?nt[n+3]:0,B[t+10]=z[e]<0?nt[n+4]:0,B[t+11]=z[e]<0?nt[n+5]:0,B[t+12]=z[e]<0?nt[n+6]:0,B[t+13]=z[e]<0?nt[n+7]:0}return!0}function Ee(e){return!(!e||e.type!==`shape`||e.kind===`plane`||e.kind===`disk`&&(e.r||0)>30)}function De(e){if(e.origin)return e.origin;let t=e.a||[0,0,0],n=e.b||t;return[(t[0]+n[0])*.5,(t[1]+n[1])*.5,(t[2]+n[2])*.5]}function Oe(e){if(W=0,e<1)return-1;let t=1/0,n=1/0,r=1/0,i=-1/0,a=-1/0,o=-1/0;for(let s=0;s<e;s++)st[s]<t&&(t=st[s]),st[s]>i&&(i=st[s]),ct[s]<n&&(n=ct[s]),ct[s]>a&&(a=ct[s]),lt[s]<r&&(r=lt[s]),lt[s]>o&&(o=lt[s]),dt[s]=s;let s=W++;_t[s]=Math.max(i-t,a-n,o-r)/2+.5,mt[s]=(t+i)/2,ht[s]=(n+a)/2,gt[s]=(r+o)/2,yt[s]=0,U[s]=e,bt[s]=-1;let c=[s];for(;c.length;){let e=c.pop();if(U[e]<=16||_t[e]<.2||W+8>2048)continue;let t=_t[e]/2,n=W;bt[e]=n;for(let n=0;n<8;n++){let r=W++;_t[r]=t,bt[r]=-1,U[r]=0,mt[r]=mt[e]+(n&1?t:-t),ht[r]=ht[e]+(n&2?t:-t),gt[r]=gt[e]+(n&4?t:-t)}let r=yt[e],i=U[e],a=[0,0,0,0,0,0,0,0];for(let t=0;t<i;t++){let n=dt[r+t],i=+(st[n]>=mt[e])|(ct[n]>=ht[e]?2:0)|(lt[n]>=gt[e]?4:0);a[i]+=1}let o=r;for(let e=0;e<8;e++)yt[n+e]=o,U[n+e]=a[e],o+=a[e];let s=a.slice();for(let e=0;e<8;e++)s[e]=yt[n+e]-r;for(let t=0;t<i;t++){let n=dt[r+t],i=+(st[n]>=mt[e])|(ct[n]>=ht[e]?2:0)|(lt[n]>=gt[e]?4:0);wt[r+s[i]]=n,s[i]+=1}for(let e=0;e<i;e++)dt[r+e]=wt[r+e];for(let e=0;e<8;e++)U[n+e]>0&&c.push(n+e)}Ct.length=0;let l=[s];for(;l.length;){let e=l.pop();Ct.push(e);let t=bt[e];if(t>=0)for(let e=0;e<8;e++)U[t+e]>0&&l.push(t+e)}for(let e=Ct.length-1;e>=0;e--){let t=Ct[e],n=bt[t],r=0;if(n<0)for(let e=0;e<U[t];e++){let n=dt[yt[t]+e];ut[n]>r&&(r=ut[n])}else for(let e=0;e<8;e++)U[n+e]>0&&vt[n+e]>r&&(r=vt[n+e]);vt[t]=r}for(let e=0;e<W;e++){if(bt[e]>=0)continue;let t=yt[e],n=U[e]<16?U[e]:16;for(let r=0;r<n;r++)xt[e*16+r]=dt[t+r]}return s}function ke(){for(let e=0;e<W;e++)if(bt[e]<0&&U[e]>16)return!1;return W>0&&W<=2048}function Ae(e,t,n){let r=De(t);return st[e]=r[0],ct[e]=r[1],lt[e]=r[2],ut[e]=t.radius||t.r||.05,pt[e]=t,ft[e]=n,e+1}function je(e){Tt.clear();let t=0;for(let n=0;n<e.length;n++){let r=e[n];if(Ee(r)){if(t>=512)return-1;t=Ae(t,r,n),Tt.add(r)}}if(t<24)return-1;let n=Oe(t);return n<0||!ke()?(Tt.clear(),-1):n}function Me(e){return Tt.has(e)}function Ne(e){return at===e?Ot:at?-1:je(e)}function Pe(e,t,n,r){if(n<0)return null;let i=null,a=1/0,o=e[0],s=e[1],c=e[2],l=t[0],u=t[1],d=t[2],f=0;for(St[f++]=n;f>0;){let e=St[--f],t=_t[e]+vt[e];if(!I(o,s,c,l,u,d,mt[e],ht[e],gt[e],t,a))continue;let n=bt[e];if(n<0){let t=U[e]<16?U[e]:16;for(let n=0;n<t;n++){let t=r(pt[xt[e*16+n]]);t&&t.t>=0&&t.t<a&&(i=t,a=t.t)}}else for(let e=0;e<8;e++)U[n+e]>0&&f<St.length&&(St[f++]=n+e)}return i}function Fe(e,t=e.length){let n=0;for(let r=0;r<t;r++){let t=e[r];if(t&&Ee(t)){if(n>=512)return 0;n=Ae(n,t,r)}}if(n<1||Oe(n)<0||!ke())return 0;Dt.fill(0);let r=0;for(let e=0;e<W;e++){let t=e*16;if(Et[t]=mt[e],Et[t+1]=ht[e],Et[t+2]=gt[e],Et[t+3]=_t[e]+vt[e],Et[t+4]=bt[e],bt[e]<0){let n=U[e]<16?U[e]:16;Et[t+5]=n,Et[t+6]=r;for(let t=0;t<n;t++)Dt[(r+t)*4]=ft[xt[e*16+t]];r+=n}else Et[t+5]=U[e],Et[t+6]=0}return W}var Ie,L,Le,Re,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,Je,Ye,Xe,Ze,Qe,$e,et,tt,R,z,nt,rt,it,B,V,at,ot,H,st,ct,lt,ut,dt,ft,pt,mt,ht,gt,_t,vt,yt,U,bt,xt,St,Ct,wt,W,Tt,Et,Dt,Ot,kt=t((()=>{Ie=8192,L=32768,Le=2048,Re=new Float64Array(Ie),ze=new Float64Array(Ie),Be=new Float64Array(Ie),Ve=new Float64Array(Ie),He=new Float64Array(Ie),Ue=new Int32Array(Ie),We=new Int32Array(Ie),Ge=Array(Ie),Ke=new Float64Array(L),qe=new Float64Array(L),Je=new Float64Array(L),Ye=new Float64Array(L),Xe=new Float64Array(L),Ze=new Float64Array(L),Qe=new Float64Array(L),$e=new Float64Array(L),et=new Float64Array(L),tt=new Int32Array(L),R=new Int32Array(L),z=new Int32Array(L),nt=new Int16Array(L*8),rt=new Int32Array(L),it=[],B=new Float32Array(Le*16),V=0,at=null,ot=-1,H=2048,st=/* @__PURE__ */ new Float64Array(512),ct=/* @__PURE__ */ new Float64Array(512),lt=/* @__PURE__ */ new Float64Array(512),ut=/* @__PURE__ */ new Float64Array(512),dt=/* @__PURE__ */ new Int32Array(512),ft=/* @__PURE__ */ new Int32Array(512),pt=Array(512),mt=new Float64Array(H),ht=new Float64Array(H),gt=new Float64Array(H),_t=new Float64Array(H),vt=new Float64Array(H),yt=new Int32Array(H),U=new Int32Array(H),bt=new Int32Array(H),xt=new Int16Array(H*16),St=new Int32Array(H),Ct=[],wt=/* @__PURE__ */ new Int32Array(512),W=0,Tt=/* @__PURE__ */ new Set,Et=new Float32Array(H*16),Dt=/* @__PURE__ */ new Float32Array(2048),Ot=-1}));function At(e,t,n,r){let i=n[0]-e[0],a=n[1]-e[1],o=n[2]-e[2],s=t[0]*t[0]+t[1]*t[1]+t[2]*t[2];if(s===0)return null;let c=t[0]*i+t[1]*a+t[2]*o,l=i*i+a*a+o*o-r*r,u=c*c-s*l;if(u<0)return null;let d=Math.sqrt(u),f=(c-d)/s;return f<0&&(f=(c+d)/s),f<0?null:{t:f,point:[e[0]+t[0]*f,e[1]+t[1]*f,e[2]+t[2]*f]}}function jt(e){let t=ve(e)||1;return[e[0]/t,e[1]/t,e[2]/t]}function Mt(e){let t=jt(e.dir),n=e.up?e.up.slice():[0,0,1],r=_e(n,t),i=[n[0]-t[0]*r,n[1]-t[1]*r,n[2]-t[2]*r];if(ve(i)<1e-6){let e=Math.abs(t[2])>.9?[0,1,0]:[0,0,1],r=_e(e,t);n=jt([e[0]-t[0]*r,e[1]-t[1]*r,e[2]-t[2]*r])}else n=jt(i);let a=[0,0,0];return P(a,t,n),{forward:t,right:a,up:n}}function Nt(e,t,n){let r=Math.tan(n.fov*Math.PI/180/2)*n.planeDistance,i=(e*2-1)*n.aspect*r,a=(1-t*2)*r,{forward:o,right:s,up:c}=Mt(n),l=n.planeDistance;return[s[0]*i+c[0]*a+o[0]*l,s[1]*i+c[1]*a+o[1]*l,s[2]*i+c[2]*a+o[2]*l]}function Pt(e,t,n){if(n.type===`sphere`){let r=At(e,t,n.origin,n.radius);return r?{...r,object:n,color:n.color}:null}return n.type===`box`?Ft(e,t,n):n.type===`crust`?It(e,t,n.field):n.type===`shape`?Yt(e,t,n):null}function Ft(e,t,n){let r=0,i=1/0,a=n.min,o=n.max;for(let n=0;n<3;n++){let s=e[n],c=t[n];if(Math.abs(c)<1e-12){if(s<a[n]||s>=o[n])return null;continue}let l=(a[n]-s)/c,u=(o[n]-s)/c;if(l>u){let e=l;l=u,u=e}if(r=Math.max(r,l),i=Math.min(i,u),r>i)return null}if(i<0)return null;let s=r>=0?r:i;return s<0?null:{t:s,point:[e[0]+t[0]*s,e[1]+t[1]*s,e[2]+t[2]*s],object:n,color:n.color}}function It(e,t,n,r=400){let i=0;for(let a=0;a<64;a++){let a=[e[0]+t[0]*i,e[1]+t[1]*i,e[2]+t[2]*i],o=n.sampleMeters(a);if(o<=0)return{t:i,point:a,object:{type:`crust`},color:a[2]<-.3?[.16,.13,.1,1]:n.color||[.55,.48,.32,1]};if(i+=Math.max(o,.05),i>r)return null}return null}function Lt(e,t){return[e[0]-t[0],e[1]-t[1],e[2]-t[2]]}function Rt(e,t){return[e[0]+t[0],e[1]+t[1],e[2]+t[2]]}function zt(e,t){return[e[0]*t,e[1]*t,e[2]*t]}function G(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function Bt(e){let t=Math.hypot(e[0],e[1],e[2])||1;return[e[0]/t,e[1]/t,e[2]/t]}function Vt(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function Ht(e,t,n,r){return{t,point:n,normal:Bt(r),object:e,color:e.color}}function Ut(e,t,n,r){let i=G(t,r);if(Math.abs(i)<1e-8)return null;let a=G(Lt(n,e),r)/i;return a<0?null:{t:a,point:Rt(e,zt(t,a)),normal:i>0?zt(r,-1):r.slice()}}function Wt(e,t,n,r,i){let a=Ut(e,t,n,r);if(!a)return null;let o=Lt(a.point,n);return G(o,o)>i*i?null:a}function Gt(e,t,n,r){let i=-1e30,a=1e30,o=0,s=1;for(let c=0;c<3;c++){if(Math.abs(t[c])<1e-8){if(e[c]<n[c]-r[c]||e[c]>n[c]+r[c])return null;continue}let l=1/t[c],u=(n[c]-r[c]-e[c])*l,d=(n[c]+r[c]-e[c])*l,f=-1;if(u>d){let e=u;u=d,d=e,f=1}if(u>i&&(i=u,o=c,s=f),d<a&&(a=d),a<i)return null}let c=i>0?i:a;if(c<0)return null;let l=[0,0,0];return l[o]=s,G(l,t)>0&&(l[o]=-l[o]),{t:c,point:Rt(e,zt(t,c)),normal:l}}function Kt(e,t,n,r){let i=Lt(e,n),a=G(t,i),o=G(i,i)-r*r,s=a*a-G(t,t)*o;if(s<0)return null;let c=Math.sqrt(s),l=G(t,t)||1,u=(-a-c)/l;if(u<0&&(u=(-a+c)/l),u<0)return null;let d=Rt(e,zt(t,u));return{t:u,point:d,normal:Lt(d,n)}}function qt(e,t,n,r,i,a){let o=Lt(r,n),s=Lt(e,n),c=G(o,o),l=G(o,t),u=G(o,s),d=c-l*l,f=c*G(s,t)-u*l,p=c*G(s,s)-u*u-i*i*c,m=null,h=e=>{!e||e.t<0||(!m||e.t<m.t)&&(m=e)},g=f*f-d*p;if(g>=0&&Math.abs(d)>1e-8){let n=Math.sqrt(g),r=[(-f-n)/d,(-f+n)/d];for(let n=0;n<r.length;n++){let i=r[n],a=u+i*l;i<0||a<=0||a>=c||h({t:i,point:Rt(e,zt(t,i)),normal:Lt(Rt(s,zt(t,i)),zt(o,a/c))})}}if(!a)h(Kt(e,t,n,i)),h(Kt(e,t,r,i));else if(c>1e-8){let a=Bt(o);h(Wt(e,t,n,zt(a,-1),i)),h(Wt(e,t,r,a,i))}return m}function Jt(e,t,n,r,i){let a=Lt(r,n),o=Lt(i,n),s=Vt(t,o),c=G(a,s);if(Math.abs(c)<1e-8)return null;let l=1/c,u=Lt(e,n),d=G(u,s)*l;if(d<0||d>1)return null;let f=Vt(u,a),p=G(t,f)*l;if(p<0||d+p>1)return null;let m=G(o,f)*l;if(m<0)return null;let h=Bt(Vt(a,o));return G(h,t)>0&&(h=zt(h,-1)),{t:m,point:Rt(e,zt(t,m)),normal:h}}function Yt(e,t,n){let r=n.kind,i=null;return r===`plane`?i=Ut(e,t,n.a,n.b):r===`disk`?i=Wt(e,t,n.a,n.b,n.r):r===`box`?i=Gt(e,t,n.a,n.b):r===`capsule`?i=qt(e,t,n.a,n.b,n.r,!1):r===`cylinder`?i=qt(e,t,n.a,n.b,n.r,!0):r===`triangle`&&(i=Jt(e,t,n.a,n.b,n.c)),i?Ht(n,i.t,i.point,i.normal):null}function Xt(e,t,n,r=[0,0,0,1]){let i=null,a=Se(n);a>=0&&(i=we(e,t,a,n=>{let r=At(e,t,n.origin,n.radius);return r?{...r,object:n,color:n.color}:null}));let o=Ne(n);if(o>=0){let n=Pe(e,t,o,n=>Yt(e,t,n));n&&(!i||n.t<i.t)&&(i=n)}for(let r=0;r<n.length;r++){let s=n[r];if(a>=0&&s.type===`sphere`||o>=0&&Me(s))continue;let c=Pt(e,t,s);c&&(!i||c.t<i.t)&&(i=c)}return i||{t:1/0,color:r,object:null,point:null}}function Zt(e){if(e.normal)return e.normal;let t=e.object;if(!t||!e.point)return[0,0,1];if(t.type===`sphere`)return jt([e.point[0]-t.origin[0],e.point[1]-t.origin[1],e.point[2]-t.origin[2]]);if(t.type===`box`){let n=[(t.min[0]+t.max[0])*.5,(t.min[1]+t.max[1])*.5,(t.min[2]+t.max[2])*.5],r=[Math.max(t.max[0]-t.min[0],.001)*.5,Math.max(t.max[1]-t.min[1],.001)*.5,Math.max(t.max[2]-t.min[2],.001)*.5],i=[(e.point[0]-n[0])/r[0],(e.point[1]-n[1])/r[1],(e.point[2]-n[2])/r[2]],a=Math.abs(i[0]),o=Math.abs(i[1]),s=Math.abs(i[2]);return a>o&&a>s?[Math.sign(i[0])||1,0,0]:o>s?[0,Math.sign(i[1])||1,0]:[0,0,Math.sign(i[2])||1]}return[0,0,1]}function Qt(e,t){let n=_e(e,t);return jt([e[0]-2*n*t[0],e[1]-2*n*t[1],e[2]-2*n*t[2]])}function $t(e,t,n,r=[0,0,0,1],i=4){let a=Xt(e,t,n,r),o=a.color||r,s=i>0?Math.min(1,Math.max(0,a.object?.reflectivity||0)):0;if(!a.object||s<=0)return o;let c=Zt(a),l=$t([a.point[0]+c[0]*en,a.point[1]+c[1]*en,a.point[2]+c[2]*en],Qt(t,c),n,r,i-1),u=1-s;return[o[0]*u+l[0]*s,o[1]*u+l[1]*s,o[2]*u+l[2]*s,o[3]??1]}var en,tn=t((()=>{ye(),kt(),en=.05})),nn,rn=t((()=>{nn=.25}));function K(e,t,n){let r=new Uint8Array(e*t*4);for(let i=0;i<t;i++)for(let a=0;a<e;a++){let o=n(a,i,e,t),s=(i*e+a)*4;r[s]=o[0],r[s+1]=o[1],r[s+2]=o[2],r[s+3]=o.length>3?o[3]:255}return{width:e,height:t,data:r,revision:0}}function an(e,t){let n=Math.sin(e*127.1+t*311.7)*43758.5453123;return n-Math.floor(n)}function on(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=an(n,r),s=an(n+1,r),c=an(n,r+1),l=an(n+1,r+1),u=i*i*(3-2*i),d=a*a*(3-2*a);return o+(s-o)*u+(c-o)*d+(o-s-c+l)*u*d}function sn(e,t){let n=Math.max(1,t);return(e%n+n)%n}function q(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=e=>sn(e,n),c=an(s(r),s(i)),l=an(s(r+1),s(i)),u=an(s(r),s(i+1)),d=an(s(r+1),s(i+1)),f=a*a*(3-2*a),p=o*o*(3-2*o);return c+(l-c)*f+(u-c)*p+(c-l-u+d)*f*p}function J(e){let t=e%8,n=e/8|0;return[t/8,n/8,1/8,1]}function Y(e,t,n){let r=t%8,i=t/8|0,a=r*128,o=i*128;for(let t=0;t<128;t++){let r=Math.min(n.height-1,t*n.height/128|0),i=(o+t)*Cn,s=r*n.width;for(let t=0;t<128;t++){let r=(s+Math.min(n.width-1,t*n.width/128|0))*4,o=(i+a+t)*4;e[o]=n.data[r],e[o+1]=n.data[r+1],e[o+2]=n.data[r+2],e[o+3]=n.data[r+3]}}}function cn(){return Tn||=K(128,128,(e,t)=>{let n=q(e/8,t/8,16),r=q(e/2,t/2,64),i=n*.7+r*.3;return[118+i*80,96+i*62,58+i*32,255]}),Tn}function ln(){return Dn||=K(128,128,(e,t)=>{let n=q(e/8,t/8,16),r=q(e/2,t/6,64),i=n*.55+r*.45;return[46+i*40,92+i*70,34+i*24,255]}),Dn}function un(){return On||=K(128,128,(e,t)=>{let n=q(e/8,t/8,16),r=Math.abs(q(e/4,t/8,32)-.5),i=n*.75+(1-r)*.25;return[92+i*50,88+i*44,80+i*36,255]}),On}function dn(){return En||=K(128,128,(e,t)=>{let n=.5+.5*Math.sin(e*.45+on(e/12,t/20)*3);return[78+n*70,48+n*36,24+n*16,255]}),En}function fn(e,t,n){return[Math.max(0,Math.min(255,Math.round(t[0]+e*n[0]))),Math.max(0,Math.min(255,Math.round(t[1]+e*n[1]))),Math.max(0,Math.min(255,Math.round(t[2]+e*n[2]))),255]}function pn(){return kn||=K(128,128,(e,t)=>{let n=.5+.5*Math.sin(e*.9),r=.5+.5*Math.sin(t*.9),i=n*.55+r*.45,a=q(e/4,t/4,32);return fn(i*.7+a*.3,[118,112,102],[90,84,74])}),kn}function mn(){return An||=K(128,128,(e,t)=>{let n=q(e/2,t/2,64),r=q(e/14,t/14,16);return fn(n*.35+r*.65,[150,112,88],[50,40,32])}),An}function hn(){return jn||=K(128,128,(e,t)=>{let n=.5+.5*Math.sin(e*.55+q(e/10,t/6,16)*2),r=q(e/3,t/18,32);return fn(n*.65+r*.35,[72,48,28],[70,42,22])}),jn}function gn(){return Mn||=K(128,128,(e,t)=>{let n=q(e/6,t/3,32),r=Math.abs(Math.sin(t*.18+q(e/12,t/12,16)*3));return fn(n*.6+r*.4,[92,64,40],[70,48,28])}),Mn}function _n(){return Nn||=K(128,128,(e,t)=>{let n=.5+.5*Math.sin(t*.7),r=q(e/5,t/5,32);return fn(n*.75+r*.25,[120,96,58],[80,60,30])}),Nn}function vn(){return Pn||=K(128,128,(e,t)=>{let n=.55+.45*Math.abs(Math.sin(e*.8+t*.15)),r=q(e/8,t/4,32);return fn(n*.7+r*.3,[168,168,162],[70,70,66])}),Pn}function yn(){return Fn||=K(128,128,(e,t)=>{let n=.5+.5*Math.sin(t*1.4+q(e/16,t/8,16)),r=Math.abs(sn(e,32)-16)<1.2?.15:0;return fn(n*.85+r,[108,112,116],[80,82,86])}),Fn}function bn(){return In||=K(128,128,(e,t)=>{let n=Math.abs(Math.sin(e*.35))<.18?.25:0;return fn(q(e/5,t/9,32)*.8+n,[48,92,36],[50,80,30])}),In}function xn(){return Ln||=K(128,128,(e,t)=>{let n=sn(e+Math.floor(t/8)%2*6,12),r=sn(t,8),i=n<1.3||r<1.2?.22:.9,a=q(e/3,t/3,32);return fn(i*.72+a*.28,[108,104,92],[62,52,40])}),Ln}function Sn(){return Rn||=K(128,128,(e,t)=>{let n=.4+.6*Math.abs(Math.sin(e*1.15+q(e/18,t/7,16)*1.4)),r=q(e/2,t/11,32);return fn(n*.78+r*.22,[96,90,82],[64,54,46])}),Rn}var Cn,wn,Tn,En,Dn,On,kn,An,jn,Mn,Nn,Pn,Fn,In,Ln,Rn,zn=t((()=>{Cn=1024,Cn/128,wn={sand:32,wood:33,grass:34,rock:35,cloth:36,skin:37,bark:38,hide:39,horn:40,feather:41,metal:42,leaf:43,scale:44,hair:45}})),Bn=/* @__PURE__ */ n({CELL_FLOOR_WIDTH:()=>160,EDGE_FADE:()=>`0.5`,EDGE_LAST_BOUNCE:()=>1,FOVEA_GLSL:()=>yr,HISTORY_KEEP:()=>br,SPHERE_BUDGET:()=>384,WEAR_GRID:()=>128,WET_DARKEN:()=>_r,WET_SHEEN:()=>vr,cellCap:()=>Yn,createGpuPainter:()=>Zn,edgeBounces:()=>Kn,exposureFor:()=>Gn,fitCanvas:()=>Xn,historyKeep:()=>Jn,screenFoveaAngle:()=>qn});function Vn(e){sr.fill(0);for(let t=0;t<e;t++){let e=cr[t],n=(e,n,r,i,a)=>{let o=(e*$n+t)*4;sr[o]=n,sr[o+1]=r,sr[o+2]=i,sr[o+3]=a},r=e.color||[1,1,1,1],i=e.a||[0,0,0],a=e.b||[0,0,0],o=e.c||[0,0,0],s=wn[e.tile]||(typeof e.tile==`number`?e.tile:0);n(0,r[0],r[1],r[2],e.reflectivity||0),n(1,i[0],i[1],i[2],lr[e.kind]||0),n(2,a[0],a[1],a[2],e.r||0),n(3,o[0]||0,o[1]||0,o[2]||0,s)}}function Hn(e,t){try{e&&e.dataset&&(e.dataset.gpuError=t)}catch{}return null}function Un(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);return e.deleteShader(r),Un.lastLog=t,null}return r}function Wn(e,t){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,t,1,0,e.RGBA,e.FLOAT,null),n}function Gn(e){let t=Array.isArray(e)?e[2]/(Math.hypot(e[0],e[1],e[2])||1):1;return 2.4+-1.4*Math.min(1,Math.max(0,(t+.1)/.5))}function Kn(e,t=!1){return!t&&e>.5?1:4}function qn(e,t,n,r){let i=(e[0]-t[0])*2*n*r,a=(e[1]-t[1])*2*r;return Math.atan(Math.hypot(i,a))}function Jn(e,t){return e&&t?br:0}function Yn(e,t=0){return Math.min(2**Math.max(0,t),Math.max(1.5,e/160))}function Xn(e,t=1,n=null){let r=e.clientWidth||window.innerWidth||960,i=e.clientHeight||window.innerHeight||540,a=n?.width||Math.min(960,Math.max(1,Math.floor(r))),o=n?.height||Math.min(540,Math.max(1,Math.floor(i))),s=Math.max(160,Math.min(a,Math.floor(a*t))),c=Math.max(90,Math.min(o,Math.floor(o*t)));e.width!==s&&(e.width=s),e.height!==c&&(e.height=c)}function Zn(e,t){let n=Math.max(8,Math.min(Qn,t?.spheres||Qn)),r=Math.max(1,Math.min(tr,t?.boxes||tr)),i=Math.max(8,Math.min(er,t?.shapes||er)),a;try{a=e.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1,powerPreference:t?`low-power`:`high-performance`})}catch{return null}if(!a)return Hn(e,`no context`);let o=a.getShaderPrecisionFormat?.(a.FRAGMENT_SHADER,a.HIGH_FLOAT);if(o&&o.precision<16)return Hn(e,`fragment highp unsupported (${o.precision} bits)`);if(a.getParameter(a.MAX_TEXTURE_SIZE)<1024)return Hn(e,`max texture ${a.getParameter(a.MAX_TEXTURE_SIZE)} < 1024`);try{let t=a.getExtension(`WEBGL_debug_renderer_info`);e.dataset.gpuInfo=String(t?a.getParameter(t.UNMASKED_RENDERER_WEBGL):a.getParameter(a.RENDERER)).slice(0,80)}catch{}a.getExtension(`EXT_color_buffer_float`);let s=`#version 300 es
precision highp float;
uniform vec3 uOrigin;
uniform vec3 uForward;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uSun;
uniform vec4 uMiss;
uniform float uFov;
uniform float uAspect;
uniform float uPlane;
uniform vec2 uRes;
uniform int uSpheres;
uniform int uBoxes;
uniform int uDigs;
uniform int uPrints;
uniform vec4 uWork;
uniform float uTime;
uniform float uRain;
uniform float uFog;
uniform vec4 uFog0;
uniform vec4 uFog1;
uniform vec4 uFog2;
uniform float uFrame;
uniform float uFull;
${yr}
uniform float uExposure;
uniform float uFoot;
in vec2 vRay;
uniform sampler2D uSphereTex;
uniform sampler2D uSphereColor;
uniform sampler2D uBoxMin;
uniform sampler2D uBoxMax;
uniform sampler2D uBoxColor;
uniform sampler2D uDigTex;
uniform sampler2D uPrintTex;
uniform sampler2D uWearTex;
uniform vec3 uWear; // origin x, origin y (m), cell size (m)
uniform sampler2D uTexRects;
uniform sampler2D uAtlas;
uniform sampler2D uShapes;
uniform sampler2D uShapeNodes;
uniform sampler2D uShapeIndex;
uniform int uShapeCount;
uniform int uShapeNodeCount;
uniform int uLooseShapes;
uniform sampler2D uTrackTex;
uniform int uTrackCount;
uniform float uTrackHalf;
/*@tree*/
uniform sampler2D uNodes;
/*@tree*/
out vec4 fragColor;

float gFoot = 0.0;
// gFoot is meters covered by one pixel at the hit, so the atlas lod follows distance and grazing angle.
vec3 tiled(int tile, vec2 uv, float perMeter, vec3 fallback) {
  vec4 rect = texelFetch(uTexRects, ivec2(tile, 0), 0);
  if (rect.w < 0.5) return fallback;
  float texels = rect.z * ${Cn}.0;
  float lod = clamp(log2(max(gFoot * perMeter * texels, 1.0e-4)), 0.0, 3.0);
  float pad = (0.5 * exp2(lod) + 0.5) / ${Cn}.0;
  vec2 st = rect.xy + vec2(pad) + fract(uv) * (rect.z - pad * 2.0);
  vec3 near = textureLod(uAtlas, st, lod).rgb;
  vec3 mean = textureLod(uAtlas, rect.xy + rect.z * 0.5, 3.0).rgb;
  return mix(near, mean, smoothstep(2.0, 3.0, lod) * 0.5);
}

vec3 sphereAlbedo(vec3 n, float radius, int i, vec3 fallback, float packed) {
  int material = int(packed);
  int tile = material > 0 ? material : i;
  vec2 uv;
  if (material <= 0) {
    // FaceRace: a portrait on a head sphere should read from the chase camera,
    // which looks along uForward, so the texture center sits on the near side.
    vec3 f = normalize(uForward);
    vec3 rgt = normalize(uRight);
    vec3 upv = normalize(uUp);
    uv.x = atan(dot(n, rgt), dot(n, -f)) * 0.15915494309189535 + 0.5;
    uv.y = asin(clamp(dot(n, upv), -1.0, 1.0)) * -0.3183098861837907 + 0.5;
  } else {
    uv = vec2(atan(n.z, n.x) * 0.15915494309189535 + 0.5, asin(clamp(n.y, -1.0, 1.0)) * 0.3183098861837907 + 0.5);
    uv *= max(radius, 0.04) * 8.0;
  }
  vec3 swatch = tiled(tile, uv, 0.35, fallback);
  if (material <= 0) return swatch;
  return clamp(swatch * (fallback + vec3(0.35)), 0.0, 1.0);
}

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float cloudShadeAt(vec3 ro, vec3 rd) {
  if (rd.z <= 0.02) return 0.0;
  float t0 = clamp((34.0 - ro.z) / rd.z, 0.0, 2400.0);
  float t1 = clamp((62.0 - ro.z) / rd.z, 0.0, 2400.0);
  float span = max(t1 - t0, 0.0);
  float sum = 0.0;
  for (int i = 0; i < 5; i++) {
    float t = t0 + span * ((float(i) + 0.5) / 5.0);
    vec3 q = ro + rd * t;
    float n = valueNoise(q.xy * 0.018 + vec2(uTime * 0.004, 0.2));
    float puff = smoothstep(0.5, 0.78, n);
    float band = smoothstep(34.0, 42.0, q.z) * smoothstep(62.0, 50.0, q.z);
    sum += puff * band * step(1.0, span);
  }
  return clamp(sum * 0.22, 0.0, 0.8);
}

float cloudShade(vec3 rd) {
  return cloudShadeAt(uOrigin, rd);
}

float coneHeight(vec2 p, vec2 c, float radius, float height) {
  float d = length(p - c);
  float wobble = 0.92 + 0.08 * sin(p.x * 0.05 + c.y) * cos(p.y * 0.04);
  float u = d / (radius * wobble);
  if (u >= 1.0) return 0.0;
  float s = 1.0 - u;
  return height * s * s * (3.0 - 2.0 * s);
}

float duneHeight(vec2 p) {
  float roll = 0.5 * sin(p.x * 0.15) + 0.5 * cos(p.y * 0.13);
  float wash = 0.5 * sin((p.x + p.y) * 0.17 + 1.3) + 0.5;
  float n = clamp(0.55 * roll + 0.45 * wash, 0.0, 1.0);
  float broad = 0.5 + 0.5 * sin(p.x * 0.021 + 0.6) * cos(p.y * 0.018);
  float h = n * n * 5.4 * (0.78 + 0.22 * broad);
  float marsh = exp(-((p.x - 36.0) * (p.x - 36.0) + (p.y + 96.0) * (p.y + 96.0)) / 2200.0);
  h *= 1.0 - marsh * 0.55;
  float ridge = exp(-((p.x + 24.0) * (p.x + 24.0)) / 520.0) * max(cos(p.y * 0.02), 0.0);
  h = clamp(h + ridge * 1.6, 0.0, 5.4);
  h += coneHeight(p, vec2(-40.0, 160.0), 104.0, 36.0);
  h += coneHeight(p, vec2(-155.0, -55.0), 72.0, 30.0);
  float crater = length(p - vec2(-155.0, -55.0));
  if (crater < 14.0) h -= (1.0 - crater / 14.0) * 12.0;
  float lakeR = length(p - vec2(70.0, 96.0));
  float rl = 14.0 * (0.94 + 0.06 * sin(p.x * 0.21));
  if (lakeR < rl) {
    float q = lakeR / max(rl, 0.01);
    h = 2.2 - 0.12 - 1.6 * (1.0 - q * q);
  }
  return max(h, -2.0);
}

vec3 duneNormal(vec2 p) {
  float e = 0.75;
  float h = duneHeight(p);
  float hx = duneHeight(p + vec2(e, 0.0));
  float hy = duneHeight(p + vec2(0.0, e));
  return normalize(vec3(h - hx, h - hy, e));
}

// Trampled paths: wear from src/sim/wear.js, bilinear over the cells around the camera.
// 0 grass, 1 worn dirt, 2 packed path; continuous between, with noise so edges are ragged.
vec3 withWear(vec3 rgb, vec2 p) {
  if (uWear.z <= 0.0) return rgb;
  vec2 uv = (p - uWear.xy) / (uWear.z * 128.0);
  if (any(lessThan(uv, vec2(0.0))) || any(greaterThan(uv, vec2(1.0)))) return rgb;
  float stage = texture(uWearTex, uv).r * 2.0;
  stage += (valueNoise(p * 3.1) - 0.5) * 0.35 * smoothstep(0.0, 0.3, stage);
  vec3 dirt = vec3(0.36, 0.29, 0.2) * (0.85 + valueNoise(p * 1.7 + 2.0) * 0.3);
  vec3 packed = vec3(0.47, 0.41, 0.32) * (0.92 + valueNoise(p * 0.9 + 7.0) * 0.12);
  vec3 out1 = mix(rgb, dirt, smoothstep(0.15, 1.0, stage));
  return mix(out1, packed, smoothstep(1.0, 2.0, stage));
}

int wrapTrack(int i, int n) {
  int m = i - (i / n) * n;
  if (i < 0) m += n;
  return m;
}

// The road is paint on the dune, not a mesh. A triangle ribbon sparkled and left holes.
vec3 ribbonAlbedo(vec2 p, vec3 base) {
  int n = uTrackCount;
  if (n < 4) return base;
  int stride = max(n / 16, 1);
  int bestI = 0;
  float bestD = 1.0e12;
  for (int k = 0; k < 20; k++) {
    int i = k * stride;
    if (i >= n) break;
    vec2 s = texelFetch(uTrackTex, ivec2(i, 0), 0).xy;
    float d2 = dot(p - s, p - s);
    if (d2 < bestD) {
      bestD = d2;
      bestI = i;
    }
  }
  int from = bestI - stride;
  int span = stride * 2 + 2;
  float best = 1.0e12;
  float lat = 0.0;
  int seg = 0;
  float alongT = 0.0;
  for (int k = 0; k < 48; k++) {
    if (k >= span) break;
    int i = wrapTrack(from + k, n);
    int j = wrapTrack(i + 1, n);
    vec4 a = texelFetch(uTrackTex, ivec2(i, 0), 0);
    vec4 b = texelFetch(uTrackTex, ivec2(j, 0), 0);
    vec2 ab = b.xy - a.xy;
    float ab2 = dot(ab, ab);
    float t = ab2 > 1.0e-5 ? clamp(dot(p - a.xy, ab) / ab2, 0.0, 1.0) : 0.0;
    vec2 q = a.xy + ab * t;
    float d2 = dot(p - q, p - q);
    if (d2 < best) {
      best = d2;
      float spanL = max(length(ab), 1.0e-4);
      lat = dot(p - q, vec2(-ab.y, ab.x)) / spanL;
      seg = i;
      alongT = t;
    }
  }
  float halfW = max(uTrackHalf, 0.5);
  float ad = abs(lat);
  if (ad > halfW + 0.9) return base;
  if (ad > halfW) {
    bool yellow = (seg - (seg / 2) * 2) == 0;
    return yellow ? vec3(0.86, 0.55, 0.12) : vec3(0.9, 0.88, 0.8);
  }
  vec3 asphalt = vec3(0.17, 0.17, 0.18) * (0.9 + valueNoise(p * 1.1) * 0.14) * (1.0 - uRain * 0.28);
  if (seg == 0 && alongT < 0.22) return vec3(0.86, 0.84, 0.76);
  if (ad < 0.16 && mod(float(seg) + alongT, 5.0) < 2.0) asphalt = vec3(0.78, 0.76, 0.68);
  return asphalt;
}

vec3 groundAlbedo(vec2 p, vec3 n) {
  float crest = clamp(duneHeight(p) / 5.4, 0.0, 1.0);
  float slope = 1.0 - clamp(n.z, 0.0, 1.0);
  float rockW = clamp(smoothstep(0.2, 0.5, slope) + smoothstep(0.62, 0.92, crest) * 0.8, 0.0, 1.0);
  float grassW = (1.0 - rockW) * smoothstep(0.1, 0.34, crest) * (1.0 - smoothstep(0.58, 0.86, crest));
  grassW *= 1.0 - smoothstep(0.16, 0.46, slope);
  vec3 sandC = tiled(32, p * 0.16, 0.16, vec3(0.55, 0.48, 0.32));
  vec3 grassC = tiled(34, p * 0.14, 0.14, vec3(0.22, 0.4, 0.16));
  vec3 rockC = tiled(35, p * 0.12, 0.12, vec3(0.4, 0.38, 0.34));
  float marsh = exp(-((p.x - 36.0) * (p.x - 36.0) + (p.y + 96.0) * (p.y + 96.0)) / 2200.0);
  float grove = exp(-((p.x + 16.0) * (p.x + 16.0) + (p.y + 128.0) * (p.y + 128.0)) / 2600.0);
  grassC = mix(grassC, vec3(0.16, 0.32, 0.14), smoothstep(0.35, 0.7, grove));
  sandC = mix(sandC, vec3(0.32, 0.34, 0.22), smoothstep(0.4, 0.75, marsh));
  grassC = mix(grassC, vec3(0.18, 0.3, 0.16), smoothstep(0.4, 0.75, marsh));
  sandC *= 0.88 + valueNoise(p * 0.23) * 0.22;
  grassC *= 0.86 + valueNoise(p * 0.31 + 4.0) * 0.26;
  rockC *= 0.84 + valueNoise(p * 0.19 + 9.0) * 0.28;
  vec3 rgb = mix(mix(sandC, grassC, grassW), rockC, rockW);
  float volc = coneHeight(p, vec2(-155.0, -55.0), 72.0, 1.0);
  rgb = mix(rgb, vec3(0.32, 0.16, 0.11), clamp(volc * 1.5, 0.0, 0.9));
  float lakeR = length(p - vec2(70.0, 96.0));
  float rl = 14.0 * (0.94 + 0.06 * sin(p.x * 0.21));
  if (lakeR < rl) {
    rgb = mix(vec3(0.45, 0.72, 0.7), vec3(0.06, 0.24, 0.4), clamp((rl - lakeR) / 7.0, 0.0, 1.0));
    rgb += vec3(0.15) * smoothstep(0.72, 0.9, valueNoise(p * 0.8 + vec2(uTime * 0.15, -uTime * 0.08)));
  }
  return withWear(ribbonAlbedo(p, rgb), p);
}

vec3 withPrints(vec3 rgb, vec2 p, int bounce) {
  if (bounce > 0 || uPrints <= 0) return rgb;
  float mark = 0.0;
  for (int i = 0; i < ${ir}; i++) {
    if (i >= uPrints) break;
    vec4 s = texelFetch(uPrintTex, ivec2(i, 0), 0);
    vec2 d = p - s.xy;
    float c = cos(s.z);
    float sn = sin(s.z);
    float hoof = s.w > 0.05 ? s.w : 1.0;
    vec2 local = vec2(d.x * c + d.y * sn, -d.x * sn + d.y * c);
    float left = length((local - vec2(-0.08, 0.02) * hoof) * vec2(9.0, 14.0) / hoof);
    float right = length((local - vec2(0.08, -0.02) * hoof) * vec2(9.0, 14.0) / hoof);
    mark = max(mark, smoothstep(1.05, 0.2, min(left, right)));
  }
  return rgb * (1.0 - 0.62 * mark);
}

float islandExit(vec3 ro, vec3 rd) {
  vec2 o = ro.xy;
  vec2 d = rd.xy;
  float a = dot(d, d);
  if (a < 1.0e-8) return 8000.0;
  float b = dot(o, d);
  float c = dot(o, o) - 65536.0;
  float disc = b * b - a * c;
  if (disc < 0.0) return 0.0;
  return (-b + sqrt(disc)) / a;
}

bool sandPlane(vec3 ro, vec3 rd, float limit, out float t, out vec3 p) {
  if (dot(ro.xy, ro.xy) <= 65536.0 && ro.z < duneHeight(ro.xy) + 0.02) {
    t = 0.02;
    p = ro + rd * t;
    p.z = duneHeight(p.xy);
    return true;
  }
  float tFar = islandExit(ro, rd);
  float tNear = 0.02;
  if (rd.z < -1.0e-4) {
    if (ro.z > 5.6) tNear = max(tNear, (5.6 - ro.z) / rd.z);
    float tGround = max(-ro.z / rd.z, tNear + 8.0);
    tFar = min(tFar, tGround);
  }
  tFar = clamp(tFar, tNear, 8000.0);
  if (limit > 0.0) tFar = min(tFar, limit);
  float prevT = tNear;
  vec3 prevQ = ro + rd * prevT;
  float prevDist = prevQ.z - duneHeight(prevQ.xy);
  bool hit = false;
  float lo = prevT;
  float hi = prevT;
  float budget = limit > 0.0 ? clamp(limit * 1.6, 28.0, 56.0) : 80.0;
  float advance = max((tFar - prevT) / budget, 0.12);
  t = prevT;
  for (int i = 0; i < 80; i++) {
    if (float(i) >= budget || t >= tFar) break;
    t += advance;
    vec3 q = ro + rd * t;
    float dist = q.z - duneHeight(q.xy);
    bool cross = !hit && prevDist > 0.0 && dist <= 0.02;
    if (cross) {
      hit = true;
      lo = prevT;
      hi = t;
      break;
    }
    prevDist = dist;
    prevT = t;
  }
  if (!hit) {
    p = ro;
    return false;
  }
  for (int k = 0; k < 10; k++) {
    float mid = 0.5 * (lo + hi);
    vec3 m = ro + rd * mid;
    if (m.z - duneHeight(m.xy) > 0.0) lo = mid;
    else hi = mid;
  }
  t = hi;
  p = ro + rd * hi;
  p.z = duneHeight(p.xy);
  return dot(p.xy, p.xy) <= 65536.0;
}

// Bounce rays march the same dunes as primary rays, coarsely: 16 steps then 5 halvings.
bool sandCoarse(vec3 ro, vec3 rd, out float t, out vec3 p) {
  t = 0.0;
  p = ro;
  if (rd.z > 0.05 && ro.z > 5.6) return false;
  float tFar = islandExit(ro, rd);
  if (rd.z < -1.0e-4) tFar = min(tFar, max(-ro.z / rd.z, 0.0) + 4.0);
  tFar = clamp(tFar, 0.0, 160.0);
  if (rd.z >= 0.0 && ro.z > 5.6) return false;
  float lo = 0.02;
  float prev = ro.z - duneHeight(ro.xy);
  if (prev <= 0.0) return false;
  float stride = max(tFar / 16.0, 0.25);
  float hi = -1.0;
  for (int i = 1; i <= 16; i++) {
    float s = float(i) * stride;
    if (s > tFar) break;
    vec3 q = ro + rd * s;
    if (q.z - duneHeight(q.xy) <= 0.0) { hi = s; break; }
    lo = s;
  }
  if (hi < 0.0) return false;
  for (int k = 0; k < 5; k++) {
    float mid = 0.5 * (lo + hi);
    vec3 m = ro + rd * mid;
    if (m.z - duneHeight(m.xy) > 0.0) lo = mid; else hi = mid;
  }
  t = hi;
  p = ro + rd * hi;
  p.z = duneHeight(p.xy);
  return dot(p.xy, p.xy) <= 65536.0;
}

// Colors are authored as display values. Decode, expose, ACES (Narkowicz fit), encode sRGB.
vec3 srgbToLinear(vec3 c) {
  c = max(c, vec3(0.0));
  return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(vec3(0.04045), c));
}
vec3 linearToSrgb(vec3 c) {
  c = clamp(c, 0.0, 1.0);
  return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
vec3 aces(vec3 x) {
  return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
}
vec3 present(vec3 c) {
  return linearToSrgb(aces(srgbToLinear(c) * uExposure));
}

bool boxHit(vec3 ro, vec3 rd, vec3 bmin, vec3 bmax, out float t) {
  float tMin = 0.0;
  float tMax = 1.0e30;
  for (int axis = 0; axis < 3; axis++) {
    float d = rd[axis];
    float o = ro[axis];
    if (abs(d) < 1.0e-8) {
      if (o < bmin[axis] || o >= bmax[axis]) return false;
      continue;
    }
    float t1 = (bmin[axis] - o) / d;
    float t2 = (bmax[axis] - o) / d;
    if (t1 > t2) { float s = t1; t1 = t2; t2 = s; }
    tMin = max(tMin, t1);
    tMax = min(tMax, t2);
    if (tMin > tMax) return false;
  }
  if (tMax < 0.0) return false;
  t = tMin >= 0.0 ? tMin : tMax;
  return t >= 0.0;
}

bool sphereHit(vec3 ro, vec3 rd, vec4 sphere, out float t) {
  vec3 oc = sphere.xyz - ro;
  float b = dot(rd, oc);
  float c = dot(oc, oc) - sphere.w * sphere.w;
  float delta = b * b - c;
  if (delta < 0.0) return false;
  float root = sqrt(delta);
  t = b - root;
  if (t < 0.0) t = b + root;
  return t >= 0.0;
}

vec3 shapeAlbedo(int kind, vec3 p, vec3 n, vec3 a, vec3 b, vec3 c, vec3 rgb, float tileId, float rad) {
  int tile = int(tileId + 0.5);
  if (tile <= 0) return rgb;
  vec2 uv;
  if (kind == 6) {
    vec3 e1 = b - a;
    vec3 e2 = c - a;
    float e11 = dot(e1, e1);
    float e12 = dot(e1, e2);
    float e22 = dot(e2, e2);
    vec3 w = p - a;
    float den = max(e11 * e22 - e12 * e12, 1.0e-6);
    uv = vec2(dot(w, e1) * e22 - dot(w, e2) * e12, dot(w, e2) * e11 - dot(w, e1) * e12) / den;
    uv *= max(length(e1), length(e2)) * 4.0;
  } else if (kind == 3) {
    vec3 ap = abs(n);
    uv = (ap.z >= ap.x && ap.z >= ap.y ? p.xy : (ap.x >= ap.y ? p.yz : p.xz)) * 3.0;
  } else {
    vec3 ba = b - a;
    float baba = max(dot(ba, ba), 1.0e-6);
    float along = dot(p - a, ba) / baba;
    float len = sqrt(baba);
    vec3 axis = ba / len;
    vec3 rel = p - (a + ba * along);
    vec3 tmp = abs(axis.z) < 0.9 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
    vec3 side = normalize(cross(axis, tmp));
    vec3 upv = cross(side, axis);
    uv = vec2(atan(dot(rel, upv), dot(rel, side)) * 0.15915494 * max(rad, 0.02) * 14.0, along * len * 5.0);
  }
  return clamp(tiled(tile, uv, 2.2, rgb) * (rgb + vec3(0.35)), 0.0, 1.0);
}

bool shapeBox(vec3 ro, vec3 rd, vec3 c, float h, float limit) {
  vec3 inv = vec3(rd.x == 0.0 ? 1e30 : 1.0 / rd.x, rd.y == 0.0 ? 1e30 : 1.0 / rd.y, rd.z == 0.0 ? 1e30 : 1.0 / rd.z);
  vec3 t1 = (c - h - ro) * inv;
  vec3 t2 = (c + h - ro) * inv;
  vec3 tmin3 = min(t1, t2);
  vec3 tmax3 = max(t1, t2);
  float tEnter = max(max(tmin3.x, tmin3.y), tmin3.z);
  float tExit = min(min(tmax3.x, tmax3.y), tmax3.z);
  return tExit >= max(tEnter, 0.0) && tEnter < limit;
}

void considerOne(int i, vec3 ro, vec3 rd, inout float bestT, inout vec3 bestP, inout vec3 bestN, inout vec3 bestRgb, inout float bestRef, inout bool found) {
  if (i < 0 || i >= uShapeCount) return;
  float mark = bestT;
    vec4 row0 = texelFetch(uShapes, ivec2(i, 0), 0);
    vec4 row1 = texelFetch(uShapes, ivec2(i, 1), 0);
    vec4 row2 = texelFetch(uShapes, ivec2(i, 2), 0);
    vec4 row3 = texelFetch(uShapes, ivec2(i, 3), 0);
    int kind = int(row1.w + 0.5);
    vec3 rgb = row0.rgb;
    float ref = row0.a;
    vec3 a = row1.xyz;
    vec3 b = row2.xyz;
    vec3 c = row3.xyz;
    float rad = row2.w;
    if (kind == 1 || kind == 2) {
      vec3 pn = normalize(b);
      float denom = dot(rd, pn);
      if (abs(denom) < 1.0e-6) return;
      float t = dot(a - ro, pn) / denom;
      if (t <= 0.02 || t >= bestT) return;
      vec3 at = ro + rd * t;
      if (kind == 2 && dot(at - a, at - a) > rad * rad) return;
      bestT = t;
      bestP = at;
      bestN = denom > 0.0 ? -pn : pn;
      bestRgb = rgb;
      bestRef = ref;
      found = true;
    } else if (kind == 3) {
      vec3 inv = vec3(abs(rd.x) < 1.0e-8 ? 1.0e16 : 1.0 / rd.x, abs(rd.y) < 1.0e-8 ? 1.0e16 : 1.0 / rd.y, abs(rd.z) < 1.0e-8 ? 1.0e16 : 1.0 / rd.z);
      vec3 t1 = (a - b - ro) * inv;
      vec3 t2 = (a + b - ro) * inv;
      vec3 tsm = min(t1, t2);
      vec3 tsM = max(t1, t2);
      float tmin = max(max(tsm.x, tsm.y), tsm.z);
      float tmaxv = min(min(tsM.x, tsM.y), tsM.z);
      if (tmaxv < tmin) return;
      float t = tmin > 0.02 ? tmin : tmaxv;
      if (t <= 0.02 || t >= bestT) return;
      vec3 p = (ro + rd * t) - a;
      vec3 ap = abs(p) / max(b, vec3(1.0e-4));
      vec3 n = vec3(0.0);
      if (ap.x >= ap.y && ap.x >= ap.z) n.x = p.x < 0.0 ? -1.0 : 1.0;
      else if (ap.y >= ap.z) n.y = p.y < 0.0 ? -1.0 : 1.0;
      else n.z = p.z < 0.0 ? -1.0 : 1.0;
      if (dot(n, rd) > 0.0) n = -n;
      bestT = t;
      bestP = ro + rd * t;
      bestN = n;
      bestRgb = rgb;
      bestRef = ref;
      found = true;
    } else if (kind == 4 || kind == 5) {
      vec3 ba = b - a;
      vec3 oc = ro - a;
      float baba = dot(ba, ba);
      float bard = dot(ba, rd);
      float baoc = dot(ba, oc);
      float k2 = baba - bard * bard;
      float k1 = baba * dot(oc, rd) - baoc * bard;
      float k0 = baba * dot(oc, oc) - baoc * baoc - rad * rad * baba;
      float h = k1 * k1 - k2 * k0;
      if (h >= 0.0 && abs(k2) > 1.0e-6) {
        float s = sqrt(h);
        for (int side = 0; side < 2; side++) {
          float t = (-k1 + (side == 0 ? -s : s)) / k2;
          float y = baoc + t * bard;
          if (t <= 0.02 || t >= bestT || y <= 0.0 || y >= baba) continue;
          bestT = t;
          bestP = ro + rd * t;
          bestN = normalize(oc + rd * t - ba * y / baba);
          bestRgb = rgb;
          bestRef = ref;
          found = true;
        }
      }
      if (kind == 4) {
        vec3 cc0 = a;
        vec3 soc0 = cc0 - ro;
        float sb0 = dot(rd, soc0);
        float sd0 = sb0 * sb0 - (dot(soc0, soc0) - rad * rad);
        if (sd0 >= 0.0) {
          float sroot0 = sqrt(sd0);
          float t0 = sb0 - sroot0;
          if (t0 <= 0.02) t0 = sb0 + sroot0;
          if (t0 > 0.02 && t0 < bestT) {
            vec3 at0 = ro + rd * t0;
            bestT = t0;
            bestP = at0;
            bestN = normalize(at0 - cc0);
            bestRgb = rgb;
            bestRef = ref;
            found = true;
          }
        }
        vec3 cc1 = b;
        vec3 soc1 = cc1 - ro;
        float sb1 = dot(rd, soc1);
        float sd1 = sb1 * sb1 - (dot(soc1, soc1) - rad * rad);
        if (sd1 >= 0.0) {
          float sroot1 = sqrt(sd1);
          float t1 = sb1 - sroot1;
          if (t1 <= 0.02) t1 = sb1 + sroot1;
          if (t1 > 0.02 && t1 < bestT) {
            vec3 at1 = ro + rd * t1;
            bestT = t1;
            bestP = at1;
            bestN = normalize(at1 - cc1);
            bestRgb = rgb;
            bestRef = ref;
            found = true;
          }
        }
      } else if (baba > 1.0e-6) {
        vec3 na = ba / sqrt(baba);
        vec3 n0 = -na;
        vec3 n1 = na;
        float denom0 = dot(rd, n0);
        if (abs(denom0) >= 1.0e-6) {
          float t0 = dot(a - ro, n0) / denom0;
          if (t0 > 0.02 && t0 < bestT) {
            vec3 at0 = ro + rd * t0;
            if (dot(at0 - a, at0 - a) <= rad * rad) {
              bestT = t0;
              bestP = at0;
              bestN = denom0 > 0.0 ? -n0 : n0;
              bestRgb = rgb;
              bestRef = ref;
              found = true;
            }
          }
        }
        float denom1 = dot(rd, n1);
        if (abs(denom1) >= 1.0e-6) {
          float t1 = dot(b - ro, n1) / denom1;
          if (t1 > 0.02 && t1 < bestT) {
            vec3 at1 = ro + rd * t1;
            if (dot(at1 - b, at1 - b) <= rad * rad) {
              bestT = t1;
              bestP = at1;
              bestN = denom1 > 0.0 ? -n1 : n1;
              bestRgb = rgb;
              bestRef = ref;
              found = true;
            }
          }
        }
      }
    } else if (kind == 6) {
      vec3 e1 = b - a;
      vec3 e2 = c - a;
      vec3 pvec = cross(rd, e2);
      float det = dot(e1, pvec);
      if (abs(det) < 1.0e-6) return;
      float invDet = 1.0 / det;
      vec3 tvec = ro - a;
      float u = dot(tvec, pvec) * invDet;
      if (u < 0.0 || u > 1.0) return;
      vec3 qvec = cross(tvec, e1);
      float v = dot(rd, qvec) * invDet;
      if (v < 0.0 || u + v > 1.0) return;
      float t = dot(e2, qvec) * invDet;
      if (t <= 0.02 || t >= bestT) return;
      vec3 n = normalize(cross(e1, e2));
      if (dot(n, rd) > 0.0) n = -n;
      bestT = t;
      bestP = ro + rd * t;
      bestN = n;
      bestRgb = rgb;
      bestRef = ref;
      found = true;
    }
  if (bestT < mark) bestRgb = shapeAlbedo(kind, bestP, bestN, a, b, c, bestRgb, row3.w, rad);
}

void walkShapes(vec3 ro, vec3 rd, inout float bestT, inout vec3 bestP, inout vec3 bestN, inout vec3 bestRgb, inout float bestRef, inout bool found) {
  int stack[96];
  int sp = 1;
  stack[0] = 0;
  for (int step = 0; step < 96; step++) {
    if (sp <= 0) break;
    sp -= 1;
    int id = stack[sp];
    vec4 box = texelFetch(uShapeNodes, ivec2(0, id), 0);
    vec4 meta = texelFetch(uShapeNodes, ivec2(1, id), 0);
    if (meta.y < 0.5 || !shapeBox(ro, rd, box.xyz, box.w, bestT)) continue;
    if (meta.x < 0.0) {
      int len = int(meta.y + 0.5);
      int start = int(meta.z + 0.5);
      for (int k = 0; k < 16; k++) {
        if (k >= len) break;
        considerOne(int(texelFetch(uShapeIndex, ivec2(start + k, 0), 0).x + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found);
      }
    } else {
      int child = int(meta.x + 0.5);
      for (int k = 0; k < 8; k++) {
        vec4 cbox = texelFetch(uShapeNodes, ivec2(0, child + k), 0);
        vec4 cm = texelFetch(uShapeNodes, ivec2(1, child + k), 0);
        if (cm.y > 0.5 && shapeBox(ro, rd, cbox.xyz, cbox.w, bestT) && sp < 96) stack[sp++] = child + k;
      }
    }
  }
}

void considerShapes(vec3 ro, vec3 rd, inout float bestT, inout vec3 bestP, inout vec3 bestN, inout vec3 bestRgb, inout float bestRef, inout bool found) {
  if (uShapeNodeCount > 0) {
    for (int i = 0; i < 4; i++) {
      if (i >= uLooseShapes) break;
      considerOne(i, ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found);
    }
    walkShapes(ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found);
    return;
  }
  for (int i = 0; i < ${i}; i++) {
    if (i >= uShapeCount) return;
    considerOne(i, ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found);
  }
}

bool shapeBlocks(vec3 ro, vec3 rd, float limit) {
  float bestT = limit;
  vec3 bestP = ro;
  vec3 bestN = ro;
  vec3 bestRgb = ro;
  float bestRef = 0.0;
  bool found = false;
  considerShapes(ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found);
  return found;
}

/*@tree*/
bool nodeBox(vec3 ro, vec3 rd, vec3 c, float h, float limit) {
  vec3 inv = vec3(rd.x == 0.0 ? 1e30 : 1.0 / rd.x, rd.y == 0.0 ? 1e30 : 1.0 / rd.y, rd.z == 0.0 ? 1e30 : 1.0 / rd.z);
  vec3 t1 = (c - h - ro) * inv;
  vec3 t2 = (c + h - ro) * inv;
  vec3 tmin3 = min(t1, t2);
  vec3 tmax3 = max(t1, t2);
  float tEnter = max(max(tmin3.x, tmin3.y), tmin3.z);
  float tExit = min(min(tmax3.x, tmax3.y), tmax3.z);
  return tExit >= max(tEnter, 0.0) && tEnter < limit;
}

void takeSphere(int i, vec3 ro, vec3 rd, inout float bestT, inout vec3 bestP, inout vec3 bestN, inout vec3 bestRgb, inout float bestRef, inout bool found, int bounce) {
  if (i < 0 || i >= uSpheres) return;
  vec4 sphere = texelFetch(uSphereTex, ivec2(i, 0), 0);
  float t;
  if (!sphereHit(ro, rd, sphere, t) || t <= 0.02 || t >= bestT) return;
  bestT = t;
  bestP = ro + rd * t;
  bestN = normalize(bestP - sphere.xyz);
  gFoot = t * uFoot * float(bounce + 1);
  vec4 col = texelFetch(uSphereColor, ivec2(i, 0), 0);
  bestRgb = sphereAlbedo(bestN, sphere.w, i, col.rgb, col.a);
  bestRef = fract(col.a);
  found = true;
}

void walkSpheres(vec3 ro, vec3 rd, inout float bestT, inout vec3 bestP, inout vec3 bestN, inout vec3 bestRgb, inout float bestRef, inout bool found, int bounce) {
  int stack[96];
  int sp = 1;
  stack[0] = 0;
  for (int step = 0; step < 80; step++) {
    if (sp <= 0) break;
    sp -= 1;
    int id = stack[sp];
    vec4 box = texelFetch(uNodes, ivec2(0, id), 0);
    vec4 meta = texelFetch(uNodes, ivec2(1, id), 0);
    if (meta.y < 0.5 || !nodeBox(ro, rd, box.xyz, box.w, bestT)) continue;
    if (meta.x < 0.0) {
      int len = int(meta.y + 0.5);
      vec4 extra = texelFetch(uNodes, ivec2(2, id), 0);
      vec4 tail = texelFetch(uNodes, ivec2(3, id), 0);
      if (len > 0) takeSphere(int(meta.z + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 1) takeSphere(int(meta.w + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 2) takeSphere(int(extra.x + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 3) takeSphere(int(extra.y + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 4) takeSphere(int(extra.z + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 5) takeSphere(int(extra.w + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 6) takeSphere(int(tail.x + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
      if (len > 7) takeSphere(int(tail.y + 0.5), ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
    } else {
      int child = int(meta.x + 0.5);
      for (int k = 0; k < 8; k++) {
        vec4 cbox = texelFetch(uNodes, ivec2(0, child + k), 0);
        vec4 cm = texelFetch(uNodes, ivec2(1, child + k), 0);
        if (cm.y > 0.5 && nodeBox(ro, rd, cbox.xyz, cbox.w, bestT) && sp < 96) stack[sp++] = child + k;
      }
    }
  }
}

bool treeBlocks(vec3 sro, vec3 ld, float lightT) {
  int stack[96];
  int sp = 1;
  stack[0] = 0;
  for (int step = 0; step < 80; step++) {
    if (sp <= 0) break;
    sp -= 1;
    int id = stack[sp];
    vec4 box = texelFetch(uNodes, ivec2(0, id), 0);
    vec4 meta = texelFetch(uNodes, ivec2(1, id), 0);
    if (meta.y < 0.5 || !nodeBox(sro, ld, box.xyz, box.w, lightT)) continue;
    if (meta.x < 0.0) {
      int len = int(meta.y + 0.5);
      vec4 extra = texelFetch(uNodes, ivec2(2, id), 0);
      vec4 tail = texelFetch(uNodes, ivec2(3, id), 0);
      int ids[8];
      ids[0] = int(meta.z + 0.5);
      ids[1] = int(meta.w + 0.5);
      ids[2] = int(extra.x + 0.5);
      ids[3] = int(extra.y + 0.5);
      ids[4] = int(extra.z + 0.5);
      ids[5] = int(extra.w + 0.5);
      ids[6] = int(tail.x + 0.5);
      ids[7] = int(tail.y + 0.5);
      for (int k = 0; k < 8; k++) {
        if (k >= len) break;
        int j = ids[k];
        if (j < 0 || j >= uSpheres) continue;
        vec4 sph = texelFetch(uSphereTex, ivec2(j, 0), 0);
        float st;
        if (sphereHit(sro, ld, sph, st) && st > 0.0 && st < lightT) return true;
      }
    } else {
      int child = int(meta.x + 0.5);
      for (int k = 0; k < 8; k++) {
        vec4 cbox = texelFetch(uNodes, ivec2(0, child + k), 0);
        vec4 cm = texelFetch(uNodes, ivec2(1, child + k), 0);
        if (cm.y > 0.5 && nodeBox(sro, ld, cbox.xyz, cbox.w, lightT) && sp < 96) stack[sp++] = child + k;
      }
    }
  }
  return false;
}
/*@tree*/

bool blocked(vec3 from, vec3 rd) {
  float t;
  for (int i = 0; i < ${r}; i++) {
    if (i >= uBoxes) break;
    vec3 bmin = texelFetch(uBoxMin, ivec2(i, 0), 0).xyz;
    vec3 bmax = texelFetch(uBoxMax, ivec2(i, 0), 0).xyz;
    if (boxHit(from, rd, bmin, bmax, t) && t < 80.0) return true;
  }
  if (uShapeCount > 0 && shapeBlocks(from, rd, 80.0)) return true;
/*@tree*/
  if (treeBlocks(from, rd, 80.0)) return true;
/*@tree*/
/*@line*/
  for (int i = 0; i < ${n}; i++) {
    if (i >= uSpheres) break;
    vec4 sphere = texelFetch(uSphereTex, ivec2(i, 0), 0);
    if (sphereHit(from, rd, sphere, t) && t < 80.0) return true;
  }
/*@line*/
  return false;
}

vec3 skyColor(vec3 rd) {
  vec3 sun = normalize(uSun);
  float elev = sun.z;
  float day = smoothstep(-0.02, 0.28, elev);
  float night = 1.0 - smoothstep(-0.2, 0.05, elev);
  float low = smoothstep(-0.08, 0.0, elev) * (1.0 - smoothstep(0.12, 0.42, elev));
  float up = clamp(rd.z * 0.85 + 0.2, 0.0, 1.0);
  vec3 noon = mix(vec3(0.62, 0.68, 0.74), vec3(0.30, 0.50, 0.84), up);
  vec3 warm = mix(vec3(0.92, 0.46, 0.22), vec3(0.42, 0.28, 0.48), up);
  vec3 dark = mix(vec3(0.03, 0.035, 0.07), vec3(0.008, 0.012, 0.03), up);
  vec3 sky = mix(mix(noon, warm, low), dark, night);
  vec3 cell = floor(rd * 48.0);
  float star = step(0.92, fract(sin(dot(cell, vec3(127.1, 311.7, 74.7))) * 43758.5453));
  sky += vec3(0.85, 0.9, 1.0) * star * night * step(0.15, rd.z);
  vec3 moon = normalize(vec3(-sun.xy, max(0.2, -elev)));
  float moonDisc = smoothstep(0.9992, 0.99955, dot(rd, moon)) * night;
  sky += vec3(0.86, 0.88, 0.95) * moonDisc * 2.2;
  float d = dot(rd, sun);
  float disc = smoothstep(0.99915, 0.99955, d);
  float glow = pow(max(d, 0.0), 220.0);
  vec3 color = sky + vec3(1.0, 0.94, 0.72) * (disc * 3.0 + glow * 0.7) * day;
  float puff = cloudShade(rd);
  vec3 cloud = mix(vec3(0.16, 0.18, 0.24), vec3(0.96, 0.97, 0.95), day);
  return mix(color, cloud, puff);
}

const float WET_DARKEN = 0.3;
const float WET_SHEEN = 0.45;
const float DECK_DRIFT = 0.004 / 0.018;
float rainNow(vec3 p) {
  return clamp((cloudShadeAt(p, vec3(0.0, 0.0, 1.0)) - 0.3) / 0.2, 0.0, 1.0);
}
// Ground stays wet after the rain moves on and dries over about 90 s of game time. The deck drifts
// toward +x at DECK_DRIFT m/s, so the rain that fell here Δ seconds ago is the rain over p - Δ·drift now.
float wetAt(vec3 p) {
  float now = rainNow(p);
  float wet = now >= 1.0 ? now : max(now, max(rainNow(p - vec3(30.0 * DECK_DRIFT, 0.0, 0.0)) * 0.65, rainNow(p - vec3(90.0 * DECK_DRIFT, 0.0, 0.0)) * 0.3));
  // Dry under a roof: only paid for where it would otherwise be wet.
  if (wet > 0.0 && blocked(p + vec3(0.0, 0.0, 0.08), vec3(0.0, 0.0, 1.0))) return 0.0;
  return wet;
}
vec3 sunLit(vec3 p, vec3 n, vec3 albedo) {
  vec3 sun = normalize(uSun);
  float day = smoothstep(0.0, 0.2, sun.z);
  float ndotl = max(dot(n, sun), 0.0);
  float direct = ndotl * day;
  if (direct > 0.0 && blocked(p + n * 0.06 + sun * 0.05, sun)) direct *= 0.28;
  // A cloud's shadow on the ground: the same deck the fin reads (src/sim/cloud.js).
  if (direct > 0.0) direct *= 1.0 - 0.75 * cloudShadeAt(p, sun);
  // Wet ground: where the deck overhead rains (the same rule as rainAt in src/sim/cloud.js),
  // upward faces darken, the way rain-soaked sand and grass do.
  if (n.z > 0.3) {
    float wet = wetAt(p);
    albedo *= 1.0 - WET_DARKEN * wet * smoothstep(0.3, 0.8, n.z);
  }
  return albedo * (vec3(0.28, 0.30, 0.34) + vec3(1.05, 0.96, 0.84) * direct);
}

vec3 boxNormal(vec3 p, vec3 bmin, vec3 bmax) {
  vec3 q = (p - (bmin + bmax) * 0.5) / max((bmax - bmin) * 0.5, vec3(0.001));
  vec3 a = abs(q);
  if (a.x > a.y && a.x > a.z) return vec3(sign(q.x), 0.0, 0.0);
  if (a.y > a.z) return vec3(0.0, sign(q.y), 0.0);
  return vec3(0.0, 0.0, sign(q.z));
}

float bankAmount(vec3 q, vec4 b) {
  if (b.z <= 0.5) return 0.0;
  vec2 o = q.xy - b.xy;
  float rise = q.z - b.w;
  return exp(-dot(o, o) / (b.z * b.z)) * smoothstep(-0.6, 0.4, rise) * exp(-max(rise, 0.0) / 2.2);
}

vec3 bankFog(vec3 ro, vec3 rd, float tHit, vec3 color) {
  float t1 = min(tHit, 240.0);
  if (t1 < 2.0) return color;
  float optical = 0.0;
  for (int i = 0; i < 6; i++) {
    vec3 q = ro + rd * (t1 * (float(i) + 0.5) / 6.0);
    float d = bankAmount(q, uFog0) + bankAmount(q, uFog1) + bankAmount(q, uFog2);
    if (d < 0.02) continue;
    float roll = valueNoise(q.xy * 0.05 + vec2(uTime * 0.35, uTime * 0.12));
    optical += d * smoothstep(0.32, 0.8, roll) * (t1 / 6.0);
  }
  float T = exp(-0.07 * optical * (0.7 + uRain * 0.8));
  float day = smoothstep(-0.05, 0.25, normalize(uSun).z);
  vec3 fogC = mix(vec3(0.26, 0.28, 0.32), vec3(0.8, 0.82, 0.84), day);
  return mix(fogC, color, clamp(T, 0.0, 1.0));
}

void main() {
  // Foveated progressive tracing: the gaze region traces every frame at full resolution;
  // the periphery traces one pixel per cell, every few frames, and stays in the accumulation target between.
  if (uFull < 0.5) {
    // Dithered, continuous sample selection: each pixel is traced with probability fovDensity,
    // thresholded by IGN shifted every frame, so density falls smoothly with angle (no cell lattice,
    // no rings) and every pixel is eventually refreshed.
    float ft = fovT(vRay);
    vec2 pix = floor(gl_FragCoord.xy);
    if (ign(pix + 5.588238 * mod(uFrame, 64.0)) >= fovDensity(ft)) discard;
  }
  float uu = vRay.x;
  float vv = vRay.y;
  float halfAngle = tan(uFov * 0.008726646259971648) * uPlane;
  float px = (uu * 2.0 - 1.0) * uAspect * halfAngle;
  float py = (1.0 - vv * 2.0) * halfAngle;
  vec3 rd = normalize(uRight * px + uUp * py + uForward * uPlane);
  vec3 eye = rd;
  vec3 ro = uOrigin;
  vec3 accum = vec3(0.0);
  float thru = 1.0;
  float firstT = 4000.0;
  float limit = 0.0;
  // The foveated edge drops the second bounce: past the fovea fade a mirror hit takes the sky tint
  // instead of tracing on, so the periphery pays for at most one reflection.
  float edgeT = uFull < 0.5 ? fovT(vRay) : 0.0;
  int lastBounce = edgeT > 0.5 ? 1 : 4;
  for (int bounce = 0; bounce < 5; bounce++) {
    float bestT = 1.0e30;
    vec3 bestP = ro;
    vec3 bestN = vec3(0.0, 0.0, 1.0);
    vec3 bestRgb = uMiss.rgb;
    float bestRef = 0.0;
    bool found = false;
    float t;
    vec3 p;
    float sandT = 1.0e30;
    vec3 sandP = ro;
    bool sand = false;
    if (bounce == 0) sand = sandPlane(ro, rd, limit, sandT, sandP);
    else sand = sandCoarse(ro, rd, sandT, sandP);
    gFoot = (sand ? sandT : 8.0) * uFoot / max(abs(rd.z), 0.25) * float(bounce + 1);
    bool openMouth = false;
    float mouthFloor = 0.0;
    if (bounce == 0 && uDigs > 0) {
      ivec2 mouth = ivec2(floor(sandP.xy / ${rr}));
      for (int n = 0; n < 32; n++) {
        if (n >= uDigs) break;
        vec4 dig = texelFetch(uDigTex, ivec2(n, 0), 0);
        if (sand && abs(dig.x - float(mouth.x)) < 0.1 && abs(dig.y - float(mouth.y)) < 0.1) {
          openMouth = true;
          mouthFloor = dig.z;
        }
        if (rd.z >= -1.0e-4) continue;
        t = (dig.z - ro.z) / rd.z;
        if (t <= 0.02 || t >= bestT) continue;
        p = ro + rd * t;
        vec2 lo = dig.xy * ${rr};
        if (p.x < lo.x - 0.02 || p.x >= lo.x + ${rr} + 0.02 || p.y < lo.y - 0.02 || p.y >= lo.y + ${rr} + 0.02) continue;
        bestT = t;
        bestP = p;
        bestN = vec3(0.0, 0.0, 1.0);
        bestRgb = withPrints(tiled(32, p.xy * 0.35, 0.35, vec3(0.16, 0.13, 0.10)) * 0.55, p.xy, bounce);
        bestRef = 0.02;
        found = true;
      }
    }
    if (sand && openMouth && !found) {
      bestT = sandT;
      bestP = vec3(sandP.xy, mouthFloor);
      bestN = vec3(0.0, 0.0, 1.0);
      bestRgb = withPrints(tiled(32, sandP.xy * 0.35, 0.35, vec3(0.16, 0.13, 0.10)) * 0.55, sandP.xy, bounce);
      bestRef = 0.02;
      found = true;
    } else if (sand && !openMouth && sandT < bestT) {
      bestT = sandT;
      bestP = sandP;
      bestN = duneNormal(sandP.xy);
      bestRgb = withPrints(groundAlbedo(sandP.xy, bestN), sandP.xy, bounce);
      bestRef = 0.02;
      found = true;
    }
    for (int i = 0; i < ${r}; i++) {
      if (i >= uBoxes) break;
      vec3 bmin = texelFetch(uBoxMin, ivec2(i, 0), 0).xyz;
      vec3 bmax = texelFetch(uBoxMax, ivec2(i, 0), 0).xyz;
      if (!boxHit(ro, rd, bmin, bmax, t) || t <= 0.02 || t >= bestT) continue;
      bestT = t;
      bestP = ro + rd * t;
      bestN = boxNormal(bestP, bmin, bmax);
      gFoot = t * uFoot / max(abs(dot(bestN, rd)), 0.25) * float(bounce + 1);
      vec4 col = texelFetch(uBoxColor, ivec2(i, 0), 0);
      vec2 woodUv = abs(bestN.z) > 0.5 ? bestP.xy : (abs(bestN.x) > 0.5 ? bestP.yz : bestP.xz);
      bestRgb = tiled(33, woodUv * 0.5, 0.5, col.rgb);
      bestRef = col.a;
      found = true;
    }
    if (uShapeCount > 0) considerShapes(ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found);
/*@tree*/
    walkSpheres(ro, rd, bestT, bestP, bestN, bestRgb, bestRef, found, bounce);
/*@tree*/
/*@line*/
    for (int i = 0; i < ${n}; i++) {
      if (i >= uSpheres) break;
      vec4 sphere = texelFetch(uSphereTex, ivec2(i, 0), 0);
      if (!sphereHit(ro, rd, sphere, t) || t <= 0.02 || t >= bestT) continue;
      bestT = t;
      bestP = ro + rd * t;
      bestN = normalize(bestP - sphere.xyz);
      gFoot = t * uFoot * float(bounce + 1);
      vec4 col = texelFetch(uSphereColor, ivec2(i, 0), 0);
      bestRgb = sphereAlbedo(bestN, sphere.w, i, col.rgb, col.a);
      bestRef = fract(col.a);
      found = true;
    }
/*@line*/
    if (rd.z < -0.001) {
      float waterT = (0.0 - ro.z) / rd.z;
      vec3 waterP = ro + rd * waterT;
      if (waterT > 0.02 && waterT < bestT && dot(waterP.xy, waterP.xy) > 256.0 * 256.0) {
        bestT = waterT;
        bestP = waterP;
        bestN = vec3(0.0, 0.0, 1.0);
        bestRgb = vec3(0.08, 0.22, 0.38);
        bestRef = 0.45;
        found = true;
      }
    }
    float workT = 1.0e30;
    if (bounce == 0 && uWork.w > 0.5) {
      float rise = max(uWork.z, 0.08);
      float wide = rise < 0.4 ? 0.42 : 0.24;
      float deep = rise < 0.4 ? 0.42 : 0.08;
      float gt;
      bool mark = uWork.w < 1.5 || uWork.w > 3.5;
      if (mark && boxHit(ro, rd, vec3(uWork.x - wide, uWork.y - deep, 0.0), vec3(uWork.x + wide, uWork.y + deep, rise), gt) && gt < bestT) workT = gt;
    }
    bool ghost = workT < 1.0e20;
    if (!found && !ghost) {
      accum += thru * skyColor(rd);
      break;
    }
    if (bounce == 0) firstT = min(bestT, workT);
    if (found) {
      if (dot(bestN, rd) > 0.0) bestN = -bestN;
      if (bounce == 0) {
        bestRgb = sunLit(bestP, bestN, bestRgb);
        // Wet ground shines: a grazing-angle sky sheen where it rains, so puddled flats catch the light.
        if (bestN.z > 0.6) {
          float wetness = wetAt(bestP);
          if (wetness > 0.0) {
            float graze = pow(1.0 - abs(dot(bestN, rd)), 4.0);
            bestRgb = mix(bestRgb, skyColor(reflect(rd, bestN)), wetness * WET_SHEEN * (0.15 + 0.85 * graze));
          }
        }
      }
      else {
        float nd = max(dot(bestN, normalize(uSun)), 0.0);
        bestRgb *= vec3(0.20, 0.22, 0.28) + vec3(1.08, 0.98, 0.86) * nd;
      }
      if (bounce == 0) {
        float low = exp(-max(bestP.z, 0.0) * 0.11);
        float fog = (1.0 - exp(-bestT * 0.0011)) * mix(0.35, 1.0, low);
        fog = clamp(fog, 0.0, 0.62);
        vec3 haze = mix(vec3(0.42, 0.48, 0.54), vec3(0.74, 0.8, 0.86), smoothstep(-0.05, 0.25, normalize(uSun).z));
        bestRgb = mix(bestRgb, haze, fog);
      }
    }
    if (bounce == 0 && uWork.w > 0.5) {
      vec2 cell = uWork.xy;
      float rise = max(uWork.z, 0.08);
      float gt;
      float wide = rise < 0.4 ? 0.42 : 0.24;
      float deep = rise < 0.4 ? 0.42 : 0.08;
      vec3 bmin = vec3(cell.x - wide, cell.y - deep, 0.0);
      vec3 bmax = vec3(cell.x + wide, cell.y + deep, rise);
      bool piece = uWork.w > 3.5;
      bool rising = uWork.w < 1.5;
      vec3 tint = piece ? vec3(1.0, 0.72, 0.28) : vec3(0.2, 0.9, 1.0);
      if ((rising || piece) && boxHit(ro, rd, bmin, bmax, gt) && gt < bestT) {
        bestT = gt;
        bestP = ro + rd * gt;
        bestN = vec3(0.0, 0.0, 1.0);
        float band = 0.55 + 0.45 * sin(bestP.z * 16.0 - uTime * 8.0);
        float lip = smoothstep(rise - 0.12, rise, bestP.z);
        bestRgb = mix(tint * band, vec3(1.0, 0.95, 0.7), lip);
        bestRef = 0.0;
      } else {
        float dist = length(bestP.xy - cell);
        float ring = 0.28 + 0.05 * sin(uTime * 3.0);
        float mark = smoothstep(0.07, 0.0, abs(dist - ring));
        float pad = smoothstep(0.34, 0.08, dist);
        float scan = 0.55 + 0.45 * sin(uTime * 6.0 + dist * 20.0);
        bestRgb += tint * (mark * 0.95 + pad * 0.35 * scan);
      }
    }
    float mirror = bounce == 4 ? 0.0 : clamp(bestRef, 0.0, 1.0);
    // One material rule everywhere: faint mirrors (and any mirror on the edge's last hop) take a cheap sky tint.
    if (found && (mirror < 0.2 || bounce >= lastBounce)) {
      vec3 rr = reflect(rd, bestN);
      float up = clamp(rr.z * 0.85 + 0.2, 0.0, 1.0);
      float day = smoothstep(-0.02, 0.25, normalize(uSun).z);
      vec3 tint = mix(vec3(0.62, 0.68, 0.74), vec3(0.30, 0.50, 0.84), up) * mix(0.12, 1.0, day);
      bestRgb = mix(bestRgb, tint, mirror);
      mirror = 0.0;
    }
    accum += thru * bestRgb * (1.0 - mirror);
    thru *= mirror;
    if (thru <= 0.001) break;
    rd = normalize(reflect(rd, bestN));
    ro = bestP + bestN * 0.05;
  }
  // Rain you can see: under a thick deck (uRain from src/sim/cloud.js) thin falling streaks dim and
  // grey the view. Streak columns are hashed, and each falls at its own pace on tick time.
  // Under a roof (anything solid straight above the camera) the near streaks and grey stop.
  if (uRain > 0.0 && !blocked(uOrigin + vec3(0.0, 0.0, 0.3), vec3(0.0, 0.0, 1.0))) {
    vec2 rp = vec2(vRay.x * 140.0, vRay.y * 9.0);
    float col = floor(rp.x);
    float h = hash21(vec2(col, 7.0));
    float fall = fract(rp.y + uTime * (2.2 + h * 1.6) + h * 13.0);
    float streak = step(0.86, fract(rp.x)) * smoothstep(0.0, 0.25, fall) * step(fall, 0.25) * step(0.55, h);
    accum = mix(accum, vec3(0.55, 0.6, 0.66), uRain * (0.18 + 0.5 * streak));
  }
  if (uFog > 0.5) accum = bankFog(uOrigin, eye, firstT, accum);
  // Alpha carries log depth (0 near, 1 at 4 km) for future reprojection.
  float depthCode = clamp(log2(1.0 + firstT) / 12.0, 0.0, 1.0);
  fragColor = vec4(present(accum), depthCode);
}`,c=(e,t)=>e.replace(/\/\*@(tree|line)\*\/([\s\S]*?)\/\*@\1\*\//g,(e,n,r)=>n===`tree`===t?r:``),l=c(s,!1),u=Un(a,a.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
out vec2 vRay;
void main() {
  vec2 uv = aPos * 0.5 + 0.5;
  vRay = vec2(uv.x, 1.0 - uv.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`),d=Un(a,a.FRAGMENT_SHADER,l);if(!u||!d)return Hn(e,Un.lastLog||`shader`);let f=a.createProgram();if(a.attachShader(f,u),a.attachShader(f,d),a.bindAttribLocation(f,0,`aPos`),a.linkProgram(f),!a.getProgramParameter(f,a.LINK_STATUS))return Hn(e,a.getProgramInfoLog(f)||`link`);let p=Un(a,a.FRAGMENT_SHADER,c(s,!0)),m=null;p&&(m=a.createProgram(),a.attachShader(m,u),a.attachShader(m,p),a.bindAttribLocation(m,0,`aPos`),a.linkProgram(m),a.getProgramParameter(m,a.LINK_STATUS)||(m=null));let h=a.createBuffer();a.bindBuffer(a.ARRAY_BUFFER,h),a.bufferData(a.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),a.STATIC_DRAW);let g,_,v,y=null,ee=null,b=null,x,te,ne,re,ie,ae,S=/* @__PURE__ */ new Float32Array(640),oe=null,C=-1,w,se;try{g=Wn(a,Qn),_=Wn(a,Qn),v=a.createTexture(),a.activeTexture(a.TEXTURE14),a.bindTexture(a.TEXTURE_2D,v),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texImage2D(a.TEXTURE_2D,0,a.RGBA32F,$n,4,0,a.RGBA,a.FLOAT,null),y=a.createTexture(),a.activeTexture(a.TEXTURE12),a.bindTexture(a.TEXTURE_2D,y),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texImage2D(a.TEXTURE_2D,0,a.RGBA32F,4,H,0,a.RGBA,a.FLOAT,null),ee=a.createTexture(),a.activeTexture(a.TEXTURE9),a.bindTexture(a.TEXTURE_2D,ee),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texImage2D(a.TEXTURE_2D,0,a.RGBA32F,$n,1,0,a.RGBA,a.FLOAT,null),m&&(b=a.createTexture(),a.activeTexture(a.TEXTURE15),a.bindTexture(a.TEXTURE_2D,b),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.texImage2D(a.TEXTURE_2D,0,a.RGBA32F,4,Le,0,a.RGBA,a.FLOAT,null)),x=Wn(a,tr),te=Wn(a,tr),ne=Wn(a,tr),re=Wn(a,nr),ie=Wn(a,ir),ae=Wn(a,160),oe=a.createTexture(),a.activeTexture(a.TEXTURE13),a.bindTexture(a.TEXTURE_2D,oe),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.pixelStorei(a.UNPACK_ALIGNMENT,1),a.texImage2D(a.TEXTURE_2D,0,a.R8,128,128,0,a.RED,a.UNSIGNED_BYTE,hr),w=Wn(a,gr),se=a.createTexture(),a.activeTexture(a.TEXTURE7),a.bindTexture(a.TEXTURE_2D,se),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR_MIPMAP_LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAX_LEVEL,3),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),Y(Z,32,cn()),Y(Z,33,dn()),Y(Z,34,ln()),Y(Z,35,un()),Y(Z,36,pn()),Y(Z,37,mn()),Y(Z,38,hn()),Y(Z,39,gn()),Y(Z,40,_n()),Y(Z,41,vn()),Y(Z,42,yn()),Y(Z,43,bn()),Y(Z,44,xn()),Y(Z,45,Sn()),X.set(J(32),128),X.set(J(33),132),X.set(J(34),136),X.set(J(35),140),X.set(J(36),144),X.set(J(37),148),X.set(J(38),152),X.set(J(39),156),X.set(J(40),160),X.set(J(41),164),X.set(J(42),168),X.set(J(43),172),X.set(J(44),176),X.set(J(45),180),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,Cn,Cn,0,a.RGBA,a.UNSIGNED_BYTE,Z),a.generateMipmap(a.TEXTURE_2D)}catch{return null}let T=e=>a.getUniformLocation(f,e);a.useProgram(f),a.uniform1i(T(`uSphereTex`),0),a.uniform1i(T(`uSphereColor`),1),a.uniform1i(T(`uBoxMin`),2),a.uniform1i(T(`uBoxMax`),3),a.uniform1i(T(`uBoxColor`),4),a.uniform1i(T(`uDigTex`),5),a.uniform1i(T(`uPrintTex`),8),a.uniform1i(T(`uTexRects`),6),a.uniform1i(T(`uAtlas`),7),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0);let E=(e,t,n,r)=>{a.activeTexture(a.TEXTURE0+e),a.bindTexture(a.TEXTURE_2D,t),a.texSubImage2D(a.TEXTURE_2D,0,0,0,n,1,a.RGBA,a.FLOAT,r)},ce=Array(Qn),le=!1,D=Un(a,a.VERTEX_SHADER,`#version 300 es
in vec2 aRay;
out vec2 vRay;
void main() {
  vRay = aRay;
  gl_Position = vec4(aRay.x * 2.0 - 1.0, (1.0 - aRay.y) * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = 1.0;
}`),O=null,ue=/* @__PURE__ */ new Float32Array(16e3),de=a.createBuffer();D&&(O=a.createProgram(),a.attachShader(O,D),a.attachShader(O,d),a.bindAttribLocation(O,0,`aRay`),a.linkProgram(O),a.getProgramParameter(O,a.LINK_STATUS)||(O=null));let k=null,A=[0,1,2].map(()=>{a.activeTexture(a.TEXTURE0);let e=a.createTexture();return a.bindTexture(a.TEXTURE_2D,e),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,a.LINEAR),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),{tex:e,fbo:a.createFramebuffer(),w:0,h:0}}),j=-1,fe=-1,pe=(e,t,n)=>{if(e.w===t&&e.h===n)return!0;a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,e.tex),a.texImage2D(a.TEXTURE_2D,0,a.RGBA,t,n,0,a.RGBA,a.UNSIGNED_BYTE,null),a.bindFramebuffer(a.FRAMEBUFFER,e.fbo),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,e.tex,0);let r=a.checkFramebufferStatus(a.FRAMEBUFFER)===a.FRAMEBUFFER_COMPLETE;return a.bindTexture(a.TEXTURE_2D,null),a.bindFramebuffer(a.FRAMEBUFFER,null),r?(e.w=t,e.h=n,!0):!1},me=()=>{a.activeTexture(a.TEXTURE9),a.bindTexture(a.TEXTURE_2D,null),a.activeTexture(a.TEXTURE10),a.bindTexture(a.TEXTURE_2D,null),a.activeTexture(a.TEXTURE0)},he=Un(a,a.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`),M=Un(a,a.FRAGMENT_SHADER,`#version 300 es
precision highp float;
uniform sampler2D uOlder;
uniform sampler2D uNewer;
uniform float uMix;
uniform float uSmooth;
in vec2 vUV;
out vec4 fragColor;
// Edge-aware upscale: bilinear, then a sharpen that is clamped to the 2x2 source texels,
// so edges stay crisp without nearest-neighbour stairs or ringing.
vec4 upscale(sampler2D tex, vec2 uv) {
  vec2 size = vec2(textureSize(tex, 0));
  vec2 st = uv * size - 0.5;
  vec2 base = (floor(st) + 0.5) / size;
  vec2 dx = vec2(1.0 / size.x, 0.0);
  vec2 dy = vec2(0.0, 1.0 / size.y);
  vec4 a = texture(tex, base);
  vec4 b = texture(tex, base + dx);
  vec4 c = texture(tex, base + dy);
  vec4 d = texture(tex, base + dx + dy);
  vec4 lin = texture(tex, uv);
  vec4 lo = min(min(a, b), min(c, d));
  vec4 hi = max(max(a, b), max(c, d));
  vec4 blur = (a + b + c + d) * 0.25;
  return clamp(lin + (lin - blur) * 0.9, lo, hi);
}
float luma(vec4 c) { return dot(c.rgb, vec3(0.299, 0.587, 0.114)); }
// Smooth upscale (anti-aliasing for low render scales): bilinear, then an FXAA-style pass in
// source-texel space that blends along detected edges, so stair-steps blur out instead of
// showing as blocks. 9 taps per picture; only runs when the trace is smaller than the canvas.
vec4 smoothUp(sampler2D tex, vec2 uv) {
  vec2 px = 1.0 / vec2(textureSize(tex, 0));
  vec4 m = texture(tex, uv);
  float lm = luma(m);
  float ln = luma(texture(tex, uv + vec2(0.0, px.y)));
  float ls = luma(texture(tex, uv - vec2(0.0, px.y)));
  float le = luma(texture(tex, uv + vec2(px.x, 0.0)));
  float lw = luma(texture(tex, uv - vec2(px.x, 0.0)));
  float lo = min(lm, min(min(ln, ls), min(le, lw)));
  float hi = max(lm, max(max(ln, ls), max(le, lw)));
  float range = hi - lo;
  if (range < max(0.03, hi * 0.08)) return m;
  vec2 dir = vec2(-(ln - ls), le - lw);
  float len = length(dir);
  if (len < 1e-4) return m;
  // Edge normal is dir; blur along the tangent across about 1.5 source texels.
  vec2 tan = vec2(dir.y, -dir.x) / len * px * 1.5;
  vec4 a = texture(tex, uv + tan * 0.5) + texture(tex, uv - tan * 0.5);
  vec4 b = texture(tex, uv + tan) + texture(tex, uv - tan);
  vec4 blend = (m * 2.0 + a * 1.5 + b) / 7.0;
  return mix(m, blend, clamp(range * 4.0, 0.0, 1.0));
}
vec4 up(sampler2D tex, vec2 uv) {
  return uSmooth > 0.5 ? smoothUp(tex, uv) : upscale(tex, uv);
}
void main() {
  vec4 past = up(uOlder, vUV);
  vec4 next = up(uNewer, vUV);
  fragColor = mix(past, next, uMix);
}`),N=null;he&&M&&(N=a.createProgram(),a.attachShader(N,he),a.attachShader(N,M),a.bindAttribLocation(N,0,`aPos`),a.linkProgram(N),a.getProgramParameter(N,a.LINK_STATUS)||(N=null));let ge=N?a.getUniformLocation(N,`uOlder`):null,_e=N?a.getUniformLocation(N,`uNewer`):null,P=N?a.getUniformLocation(N,`uMix`):null,ve=N?a.getUniformLocation(N,`uSmooth`):null,ye=!0,F=Un(a,a.FRAGMENT_SHADER,`#version 300 es
precision highp float;
uniform sampler2D uAccum;
uniform sampler2D uHistory;
uniform float uKeep;
${yr}
in vec2 vUV;
out vec4 fragColor;
uniform float uJitter;
// Gaussian reconstruction over a jittered Vogel disk of radius ~r. Taps use bilinear filtering of
// the accumulation target, the disk is rotated per pixel and per frame (IGN), and the history
// blend averages those rotations over time, so the blur radius is continuous in angle.
vec3 gather(vec2 pix, float r) {
  vec2 size = vec2(textureSize(uAccum, 0));
  float spin = 6.2831853 * ign(pix + 5.588238 * uJitter);
  float sigma = 0.5 * r;
  vec3 sum = texture(uAccum, (pix + 0.5) / size).rgb;
  float total = 1.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i) + 0.5;
    float rad = r * sqrt(fi / 8.0);
    float ang = fi * 2.3999632 + spin;
    vec2 off = rad * vec2(cos(ang), sin(ang));
    float w = exp(-dot(off, off) / (2.0 * sigma * sigma));
    sum += w * texture(uAccum, (pix + 0.5 + off) / size).rgb;
    total += w;
  }
  return sum / total;
}
void main() {
  vec2 ray = vec2(vUV.x, 1.0 - vUV.y);
  float t = fovT(ray);
  float r = fovRadius(t);
  vec2 pix = floor(gl_FragCoord.xy);
  vec3 sharp = texelFetch(uAccum, ivec2(pix), 0).rgb;
  vec3 rgb = mix(sharp, gather(pix, r), smoothstep(1.0, 1.5, r));
  vec3 past = texelFetch(uHistory, ivec2(pix), 0).rgb;
  fragColor = vec4(mix(rgb, past, uKeep * t), 1.0);
}`),I=null;he&&F&&(I=a.createProgram(),a.attachShader(I,he),a.attachShader(I,F),a.bindAttribLocation(I,0,`aPos`),a.linkProgram(I),a.getProgramParameter(I,a.LINK_STATUS)||(I=null));let xe=(e,t,n,r)=>{let i=t=>a.getUniformLocation(e,t);a.uniform2f(i(`uGaze`),t.x,t.y),a.uniform4f(i(`uFovea`),t.fovea,t.falloff,t.period,t.block),a.uniform1f(i(`uRefine`),t.refine),a.uniform1f(i(`uCellMax`),t.cellMax??2**(t.block||0)),a.uniform1f(i(`uTanHalf`),Math.tan((n.fov||70)*Math.PI/360)),a.uniform1f(i(`uView`),n.aspect||1),r!==void 0&&a.uniform1f(i(`uFull`),+!!r)},Se=(e=>{a.activeTexture(a.TEXTURE0);let t=a.createTexture();return a.bindTexture(a.TEXTURE_2D,t),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,e),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,e),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),{tex:t,fbo:a.createFramebuffer(),w:0,h:0}})(a.LINEAR),Ce=0,we=0,Ee=!0,De=null,Oe=()=>{if(!De)return!1;let e=a.clientWaitSync(De,0,0);return e===a.ALREADY_SIGNALED||e===a.CONDITION_SATISFIED?(a.deleteSync(De),De=null,!1):!0},ke=()=>{De&&a.deleteSync(De),De=a.fenceSync(a.SYNC_GPU_COMMANDS_COMPLETE,0),a.flush()},Ae=(t,n,r,i=null)=>{ar.fill(0),or.fill(0),ur.fill(0),dr.fill(0),fr.fill(0),pr.fill(0),mr.fill(0);let o=0,s=0,c=0,l=0,u=e=>{l>=$n||(cr[l]=e,l+=1)};for(let e of t.objects)if(e.type===`sphere`&&o<Qn){let t=o*4;ar[t]=e.origin[0],ar[t+1]=e.origin[1],ar[t+2]=e.origin[2],ar[t+3]=e.radius,or[t]=e.color[0],or[t+1]=e.color[1],or[t+2]=e.color[2],or[t+3]=(e.texture?0:wn[e.tile]||0)+(e.reflectivity||0),e.texture?o<32&&(X.set(J(o),o*4),ce[o]!==e.texture&&(Y(Z,o,e.texture),ce[o]=e.texture,le=!0)):o<32&&(X[o*4+3]=0),o+=1}else if(e.type===`box`&&s<tr){let t=s*4;ur.set(e.min,t),dr.set(e.max,t),fr.set(e.color,t),fr[t+3]=e.reflectivity||0,s+=1}else if(e.type===`shape`)u(e);else if(e.type===`crust`&&e.field){let t=/* @__PURE__ */ new Map;for(let[n,r]of e.field.overrides){if(r<=0)continue;let[e,i,a]=n.split(`,`).map(Number),o=a*nn,s=`${e},${i}`,c=t.get(s);(c===void 0||o<c)&&t.set(s,o)}for(let[e,n]of t){if(c>=nr)break;let[t,r]=e.split(`,`).map(Number),i=c*4;pr[i]=t,pr[i+1]=r,pr[i+2]=n,pr[i+3]=1,c+=1}}let d=t.shapes||[];for(let e=0;e<d.length;e++)u(d[e]);let p=0;for(let e=0;e<l;e++){let t=cr[e];t&&(t.kind===`plane`||t.kind===`disk`&&(t.r||0)>30)&&(e!==p&&(cr[e]=cr[p],cr[p]=t),p+=1)}Vn(l);let T=Fe(cr,l),D=Mt(t.camera),A=t.prints||[],j=Math.min(A.length,ir);for(let e=0;e<j;e+=1){let t=A[A.length-j+e];mr[e*4]=t.x,mr[e*4+1]=t.y,mr[e*4+2]=t.yaw||0,mr[e*4+3]=t.scale||0}let fe=t.miss||[.45,.62,.85,1],pe=t.sun||[0,0,1],me=n!==`points`&&!!m&&!!b&&o>64&&Te(ar,o),he=n===`points`&&O?O:me?m:f,M=e=>a.getUniformLocation(he,e);a.useProgram(he),a.viewport(0,0,k?k.w:e.width,k?k.h:e.height),E(0,g,Qn,ar),E(1,_,Qn,or),E(2,x,tr,ur),E(3,te,tr,dr),E(4,ne,tr,fr),E(5,re,nr,pr),E(8,ie,ir,mr);let N=t.track,ge=0,_e=0;N&&N.samples&&N.samples.length>=16&&(ge=Math.min(160,N.count|0,N.samples.length>>2),_e=N.half||0,S.fill(0),S.set(N.samples.subarray(0,ge*4))),a.activeTexture(a.TEXTURE10),a.bindTexture(a.TEXTURE_2D,ae),a.texSubImage2D(a.TEXTURE_2D,0,0,0,160,1,a.RGBA,a.FLOAT,S);let P=t.wear;if(P&&P.version!==C&&(C=P.version,hr.set(P.grid),a.activeTexture(a.TEXTURE13),a.bindTexture(a.TEXTURE_2D,oe),a.pixelStorei(a.UNPACK_ALIGNMENT,1),a.texSubImage2D(a.TEXTURE_2D,0,0,0,128,128,a.RED,a.UNSIGNED_BYTE,hr)),E(6,w,gr,X),a.activeTexture(a.TEXTURE7),a.bindTexture(a.TEXTURE_2D,se),le&&=(a.texSubImage2D(a.TEXTURE_2D,0,0,0,Cn,Cn,a.RGBA,a.UNSIGNED_BYTE,Z),a.generateMipmap(a.TEXTURE_2D),!1),a.uniform1i(M(`uSphereTex`),0),a.uniform1i(M(`uSphereColor`),1),a.uniform1i(M(`uBoxMin`),2),a.uniform1i(M(`uBoxMax`),3),a.uniform1i(M(`uBoxColor`),4),a.uniform1i(M(`uDigTex`),5),a.uniform1i(M(`uPrintTex`),8),a.uniform1i(M(`uTrackTex`),10),a.uniform1i(M(`uTrackCount`),ge),a.uniform1f(M(`uTrackHalf`),_e),a.uniform1i(M(`uTexRects`),6),a.uniform1i(M(`uAtlas`),7),a.activeTexture(a.TEXTURE14),a.bindTexture(a.TEXTURE_2D,v),a.texSubImage2D(a.TEXTURE_2D,0,0,0,$n,4,a.RGBA,a.FLOAT,sr),a.uniform1i(M(`uShapes`),14),a.uniform1i(M(`uShapeCount`),l),a.uniform1i(M(`uLooseShapes`),p),a.activeTexture(a.TEXTURE12),a.bindTexture(a.TEXTURE_2D,y),T>0&&a.texSubImage2D(a.TEXTURE_2D,0,0,0,4,T,a.RGBA,a.FLOAT,Et),a.uniform1i(M(`uShapeNodes`),12),a.uniform1i(M(`uShapeNodeCount`),T),a.activeTexture(a.TEXTURE9),a.bindTexture(a.TEXTURE_2D,ee),a.texSubImage2D(a.TEXTURE_2D,0,0,0,$n,1,a.RGBA,a.FLOAT,Dt),a.uniform1i(M(`uShapeIndex`),9),me){a.activeTexture(a.TEXTURE15),a.bindTexture(a.TEXTURE_2D,b),a.texSubImage2D(a.TEXTURE_2D,0,0,0,4,be(),a.RGBA,a.FLOAT,B);let e=M(`uNodes`);e&&a.uniform1i(e,15)}a.activeTexture(a.TEXTURE13),a.bindTexture(a.TEXTURE_2D,oe),a.uniform1i(M(`uWearTex`),13),a.uniform3f(M(`uWear`),P?P.origin[0]:0,P?P.origin[1]:0,P?P.cell:0),a.uniform3f(M(`uOrigin`),t.camera.origin[0],t.camera.origin[1],t.camera.origin[2]),a.uniform3f(M(`uForward`),D.forward[0],D.forward[1],D.forward[2]),a.uniform3f(M(`uRight`),D.right[0],D.right[1],D.right[2]),a.uniform3f(M(`uUp`),D.up[0],D.up[1],D.up[2]),a.uniform3f(M(`uSun`),pe[0],pe[1],pe[2]),a.uniform4f(M(`uMiss`),fe[0],fe[1],fe[2],fe[3]),a.uniform1f(M(`uFov`),t.camera.fov),a.uniform1f(M(`uAspect`),t.camera.aspect),a.uniform1f(M(`uPlane`),t.camera.planeDistance);let ve=k?k.w:e.width,ye=k?k.h:e.height;a.uniform2f(M(`uRes`),ve,ye),a.uniform1i(M(`uSpheres`),o),a.uniform1i(M(`uBoxes`),s),a.uniform1i(M(`uDigs`),c),a.uniform1i(M(`uPrints`),j),a.uniform1f(M(`uRain`),t.rain||0),a.uniform1f(M(`uFog`),1),a.uniform4f(M(`uFog0`),70,96,18,2.2),a.uniform4f(M(`uFog1`),-155,-55,40,10),a.uniform4f(M(`uFog2`),36,-96,22,.8);let F=t.work;a.uniform4f(M(`uWork`),F?F.x:0,F?F.y:0,F?F.height:0,F?F.mode:0),a.uniform1f(M(`uTime`),t.time||0),a.uniform1f(M(`uFrame`),Ce),xe(he,i||{x:.5,y:.5,fovea:3.2,falloff:1,period:1,block:0,refine:0},t.camera,!i||Ee),a.uniform1f(M(`uExposure`),Gn(pe));let I=Math.tan((t.camera.fov||70)*Math.PI/360);if(a.uniform1f(M(`uFoot`),2*I/Math.max(2,ye)),he===O){let t=Math.max(0,Math.min(r|0,ue.length/2)),n=Math.max(1,e.width),i=Math.max(1,e.height);for(let e=0;e<t;e+=1)ue[e*2]=(Math.random()*(n-1)+.5)/n,ue[e*2+1]=(Math.random()*(i-1)+.5)/i;return a.bindBuffer(a.ARRAY_BUFFER,de),a.bufferData(a.ARRAY_BUFFER,ue.subarray(0,t*2),a.DYNAMIC_DRAW),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.drawArrays(a.POINTS,0,t),!0}return a.bindBuffer(a.ARRAY_BUFFER,h),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.drawArrays(a.TRIANGLES,0,3),!0};return{paint(t,n,r){let i=n|0,o=r|0,s=Math.max(2,i>0?i:Math.min(e.width||160,480)),c=Math.max(2,o>0?o:Math.min(e.height||90,270)),l=()=>(k=null,a.bindFramebuffer(a.FRAMEBUFFER,null),a.disable(a.BLEND),Ae(t,`full`,0,null));if(!N||!I)return l();let u=0;for(let e=0;e<A.length;e+=1)if(e!==j&&e!==fe){u=e;break}let d=A[u],f=Se.w===s&&Se.h===c;if(!pe(Se,s,c)||!pe(d,s,c))return l();f||(Ee=!0);let p=t.fovea||{x:.5,y:.5,fovea:3.2,falloff:1,period:1,block:0,still:!1};we=p.still?we+1:0;let m={...p,refine:we/Math.max(1,p.period),cellMax:Yn(s,p.block)};me(),a.disable(a.BLEND),a.bindFramebuffer(a.FRAMEBUFFER,Se.fbo),k={w:s,h:c};let g=Ee,_=Ae(t,`full`,0,m);if(Ee=!1,Ce=(Ce+1)%3600,!_)return k=null,a.bindFramebuffer(a.FRAMEBUFFER,null),!1;a.bindFramebuffer(a.FRAMEBUFFER,d.fbo),a.viewport(0,0,s,c),a.useProgram(I),xe(I,m,t.camera),a.activeTexture(a.TEXTURE11),a.bindTexture(a.TEXTURE_2D,Se.tex),a.uniform1i(a.getUniformLocation(I,`uAccum`),11);let v=j>=0&&A[j]!==d?A[j]:Se;return a.activeTexture(a.TEXTURE12),a.bindTexture(a.TEXTURE_2D,v.tex),a.uniform1i(a.getUniformLocation(I,`uHistory`),12),a.uniform1f(a.getUniformLocation(I,`uJitter`),Ce%64),a.uniform1f(a.getUniformLocation(I,`uKeep`),Jn(p.still,v!==Se&&v.w===s&&v.h===c&&!g)),a.bindBuffer(a.ARRAY_BUFFER,h),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.drawArrays(a.TRIANGLES,0,3),a.activeTexture(a.TEXTURE11),a.bindTexture(a.TEXTURE_2D,null),a.activeTexture(a.TEXTURE12),a.bindTexture(a.TEXTURE_2D,null),k=null,a.bindFramebuffer(a.FRAMEBUFFER,null),j>=0&&(fe=j),j=u,!0},invalidate(){Ee=!0},setSmoothing(e){ye=!!e},present(t=1){if(!N||j<0)return!1;let n=A[fe>=0?fe:j],r=A[j],i=fe<0?1:Math.max(0,Math.min(1,t));return a.bindFramebuffer(a.FRAMEBUFFER,null),a.viewport(0,0,e.width,e.height),a.useProgram(N),a.activeTexture(a.TEXTURE9),a.bindTexture(a.TEXTURE_2D,n.tex),a.uniform1i(ge,9),a.activeTexture(a.TEXTURE10),a.bindTexture(a.TEXTURE_2D,r.tex),a.uniform1i(_e,10),a.uniform1f(P,i),a.uniform1f(ve,+!!ye),a.bindBuffer(a.ARRAY_BUFFER,h),a.enableVertexAttribArray(0),a.vertexAttribPointer(0,2,a.FLOAT,!1,0,0),a.drawArrays(a.TRIANGLES,0,3),me(),ke(),!0},busy(){return Oe()},paintRandom(e,t){return O?Ae(e,`points`,t):Ae(e,`full`,0)}}}var Qn,$n,er,tr,nr,rr,ir,ar,or,sr,cr,lr,ur,dr,fr,pr,mr,hr,gr,X,Z,_r,vr,yr,br,xr=t((()=>{tn(),kt(),rn(),zn(),Qn=384,$n=512,er=80,tr=32,nr=512,rr=nn.toFixed(4),ir=48,ar=new Float32Array(Qn*4),or=new Float32Array(Qn*4),sr=new Float32Array($n*16),cr=Array($n),lr={plane:1,disk:2,box:3,capsule:4,cylinder:5,triangle:6},ur=/* @__PURE__ */ new Float32Array(128),dr=/* @__PURE__ */ new Float32Array(128),fr=/* @__PURE__ */ new Float32Array(128),pr=new Float32Array(nr*4),mr=/* @__PURE__ */ new Float32Array(192),hr=/* @__PURE__ */ new Uint8Array(16384),gr=48,X=/* @__PURE__ */ new Float32Array(192),Z=new Uint8Array(Cn*Cn*4),_r=.3,vr=.45,yr=`
uniform vec2 uGaze;
uniform vec4 uFovea;
uniform float uRefine;
uniform float uTanHalf;
uniform float uView;
vec3 camDir(vec2 uv) {
  return normalize(vec3((uv.x * 2.0 - 1.0) * uView * uTanHalf, (1.0 - uv.y * 2.0) * uTanHalf, 1.0));
}
float fovT(vec2 uv) {
  // A circle on the screen: the gaze-to-pixel offset on the image plane, read as an angle.
  // Matches the true angle at the gaze; away from it the sharp area stays round, not stretched.
  vec2 d = (uv - uGaze) * 2.0 * vec2(uView, 1.0) * uTanHalf;
  float a = atan(length(d));
  return smoothstep(uFovea.x, uFovea.x + uFovea.y, a);
}
float fovPeriod(float t) {
  return 1.0 + (max(1.0, uFovea.z) - 1.0) * t;
}
uniform float uCellMax;
// Continuous per-pixel blur radius in pixels: 1 at the gaze, 2^block in the far periphery,
// shrinking smoothly as the still view refines, capped at uCellMax (the low-trace-scale floor).
float fovRadius(float t) {
  return clamp(exp2(uFovea.w * t - uRefine), 1.0, max(1.0, uCellMax));
}
float fovLevel(float t) {
  return log2(fovRadius(t));
}
// Interleaved gradient noise (Jimenez 2014): a blue-ish per-pixel threshold with no lattice.
float ign(vec2 p) {
  return fract(52.9829189 * fract(dot(p, vec2(0.06711056, 0.00583715))));
}
// Share of frames on which this pixel is traced: one sample per r*r pixels, every period frames.
float fovDensity(float t) {
  float r = fovRadius(t);
  return 1.0 / (r * r * fovPeriod(t));
}
`,br=.6})),Sr=/* @__PURE__ */ n({createLitePainter:()=>wr});function Cr(e,t,n){let r=e.createShader(t);if(!r)return null;if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r)||`shader`;throw e.deleteShader(r),Error(t)}return r}function wr(e){let t=e.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`});if(!t)return null;let n=Cr(t,t.VERTEX_SHADER,Tr),r=Cr(t,t.FRAGMENT_SHADER,Er),i=t.createProgram();if(!n||!r||!i||(t.attachShader(i,n),t.attachShader(i,r),t.bindAttribLocation(i,0,`a`),t.linkProgram(i),!t.getProgramParameter(i,t.LINK_STATUS)))return null;let a=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,a),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),t.STATIC_DRAW);let o=/* @__PURE__ */ new Float32Array(256),s=/* @__PURE__ */ new Float32Array(48),c=/* @__PURE__ */ new Float32Array(36),l=/* @__PURE__ */ new Float32Array(12),d=/* @__PURE__ */ new Float32Array(48),f=/* @__PURE__ */ new Float32Array(160),p=/* @__PURE__ */ new Float32Array(16),m=/* @__PURE__ */ new Float32Array(64),h=/* @__PURE__ */ new Float32Array(16),g=new Uint8Array(kr*Ar*4);for(let e=0;e<g.length;e+=4)g[e]=214,g[e+1]=170,g[e+2]=132,g[e+3]=255;let _=t.createTexture();t.bindTexture(t.TEXTURE_2D,_),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,kr,Ar,0,t.RGBA,t.UNSIGNED_BYTE,g);let v=/* @__PURE__ */ new Map,y=/* @__PURE__ */ new Map,b=0,te=!1,re=``,ae=8,S=e=>t.getUniformLocation(i,e),oe=e=>{e&&e!==re&&(ee(e),re=e);let t=ne(64);o.fill(0);let n=Math.min(64,t.length/4);for(let e=0;e<n;e++){let r=(e+1)%n;o[e*4]=t[e*4],o[e*4+1]=t[e*4+1],o[e*4+2]=t[r*4],o[e*4+3]=t[r*4+1]}ae=x(),p.fill(0);for(let e=0;e<4;e++){let t=ie(e);p[e*4]=t.x,p[e*4+1]=t.y}};oe();let C=t.createTexture(),w=t.createFramebuffer(),se=0,T=0;return C&&(t.bindTexture(t.TEXTURE_2D,C),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)),{setFace(e,t){let n=0,r=t.data;for(let e=0;e<r.length;e+=997)n=n+(r[e]??0)|0;if(y.get(e)===n)return;y.set(e,n);let i=v.get(e);i??(i=b%12,b+=1,v.set(e,i));let a=i%Or,o=i/Or|0;for(let e=0;e<Dr;e++)for(let n=0;n<Dr;n++){let i=Math.min(t.width-1,(n+.5)*t.width/Dr)|0,s=((Math.min(t.height-1,(e+.5)*t.height/Dr)|0)*t.width+i)*4,c=((o*Dr+e)*kr+(a*Dr+n))*4;g[c]=r[s]??0,g[c+1]=r[s+1]??0,g[c+2]=r[s+2]??0,g[c+3]=255}te=!0},paint(n,r){oe(n.course),te&&_&&(t.bindTexture(t.TEXTURE_2D,_),t.pixelStorei(t.UNPACK_FLIP_Y_WEBGL,!0),t.texSubImage2D(t.TEXTURE_2D,0,0,0,kr,Ar,t.RGBA,t.UNSIGNED_BYTE,g),te=!1);let y=Math.max(2,r?.w||e.width),ee=Math.max(2,r?.h||e.height),b=!!(C&&w)&&(y<e.width-8||ee<e.height-8);b&&C&&w?((y!==se||ee!==T)&&(se=y,T=ee,t.bindTexture(t.TEXTURE_2D,C),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,y,ee,0,t.RGBA,t.UNSIGNED_BYTE,null),t.bindFramebuffer(t.FRAMEBUFFER,w),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,C,0)),t.bindFramebuffer(t.FRAMEBUFFER,w),t.viewport(0,0,y,ee)):(t.bindFramebuffer(t.FRAMEBUFFER,null),t.viewport(0,0,e.width,e.height));let x=n.camera.dir,ne=x[1],re=-x[0],ie=Math.hypot(ne,re)||1,E=[ne/ie,re/ie,0],ce=[E[1]*x[2]-E[2]*x[1],E[2]*x[0]-E[0]*x[2],E[0]*x[1]-E[1]*x[0]];s.fill(0),c.fill(0),l.fill(0),d.fill(0);let le=Math.min(12,n.bodies.length);for(let e=0;e<le;e++){let t=n.bodies[e];s[e*4]=t.x,s[e*4+1]=t.y,s[e*4+2]=t.z??u(t.x,t.y)+.46,s[e*4+3]=t.yaw??0,c[e*3]=t.color[0],c[e*3+1]=t.color[1],c[e*3+2]=t.color[2],l[e]=v.get(t.seed??e)??0,d[e*4]=t.pitch??0,d[e*4+1]=t.roll??0,d[e*4+2]=t.flame??0}t.useProgram(i),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,_),t.bindBuffer(t.ARRAY_BUFFER,a),t.enableVertexAttribArray(0),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.uniform3f(S(`uCam`),n.camera.x,n.camera.y,n.camera.z),t.uniform3f(S(`uFwd`),x[0],x[1],x[2]),t.uniform3f(S(`uRight`),E[0],E[1],E[2]),t.uniform3f(S(`uUp`),ce[0],ce[1],ce[2]),t.uniform3f(S(`uSun`),n.sun[0],n.sun[1],n.sun[2]),t.uniform1f(S(`uFov`),68*Math.PI/180);let D=b?y:e.width,O=b?ee:e.height;t.uniform1f(S(`uAspect`),D/Math.max(1,O)),t.uniform1f(S(`uTime`),n.time??0),t.uniform1i(S(`uNext`),n.nextGate??0),t.uniform1f(S(`uRoad`),ae),t.uniform4fv(S(`uTrack`),o),t.uniform4fv(S(`uGate`),p),t.uniform4fv(S(`uPos`),s),t.uniform3fv(S(`uTint`),c),t.uniform1fv(S(`uSlot`),l);let ue=n.skids??[],de=Math.min(40,ue.length);f.fill(0);for(let e=0;e<de;e++){let t=ue[e];f[e*4]=t.x,f[e*4+1]=t.y,f[e*4+2]=t.x2,f[e*4+3]=t.y2}t.uniform4fv(S(`uLean`),d),t.uniform4fv(S(`uSkid`),f),t.uniform1i(S(`uSkids`),de);let k=n.rails??[],A=Math.min(16,k.length);m.fill(0),h.fill(0);for(let e=0;e<A;e++){let t=k[e];m[e*4]=t.x,m[e*4+1]=t.y,m[e*4+2]=t.x2,m[e*4+3]=t.y2,h[e]=t.hp}t.uniform4fv(S(`uRail`),m),t.uniform1fv(S(`uHp`),h),t.uniform1i(S(`uRails`),A),t.uniform1i(S(`uFace`),0),t.uniform1i(S(`uKarts`),le),t.drawArrays(t.TRIANGLES,0,3),b&&w&&(t.bindFramebuffer(t.READ_FRAMEBUFFER,w),t.bindFramebuffer(t.DRAW_FRAMEBUFFER,null),t.blitFramebuffer(0,0,y,ee,0,0,e.width,e.height,t.COLOR_BUFFER_BIT,t.LINEAR),t.bindFramebuffer(t.FRAMEBUFFER,null)),t.finish()}}}var Tr,Er,Dr,Or,kr,Ar,jr=t((()=>{h(),de(),Tr=`#version 300 es
in vec2 a;
out vec2 vUv;
void main() {
  vUv = a * 0.5 + 0.5;
  gl_Position = vec4(a, 0.0, 1.0);
}`,Er=`#version 300 es
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform vec3 uCam;
uniform vec3 uFwd;
uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uSun;
uniform float uFov;
uniform float uAspect;
uniform float uRoad;
uniform vec4 uTrack[64];
uniform vec4 uPos[12];
uniform vec3 uTint[12];
uniform float uSlot[12];
uniform vec4 uLean[12];
uniform vec4 uSkid[40];
uniform int uSkids;
uniform int uKarts;
uniform vec4 uGate[4];
uniform float uTime;
uniform int uNext;
uniform vec4 uRail[16];
uniform float uHp[16];
uniform int uRails;
uniform sampler2D uFace;

float heightAt(vec2 p) {
  float roll = 0.5 * sin(p.x * 0.15) + 0.5 * cos(p.y * 0.13);
  float wash = 0.5 * sin((p.x + p.y) * 0.17 + 1.3) + 0.5;
  float n = clamp(0.55 * roll + 0.45 * wash, 0.0, 1.0);
  float broad = 0.5 + 0.5 * sin(p.x * 0.021 + 0.6) * cos(p.y * 0.018);
  float h = n * n * 5.4 * (0.78 + 0.22 * broad);
  float marsh = exp(-((p.x - 36.0) * (p.x - 36.0) + (p.y + 96.0) * (p.y + 96.0)) / 2200.0);
  h *= 1.0 - marsh * 0.55;
  float ridge = exp(-(p.x + 24.0) * (p.x + 24.0) / 520.0) * max(0.0, cos(p.y * 0.02));
  h = clamp(h + ridge * 1.6, 0.0, 5.4);
  float d = length(p - vec2(-40.0, 160.0));
  float wobble = 0.92 + 0.08 * sin(p.x * 0.05 + 160.0) * cos(p.y * 0.04);
  float u = d / (104.0 * wobble);
  if (u < 1.0) {
    float s = 1.0 - u;
    h += 36.0 * s * s * (3.0 - 2.0 * s);
  }
  d = length(p - vec2(-155.0, -55.0));
  wobble = 0.92 + 0.08 * sin(p.x * 0.05 - 55.0) * cos(p.y * 0.04);
  u = d / (72.0 * wobble);
  if (u < 1.0) {
    float s = 1.0 - u;
    h += 30.0 * s * s * (3.0 - 2.0 * s);
  }
  if (d < 14.0) h -= (1.0 - d / 14.0) * 12.0;
  float r = length(p - vec2(70.0, 96.0));
  float rl = 14.0 * (0.94 + 0.06 * sin(p.x * 0.21));
  if (r < rl) {
    float q = r / max(rl, 0.01);
    h = 2.2 - 0.12 - 1.6 * (1.0 - q * q);
  }
  return max(-2.0, h);
}

float coneBound(vec2 a, vec2 b, vec2 c, float radius, float height) {
  vec2 ab = b - a;
  float span = max(dot(ab, ab), 0.0001);
  float u = clamp(dot(c - a, ab) / span, 0.0, 1.0);
  float dist = length(a + ab * u - c);
  float reach = radius * 0.92;
  if (dist >= reach) return 0.0;
  float s = 1.0 - dist / reach;
  return height * s * s * (3.0 - 2.0 * s);
}

float nearest(vec2 p) {
  float best = 200.0;
  for (int i = 0; i < 64; i++) {
    vec2 a = uTrack[i].xy;
    vec2 b = uTrack[i].zw;
    vec2 ab = b - a;
    float span = max(dot(ab, ab), 0.0001);
    float t = clamp(dot(p - a, ab) / span, 0.0, 1.0);
    best = min(best, length(p - (a + ab * t)));
  }
  return best;
}

void axes(float yaw, float pitch, float roll, out vec3 fwd, out vec3 right, out vec3 up) {
  float cp = cos(pitch);
  float sp = sin(pitch);
  float cr = cos(roll);
  float sr = sin(roll);
  float fx = sin(yaw);
  float fy = cos(yaw);
  fwd = vec3(fx * cp, fy * cp, sp);
  vec3 rx0 = vec3(cos(yaw), -sin(yaw), 0.0);
  vec3 up0 = vec3(-fx * sp, -fy * sp, cp);
  right = rx0 * cr + up0 * sr;
  up = up0 * cr - rx0 * sr;
}

vec3 placed(vec3 pos, vec3 fwd, vec3 right, vec3 up, vec3 local) {
  return pos + right * local.x + fwd * local.y + up * local.z;
}

vec3 wheelAt(vec3 pos, vec3 fwd, vec3 right, vec3 up, vec3 local) {
  vec3 w = placed(pos, fwd, right, up, local);
  if (up.z > 0.25) w.z = max(w.z, heightAt(w.xy) + 0.2);
  return w;
}

void ball(vec3 ro, vec3 rd, vec3 center, float radius, vec3 albedo, float faceSlot, vec3 fwd, vec3 sun, inout float best, inout vec3 rgb, inout bool hit) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float disc = b * b - c;
  if (disc <= 0.0) return;
  float t = -b - sqrt(disc);
  if (t <= 0.2 || t >= best) return;
  best = t;
  vec3 n = normalize(ro + rd * t - center);
  float light = 0.32 + 0.68 * max(dot(n, sun), 0.0);
  vec3 color = mix(albedo * 0.62, albedo, smoothstep(-0.2, 0.55, n.z)) * light;
  if (faceSlot >= 0.0) {
    vec3 side = vec3(fwd.y, -fwd.x, 0.0);
    float front = dot(n, fwd);
    if (front > 0.18) {
      float u = clamp(dot(n, side) * 1.25 + 0.5, 0.02, 0.98);
      float v = clamp(n.z * 1.2 + 0.4, 0.02, 0.98);
      float col = mod(faceSlot, 4.0);
      float row = floor(faceSlot / 4.0);
      vec2 uv = vec2((col + u) / 4.0, 1.0 - (row + (1.0 - v)) / 3.0);
      color = texture(uFace, uv).rgb * (0.62 + 0.5 * light);
    } else {
      color = vec3(0.18, 0.12, 0.09) * light;
    }
  }
  rgb = color;
  hit = true;
}

float capT(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float ra, out vec3 nrm) {
  nrm = vec3(0.0, 0.0, 1.0);
  vec3 ba = pb - pa;
  vec3 oa = ro - pa;
  float baba = dot(ba, ba);
  float bard = dot(ba, rd);
  float baoa = dot(ba, oa);
  float rdoa = dot(rd, oa);
  float oaoa = dot(oa, oa);
  float aa = baba - bard * bard;
  float bb = baba * rdoa - baoa * bard;
  float cc = baba * oaoa - baoa * baoa - ra * ra * baba;
  float h = bb * bb - aa * cc;
  float bestT = -1.0;
  if (h >= 0.0 && abs(aa) > 1.0e-4) {
    float t = (-bb - sqrt(h)) / aa;
    float y = baoa + t * bard;
    if (y > 0.0 && y < baba) {
      vec3 p = ro + rd * t;
      nrm = normalize(p - (pa + ba * (y / max(baba, 1.0e-4))));
      return t;
    }
  }
  vec3 capA = pa;
  vec3 oc = ro - capA;
  bb = dot(oc, rd);
  cc = dot(oc, oc) - ra * ra;
  h = bb * bb - cc;
  if (h > 0.0) {
    float t = -bb - sqrt(h);
    if (t > 0.0) {
      bestT = t;
      nrm = normalize(ro + rd * t - capA);
    }
  }
  oc = ro - pb;
  bb = dot(oc, rd);
  cc = dot(oc, oc) - ra * ra;
  h = bb * bb - cc;
  if (h > 0.0) {
    float t = -bb - sqrt(h);
    if (t > 0.0 && (bestT < 0.0 || t < bestT)) {
      bestT = t;
      nrm = normalize(ro + rd * t - pb);
    }
  }
  return bestT;
}

void beam(vec3 ro, vec3 rd, vec3 pa, vec3 pb, float ra, vec3 albedo, vec3 sun, inout float best, inout vec3 rgb, inout bool hit) {
  vec3 nrm;
  float t = capT(ro, rd, pa, pb, ra, nrm);
  if (t <= 0.2 || t >= best) return;
  best = t;
  float light = 0.34 + 0.66 * max(dot(nrm, sun), 0.0);
  rgb = albedo * light;
  hit = true;
}

void pillar(vec3 ro, vec3 rd, vec2 base, float tall, vec2 wind, vec3 albedo, vec3 sun, inout float best, inout vec3 rgb, inout bool hit) {
  float h0 = heightAt(base);
  vec3 prev = vec3(base, h0 + 0.12);
  for (int s = 0; s < 3; s++) {
    float f = float(s + 1) / 3.0;
    vec2 p = base + wind * (f * f);
    vec3 cur = vec3(p, h0 + tall * f);
    float pulse = 0.94 + 0.06 * sin(uTime * 2.6 + f * 5.0 + base.x);
    beam(ro, rd, prev, cur, (0.46 - f * 0.08) * pulse, albedo, sun, best, rgb, hit);
    prev = cur;
  }
  ball(ro, rd, prev + vec3(wind * 0.08, 0.32), 0.52, albedo, -1.0, vec3(0.0, 1.0, 0.0), sun, best, rgb, hit);
}

void main() {
  vec2 ndc = vUv * 2.0 - 1.0;
  float tanHalf = tan(uFov * 0.5);
  vec3 rd = normalize(uFwd + uRight * (ndc.x * tanHalf * uAspect) + uUp * (ndc.y * tanHalf));
  vec3 sun = normalize(uSun);
  float best = 8000.0;
  vec3 rgb = vec3(0.0);
  bool hit = false;
  for (int i = 0; i < 12; i++) {
    if (i >= uKarts) break;
    vec3 pos = uPos[i].xyz;
    float yaw = uPos[i].w;
    vec3 fwd;
    vec3 side;
    vec3 up;
    axes(yaw, uLean[i].x, uLean[i].y, fwd, side, up);
    vec3 tint = uTint[i];
    vec3 dark = tint * 0.38;
    vec3 wheel = vec3(0.07, 0.07, 0.08);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, 0.0, 0.05)), 0.46, tint, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, 0.72, 0.08)), 0.24, tint, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, -0.48, 0.02)), 0.2, dark, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, -0.02, 0.52)), 0.36, vec3(0.86, 0.72, 0.58), uSlot[i], fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(0.46, 0.5, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(-0.46, 0.5, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(0.46, -0.42, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    ball(uCam, rd, wheelAt(pos, fwd, side, up, vec3(-0.46, -0.42, -0.28)), 0.2, wheel, -1.0, fwd, sun, best, rgb, hit);
    if (uLean[i].z > 0.5) {
      ball(uCam, rd, placed(pos, fwd, side, up, vec3(0.0, -0.85, 0.02)), 0.16, vec3(1.0, 0.45, 0.08), -1.0, fwd, sun, best, rgb, hit);
    }
  }
  for (int g = 0; g < 4; g++) {
    vec2 base = uGate[g].xy;
    float gust = 0.65 + 0.35 * sin(uTime * 1.7 + float(g) * 1.3);
    vec2 wind = vec2(sin(uTime * 0.37), cos(uTime * 0.29 + 1.2)) * gust;
    bool next = g == uNext;
    float lean = next ? 0.95 : 0.72;
    vec3 cloth = next ? vec3(0.98, 0.82, 0.16) : vec3(0.92, 0.32, 0.16);
    pillar(uCam, rd, base, next ? 4.6 : 3.3, wind * lean, cloth, sun, best, rgb, hit);
  }
  for (int i = 0; i < 16; i++) {
    if (i >= uRails) break;
    float hp = uHp[i];
    if (hp < 0.12) continue;
    vec2 a = uRail[i].xy;
    vec2 b = uRail[i].zw;
    vec2 mid = (a + b) * 0.5;
    vec2 toMid = mid - uCam.xy;
    if (dot(toMid, uFwd.xy) < -6.0 && length(toMid) > 14.0) continue;
    if (length(toMid) > 120.0) continue;
    float ha = heightAt(a);
    float hb = heightAt(b);
    float sag = (1.0 - hp) * 0.7;
    float rad = 0.2 + 0.12 * hp;
    float hurt = 1.0 - hp;
    vec3 steel = mix(vec3(0.82, 0.84, 0.8), vec3(0.4, 0.18, 0.1), hurt);
    vec3 band = mix(vec3(0.95, 0.93, 0.88), vec3(0.28, 0.16, 0.12), hurt);
    if (mod(float(i), 2.0) < 0.5) band = mix(vec3(0.9, 0.2, 0.12), vec3(0.32, 0.1, 0.08), hurt);
    beam(uCam, rd, vec3(a, ha + 0.48 - sag), vec3(b, hb + 0.48 - sag), rad, steel, sun, best, rgb, hit);
    beam(uCam, rd, vec3(a, ha + 1.02 - sag), vec3(b, hb + 1.02 - sag), rad * 0.85, band, sun, best, rgb, hit);
  }
  float prevT = 0.3;
  float t = 0.3;
  float ground = -1.0;
  for (int i = 0; i < 80; i++) {
    vec3 a = uCam + rd * t;
    float clearance = a.z - heightAt(a.xy);
    float stride = t < 130.0 ? min(3.6, 0.45 + t * 0.024) : min(88.0, 4.2 + (t - 130.0) * 0.1);
    if (clearance > 18.0 && t > 40.0) stride = max(stride, min(72.0, clearance * 0.85));
    float nextT = min(t + stride, 8000.0);
    vec3 b = uCam + rd * nextT;
    float cones = coneBound(a.xy, b.xy, vec2(-40.0, 160.0), 104.0, 36.0);
    cones = max(cones, coneBound(a.xy, b.xy, vec2(-155.0, -55.0), 72.0, 30.0));
    if (cones > 0.5 && min(a.z, b.z) < cones + 2.0 && stride > 3.2) {
      nextT = min(t + max(1.3, min(6.0, stride * 0.28)), 8000.0);
      b = uCam + rd * nextT;
    }
    if (b.z <= heightAt(b.xy)) {
      prevT = t;
      ground = nextT;
      break;
    }
    if (rd.z >= 0.0 && b.z > 48.0 && t > 12.0) break;
    prevT = t;
    t = nextT;
    if (t >= 8000.0) break;
  }
  if (ground > 0.0 && ground < best) {
    float lo = prevT;
    float hi = ground;
    for (int i = 0; i < 8; i++) {
      float mid = 0.5 * (lo + hi);
      vec3 p = uCam + rd * mid;
      if (p.z < heightAt(p.xy)) hi = mid;
      else lo = mid;
    }
    vec3 p = uCam + rd * hi;
    float h = heightAt(p.xy);
    float road = nearest(p.xy);
    vec3 n = normalize(vec3(heightAt(p.xy + vec2(1.15, 0.0)) - h, heightAt(p.xy + vec2(0.0, 1.15)) - h, 1.15));
    float light = 0.42 + 0.58 * max(dot(n, sun), 0.0);
    vec3 sand = vec3(0.62, 0.48, 0.22);
    vec3 grass = vec3(0.28, 0.38, 0.18);
    vec3 rock = vec3(0.42, 0.36, 0.30);
    vec3 albedo = mix(grass, sand, smoothstep(1.2, 4.5, h));
    if (h > 12.0) albedo = mix(albedo, rock, smoothstep(12.0, 24.0, h));
    if (length(p.xy - vec2(70.0, 96.0)) < 14.0 && h < 2.4) albedo = vec3(0.15, 0.32, 0.38);
    if (road < uRoad) {
      vec3 asphalt = vec3(0.15, 0.15, 0.16);
      albedo = asphalt;
      if (road < 0.18) albedo = vec3(0.86, 0.74, 0.22);
      if (road > uRoad - 0.55) albedo = mix(vec3(0.92, 0.92, 0.88), vec3(0.78, 0.16, 0.11), step(0.5, fract((p.x + p.y) * 0.35)));
    } else {
      albedo *= 0.94 + 0.06 * sin(p.x * 0.7) * cos(p.y * 0.6);
    }
    for (int g = 0; g < 4; g++) {
      float d = length(p.xy - uGate[g].xy);
      float ring = 1.0 - smoothstep(0.05, 0.28, abs(d - 1.85));
      if (ring > 0.0) {
        vec3 mark = g == uNext ? vec3(0.98, 0.82, 0.18) : vec3(0.86, 0.28, 0.12);
        albedo = mix(albedo, mark, ring * (g == uNext ? 0.92 : 0.55));
      }
    }
    float shade = 1.0;
    for (int i = 0; i < 12; i++) {
      if (i >= uKarts) break;
      float drop = max(0.0, uPos[i].z - h);
      float d = length(p.xy - uPos[i].xy);
      shade *= 1.0 - (1.0 - smoothstep(0.35, 1.5 + drop * 0.45, d)) * (0.42 / (1.0 + drop * 0.25));
    }
    albedo *= shade;
    float rubber = 0.0;
    for (int i = 0; i < 40; i++) {
      if (i >= uSkids) break;
      vec2 a = uSkid[i].xy;
      vec2 b = uSkid[i].zw;
      vec2 ab = b - a;
      float span = max(dot(ab, ab), 0.0001);
      float u = clamp(dot(p.xy - a, ab) / span, 0.0, 1.0);
      rubber = max(rubber, 1.0 - smoothstep(0.08, 0.62, length(p.xy - (a + ab * u))));
    }
    albedo = mix(albedo, vec3(0.02, 0.02, 0.025), rubber * 0.94);
    float fog = 1.0 - exp(-hi * 0.00012);
    rgb = mix(albedo * light, vec3(0.62, 0.72, 0.82), fog);
    hit = true;
  }
  if (!hit) {
    float up = clamp(rd.z * 0.9 + 0.15, 0.0, 1.0);
    rgb = mix(vec3(0.86, 0.72, 0.48), vec3(0.42, 0.62, 0.86), up);
    rgb += vec3(1.0, 0.92, 0.7) * pow(max(dot(rd, sun), 0.0), 48.0);
  }
  fragColor = vec4(rgb, 1.0);
}`,Dr=64,Or=4,kr=256,Ar=192})),Mr=/* @__PURE__ */ n({paintFrame:()=>Nr,paintRows:()=>Pr});function Nr(e,t,n,r){return Ce(e.objects,()=>Fr(e,t,n,r,0,n))}function Pr(e,t,n,r,i,a){return Ce(e.objects,()=>Fr(e,t,n,a,r,i))}function Fr(e,t,n,r,i,a){let o=r??new Uint8ClampedArray(t*n*4),s=e.miss||[0,0,0,1],c=Math.min(n,a);for(let r=i;r<c;r++){let i=(r+.5)/n,a=r*t*4;for(let n=0;n<t;n++){let r=Nt((n+.5)/t,i,e.camera),c=Ir(e,Xt(e.camera.origin,r,e.objects,s),s,r);o[a++]=c[0]*255,o[a++]=c[1]*255,o[a++]=c[2]*255,o[a++]=c[3]*255}}return o}function Ir(e,t,n,r){let i=t.color||n;if(e.sun&&t.object&&t.point){let r=Xt([t.point[0]+e.sun[0]*.08,t.point[1]+e.sun[1]*.08,t.point[2]+e.sun[2]*.08],e.sun,e.objects,n);r.object&&r.t<=80&&(i=[i[0]*.45,i[1]*.45,i[2]*.45,i[3]])}let a=Math.min(1,Math.max(0,t.object?.reflectivity||0));if(a<=0||!r||!t.point)return i;let o=t.normal?t.normal:t.object.type===`sphere`?[t.point[0]-t.object.origin[0],t.point[1]-t.object.origin[1],t.point[2]-t.object.origin[2]]:[0,0,1],s=Math.hypot(o[0],o[1],o[2])||1,c=[o[0]/s,o[1]/s,o[2]/s],l=r[0]*c[0]+r[1]*c[1]+r[2]*c[2],u=[r[0]-2*l*c[0],r[1]-2*l*c[1],r[2]-2*l*c[2]],d=$t([t.point[0]+c[0]*.05,t.point[1]+c[1]*.05,t.point[2]+c[2]*.05],u,e.objects,n,3),f=1-a;return[i[0]*f+d[0]*a,i[1]*f+d[1]*a,i[2]*f+d[2]*a,i[3]??1]}var Lr=t((()=>{tn()}));let Rr=self,Q=null,zr=null,Br=null,Vr=null,Hr=null,Ur=`discrete`,Wr,Gr=960,Kr=540,$=1,qr=!1,Jr=!1,Yr=!1,Xr=null,Zr=/* @__PURE__ */ new Map,Qr=NaN,$r=null;function ei(e){if(e===Qr&&$r)return $r;let t=Zr.get(e);return t||(t=o(e),Zr.set(e,t)),t}function ti(){if($>.97)return{w:Gr,h:Kr};let e=Math.max(160,Math.min(Gr,Math.round(Gr*$/8)*8));return{w:e,h:Math.max(90,Math.min(Kr,Math.round(e*Kr/Math.max(1,Gr)/8)*8))}}function ni(e){e>34?$=Math.max(.2,$*.55):e>22?$=Math.max(.2,$*.72):e>17?$=Math.max(.2,$*.86):e<8?$=Math.min(1,$*1.35):e<12?$=Math.min(1,$*1.18):e<15&&($=Math.min(1,$*1.06))}function ri(e){if(!Q)return;qr=!1;let t=ti();if(Br){for(let t of e.bodies){let e=t.seed===Qr&&$r?$r:ei(t.seed);Br.setFace?.(t.seed,e)}let n=performance.now();Br.paint(e,t),ni(performance.now()-n);let r=Q.transferToImageBitmap();Rr.postMessage({type:`bitmap`,bitmap:r},[r]);return}let n=Ur===`software`?Math.max(80,Math.min(192,t.w)):t.w,r=Ur===`software`?Math.max(48,Math.round(n*Kr/Math.max(1,Gr)/2)*2):t.h,i=ge(e.bodies.map(e=>({x:e.x,y:e.y,z:e.z,yaw:e.yaw,pitch:e.pitch,roll:e.roll,flame:e.flame,color:e.color,name:e.name,face:ei(e.seed)})),e.camera,n,r,e.still,e.sun,e.rain,e.rails??[],e.time??0,e.nextGate??0),a=performance.now();if(zr){let e=zr.paint(i,n,r);e&&zr.present(1),ni(performance.now()-a),Rr.postMessage({type:`painted`,ms:performance.now()-a,ok:e});let t=Q.transferToImageBitmap();Rr.postMessage({type:`bitmap`,bitmap:t},[t]);return}if(!Vr||!Hr)return;let o=Vr.paintFrame(i,n,r),s=new ImageData(new Uint8ClampedArray(o),n,r),c=new OffscreenCanvas(n,r);c.getContext(`2d`)?.putImageData(s,0,0),Hr.imageSmoothingEnabled=!0,Hr.drawImage(c,0,0,Q.width,Q.height),ni(performance.now()-a);let l=Q.transferToImageBitmap();Rr.postMessage({type:`bitmap`,bitmap:l,ms:performance.now()-a},[l])}async function ii(){Q&&Ur===`discrete`&&(zr=(await Promise.resolve().then(()=>(xr(),Bn))).createGpuPainter(Q,Wr),zr?.setSmoothing?.(!0))}async function ai(){if(!Q)return;if(Ur===`discrete`){await ii();return}let{createLitePainter:e}=await Promise.resolve().then(()=>(jr(),Sr));try{Br=e(Q)}catch(e){Br=null,console.error(e)}Br||(Vr=await Promise.resolve().then(()=>(Lr(),Mr)),Hr=Q.getContext(`2d`))}Rr.onmessage=e=>{let t=e.data;if(t.cmd===`stop`)Rr.close();else if(t.cmd===`init`)Ur=t.mode||`discrete`,Wr=t.tune,Gr=t.viewW||Gr,Kr=t.viewH||Kr,$=1,Q=new OffscreenCanvas(Gr,Kr),(async()=>{try{Ur===`discrete`?await ii():await ai(),Jr=!0,Rr.postMessage({type:`ready`,ok:!!(zr||Br||Hr)})}catch(e){Rr.postMessage({type:`ready`,ok:!1,reason:e instanceof Error?e.message:`picture failed`})}})();else if(t.cmd===`face`&&t.data&&t.seed!=null&&t.width&&t.height)Qr=t.seed,$r={width:t.width,height:t.height,data:new Uint8Array(t.data),url:``};else if(t.cmd===`resize`&&t.viewW&&t.viewH){if(Math.abs(t.viewW-Gr)<48&&Math.abs(t.viewH-Kr)<48||(Gr=t.viewW,Kr=t.viewH,!Q))return;Q.width=Gr,Q.height=Kr,zr=null,Br=null,Ur===`discrete`?ii():ai()}else if(t.cmd===`frame`&&t.bodies&&t.camera&&t.sun){let e={cmd:`frame`,bodies:t.bodies,camera:t.camera,still:!!t.still,rain:t.rain||0,sun:t.sun,course:t.course,skids:t.skids,rails:t.rails,time:t.time,nextGate:t.nextGate};if(!Jr){Xr=e;return}if(Yr){Xr=e,qr||=($=Math.max(.2,$*.85),!0);return}Yr=!0;try{ri(e)}finally{Yr=!1;let e=Xr;if(Xr=null,e){Yr=!0;try{ri(e)}finally{Yr=!1}}}}}})();