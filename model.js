// model.js
// Single source of truth: one model instance shared by all monitors
const { ObservableModel } = require('./observable-model');
module.exports = new ObservableModel();
