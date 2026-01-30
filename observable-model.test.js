// observable-model.test.js
const { describe, it } = require('node:test');
const assert = require('node:assert');
const { ObservableModel } = require('./observable-model');

describe('ObservableModel', () => {
  describe('delete(key)', () => {
    it('removes the key and emits change with newValue undefined', () => {
      const model = new ObservableModel({ a: 1, b: 2 });
      const events = [];
      model.on('change', (e) => events.push(e));

      model.delete('a');

      assert.strictEqual(model.get('a'), undefined);
      assert.strictEqual(model.get('b'), 2);
      assert.strictEqual(events.length, 1);
      assert.deepStrictEqual(events[0], {
        key: 'a',
        oldValue: 1,
        newValue: undefined
      });
    });

    it('does nothing when key is not present', () => {
      const model = new ObservableModel({ a: 1 });
      const events = [];
      model.on('change', (e) => events.push(e));

      model.delete('b');

      assert.strictEqual(model.get('a'), 1);
      assert.strictEqual(events.length, 0);
    });
  });

  describe('deleteAll()', () => {
    it('removes all keys and emits change for each', () => {
      const model = new ObservableModel({ a: 1, b: 2, c: 3 });
      const events = [];
      model.on('change', (e) => events.push(e));

      model.deleteAll();

      assert.deepStrictEqual(model.entries(), {});
      assert.strictEqual(events.length, 3);
      const keys = events.map((e) => e.key).sort();
      assert.deepStrictEqual(keys, ['a', 'b', 'c']);
      events.forEach((e) => {
        assert.strictEqual(e.newValue, undefined);
      });
    });

    it('does nothing when model is already empty', () => {
      const model = new ObservableModel();
      const events = [];
      model.on('change', (e) => events.push(e));

      model.deleteAll();

      assert.strictEqual(events.length, 0);
    });
  });

  describe('emit(key)', () => {
    it('rebroadcasts current key-value with event "emit" and { key, oldValue }', () => {
      const model = new ObservableModel({ a: 1 });
      const events = [];
      model.on('emit', (e) => events.push(e));

      model.emit('a');

      assert.strictEqual(model.get('a'), 1);
      assert.strictEqual(events.length, 1);
      assert.deepStrictEqual(events[0], { key: 'a', oldValue: 1 });
      assert.strictEqual('newValue' in events[0], false);
    });

    it('can emit for a key not in state (oldValue undefined)', () => {
      const model = new ObservableModel();
      const events = [];
      model.on('emit', (e) => events.push(e));

      model.emit('x');

      assert.strictEqual(events.length, 1);
      assert.deepStrictEqual(events[0], { key: 'x', oldValue: undefined });
      assert.strictEqual('newValue' in events[0], false);
    });
  });

  describe('emitAll()', () => {
    it('emits "emit" for every current key-value with { key, oldValue }, no newValue', () => {
      const model = new ObservableModel({ a: 1, b: 2 });
      const events = [];
      model.on('emit', (e) => events.push(e));

      model.emitAll();

      assert.deepStrictEqual(model.entries(), { a: 1, b: 2 });
      assert.strictEqual(events.length, 2);
      const byKey = Object.fromEntries(events.map((e) => [e.key, e]));
      assert.deepStrictEqual(byKey.a, { key: 'a', oldValue: 1 });
      assert.deepStrictEqual(byKey.b, { key: 'b', oldValue: 2 });
      events.forEach((e) => assert.strictEqual('newValue' in e, false));
    });

    it('emits nothing when model is empty', () => {
      const model = new ObservableModel();
      const events = [];
      model.on('emit', (e) => events.push(e));

      model.emitAll();

      assert.strictEqual(events.length, 0);
    });
  });
});
