/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type RealtimeListener = (event: Record<string, any>) => void;

class RealtimeClient {
  private ws: WebSocket | null = null;
  private listeners = new Set<RealtimeListener>();
  private username = '';
  private uid = '';
  private reconnectTimer: number | null = null;
  private onlineUsers: string[] = [];

  connect(username: string, uid?: string): void {
    const clean = username.toLowerCase().trim();
    if (!clean) return;
    if (this.ws && this.ws.readyState === WebSocket.OPEN && this.username === clean) {
      return;
    }
    this.username = clean;
    this.uid = uid || '';
    this.openSocket();
  }

  disconnect(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
      this.ws = null;
    }
  }

  subscribe(fn: RealtimeListener): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  sendTyping(toUsername: string, isTyping: boolean, threadId?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    try {
      this.ws.send(
        JSON.stringify({
          type: isTyping ? 'typing:start' : 'typing:stop',
          toUsername,
          threadId,
        })
      );
    } catch {}
  }

  getOnlineUsers(): string[] {
    return this.onlineUsers;
  }

  private openSocket(): void {
    if (typeof window === 'undefined') return;
    if (this.ws) {
      try {
        this.ws.close();
      } catch {}
    }
    try {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${proto}//${window.location.host}/ws?username=${encodeURIComponent(this.username)}&uid=${encodeURIComponent(this.uid)}`;
      const sock = new WebSocket(url);
      this.ws = sock;

      sock.onopen = () => {
        if (this.username) {
          sock.send(JSON.stringify({ type: 'identify', username: this.username, uid: this.uid }));
        }
      };

      sock.onmessage = (ev) => {
        try {
          const data = JSON.parse(String(ev.data || '{}'));
          if (Array.isArray(data.onlineUsers)) {
            this.onlineUsers = data.onlineUsers;
          }
          for (const listener of this.listeners) {
            listener(data);
          }
        } catch {}
      };

      sock.onclose = () => {
        if (this.username && this.reconnectTimer === null) {
          this.reconnectTimer = window.setTimeout(() => {
            this.reconnectTimer = null;
            this.openSocket();
          }, 4000);
        }
      };
    } catch {}
  }
}

export const realtimeClient = new RealtimeClient();
