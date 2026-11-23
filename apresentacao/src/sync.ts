import { createClient, type RealtimeChannel } from "@supabase/supabase-js";

/**
 * Sincronização entre a tela (notebook no projetor) e os celulares.
 *
 * - Pela internet: canal Broadcast do Supabase Realtime (não toca no banco),
 *   com presence para saber quem está conectado. Funciona até no 4G.
 * - No mesmo aparelho: BroadcastChannel (ensaio com duas janelas).
 *
 * A tela é a autoridade: os celulares mandam comandos e a tela responde
 * com o estado. As mensagens podem chegar pelos dois caminhos; o `id`
 * evita aplicar a mesma duas vezes.
 */

export type Role = "tela" | "apresentador";

export type Msg =
  | { t: "cmd"; a: "next" | "prev" | "goto"; scene?: number; step?: number; by?: string }
  | { t: "hello"; by?: string }
  | {
      t: "state";
      scene: number;
      step: number;
      /** Milissegundos desde o início (ou null antes de começar). */
      elapsed: number | null;
      sceneElapsed: number;
    };

type Envelope = Msg & { id: string; from: string };

export type PresenceEntry = { role: Role; nome: string };
export type SyncStatus = "conectando" | "online" | "offline" | "local";

export interface Sync {
  readonly status: SyncStatus;
  send(msg: Msg): void;
  onMessage(callback: (msg: Msg) => void): void;
  onPresence(callback: (list: PresenceEntry[]) => void): void;
  onStatus(callback: (status: SyncStatus) => void): void;
  setNome(nome: string): void;
}

/** Letras e números sem os que se confundem (0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function newSala(length = 4): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => ALPHABET.charAt(byte % ALPHABET.length)).join("");
}

export function createSync(sala: string, me: PresenceEntry): Sync {
  const clientId = newSala(12);
  const seen = new Set<string>();
  const order: string[] = [];
  const messageListeners = new Set<(msg: Msg) => void>();
  const presenceListeners = new Set<(list: PresenceEntry[]) => void>();
  const statusListeners = new Set<(status: SyncStatus) => void>();
  let status: SyncStatus = "conectando";
  let presence: PresenceEntry = me;

  const setStatus = (next: SyncStatus) => {
    if (status === next) return;
    status = next;
    statusListeners.forEach((listener) => listener(next));
  };

  const deliver = (envelope: Envelope) => {
    if (!envelope || envelope.from === clientId || seen.has(envelope.id)) return;
    seen.add(envelope.id);
    order.push(envelope.id);
    if (order.length > 300) seen.delete(order.shift() ?? "");
    const { id: _id, from: _from, ...msg } = envelope;
    messageListeners.forEach((listener) => listener(msg as Msg));
  };

  // Mesmo aparelho (duas janelas).
  let local: BroadcastChannel | null = null;
  try {
    local = new BroadcastChannel(`nsc-apresentacao:${sala}`);
    local.onmessage = (event) => deliver(event.data as Envelope);
  } catch {
    local = null;
  }

  // Internet (Supabase Realtime).
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  let channel: RealtimeChannel | null = null;

  if (url && key) {
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const ch = client.channel(`apresentacao:${sala}`, {
      config: { broadcast: { self: false, ack: false }, presence: { key: clientId } },
    });
    ch.on("broadcast", { event: "msg" }, ({ payload }) => deliver(payload as Envelope));
    ch.on("presence", { event: "sync" }, () => {
      const state = ch.presenceState<PresenceEntry>();
      const list = Object.values(state)
        .flat()
        .map(({ role, nome }) => ({ role, nome }));
      presenceListeners.forEach((listener) => listener(list));
    });
    ch.subscribe((state) => {
      if (state === "SUBSCRIBED") {
        setStatus("online");
        void ch.track(presence);
      } else if (state === "CHANNEL_ERROR" || state === "TIMED_OUT" || state === "CLOSED") {
        setStatus("offline");
      }
    });
    channel = ch;
  } else {
    setStatus("local");
  }

  return {
    get status() {
      return status;
    },
    send(msg) {
      const envelope = { ...msg, id: newSala(12), from: clientId } as Envelope;
      local?.postMessage(envelope);
      if (channel && status === "online") {
        void channel.send({ type: "broadcast", event: "msg", payload: envelope });
      }
    },
    onMessage(callback) {
      messageListeners.add(callback);
    },
    onPresence(callback) {
      presenceListeners.add(callback);
    },
    onStatus(callback) {
      statusListeners.add(callback);
      callback(status);
    },
    setNome(nome) {
      presence = { ...presence, nome };
      if (channel && status === "online") void channel.track(presence);
    },
  };
}
