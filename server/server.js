require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Allow our React website to talk to this server
app.use(cors());

// Let the server understand data sent as JSON
app.use(express.json());

// A test "door": visiting / returns a friendly message
app.get('/', (req, res) => {
  res.send('E-commerce API is running!');
});

// Pick the port number (the server's "door number")
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});