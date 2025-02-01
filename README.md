# yvonne

DESIGN AND IMPLEMENTATION OF KINYARWANDA AI HELPDESK CHATBOT

# IremboGov AI Helpdesk Chatbot

Kinyarwanda AI Helpdesk Chatbot for IremboGov services. This chatbot helps users get information about various government services in Kinyarwanda.

## Features

- Natural Language Processing in Kinyarwanda
- Real-time chat interface
- Information about IremboGov services
- Support for multiple service categories
- Error handling and fallback responses
- Mobile-responsive design

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (version >= 14.0.0)
- npm (usually comes with Node.js)

## Installation

1. Clone the repository:

bash
git clone https://github.com/mjeanbosco19/yvonne.git
cd yvonne

2. Install dependencies:

bash
npm install
bash
npm install

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The application will start on `http://localhost:3000`

## Project Structure

```
├── public/
│   └── index.html       # Frontend chat interface
├── corpus-rw.json       # Kinyarwanda training data
├── conf.json            # NLP configuration
├── index.js            # Main server file
├── pipelines.md        # NLP pipelines
└── package.json        # Project dependencies
```

## Deployment

The project can be deployed to various platforms:

### Render

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your repository
4. Use the following settings:
   - Build Command: `npm install`
   - Start Command: `node index.js`

### Railway

1. Fork this repository
2. Create a new project on Railway
3. Connect your repository
4. Railway will automatically detect the configuration

### Heroku

1. Create a new Heroku app
2. Connect your repository
3. Deploy using the Heroku CLI or GitHub integration

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.

