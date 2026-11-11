(function(){let e=new Uint32Array([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]),t=/* @__PURE__ */ new Uint32Array(64);function n(e,t){return e>>>t|e<<32-t}function r(r,i){let a=new DataView(r.buffer,r.byteOffset,64);for(let e=0;e<16;e++)t[e]=a.getUint32(e*4,!1);for(let e=16;e<64;e++){let r=n(t[e-15],7)^n(t[e-15],18)^t[e-15]>>>3,i=n(t[e-2],17)^n(t[e-2],19)^t[e-2]>>>10;t[e]=t[e-16]+r+t[e-7]+i>>>0}let o=i[0],s=i[1],c=i[2],l=i[3],u=i[4],d=i[5],f=i[6],p=i[7];for(let r=0;r<64;r++){let i=n(u,6)^n(u,11)^n(u,25),a=u&d^~u&f,m=p+i+a+e[r]+t[r]>>>0,h=(n(o,2)^n(o,13)^n(o,22))+(o&s^o&c^s&c)>>>0;p=f,f=d,d=u,u=l+m>>>0,l=c,c=s,s=o,o=m+h>>>0}i[0]=i[0]+o>>>0,i[1]=i[1]+s>>>0,i[2]=i[2]+c>>>0,i[3]=i[3]+l>>>0,i[4]=i[4]+u>>>0,i[5]=i[5]+d>>>0,i[6]=i[6]+f>>>0,i[7]=i[7]+p>>>0}function i(){return new Uint32Array([1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225])}function a(e){let t=/* @__PURE__ */ new Uint8Array(32),n=new DataView(t.buffer);for(let t=0;t<8;t++)n.setUint32(t*4,e[t],!1);return t}function o(e){let t=i();return r(e,t),a(t)}function s(e){let t=``;for(let n of e)t+=n.toString(16).padStart(2,`0`);return t}function c(e,t,n,r,i){e.fill(0),e.set(t.subarray(0,32),0);let a=new DataView(e.buffer,e.byteOffset,e.byteLength);a.setUint32(32,n>>>0,!1),a.setUint32(36,r>>>0,!1),e.set(i.subarray(0,8),40),e[52]=128,a.setUint32(60,416,!1)}function l(e,t){new DataView(e.buffer,e.byteOffset,e.byteLength).setUint32(48,t>>>0,!1)}let u=self,d=`#version 300 es
precision highp float;
precision highp int;
out vec4 outColor;
uniform uint uPrev[8];
uniform uint uTime;
uniform uint uHeight;
uniform uint uMiner0;
uniform uint uMiner1;
uniform uint uBase;
uniform uint uBits;
uniform uint uMode;
uniform uint uWidth;

uint rotr(uint x, uint n) { return (x >> n) | (x << (32u - n)); }
uint kk(int i) {
${[...e].map((e,t)=>`  if (i == ${t}) return ${e>>>0}u;`).join(`
`)}
  return 0u;
}

void compress(uint nonce, out uint H0, out uint H1, out uint H2, out uint H3, out uint H4, out uint H5, out uint H6, out uint H7) {
  uint w[64];
  w[0] = uPrev[0]; w[1] = uPrev[1]; w[2] = uPrev[2]; w[3] = uPrev[3];
  w[4] = uPrev[4]; w[5] = uPrev[5]; w[6] = uPrev[6]; w[7] = uPrev[7];
  w[8] = uTime; w[9] = uHeight; w[10] = uMiner0; w[11] = uMiner1;
  w[12] = nonce; w[13] = 0x80000000u; w[14] = 0u; w[15] = 416u;
  for (int i = 16; i < 64; ++i) {
    uint x15 = w[i - 15];
    uint x2 = w[i - 2];
    uint s0 = rotr(x15, 7u) ^ rotr(x15, 18u) ^ (x15 >> 3u);
    uint s1 = rotr(x2, 17u) ^ rotr(x2, 19u) ^ (x2 >> 10u);
    w[i] = w[i - 16] + s0 + w[i - 7] + s1;
  }
  uint a = 0x6a09e667u;
  uint b = 0xbb67ae85u;
  uint c = 0x3c6ef372u;
  uint d = 0xa54ff53au;
  uint e = 0x510e527fu;
  uint f = 0x9b05688cu;
  uint g = 0x1f83d9abu;
  uint h = 0x5be0cd19u;
  for (int i = 0; i < 64; ++i) {
    uint s1 = rotr(e, 6u) ^ rotr(e, 11u) ^ rotr(e, 25u);
    uint ch = (e & f) ^ ((~e) & g);
    uint t1 = h + s1 + ch + kk(i) + w[i];
    uint s0 = rotr(a, 2u) ^ rotr(a, 13u) ^ rotr(a, 22u);
    uint maj = (a & b) ^ (a & c) ^ (b & c);
    uint t2 = s0 + maj;
    h = g; g = f; f = e; e = d + t1; d = c; c = b; b = a; a = t1 + t2;
  }
  H0 = a + 0x6a09e667u; H1 = b + 0xbb67ae85u; H2 = c + 0x3c6ef372u; H3 = d + 0xa54ff53au;
  H4 = e + 0x510e527fu; H5 = f + 0x9b05688cu; H6 = g + 0x1f83d9abu; H7 = h + 0x5be0cd19u;
}

void main() {
  if (uMode == 0u) {
    uint H0, H1, H2, H3, H4, H5, H6, H7;
    compress(0u, H0, H1, H2, H3, H4, H5, H6, H7);
    uint words[8] = uint[8](H0, H1, H2, H3, H4, H5, H6, H7);
    uint word = words[int(gl_FragCoord.x)];
    outColor = vec4(
      float((word >> 24) & 255u) / 255.0,
      float((word >> 16) & 255u) / 255.0,
      float((word >> 8) & 255u) / 255.0,
      float(word & 255u) / 255.0
    );
    return;
  }
  uint index = uint(int(gl_FragCoord.x)) + uint(int(gl_FragCoord.y)) * uWidth;
  uint H0, H1, H2, H3, H4, H5, H6, H7;
  compress(uBase + index, H0, H1, H2, H3, H4, H5, H6, H7);
  uint bits = uBits;
  bool hit = bits >= 32u ? H0 == 0u : (H0 & (0xffffffffu << (32u - bits))) == 0u;
  outColor = hit ? vec4(1.0) : vec4(0.0);
}`,f=null,p=null,m=null,h=null,g=!1,_=!1,v=0;function y(e){g=!1,u.postMessage({type:`gpu`,on:!1,reason:e})}function b(e){return p.getUniformLocation(m,e)}function x(e,t){if(!h||!p)return;let n=/* @__PURE__ */ new Uint32Array(8),r=h.prev.padStart(64,`0`);for(let e=0;e<8;e++)n[e]=parseInt(r.slice(e*8,e*8+8),16)>>>0;let i=h.miner.padStart(16,`0`);p.uniform1uiv(b(`uPrev[0]`),n),p.uniform1ui(b(`uTime`),h.time>>>0),p.uniform1ui(b(`uHeight`),h.height>>>0),p.uniform1ui(b(`uMiner0`),parseInt(i.slice(0,8),16)>>>0),p.uniform1ui(b(`uMiner1`),parseInt(i.slice(8,16),16)>>>0),p.uniform1ui(b(`uBase`),e>>>0),p.uniform1ui(b(`uBits`),h.bits>>>0),p.uniform1ui(b(`uMode`),t>>>0),p.uniform1ui(b(`uWidth`),32)}function S(e,t){p.viewport(0,0,e,t),p.drawArrays(p.TRIANGLES,0,3)}function C(){if(!p||!h)return!1;let e=/* @__PURE__ */ new Uint8Array(64),t=/* @__PURE__ */ new Uint8Array(32),n=/* @__PURE__ */ new Uint8Array(8),r=h.prev.padStart(64,`0`),i=h.miner.padStart(16,`0`);for(let e=0;e<32;e++)t[e]=parseInt(r.slice(e*2,e*2+2),16);for(let e=0;e<8;e++)n[e]=parseInt(i.slice(e*2,e*2+2),16);c(e,t,h.time,h.height,n),l(e,0);let a=o(e);x(0,0),S(8,1);let d=/* @__PURE__ */ new Uint8Array(32);p.readPixels(0,0,8,1,p.RGBA,p.UNSIGNED_BYTE,d);let f=0;for(let e=0;e<32;e++)d[e]===a[e]&&(f+=1);return f<32?(y(`GPU hash disagreed (${f}/32)`),!1):(u.postMessage({type:`gpu`,on:!0,check:s(a)}),!0)}function w(){if(f)return!0;try{if(f=new OffscreenCanvas(32,32),p=f.getContext(`webgl2`,{antialias:!1,depth:!1,stencil:!1,powerPreference:`low-power`}),!p)return y(`No WebGL2`),!1;let e=(e,t)=>{let n=p.createShader(e);return p.shaderSource(n,t),p.compileShader(n),p.getShaderParameter(n,p.COMPILE_STATUS)?n:(y(p.getShaderInfoLog(n)||`shader`),null)},t=e(p.VERTEX_SHADER,`#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`),n=e(p.FRAGMENT_SHADER,d);return!t||!n?!1:(m=p.createProgram(),p.attachShader(m,t),p.attachShader(m,n),p.linkProgram(m),p.getProgramParameter(m,p.LINK_STATUS)?(p.useProgram(m),p.disable(p.BLEND),p.disable(p.DEPTH_TEST),!0):(y(p.getProgramInfoLog(m)||`link`),!1))}catch(e){return y(e instanceof Error?e.message:`GPU miner failed`),!1}}function T(){if(!g||!p||!h)return;let e=performance.now();if(!_&&(_=C(),!_))return;x(v,1),S(32,32);let t=/* @__PURE__ */ new Uint8Array(4096);p.readPixels(0,0,32,32,p.RGBA,p.UNSIGNED_BYTE,t);for(let e=0;e<1024;e++)if(t[e*4]>200){u.postMessage({type:`found`,nonce:v+e>>>0,time:h.time,height:h.height,prev:h.prev,bits:h.bits});break}let n=1024;v=v+n>>>0;let r=performance.now()-e,i=Math.min(1,Math.max(.02,h.duty)),a=i>=.99?16:Math.max(16,r*(1-i)/i);u.postMessage({type:`rate`,hashes:n,spent:r,wall:r+a,gpu:!0}),setTimeout(T,a)}u.onmessage=e=>{let t=e.data;if(t.cmd===`stop`)g=!1;else if(t.cmd===`duty`&&h)h.duty=t.duty||h.duty;else if(t.cmd===`job`){let e=!g;if(h={prev:t.prev||``,time:t.time||0,height:t.height||1,miner:t.miner||``,bits:t.bits||20,duty:t.duty||.1},!w())return;e&&(g=!0,setTimeout(T,1200))}}})();