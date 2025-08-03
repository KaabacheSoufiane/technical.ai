// mon-application-fullstack/backend/index.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello from Backend!');
});

app.get('/api/message', (req, res) => {
  res.json({ message: 'Ceci est un message de votre API Backend!' });
});

app.listen(port, () => {
  console.log(`Backend listening at http://localhost:${port}`);
});
