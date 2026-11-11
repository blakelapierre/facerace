import { fromHex, leadingZeros, sha256Block } from "./sha256";
import { prepareHeader, writeNonce } from "./work";

const scope = self as unknown as {
  onmessage: ((event: MessageEvent) => void) | null;
  postMessage: (data: unknown) => void;
};

let duty = 0.1;
let bits = 20;
let jobTime = 0;
let jobHeight = 1;
let jobPrev = "";
let nonce = (Math.random() * 0xffffffff) >>> 0;
let running = false;
const buf = new Uint8Array(64);

function report(hashes: number, spent: number, wall: number) {
  scope.postMessage({ type: "rate", hashes, spent, wall });
}

function loop() {
  if (!running) return;
  const started = performance.now();
  let hashes = 0;
  const slice = 40;
  while (performance.now() - started < slice) {
    for (let i = 0; i < 24; i++) {
      writeNonce(buf, nonce);
      const hash = sha256Block(buf);
      hashes += 1;
      if (leadingZeros(hash) >= bits) {
        const foundBits = bits;
        bits = 99;
        scope.postMessage({ type: "found", nonce, time: jobTime, height: jobHeight, prev: jobPrev, bits: foundBits });
        nonce = (nonce + 1) >>> 0;
        break;
      }
      nonce = (nonce + 1) >>> 0;
    }
  }
  const spent = performance.now() - started;
  const rest = duty >= 0.99 ? 0 : (spent * (1 - duty)) / Math.max(0.05, duty);
  report(hashes, spent, spent + rest);
  setTimeout(loop, rest);
}

scope.onmessage = (event: MessageEvent) => {
  const message = event.data as {
    cmd?: string;
    duty?: number;
    bits?: number;
    time?: number;
    height?: number;
    prev?: string;
    miner?: string;
    txTag?: number;
    lane?: number;
  };
  if (message.cmd === "stop") {
    running = false;
    return;
  }
  if (message.cmd === "duty") {
    duty = Math.min(1, Math.max(0.02, message.duty || 0.1));
    return;
  }
  if (message.cmd === "job") {
    bits = message.bits || 20;
    duty = Math.min(1, Math.max(0.02, message.duty || duty));
    jobTime = message.time || 0;
    jobHeight = message.height || 1;
    jobPrev = message.prev || "";
    prepareHeader(buf, fromHex(jobPrev.padStart(64, "0")), jobTime, jobHeight, fromHex((message.miner || "").padStart(16, "0")), message.txTag || 0);
    nonce = ((Math.random() * 0xffffffff) ^ ((message.lane || 0) * 0x9e3779b1)) >>> 0;
    if (!running) {
      running = true;
      loop();
    }
  }
};
