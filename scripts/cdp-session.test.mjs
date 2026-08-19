import assert from 'node:assert/strict';
import test from 'node:test';
import { CdpSession } from './cdp-session.mjs';

class FakeSocket {
  constructor() {
    this.listeners = new Map();
    this.sent = [];
    this.closed = false;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  send(payload) {
    this.sent.push(JSON.parse(payload));
  }

  close() {
    this.closed = true;
    this.emit('close', {});
  }

  emit(type, event) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

test('routes command responses by id', async () => {
  const socket = new FakeSocket();
  const session = new CdpSession(socket);
  const pending = session.send('Runtime.enable', { example: true });

  assert.deepEqual(socket.sent, [{ id: 1, method: 'Runtime.enable', params: { example: true } }]);
  socket.emit('message', { data: JSON.stringify({ id: 1, result: { enabled: true } }) });
  assert.deepEqual(await pending, { enabled: true });
});

test('rejects command responses that carry protocol errors', async () => {
  const socket = new FakeSocket();
  const session = new CdpSession(socket);
  const pending = session.send('Page.invalid');

  socket.emit('message', {
    data: JSON.stringify({ id: 1, error: { code: -32601, message: 'Method not found' } }),
  });
  await assert.rejects(pending, /Method not found \(-32601\)/);
});

test('resolves registered event waiters with event parameters', async () => {
  const socket = new FakeSocket();
  const session = new CdpSession(socket);
  const loaded = session.waitForEvent('Page.loadEventFired', 1_000);

  socket.emit('message', {
    data: JSON.stringify({ method: 'Page.loadEventFired', params: { timestamp: 42 } }),
  });
  assert.deepEqual(await loaded, { timestamp: 42 });
});

test('times out event waiters and removes them', async () => {
  const socket = new FakeSocket();
  const session = new CdpSession(socket);
  await assert.rejects(session.waitForEvent('Page.never', 10), /Timed out waiting for DevTools event Page\.never/);
  assert.equal(session.eventWaiters.size, 0);
});

test('rejects pending commands and events when the socket closes', async () => {
  const socket = new FakeSocket();
  const session = new CdpSession(socket);
  const command = session.send('Runtime.enable');
  const event = session.waitForEvent('Page.loadEventFired', 1_000);

  socket.close();
  await assert.rejects(command, /DevTools WebSocket closed/);
  await assert.rejects(event, /DevTools WebSocket closed/);
  assert.equal(session.pending.size, 0);
  assert.equal(session.eventWaiters.size, 0);
});
