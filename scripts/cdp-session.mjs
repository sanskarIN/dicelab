export class CdpSession {
  static async connect(url, timeoutMs = 10_000) {
    const socket = new WebSocket(url);
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out opening DevTools WebSocket.')), timeoutMs);
      socket.addEventListener(
        'open',
        () => {
          clearTimeout(timeout);
          resolve();
        },
        { once: true },
      );
      socket.addEventListener(
        'error',
        () => {
          clearTimeout(timeout);
          reject(new Error('Could not open DevTools WebSocket.'));
        },
        { once: true },
      );
    });
    return new CdpSession(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.eventWaiters = new Map();

    socket.addEventListener('message', (event) => {
      const message = JSON.parse(String(event.data));
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${message.error.message} (${message.error.code})`));
        else pending.resolve(message.result ?? {});
        return;
      }
      if (message.method) this.resolveEvent(message.method, message.params ?? {});
    });

    socket.addEventListener('close', () => {
      const error = new Error('DevTools WebSocket closed.');
      for (const pending of this.pending.values()) pending.reject(error);
      this.pending.clear();
      for (const waiters of this.eventWaiters.values()) {
        for (const waiter of waiters) {
          clearTimeout(waiter.timeout);
          waiter.reject(error);
        }
      }
      this.eventWaiters.clear();
    });
  }

  send(method, params = {}) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  waitForEvent(method, timeoutMs) {
    return new Promise((resolve, reject) => {
      const waiter = { resolve, reject, timeout: undefined };
      waiter.timeout = setTimeout(() => {
        this.removeEventWaiter(method, waiter);
        reject(new Error(`Timed out waiting for DevTools event ${method}.`));
      }, timeoutMs);
      const waiters = this.eventWaiters.get(method) ?? [];
      waiters.push(waiter);
      this.eventWaiters.set(method, waiters);
    });
  }

  resolveEvent(method, params) {
    const waiters = this.eventWaiters.get(method);
    if (!waiters?.length) return;
    this.eventWaiters.delete(method);
    for (const waiter of waiters) {
      clearTimeout(waiter.timeout);
      waiter.resolve(params);
    }
  }

  removeEventWaiter(method, waiter) {
    const waiters = this.eventWaiters.get(method);
    if (!waiters) return;
    const remaining = waiters.filter((item) => item !== waiter);
    if (remaining.length) this.eventWaiters.set(method, remaining);
    else this.eventWaiters.delete(method);
  }

  close() {
    this.socket.close();
  }
}
