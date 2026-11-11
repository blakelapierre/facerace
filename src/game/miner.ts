import { createTorrentRoom } from "@/vendor/meridian/net/signal-torrent.js";
import { startRoom } from "@/vendor/meridian/net/room.js";
import { blocksAfter, chainTip, consider, minedBy, REWARD, type Block } from "./chain";
import { hashHeader, nextBits, workMeets } from "./work";

export type MineStatus = {
  height: number;
  rate: string;
  power: number;
  gpu: boolean;
  load: number;
  mined: number;
  detail: string;
};

type Handle = {
  setPower: (power: number) => void;
  stop: () => void;
};

const POWER_KEY = "facerace-mine-power";

function savedPower() {
  try {
    const value = Number(localStorage.getItem(POWER_KEY));
    if (value >= 10 && value <= 100) return value;
  } catch {
    /* default */
  }
  return 10;
}

function plan(power: number) {
  const cores = navigator.hardwareConcurrency || 4;
  const share = Math.min(1, Math.max(0.1, power / 100));
  const usable = Math.max(1, cores - (share >= 0.85 ? 1 : 0));
  const need = Math.min(usable, share * cores);
  const workers = Math.max(1, Math.min(usable, Math.ceil(need - 1e-6)));
  const duty = Math.min(1, need / workers);
  return { workers, duty, cores };
}

function formatRate(hashesPerSecond: number) {
  if (hashesPerSecond >= 1_000_000) return `${(hashesPerSecond / 1_000_000).toFixed(1)} MH/s`;
  if (hashesPerSecond >= 1_000) return `${Math.round(hashesPerSecond / 1_000)} kH/s`;
  return `${Math.round(hashesPerSecond)} H/s`;
}

function pack(block: Block) {
  return `k|${block.height}|${block.bits}|${block.nonce}|${block.time}|${block.miner}|${block.hash}|${block.prev}`;
}

function unpack(raw: string): Block | null {
  if (!raw.startsWith("k|")) return null;
  const [, height, bits, nonce, time, miner, hash, prev] = raw.split("|");
  if (!hash || !prev || !miner) return null;
  return {
    height: Number(height) || 0,
    bits: Number(bits) || 0,
    nonce: Number(nonce) || 0,
    time: Number(time) || 0,
    miner,
    hash,
    prev,
  };
}

