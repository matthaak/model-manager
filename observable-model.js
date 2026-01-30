// observable-model.js
const EventEmitter = require('events');

class ObservableModel extends EventEmitter {
  constructor(initialState = {}) {
    super();
    this._state = { ...initialState };
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    const oldValue = this._state[key];
    this._state[key] = value;

    EventEmitter.prototype.emit.call(this, 'change', {
      key,
      oldValue,
      newValue: value
    });
  }

  delete(key) {
    if (!(key in this._state)) return;

    const oldValue = this._state[key];
    delete this._state[key];

    EventEmitter.prototype.emit.call(this, 'change', {
      key,
      oldValue,
      newValue: undefined
    });
  }

  deleteAll() {
    const keys = Object.keys(this._state);
    for (const key of keys) {
      const oldValue = this._state[key];
      delete this._state[key];
      EventEmitter.prototype.emit.call(this, 'change', {
        key,
        oldValue,
        newValue: undefined
      });
    }
  }

  /**
   * Rebroadcast the current key-value: emit an 'emit' event with { key, oldValue }.
   * Does not modify state.
   */
  emit(key) {
    EventEmitter.prototype.emit.call(this, 'emit', {
      key,
      oldValue: this._state[key]
    });
  }

  /**
   * Rebroadcast every current key-value: emit an 'emit' event for each with { key, oldValue }.
   * Does not modify state.
   */
  emitAll() {
    for (const key of Object.keys(this._state)) {
      EventEmitter.prototype.emit.call(this, 'emit', {
        key,
        oldValue: this._state[key]
      });
    }
  }

  entries() {
    return { ...this._state };
  }
}

module.exports = {
  ObservableModel
};