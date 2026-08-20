/**
 * Kizuna Haven - Multi-Client Network Event Broadcaster & Listener
 */

import { NetworkEventType, NetworkMessage } from '../types';

export type EventHandler<T> = (payload: T, senderId: string, timestamp: number) => void;

export interface MessageBusTransport {
  emit(event: string, data: unknown): void;
  on(event: string, handler: (data: unknown) => void): void;
}

/**
 * In-memory fallback transport for testing and local isolated environments
 */
export class InMemoryTransport implements MessageBusTransport {
  private handlers = new Map<string, ((data: unknown) => void)[]>();

  emit(event: string, data: unknown): void {
    const list = this.handlers.get(event);
    if (list) {
      const cloned = JSON.parse(JSON.stringify(data));
      for (const handler of list) {
        handler(cloned);
      }
    }
  }

  on(event: string, handler: (data: unknown) => void): void {
    const current = this.handlers.get(event) ?? [];
    current.push(handler);
    this.handlers.set(event, current);
  }
}

export class StateBroadcaster {
  private transport: MessageBusTransport;
  private localUserId: string;
  private handlers = new Map<NetworkEventType, EventHandler<any>[]>();

  constructor(localUserId: string, transport?: MessageBusTransport) {
    this.localUserId = localUserId;
    this.transport = transport ?? new InMemoryTransport();

    // Hook internal channel
    this.transport.on('kizuna_channel', (rawMessage: unknown) => {
      this.handleIncoming(rawMessage);
    });
  }

  public setTransport(transport: MessageBusTransport): void {
    this.transport = transport;
    this.transport.on('kizuna_channel', (rawMessage: unknown) => {
      this.handleIncoming(rawMessage);
    });
  }

  public broadcast<T>(type: NetworkEventType, payload: T): NetworkMessage<T> {
    const message: NetworkMessage<T> = {
      type,
      senderId: this.localUserId,
      timestamp: Date.now(),
      payload
    };

    this.transport.emit('kizuna_channel', message);
    return message;
  }

  public on<T>(type: NetworkEventType, handler: EventHandler<T>): () => void {
    const current = this.handlers.get(type) ?? [];
    current.push(handler);
    this.handlers.set(type, current);

    // Return un-subscriber
    return () => {
      const list = this.handlers.get(type);
      if (list) {
        this.handlers.set(type, list.filter(h => h !== handler));
      }
    };
  }

  private handleIncoming(rawMessage: unknown): void {
    if (!rawMessage || typeof rawMessage !== 'object') return;
    const msg = rawMessage as Partial<NetworkMessage<any>>;
    if (!msg.type || !msg.senderId || !msg.payload) return;
    if (msg.senderId === this.localUserId) return; // Ignore self-sent messages

    const registeredHandlers = this.handlers.get(msg.type);
    if (registeredHandlers && registeredHandlers.length > 0) {
      for (const handler of registeredHandlers) {
        handler(msg.payload, msg.senderId, msg.timestamp ?? Date.now());
      }
    }
  }
}
