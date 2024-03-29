const express = require("express");
var cors = require('cors')
const app = express();
const fs = require('fs');
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
  // key: fs.readFileSync("/home2/developmenthatin/public_html/vc3/key.pem"),
  // cert: fs.readFileSync("/home2/developmenthatin/public_html/vc3/cert.pem"),
  // requestCert: false
  // debug: true,
};
// app.use(cors())


// app.use(function (req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", 
//   "Origin, X-Requested-With, Content-Type, Accept");
//   next();
//   });

const server = require("https").createServer(
  options,
  app);
const { v4: uuidv4 } = require("uuid");
app.set("view engine", "ejs");
// const io = require("socket.io")(server, {
  
//   cors: {
//     origin: '*',
//   }
// });
const io = require("socket.io")(server
  // , {
  
  // cors: {
  //   origin: '*',
  // }
// }
);
const { ExpressPeerServer } = require("peer");
const options_express_server = {
  ssl:{
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem"),
  },
    debug: true,
};

const peerServer = ExpressPeerServer(server, options_express_server);
// const peerServer = ExpressPeerServer(server, {
//   debug: true,
// });

app.use("/peerjs", peerServer);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId, userName) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });
  });
});

server.listen( 3034);
