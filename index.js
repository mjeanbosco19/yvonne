const { dockStart } = require('@nlpjs/basic');
const express = require('express');
const path = require('path');

const DEFAULT_RESPONSE = `Mbabarira, sinumvise neza icyo ushaka kuvuga. Waba ukeneye ubufasha mu gukoresha IremboGov,
Ganira n'itsinda ryacu ritanga ubufasha.

Hamagara itsinda ryacu ritanga ubufasha:
9099

Andikira itsinda ryacu ritanga ubufasha:
support@irembo.com`;

(async () => {
  const dock = await dockStart();
  const nlp = dock.get('nlp');

  // Train the NLP model with our corpus
  try {
    await nlp.train();
    console.log('NLP model trained successfully');
  } catch (error) {
    console.error('Error training NLP model:', error);
    process.exit(1);
  }

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
      res.json({
        answer: response.answer || DEFAULT_RESPONSE,
        intent: response.intent,
      });
    } catch (error) {
      console.error('Error processing message:', error);
      res.status(500).json({
        error: 'Internal server error',
        answer: DEFAULT_RESPONSE,
      });
    }
  });

  console.log('Server started on port 3000');
})();
