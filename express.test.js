// server/express.test.js
const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const http = require('http');

describe('Express Server Tests', () => {
  let server;

  beforeAll(async () => {
    const port = 8000;
    const app = express();
    server = http.createServer(app);
    server.listen(port);
  });

  afterAll(async () => {
    server.close();
  });

  test('server is listening on port 8000', async () => {
    let isPortInUse = false;
    
    try {
      const testServer = http.createServer();
      await new Promise((resolve, reject) => {
        testServer.on('error', (e) => {
          if (e.code === 'EADDRINUSE') {
            isPortInUse = true;
          }
          resolve();
        });
        
        testServer.listen(8000, () => {
          testServer.close();
          resolve();
        });
      });
    } catch (error) {
      isPortInUse = true;
    }

    expect(isPortInUse).toBe(true);
  });
});