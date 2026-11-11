import{a as e,c as t,d as n,f as r,o as i,p as a,s as o,t as s,u as c}from"./cast-DhpX1blS.js";var l=.25,u=1024;u/128;var d={sand:32,wood:33,grass:34,rock:35,cloth:36,skin:37,bark:38,hide:39,horn:40,feather:41,metal:42,leaf:43,scale:44,hair:45};function f(e,t,n){let r=new Uint8Array(e*t*4);for(let i=0;i<t;i++)for(let a=0;a<e;a++){let o=n(a,i,e,t),s=(i*e+a)*4;r[s]=o[0],r[s+1]=o[1],r[s+2]=o[2],r[s+3]=o.length>3?o[3]:255}return{width:e,height:t,data:r,revision:0}}function p(e,t){let n=Math.sin(e*127.1+t*311.7)*43758.5453123;return n-Math.floor(n)}function m(e,t){let n=Math.floor(e),r=Math.floor(t),i=e-n,a=t-r,o=p(n,r),s=p(n+1,r),c=p(n,r+1),l=p(n+1,r+1),u=i*i*(3-2*i),d=a*a*(3-2*a);return o+(s-o)*u+(c-o)*d+(o-s-c+l)*u*d}function h(e,t){let n=Math.max(1,t);return(e%n+n)%n}function g(e,t,n){let r=Math.floor(e),i=Math.floor(t),a=e-r,o=t-i,s=e=>h(e,n),c=p(s(r),s(i)),l=p(s(r+1),s(i)),u=p(s(r),s(i+1)),d=p(s(r+1),s(i+1)),f=a*a*(3-2*a),m=o*o*(3-2*o);return c+(l-c)*f+(u-c)*m+(c-l-u+d)*f*m}function _(e){let t=e%8,n=e/8|0;return[t/8,n/8,1/8,1]}function v(e,t,n){let r=t%8,i=t/8|0,a=r*128,o=i*128;for(let t=0;t<128;t++){let r=Math.min(n.height-1,t*n.height/128|0),i=(o+t)*u,s=r*n.width;for(let t=0;t<128;t++){let r=(s+Math.min(n.width-1,t*n.width/128|0))*4,o=(i+a+t)*4;e[o]=n.data[r],e[o+1]=n.data[r+1],e[o+2]=n.data[r+2],e[o+3]=n.data[r+3]}}}var y,b,x,S;function ee(){return y||=f(128,128,(e,t)=>{let n=g(e/8,t/8,16),r=g(e/2,t/2,64),i=n*.7+r*.3;return[118+i*80,96+i*62,58+i*32,255]}),y}function te(){return x||=f(128,128,(e,t)=>{let n=g(e/8,t/8,16),r=g(e/2,t/6,64),i=n*.55+r*.45;return[46+i*40,92+i*70,34+i*24,255]}),x}function C(){return S||=f(128,128,(e,t)=>{let n=g(e/8,t/8,16),r=Math.abs(g(e/4,t/8,32)-.5),i=n*.75+(1-r)*.25;return[92+i*50,88+i*44,80+i*36,255]}),S}function ne(){return b||=f(128,128,(e,t)=>{let n=.5+.5*Math.sin(e*.45+m(e/12,t/20)*3);return[78+n*70,48+n*36,24+n*16,255]}),b}function w(e,t,n){return[Math.max(0,Math.min(255,Math.round(t[0]+e*n[0]))),Math.max(0,Math.min(255,Math.round(t[1]+e*n[1]))),Math.max(0,Math.min(255,Math.round(t[2]+e*n[2]))),255]}var T,E,re,ie,ae,oe,se,D,ce,le;function ue(){return T||=f(128,128,(e,t)=>{let n=.5+.5*Math.sin(e*.9),r=.5+.5*Math.sin(t*.9),i=n*.55+r*.45,a=g(e/4,t/4,32);return w(i*.7+a*.3,[118,112,102],[90,84,74])}),T}function de(){return E||=f(128,128,(e,t)=>{let n=g(e/2,t/2,64),r=g(e/14,t/14,16);return w(n*.35+r*.65,[150,112,88],[50,40,32])}),E}function fe(){return re||=f(128,128,(e,t)=>{let n=.5+.5*Math.sin(e*.55+g(e/10,t/6,16)*2),r=g(e/3,t/18,32);return w(n*.65+r*.35,[72,48,28],[70,42,22])}),re}function pe(){return ie||=f(128,128,(e,t)=>{let n=g(e/6,t/3,32),r=Math.abs(Math.sin(t*.18+g(e/12,t/12,16)*3));return w(n*.6+r*.4,[92,64,40],[70,48,28])}),ie}function me(){return ae||=f(128,128,(e,t)=>{let n=.5+.5*Math.sin(t*.7),r=g(e/5,t/5,32);return w(n*.75+r*.25,[120,96,58],[80,60,30])}),ae}function he(){return oe||=f(128,128,(e,t)=>{let n=.55+.45*Math.abs(Math.sin(e*.8+t*.15)),r=g(e/8,t/4,32);return w(n*.7+r*.3,[168,168,162],[70,70,66])}),oe}function O(){return se||=f(128,128,(e,t)=>{let n=.5+.5*Math.sin(t*1.4+g(e/16,t/8,16)),r=Math.abs(h(e,32)-16)<1.2?.15:0;return w(n*.85+r,[108,112,116],[80,82,86])}),se}function k(){return D||=f(128,128,(e,t)=>{let n=Math.abs(Math.sin(e*.35))<.18?.25:0;return w(g(e/5,t/9,32)*.8+n,[48,92,36],[50,80,30])}),D}function ge(){return ce||=f(128,128,(e,t)=>{let n=h(e+Math.floor(t/8)%2*6,12),r=h(t,8),i=n<1.3||r<1.2?.22:.9,a=g(e/3,t/3,32);return w(i*.72+a*.28,[108,104,92],[62,52,40])}),ce}function _e(){return le||=f(128,128,(e,t)=>{let n=.4+.6*Math.abs(Math.sin(e*1.15+g(e/18,t/7,16)*1.4)),r=g(e/2,t/11,32);return w(n*.78+r*.22,[96,90,82],[64,54,46])}),le}var A=384,j=512,M=80,N=32,ve=512,ye=l.toFixed(4),be=48,P=new Float32Array(A*4),xe=new Float32Array(A*4),F=new Float32Array(j*16),I=Array(j),Se={plane:1,disk:2,box:3,capsule:4,cylinder:5,triangle:6};function Ce(e){F.fill(0);for(let t=0;t<e;t++){let e=I[t],n=(e,n,r,i,a)=>{let o=(e*j+t)*4;F[o]=n,F[o+1]=r,F[o+2]=i,F[o+3]=a},r=e.color||[1,1,1,1],i=e.a||[0,0,0],a=e.b||[0,0,0],o=e.c||[0,0,0],s=d[e.tile]||(typeof e.tile==`number`?e.tile:0);n(0,r[0],r[1],r[2],e.reflectivity||0),n(1,i[0],i[1],i[2],Se[e.kind]||0),n(2,a[0],a[1],a[2],e.r||0),n(3,o[0]||0,o[1]||0,o[2]||0,s)}}var we=new Float32Array(128),Te=new Float32Array(128),Ee=new Float32Array(128),L=new Float32Array(ve*4),R=new Float32Array(192),De=new Uint8Array(16384),Oe=48,z=new Float32Array(192),B=new Uint8Array(u*u*4);function V(e,t){return e.dataset.gpuError=t,null}function H(e,t,n){let r=e.createShader(t);if(e.shaderSource(r,n),e.compileShader(r),!e.getShaderParameter(r,e.COMPILE_STATUS)){let t=e.getShaderInfoLog(r);return e.deleteShader(r),H.lastLog=t,null}return r}function U(e,t){let n=e.createTexture();return e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texImage2D(e.TEXTURE_2D,0,e.RGBA32F,t,1,0,e.RGBA,e.FLOAT,null),n}function ke(e){let t=Array.isArray(e)?e[2]/(Math.hypot(e[0],e[1],e[2])||1):1;return 2.4+-1.4*Math.min(1,Math.max(0,(t+.1)/.5))}var Ae=`
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
`,je=.6;function Me(e,t){return e&&t?je:0}function Ne(e,t=0){return Math.min(2**Math.max(0,t),Math.max(1.5,e/160))}function Pe(f){let p;try{p=f.getContext(`webgl2`,{alpha:!1,antialias:!1,depth:!1,stencil:!1,preserveDrawingBuffer:!1})}catch{return null}if(!p)return V(f,`no context`);let m=p.getShaderPrecisionFormat?.(p.FRAGMENT_SHADER,p.HIGH_FLOAT);if(m&&m.precision<16)return V(f,`fragment highp unsupported (${m.precision} bits)`);if(p.getParameter(p.MAX_TEXTURE_SIZE)<1024)return V(f,`max texture ${p.getParameter(p.MAX_TEXTURE_SIZE)} < 1024`);try{let e=p.getExtension(`WEBGL_debug_renderer_info`);f.dataset.gpuInfo=String(e?p.getParameter(e.UNMASKED_RENDERER_WEBGL):p.getParameter(p.RENDERER)).slice(0,80)}catch{}p.getExtension(`EXT_color_buffer_float`);let h=`#version 300 es
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
${Ae}
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
  float texels = rect.z * ${u}.0;
  float lod = clamp(log2(max(gFoot * perMeter * texels, 1.0e-4)), 0.0, 3.0);
  float pad = (0.5 * exp2(lod) + 0.5) / ${u}.0;
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
  for (int i = 0; i < ${be}; i++) {
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
  for (int i = 0; i < ${M}; i++) {
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
  for (int i = 0; i < ${N}; i++) {
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
  for (int i = 0; i < ${A}; i++) {
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
      ivec2 mouth = ivec2(floor(sandP.xy / ${ye}));
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
        vec2 lo = dig.xy * ${ye};
        if (p.x < lo.x - 0.02 || p.x >= lo.x + ${ye} + 0.02 || p.y < lo.y - 0.02 || p.y >= lo.y + ${ye} + 0.02) continue;
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
    for (int i = 0; i < ${N}; i++) {
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
    for (int i = 0; i < ${A}; i++) {
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
}`,g=(e,t)=>e.replace(/\/\*@(tree|line)\*\/([\s\S]*?)\/\*@\1\*\//g,(e,n,r)=>n===`tree`===t?r:``),y=g(h,!1),b=H(p,p.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
out vec2 vRay;
void main() {
  vec2 uv = aPos * 0.5 + 0.5;
  vRay = vec2(uv.x, 1.0 - uv.y);
  gl_Position = vec4(aPos, 0.0, 1.0);
}`),x=H(p,p.FRAGMENT_SHADER,y);if(!b||!x)return V(f,H.lastLog||`shader`);let S=p.createProgram();if(p.attachShader(S,b),p.attachShader(S,x),p.bindAttribLocation(S,0,`aPos`),p.linkProgram(S),!p.getProgramParameter(S,p.LINK_STATUS))return V(f,p.getProgramInfoLog(S)||`link`);let w=H(p,p.FRAGMENT_SHADER,g(h,!0)),T=null;w&&(T=p.createProgram(),p.attachShader(T,b),p.attachShader(T,w),p.bindAttribLocation(T,0,`aPos`),p.linkProgram(T),p.getProgramParameter(T,p.LINK_STATUS)||(T=null));let E=p.createBuffer();p.bindBuffer(p.ARRAY_BUFFER,E),p.bufferData(p.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),p.STATIC_DRAW);let re,ie,ae,oe=null,se=null,D=null,ce,le,Se,je,Pe,Fe,Ie=new Float32Array(640),Le=null,Re=-1,ze,Be;try{re=U(p,A),ie=U(p,A),ae=p.createTexture(),p.activeTexture(p.TEXTURE14),p.bindTexture(p.TEXTURE_2D,ae),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),p.texImage2D(p.TEXTURE_2D,0,p.RGBA32F,j,4,0,p.RGBA,p.FLOAT,null),oe=p.createTexture(),p.activeTexture(p.TEXTURE12),p.bindTexture(p.TEXTURE_2D,oe),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),p.texImage2D(p.TEXTURE_2D,0,p.RGBA32F,4,i,0,p.RGBA,p.FLOAT,null),se=p.createTexture(),p.activeTexture(p.TEXTURE9),p.bindTexture(p.TEXTURE_2D,se),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),p.texImage2D(p.TEXTURE_2D,0,p.RGBA32F,j,1,0,p.RGBA,p.FLOAT,null),T&&(D=p.createTexture(),p.activeTexture(p.TEXTURE15),p.bindTexture(p.TEXTURE_2D,D),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.NEAREST),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),p.texImage2D(p.TEXTURE_2D,0,p.RGBA32F,4,e,0,p.RGBA,p.FLOAT,null)),ce=U(p,N),le=U(p,N),Se=U(p,N),je=U(p,ve),Pe=U(p,be),Fe=U(p,160),Le=p.createTexture(),p.activeTexture(p.TEXTURE13),p.bindTexture(p.TEXTURE_2D,Le),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),p.pixelStorei(p.UNPACK_ALIGNMENT,1),p.texImage2D(p.TEXTURE_2D,0,p.R8,128,128,0,p.RED,p.UNSIGNED_BYTE,De),ze=U(p,Oe),Be=p.createTexture(),p.activeTexture(p.TEXTURE7),p.bindTexture(p.TEXTURE_2D,Be),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.LINEAR_MIPMAP_LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAX_LEVEL,3),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),v(B,32,ee()),v(B,33,ne()),v(B,34,te()),v(B,35,C()),v(B,36,ue()),v(B,37,de()),v(B,38,fe()),v(B,39,pe()),v(B,40,me()),v(B,41,he()),v(B,42,O()),v(B,43,k()),v(B,44,ge()),v(B,45,_e()),z.set(_(32),128),z.set(_(33),132),z.set(_(34),136),z.set(_(35),140),z.set(_(36),144),z.set(_(37),148),z.set(_(38),152),z.set(_(39),156),z.set(_(40),160),z.set(_(41),164),z.set(_(42),168),z.set(_(43),172),z.set(_(44),176),z.set(_(45),180),p.texImage2D(p.TEXTURE_2D,0,p.RGBA,u,u,0,p.RGBA,p.UNSIGNED_BYTE,B),p.generateMipmap(p.TEXTURE_2D)}catch{return null}let W=e=>p.getUniformLocation(S,e);p.useProgram(S),p.uniform1i(W(`uSphereTex`),0),p.uniform1i(W(`uSphereColor`),1),p.uniform1i(W(`uBoxMin`),2),p.uniform1i(W(`uBoxMax`),3),p.uniform1i(W(`uBoxColor`),4),p.uniform1i(W(`uDigTex`),5),p.uniform1i(W(`uPrintTex`),8),p.uniform1i(W(`uTexRects`),6),p.uniform1i(W(`uAtlas`),7),p.enableVertexAttribArray(0),p.vertexAttribPointer(0,2,p.FLOAT,!1,0,0);let G=(e,t,n,r)=>{p.activeTexture(p.TEXTURE0+e),p.bindTexture(p.TEXTURE_2D,t),p.texSubImage2D(p.TEXTURE_2D,0,0,0,n,1,p.RGBA,p.FLOAT,r)},Ve=Array(A),He=!1,Ue=H(p,p.VERTEX_SHADER,`#version 300 es
in vec2 aRay;
out vec2 vRay;
void main() {
  vRay = aRay;
  gl_Position = vec4(aRay.x * 2.0 - 1.0, (1.0 - aRay.y) * 2.0 - 1.0, 0.0, 1.0);
  gl_PointSize = 1.0;
}`),K=null,We=new Float32Array(16e3),Ge=p.createBuffer();Ue&&(K=p.createProgram(),p.attachShader(K,Ue),p.attachShader(K,x),p.bindAttribLocation(K,0,`aRay`),p.linkProgram(K),p.getProgramParameter(K,p.LINK_STATUS)||(K=null));let q=null,J=[0,1,2].map(()=>{p.activeTexture(p.TEXTURE0);let e=p.createTexture();return p.bindTexture(p.TEXTURE_2D,e),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,p.LINEAR),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),{tex:e,fbo:p.createFramebuffer(),w:0,h:0}}),Y=-1,Ke=-1,qe=(e,t,n)=>{if(e.w===t&&e.h===n)return!0;p.activeTexture(p.TEXTURE0),p.bindTexture(p.TEXTURE_2D,e.tex),p.texImage2D(p.TEXTURE_2D,0,p.RGBA,t,n,0,p.RGBA,p.UNSIGNED_BYTE,null),p.bindFramebuffer(p.FRAMEBUFFER,e.fbo),p.framebufferTexture2D(p.FRAMEBUFFER,p.COLOR_ATTACHMENT0,p.TEXTURE_2D,e.tex,0);let r=p.checkFramebufferStatus(p.FRAMEBUFFER)===p.FRAMEBUFFER_COMPLETE;return p.bindTexture(p.TEXTURE_2D,null),p.bindFramebuffer(p.FRAMEBUFFER,null),r?(e.w=t,e.h=n,!0):!1},Je=()=>{p.activeTexture(p.TEXTURE9),p.bindTexture(p.TEXTURE_2D,null),p.activeTexture(p.TEXTURE10),p.bindTexture(p.TEXTURE_2D,null),p.activeTexture(p.TEXTURE0)},Ye=H(p,p.VERTEX_SHADER,`#version 300 es
in vec2 aPos;
out vec2 vUV;
void main() {
  vUV = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`),Xe=H(p,p.FRAGMENT_SHADER,`#version 300 es
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
}`),X=null;Ye&&Xe&&(X=p.createProgram(),p.attachShader(X,Ye),p.attachShader(X,Xe),p.bindAttribLocation(X,0,`aPos`),p.linkProgram(X),p.getProgramParameter(X,p.LINK_STATUS)||(X=null));let Ze=X?p.getUniformLocation(X,`uOlder`):null,Qe=X?p.getUniformLocation(X,`uNewer`):null,$e=X?p.getUniformLocation(X,`uMix`):null,et=X?p.getUniformLocation(X,`uSmooth`):null,tt=!0,nt=H(p,p.FRAGMENT_SHADER,`#version 300 es
precision highp float;
uniform sampler2D uAccum;
uniform sampler2D uHistory;
uniform float uKeep;
${Ae}
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
}`),Z=null;Ye&&nt&&(Z=p.createProgram(),p.attachShader(Z,Ye),p.attachShader(Z,nt),p.bindAttribLocation(Z,0,`aPos`),p.linkProgram(Z),p.getProgramParameter(Z,p.LINK_STATUS)||(Z=null));let rt=(e,t,n,r)=>{let i=t=>p.getUniformLocation(e,t);p.uniform2f(i(`uGaze`),t.x,t.y),p.uniform4f(i(`uFovea`),t.fovea,t.falloff,t.period,t.block),p.uniform1f(i(`uRefine`),t.refine),p.uniform1f(i(`uCellMax`),t.cellMax??2**(t.block||0)),p.uniform1f(i(`uTanHalf`),Math.tan((n.fov||70)*Math.PI/360)),p.uniform1f(i(`uView`),n.aspect||1),r!==void 0&&p.uniform1f(i(`uFull`),+!!r)},Q=(e=>{p.activeTexture(p.TEXTURE0);let t=p.createTexture();return p.bindTexture(p.TEXTURE_2D,t),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MIN_FILTER,e),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_MAG_FILTER,e),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_S,p.CLAMP_TO_EDGE),p.texParameteri(p.TEXTURE_2D,p.TEXTURE_WRAP_T,p.CLAMP_TO_EDGE),{tex:t,fbo:p.createFramebuffer(),w:0,h:0}})(p.LINEAR),it=0,at=0,ot=!0,$=null,st=()=>{if(!$)return!1;let e=p.clientWaitSync($,0,0);return e===p.ALREADY_SIGNALED||e===p.CONDITION_SATISFIED?(p.deleteSync($),$=null,!1):!0},ct=()=>{$&&p.deleteSync($),$=p.fenceSync(p.SYNC_GPU_COMMANDS_COMPLETE,0),p.flush()},lt=(e,i,m,h=null)=>{P.fill(0),xe.fill(0),we.fill(0),Te.fill(0),Ee.fill(0),L.fill(0),R.fill(0);let g=0,y=0,b=0,x=0,ee=e=>{x>=j||(I[x]=e,x+=1)};for(let t of e.objects)if(t.type===`sphere`&&g<A){let e=g*4;P[e]=t.origin[0],P[e+1]=t.origin[1],P[e+2]=t.origin[2],P[e+3]=t.radius,xe[e]=t.color[0],xe[e+1]=t.color[1],xe[e+2]=t.color[2],xe[e+3]=(t.texture?0:d[t.tile]||0)+(t.reflectivity||0),t.texture?g<32&&(z.set(_(g),g*4),Ve[g]!==t.texture&&(v(B,g,t.texture),Ve[g]=t.texture,He=!0)):g<32&&(z[g*4+3]=0),g+=1}else if(t.type===`box`&&y<N){let e=y*4;we.set(t.min,e),Te.set(t.max,e),Ee.set(t.color,e),Ee[e+3]=t.reflectivity||0,y+=1}else if(t.type===`shape`)ee(t);else if(t.type===`crust`&&t.field){let e=new Map;for(let[n,r]of t.field.overrides){if(r<=0)continue;let[t,i,a]=n.split(`,`).map(Number),o=a*l,s=`${t},${i}`,c=e.get(s);(c===void 0||o<c)&&e.set(s,o)}for(let[t,n]of e){if(b>=ve)break;let[e,r]=t.split(`,`).map(Number),i=b*4;L[i]=e,L[i+1]=r,L[i+2]=n,L[i+3]=1,b+=1}}let te=e.shapes||[];for(let e=0;e<te.length;e++)ee(te[e]);let C=0;for(let e=0;e<x;e++){let t=I[e];t&&(t.kind===`plane`||t.kind===`disk`&&(t.r||0)>30)&&(e!==C&&(I[e]=I[C],I[C]=t),C+=1)}Ce(x);let ne=n(I,x),w=s(e.camera),ue=e.prints||[],de=Math.min(ue.length,be);for(let e=0;e<de;e+=1){let t=ue[ue.length-de+e];R[e*4]=t.x,R[e*4+1]=t.y,R[e*4+2]=t.yaw||0,R[e*4+3]=t.scale||0}let fe=e.miss||[.45,.62,.85,1],pe=e.sun||[0,0,1],me=i!==`points`&&!!T&&!!D&&g>64&&c(P,g),he=i===`points`&&K?K:me?T:S,O=e=>p.getUniformLocation(he,e);p.useProgram(he),p.viewport(0,0,q?q.w:f.width,q?q.h:f.height),G(0,re,A,P),G(1,ie,A,xe),G(2,ce,N,we),G(3,le,N,Te),G(4,Se,N,Ee),G(5,je,ve,L),G(8,Pe,be,R);let k=e.track,ge=0,_e=0;k&&k.samples&&k.samples.length>=16&&(ge=Math.min(160,k.count|0,k.samples.length>>2),_e=k.half||0,Ie.fill(0),Ie.set(k.samples.subarray(0,ge*4))),p.activeTexture(p.TEXTURE10),p.bindTexture(p.TEXTURE_2D,Fe),p.texSubImage2D(p.TEXTURE_2D,0,0,0,160,1,p.RGBA,p.FLOAT,Ie);let M=e.wear;if(M&&M.version!==Re&&(Re=M.version,De.set(M.grid),p.activeTexture(p.TEXTURE13),p.bindTexture(p.TEXTURE_2D,Le),p.pixelStorei(p.UNPACK_ALIGNMENT,1),p.texSubImage2D(p.TEXTURE_2D,0,0,0,128,128,p.RED,p.UNSIGNED_BYTE,De)),G(6,ze,Oe,z),p.activeTexture(p.TEXTURE7),p.bindTexture(p.TEXTURE_2D,Be),He&&=(p.texSubImage2D(p.TEXTURE_2D,0,0,0,u,u,p.RGBA,p.UNSIGNED_BYTE,B),p.generateMipmap(p.TEXTURE_2D),!1),p.uniform1i(O(`uSphereTex`),0),p.uniform1i(O(`uSphereColor`),1),p.uniform1i(O(`uBoxMin`),2),p.uniform1i(O(`uBoxMax`),3),p.uniform1i(O(`uBoxColor`),4),p.uniform1i(O(`uDigTex`),5),p.uniform1i(O(`uPrintTex`),8),p.uniform1i(O(`uTrackTex`),10),p.uniform1i(O(`uTrackCount`),ge),p.uniform1f(O(`uTrackHalf`),_e),p.uniform1i(O(`uTexRects`),6),p.uniform1i(O(`uAtlas`),7),p.activeTexture(p.TEXTURE14),p.bindTexture(p.TEXTURE_2D,ae),p.texSubImage2D(p.TEXTURE_2D,0,0,0,j,4,p.RGBA,p.FLOAT,F),p.uniform1i(O(`uShapes`),14),p.uniform1i(O(`uShapeCount`),x),p.uniform1i(O(`uLooseShapes`),C),p.activeTexture(p.TEXTURE12),p.bindTexture(p.TEXTURE_2D,oe),ne>0&&p.texSubImage2D(p.TEXTURE_2D,0,0,0,4,ne,p.RGBA,p.FLOAT,a),p.uniform1i(O(`uShapeNodes`),12),p.uniform1i(O(`uShapeNodeCount`),ne),p.activeTexture(p.TEXTURE9),p.bindTexture(p.TEXTURE_2D,se),p.texSubImage2D(p.TEXTURE_2D,0,0,0,j,1,p.RGBA,p.FLOAT,r),p.uniform1i(O(`uShapeIndex`),9),me){p.activeTexture(p.TEXTURE15),p.bindTexture(p.TEXTURE_2D,D),p.texSubImage2D(p.TEXTURE_2D,0,0,0,4,o(),p.RGBA,p.FLOAT,t);let e=O(`uNodes`);e&&p.uniform1i(e,15)}p.activeTexture(p.TEXTURE13),p.bindTexture(p.TEXTURE_2D,Le),p.uniform1i(O(`uWearTex`),13),p.uniform3f(O(`uWear`),M?M.origin[0]:0,M?M.origin[1]:0,M?M.cell:0),p.uniform3f(O(`uOrigin`),e.camera.origin[0],e.camera.origin[1],e.camera.origin[2]),p.uniform3f(O(`uForward`),w.forward[0],w.forward[1],w.forward[2]),p.uniform3f(O(`uRight`),w.right[0],w.right[1],w.right[2]),p.uniform3f(O(`uUp`),w.up[0],w.up[1],w.up[2]),p.uniform3f(O(`uSun`),pe[0],pe[1],pe[2]),p.uniform4f(O(`uMiss`),fe[0],fe[1],fe[2],fe[3]),p.uniform1f(O(`uFov`),e.camera.fov),p.uniform1f(O(`uAspect`),e.camera.aspect),p.uniform1f(O(`uPlane`),e.camera.planeDistance);let ye=q?q.w:f.width,V=q?q.h:f.height;p.uniform2f(O(`uRes`),ye,V),p.uniform1i(O(`uSpheres`),g),p.uniform1i(O(`uBoxes`),y),p.uniform1i(O(`uDigs`),b),p.uniform1i(O(`uPrints`),de),p.uniform1f(O(`uRain`),e.rain||0),p.uniform1f(O(`uFog`),1),p.uniform4f(O(`uFog0`),70,96,18,2.2),p.uniform4f(O(`uFog1`),-155,-55,40,10),p.uniform4f(O(`uFog2`),36,-96,22,.8);let H=e.work;p.uniform4f(O(`uWork`),H?H.x:0,H?H.y:0,H?H.height:0,H?H.mode:0),p.uniform1f(O(`uTime`),e.time||0),p.uniform1f(O(`uFrame`),it),rt(he,h||{x:.5,y:.5,fovea:3.2,falloff:1,period:1,block:0,refine:0},e.camera,!h||ot),p.uniform1f(O(`uExposure`),ke(pe));let U=Math.tan((e.camera.fov||70)*Math.PI/360);if(p.uniform1f(O(`uFoot`),2*U/Math.max(2,V)),he===K){let e=Math.max(0,Math.min(m|0,We.length/2)),t=Math.max(1,f.width),n=Math.max(1,f.height);for(let r=0;r<e;r+=1)We[r*2]=(Math.random()*(t-1)+.5)/t,We[r*2+1]=(Math.random()*(n-1)+.5)/n;return p.bindBuffer(p.ARRAY_BUFFER,Ge),p.bufferData(p.ARRAY_BUFFER,We.subarray(0,e*2),p.DYNAMIC_DRAW),p.enableVertexAttribArray(0),p.vertexAttribPointer(0,2,p.FLOAT,!1,0,0),p.drawArrays(p.POINTS,0,e),!0}return p.bindBuffer(p.ARRAY_BUFFER,E),p.enableVertexAttribArray(0),p.vertexAttribPointer(0,2,p.FLOAT,!1,0,0),p.drawArrays(p.TRIANGLES,0,3),!0};return{paint(e,t,n){let r=t|0,i=n|0,a=Math.max(2,r>0?r:Math.min(f.width||160,480)),o=Math.max(2,i>0?i:Math.min(f.height||90,270)),s=()=>(q=null,p.bindFramebuffer(p.FRAMEBUFFER,null),p.disable(p.BLEND),lt(e,`full`,0,null));if(!X||!Z)return s();let c=0;for(let e=0;e<J.length;e+=1)if(e!==Y&&e!==Ke){c=e;break}let l=J[c],u=Q.w===a&&Q.h===o;if(!qe(Q,a,o)||!qe(l,a,o))return s();u||(ot=!0);let d=e.fovea||{x:.5,y:.5,fovea:3.2,falloff:1,period:1,block:0,still:!1};at=d.still?at+1:0;let m={...d,refine:at/Math.max(1,d.period),cellMax:Ne(a,d.block)};Je(),p.disable(p.BLEND),p.bindFramebuffer(p.FRAMEBUFFER,Q.fbo),q={w:a,h:o};let h=ot,g=lt(e,`full`,0,m);if(ot=!1,it=(it+1)%3600,!g)return q=null,p.bindFramebuffer(p.FRAMEBUFFER,null),!1;p.bindFramebuffer(p.FRAMEBUFFER,l.fbo),p.viewport(0,0,a,o),p.useProgram(Z),rt(Z,m,e.camera),p.activeTexture(p.TEXTURE11),p.bindTexture(p.TEXTURE_2D,Q.tex),p.uniform1i(p.getUniformLocation(Z,`uAccum`),11);let _=Y>=0&&J[Y]!==l?J[Y]:Q;return p.activeTexture(p.TEXTURE12),p.bindTexture(p.TEXTURE_2D,_.tex),p.uniform1i(p.getUniformLocation(Z,`uHistory`),12),p.uniform1f(p.getUniformLocation(Z,`uJitter`),it%64),p.uniform1f(p.getUniformLocation(Z,`uKeep`),Me(d.still,_!==Q&&_.w===a&&_.h===o&&!h)),p.bindBuffer(p.ARRAY_BUFFER,E),p.enableVertexAttribArray(0),p.vertexAttribPointer(0,2,p.FLOAT,!1,0,0),p.drawArrays(p.TRIANGLES,0,3),p.activeTexture(p.TEXTURE11),p.bindTexture(p.TEXTURE_2D,null),p.activeTexture(p.TEXTURE12),p.bindTexture(p.TEXTURE_2D,null),q=null,p.bindFramebuffer(p.FRAMEBUFFER,null),Y>=0&&(Ke=Y),Y=c,!0},invalidate(){ot=!0},setSmoothing(e){tt=!!e},present(e=1){if(!X||Y<0)return!1;let t=J[Ke>=0?Ke:Y],n=J[Y],r=Ke<0?1:Math.max(0,Math.min(1,e));return p.bindFramebuffer(p.FRAMEBUFFER,null),p.viewport(0,0,f.width,f.height),p.useProgram(X),p.activeTexture(p.TEXTURE9),p.bindTexture(p.TEXTURE_2D,t.tex),p.uniform1i(Ze,9),p.activeTexture(p.TEXTURE10),p.bindTexture(p.TEXTURE_2D,n.tex),p.uniform1i(Qe,10),p.uniform1f($e,r),p.uniform1f(et,+!!tt),p.bindBuffer(p.ARRAY_BUFFER,E),p.enableVertexAttribArray(0),p.vertexAttribPointer(0,2,p.FLOAT,!1,0,0),p.drawArrays(p.TRIANGLES,0,3),Je(),ct(),!0},busy(){return st()},paintRandom(e,t){return K?lt(e,`points`,t):lt(e,`full`,0)}}}export{Pe as createGpuPainter};