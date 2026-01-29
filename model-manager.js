// model-manager.js
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

class ModelManager {
  constructor(port, model) {
    if (!model) {
      throw new Error('ModelManager requires a model instance. Pass the shared model from model.js');
    }
    this.port = port;
    this.model = model;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new Server(this.server);

    this.setupRoutes();
    this.setupWebSocket();
    this.setupModelListeners();
  }

  setupRoutes() {
    // Serve static files (HTML, CSS, JS)
    this.app.use(express.json());
    this.app.use(express.static(__dirname));

    // API endpoint to get all entries
    this.app.get('/api/entries', (req, res) => {
      res.json(this.model.entries());
    });

    // API endpoint to set a value
    this.app.post('/api/set', (req, res) => {
      const { key, value } = req.body;
      if (key === undefined) {
        return res.status(400).json({ error: 'key is required' });
      }
      this.model.set(key, value);
      res.json({ success: true });
    });

    // Serve the main UI
    this.app.get('/', (req, res) => {
      res.send(this.getHTML());
    });
  }

  setupWebSocket() {
    this.io.on('connection', (socket) => {
      console.log(`[Manager ${this.port}] Client connected`);

      // Send initial state
      socket.emit('state', this.model.entries());

      // Handle state request
      socket.on('request-state', () => {
        socket.emit('state', this.model.entries());
      });

      socket.on('disconnect', () => {
        console.log(`[Manager ${this.port}] Client disconnected`);
      });
    });
  }

  setupModelListeners() {
    this.model.on('change', (event) => {
      // Broadcast changes to all connected clients
      this.io.sockets.emit('change', event);
    });
  }

  start() {
    this.server.listen(this.port, 'localhost', () => {
      console.log(`[Manager ${this.port}] Model manager running on http://localhost:${this.port}`);
    });
  }

  stop() {
    return new Promise((resolve) => {
      if (!this.server.listening) {
        resolve();
        return;
      }
      this.server.close(() => {
        console.log(`[Manager ${this.port}] Stopped`);
        resolve();
      });
      // Force close after 1 second if graceful close doesn't work
      setTimeout(() => {
        if (this.server.listening) {
          this.server.close();
        }
        resolve();
      }, 1000);
    });
  }

  getHTML() {
    const htmlPath = path.join(__dirname, 'model-manager.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    return html.replace(/\$\{PORT\}/g, this.port);
  }
}

module.exports = { ModelManager };
