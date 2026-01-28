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

    this.emit('change', {
      key,
      oldValue,
      newValue: value
    });
  }

  delete(key) {
    if (!(key in this._state)) return;

    const oldValue = this._state[key];
    delete this._state[key];

    this.emit('change', {
      key,
      oldValue,
      newValue: undefined
    });
  }

  entries() {
    return { ...this._state };
  }
}

module.exports = {
  ObservableModel
};