export function startMiner(options: {
  address: string;
  onStatus: (status: MineStatus) => void;
  onReward: (amount: number) => void;
}): Handle {
  let power = savedPower();
  let stopped = false;
  let gpu = false;
  let detail = "GPU starting";
  const cpus: Worker[] = [];
  const dutyOf = new Map<number, number>();
  let hashes = 0;
  let hashAt = performance.now();
  let rate = "0 H/s";
  let gpuWorker: Worker | null = null;
  let room: { setCatalog?: (next: string) => void; send?: (to: string, blob: string) => void; close: () => void; onMessage?: (fn: (message: { type?: string; from?: string; blob?: string }) => void) => void; list?: () => Promise<{ pubkey: string; catalog?: string }[]> } | null = null;
  const asked = new Map<string, number>();

  const publish = () => {
    const tip = chainTip();
    room?.setCatalog?.(pack(tip));
  };

  const emit = () => {
    const cores = navigator.hardwareConcurrency || 4;
    const load = [...dutyOf.values()].reduce((sum, duty) => sum + duty, 0) / cores;
    options.onStatus({
      height: chainTip().height,
      rate,
      power,
      gpu,
      load: Math.round(load * 100),
      mined: minedBy(options.address),
      detail,
    });
  };

  const job = () => {
    const tip = chainTip();
    const time = Math.floor(Date.now() / 1000);
    return {
      cmd: "job",
      prev: tip.hash,
      time,
      height: tip.height + 1,
      miner: options.address,
      bits: nextBits(tip, time),
      duty: plan(power).duty,
    };
  };

  const postJob = () => {
    const next = job();
    for (const [lane, worker] of cpus.entries()) worker.postMessage({ ...next, lane });
    gpuWorker?.postMessage(next);
    publish();
  };

  const take = (found: { nonce?: number; time?: number; height?: number; prev?: string; bits?: number }) => {
    if (typeof found.nonce !== "number" || typeof found.time !== "number" || typeof found.prev !== "string" || typeof found.bits !== "number") return;
    const tip = chainTip();
    if (found.prev !== tip.hash) return;
    const header = {
      height: tip.height + 1,
      prev: tip.hash,
      time: found.time,
      miner: options.address,
      nonce: found.nonce,
      bits: found.bits,
    };
    if (header.bits !== nextBits(tip, header.time)) return;
    const hash = hashHeader(header);
    if (!workMeets(hash, header.bits)) return;
    if (consider({ ...header, hash }) !== "added") return;
    options.onReward(REWARD);
    postJob();
    emit();
  };

  const onCpu = (id: number) => (event: MessageEvent) => {
    const message = event.data as { type?: string; hashes?: number; spent?: number; wall?: number; nonce?: number; time?: number; prev?: string; bits?: number };
    if (message.type === "rate") {
      hashes += message.hashes || 0;
      const wall = message.wall || 1;
      dutyOf.set(id, Math.min(1, (message.spent || 0) / wall));
      return;
    }
    if (message.type === "found") take(message);
  };

  const spawn = () => {
    for (const worker of cpus) worker.terminate();
    cpus.length = 0;
    dutyOf.clear();
    const { workers, duty } = plan(power);
    for (let lane = 0; lane < workers; lane++) {
      const worker = new Worker(new URL("./pow.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = onCpu(lane);
      cpus.push(worker);
      worker.postMessage({ ...job(), duty, lane });
    }
    if (!gpuWorker) {
      gpuWorker = new Worker(new URL("./gpu.worker.ts", import.meta.url), { type: "module" });
      gpuWorker.onmessage = (event: MessageEvent) => {
        const message = event.data as { type?: string; hashes?: number; spent?: number; wall?: number; nonce?: number; time?: number; prev?: string; bits?: number; on?: boolean };
        if (message.type === "gpu") {
          gpu = Boolean(message.on);
          detail = gpu ? "GPU on" : String((message as { reason?: string }).reason || "GPU off");
        }
        if (message.type === "rate") hashes += message.hashes || 0;
        if (message.type === "found") take(message);
      };
      gpuWorker.postMessage(job());
    } else {
      gpuWorker.postMessage({ cmd: "duty", duty });
      gpuWorker.postMessage(job());
    }
  };

  const bootRoom = () => {
    const me = `fc-${options.address.slice(0, 8)}`;
    const created = createTorrentRoom({ me, cell: "facerace/chain", role: "host", catalog: pack(chainTip()), announceMs: 5000 }) as ReturnType<typeof createTorrentRoom> & {
      setCatalog?: (next: string) => void;
    };
    void startRoom(created, { slowMs: 8000 })
      .then((opened: { close: () => void; send: (to: string, blob: string) => void; onMessage: (fn: (message: { type?: string; from?: string; blob?: string }) => void) => void; setCatalog?: (next: string) => void; list: () => Promise<{ pubkey: string; catalog?: string }[]> }) => {
        if (stopped) {
          opened.close();
          return;
        }
        room = opened;
        opened.onMessage((message: { type?: string; from?: string; blob?: string }) => {
          if (message.type !== "signal" || !message.blob || !message.from) return;
          try {
            const body = JSON.parse(message.blob) as { t?: string; have?: number; blocks?: Block[] };
            if (body.t === "want") {
              opened.send(message.from, JSON.stringify({ t: "blocks", blocks: blocksAfter(body.have || 0) }));
            } else if (body.t === "blocks" && Array.isArray(body.blocks)) {
              let added = false;
              for (const block of body.blocks) if (consider(block) === "added") added = true;
              if (added) postJob();
            }
          } catch {
            /* ignore a bad peer */
          }
        });
        publish();
      })
      .catch(() => {
        room = null;
      });
  };

  const poll = window.setInterval(() => {
    if (stopped) return;
    const elapsed = (performance.now() - hashAt) / 1000;
    if (elapsed >= 1) {
      rate = formatRate(hashes / elapsed);
      hashes = 0;
      hashAt = performance.now();
    }
    void room?.list?.().then((peers) => {
      const tip = chainTip();
      for (const peer of peers) {
        const block = unpack(peer.catalog || "");
        if (!block) continue;
        const verdict = consider(block);
        if (verdict === "added") postJob();
        if ((verdict === "orphan" || block.height > tip.height + 1) && performance.now() - (asked.get(peer.pubkey) || 0) > 5000) {
          asked.set(peer.pubkey, performance.now());
          room?.send?.(peer.pubkey, JSON.stringify({ t: "want", have: chainTip().height }));
        }
      }
    });
    emit();
  }, 500);

  const refresh = window.setInterval(() => {
    if (!stopped) postJob();
  }, 4000);

  spawn();
  bootRoom();
  emit();

  return {
    setPower(next: number) {
      power = Math.min(100, Math.max(10, Math.round(next)));
      try {
        localStorage.setItem(POWER_KEY, String(power));
      } catch {
        /* ignore */
      }
      const { workers, duty } = plan(power);
      if (workers !== cpus.length) spawn();
      else {
        for (const worker of cpus) worker.postMessage({ cmd: "duty", duty });
        gpuWorker?.postMessage({ cmd: "duty", duty });
      }
      emit();
    },
    stop() {
      stopped = true;
      window.clearInterval(poll);
      window.clearInterval(refresh);
      for (const worker of cpus) worker.terminate();
      gpuWorker?.terminate();
      room?.close();
    },
  };
}
