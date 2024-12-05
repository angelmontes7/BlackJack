const http = require('http');
const express = require('express');
const path = require('path');
const { app, initializeWebSockets } = require('./app'); // Import the Express app and WebSocket initializer
const routes = require('./routes');  // Import the routes
const dbManager = require('./dbmgr');

const hostname = '127.0.0.1';
const port = 3000;

app.use(express.json()); // This is the key part that allows Express to parse JSON

// Setup the database
dbManager.testConnection();

app.use('/', routes);

// Create an HTTP server
const server = http.createServer(app);

// Initialize WebSocket
initializeWebSockets(server);

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});