

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const cors = require('cors');

app.use(express.json());
app.use(cors());

const port = 3000;

// Array to store logged messages
const loggedMessages = [];

io.on('connection', (socket) => {
  console.log('A client connected');

  // Your socket connection logic here

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

app.post('/*', function (req, res) {
  console.log("hello");
  console.log("-------------- New Request POST --------------");
  console.log("Headers:" + JSON.stringify(req.headers, null, 3));
  console.log("Body:" + JSON.stringify(req.body, null, 3));

  // Store the logged message in the array
  const newMessage = {
    type: 'post',
    headers: req.headers,
    body: req.body,
  };

  loggedMessages.push(newMessage);

  io.emit('newMessage', newMessage);

  console.log(newMessage);

  res.json({ message: "Thank you for the message" });
});


// Add support for GET requests to Facebook webhook
app.get("/webhooks", (req, res) => {
  // Parse the query params
  var mode = req.query["hub.mode"];
  var token = req.query["hub.verify_token"];
  var challenge = req.query["hub.challenge"];

  console.log("-------------- New Request GET --------------");
  console.log("Headers:" + JSON.stringify(req.headers, null, 3));
  console.log("Body:" + JSON.stringify(req.body, null, 3));

  // Check if a token and mode is in the query string of the request
  if (mode && token) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === "12345") {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      console.log("Responding with 403 Forbidden");
      // Respond with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  } else {
    console.log("Replying Thank you.");
    res.json({ message: "Thank you for the message" });
  }
});

// New endpoint to get logged messages
app.get('/getMessages', function (req, res) {
  console.log("get messages");
  res.json(loggedMessages);
});

server.listen(port, function () {
  console.log(`Example Facebook app listening at ${port}`);
});
