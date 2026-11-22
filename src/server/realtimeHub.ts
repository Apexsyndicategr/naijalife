/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import http from 'http';
import { WebSocket, WebSocketServer } from 'ws';

export interface WsClientMeta {
  ws: WebSocket;
  uid?: string;
  usernameLower: string;
  connectedAt: number;
}

class RealtimeHub {
  private wss: WebSocketServer | null = null;
  private clients = new Map<WebSocket, WsClientMeta>();
  private socketsByUsername = new Map<string, Set<WebSocket>>();

  attach(server: http.Server): void {
    if (this.wss) return;
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      try {
        const url = new URL(req.url || '/ws', 'http://localhost');
        const username = String(url.searchParams.get('username') || '').toLowerCase().trim();
        const uid = String(url.searchParams.get('uid') || '').trim();

        const meta: WsClientMeta = {
          ws,
          uid: uid || undefined,
          usernameLower: username,
          connectedAt: Date.now(),
        };
        this.clients.set(ws, meta);
        if (username) {
          if (!this.socketsByUsername.has(username)) {
            this.socketsByUsername.set(username, new Set());
          }
          this.socketsByUsername.get(username)!.add(ws);
          this.broadcastPresence(username, true);
        }

        ws.send(
          JSON.stringify({
            type: 'ws:connected',
            onlineUsers: this.getOnlineUsernames(),
            serverTime: Date.now(),
          })
        );

        ws.on('message', (raw) => {
          try {
            const msg = JSON.parse(raw.toString());
            if (!msg || typeof msg !== 'object') return;
            if (msg.type === 'identify' && typeof msg.username === 'string') {
              const nextUser = msg.username.toLowerCase().trim();
              if (meta.usernameLower && meta.usernameLower !== nextUser) {
                this.socketsByUsername.get(meta.usernameLower)?.delete(ws);
              }
              meta.usernameLower = nextUser;
              if (typeof msg.uid === 'string' && msg.uid.trim()) {
                meta.uid = msg.uid.trim();
              }
              if (nextUser) {
                if (!this.socketsByUsername.has(nextUser)) {
                  this.socketsByUsername.set(nextUser, new Set());
                }
                this.socketsByUsername.get(nextUser)!.add(ws);
                this.broadcastPresence(nextUser, true);
              }
            } else if ((msg.type === 'typing:start' || msg.type === 'typing:stop') && typeof msg.toUsername === 'string') {
              const to = msg.toUsername.toLowerCase().trim();
              if (meta.usernameLower && to) {
                this.sendToUser(to, {
                  type: msg.type,
                  fromUsername: meta.usernameLower,
                  threadId: msg.threadId || null,
                  timestamp: Date.now(),
                });
              }
            } else if (msg.type === 'ping') {
              ws.send(JSON.stringify({ type: 'pong', serverTime: Date.now() }));
            }
          } catch {}
        });

        ws.on('close', () => {
          const closedMeta = this.clients.get(ws);
          this.clients.delete(ws);
          if (closedMeta?.usernameLower) {
            const set = this.socketsByUsername.get(closedMeta.usernameLower);
            set?.delete(ws);
            if (!set || set.size === 0) {
              this.socketsByUsername.delete(closedMeta.usernameLower);
              this.broadcastPresence(closedMeta.usernameLower, false);
            }
          }
        });
      } catch {
        try {
          ws.close();
        } catch {}
      }
    });
  }

  getOnlineUsernames(): string[] {
    return Array.from(this.socketsByUsername.keys());
  }

  isUserOnline(username: string): boolean {
    const set = this.socketsByUsername.get(username.toLowerCase().trim());
    return Boolean(set && set.size > 0);
  }

  sendToUser(username: string, payload: Record<string, unknown>): void {
    const clean = username.toLowerCase().trim();
    const set = this.socketsByUsername.get(clean);
    if (!set) return;
    const raw = JSON.stringify(payload);
    for (const sock of set) {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(raw);
        } catch {}
      }
    }
  }

  broadcastAll(payload: Record<string, unknown>): void {
    const raw = JSON.stringify(payload);
    for (const sock of this.clients.keys()) {
      if (sock.readyState === WebSocket.OPEN) {
        try {
          sock.send(raw);
        } catch {}
      }
    }
  }

  private broadcastPresence(usernameLower: string, online: boolean): void {
    this.broadcastAll({
      type: 'presence:update',
      username: usernameLower,
      online,
      onlineUsers: this.getOnlineUsernames(),
      timestamp: Date.now(),
    });
  }
}

export const realtimeHub = new RealtimeHub();
