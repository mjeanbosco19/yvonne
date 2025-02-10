const { dockStart } = require('@nlpjs/basic');
const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const session = require('express-session');

const DEFAULT_RESPONSE = `Mbabarira, sinumvise neza icyo ushaka kuvuga. Waba ukeneye ubufasha mu gukoresha IremboGov,
Ganira n'itsinda ryacu ritanga ubufasha.

Hamagara itsinda ryacu ritanga ubufasha:
9099

Andikira itsinda ryacu ritanga ubufasha:
support@irembo.com`;

const PORT = process.env.PORT || 3000;

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

  // Add security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Serve static files from public directory
  app.use(express.static(path.join(__dirname, 'public')));

  // Parse JSON bodies with size limit
  app.use(express.json({ limit: '1mb' }));

  // Add rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: "Mwakoresheje cyane API. Mwongere mugerageze nyuma y'iminota 15.",
      answer: DEFAULT_RESPONSE,
    },
  });

  // Apply rate limiting to API routes
  app.use('/api/', limiter);

  // Add session management
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'your-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Add conversation history endpoint
  app.get('/api/history', async (req, res) => {
    try {
      if (!req.session.history) {
        req.session.history = [];
      }
      res.json({ history: req.session.history });
    } catch (error) {
      console.error('Error fetching history:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle chat messages with validation
  app.post(
    '/api/messages',
    [
      body('message')
        .trim()
        .notEmpty()
        .withMessage('Ubutumwa ntibushobora kuba ubusa')
        .isLength({ max: 500 })
        .withMessage('Ubutumwa ntibushobora kurenza inyuguti 500'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          answer: 'Mbabarira, ubutumwa bwawe ntibwemewe. Ongera ugerageze.',
        });
      }

      const { message } = req.body;
      try {
        const response = await nlp.process('rw', message);

        // Store conversation in session
        if (!req.session.history) {
          req.session.history = [];
        }
        req.session.history.push({
          user: message,
          bot: response.answer || DEFAULT_RESPONSE,
          timestamp: new Date(),
          intent: response.intent,
        });

        res.json({
          answer: response.answer || DEFAULT_RESPONSE,
          intent: response.intent,
          confidence: response.score,
        });
      } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({
          error: 'Internal server error',
          answer: DEFAULT_RESPONSE,
        });
      }
    }
  );

  // Add health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
    });
  });

  // Serve chat interface at /chat
  app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  // Redirect root to chat
  app.get('/', (req, res) => {
    res.redirect('/chat');
  });

  console.log(`Server started on port ${PORT}`);
})();
