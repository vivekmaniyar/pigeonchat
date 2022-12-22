const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const morgan = require('morgan');
const mongoose = require('mongoose');
const userRoutes = require('./Routes/users');
const chatRoutes = require('./Routes/chats');
const messageRoutes = require('./Routes/messages');
const UserController = require('./Controllers/UserController');
const checkAuth = require('./Middleware/check-auth');
const cookieParser = require('cookie-parser');

//Connect to MongoDB
mongoose.connect(process.env.MONGO_URL, function(err) {
    if (err) {
        console.log('Not connected to the database: ' + err);
    } else {
        console.log('Successfully connected to MongoDB');
    }
});

app.set('view engine', 'ejs');
app.set('views', './Views');

app.use(cookieParser());
//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//Use morgan to log requests to the console
app.use(morgan('dev'));

//Use body-parser to get POST requests for API use
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Headers to prevent errors from Cross Origin Resource Sharing
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token");
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//Routes which should handle requests
app.use('/users', userRoutes);
app.use('/chats', chatRoutes);
app.use('/messages', messageRoutes);

app.get('/adminlogin', UserController.adminloginpage);
app.post('/adminlogin', UserController.adminlogin);
app.get('/userlist', UserController.listusers);
app.get('/adminlogout', UserController.adminlogout);
app.post('/blockuser', UserController.blockuser);

//Error handling
app.use(function(req, res, next) {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use(function(error, req, res, next) {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

const server = app.listen(process.env.PORT, function() {
    console.log('Listening on port ' + server.address().port);
});

const io = require('socket.io')(server,{
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        headers:{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST'
        }
    }
});

io.on("connection", (socket) => {
    console.log("Connected to socket.io");
    socket.on("setup", (userData) => {
      socket.join(userData._id);
      socket.emit("connected");
    });
  
    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room: " + room);
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));
  
    socket.on("new message", (newMessageRecieved) => {
      var chat = newMessageRecieved.chat;
  
      if (!chat.users) return console.log("chat.users not defined");
  
      chat.users.forEach((user) => {
        if (user._id == newMessageRecieved.sender._id) return;
  
        socket.in(user._id).emit("message recieved", newMessageRecieved);
      });
    });

    socket.on("send invite", (data) => {
        socket.in(data.userToCall).emit("receive call", data);
    });
  
    socket.off("setup", () => {
      console.log("USER DISCONNECTED");
      socket.leave(userData._id);
    });
  });
