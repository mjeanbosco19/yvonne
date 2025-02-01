const { dockStart } = require('@nlpjs/basic');
const express = require('express');
const path = require('path');

(async () => {
  const dock = await dockStart();
  const nlp = dock.get('nlp');
  
  // Get the Express instance from the API server
  const apiServer = dock.get('api-server');
  const app = apiServer.app;

  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Parse JSON bodies
  app.use(express.json());

  // Handle chat messages
  app.post('/api/messages', async (req, res) => {
    const { message } = req.body;
    try {
      const response = await nlp.process('rw', message);
      res.json({ answer: response.answer || "Mbabarira, sinumvise neza icyo ushaka kuvuga." });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
})();
