const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const mongoURI = "mongodb+srv://Khalaf:AJkKAnjKCppNZofj@cluster0.espszhq.mongodb.net/SocialPlatform?retryWrites=true&w=majority&appName=Cluster0";
const postRouter = require('./Routes/posts');
const authRouter = require('./Routes/auth');
const multer = require('multer');
const http = require('http');
const socketIo = require('./socket'); // Import socket.io configuration

const app = express();
const server = http.createServer(app); // Create HTTP server with Express

const diskStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'images'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

// Handle Cross-Origin Resource Sharing (CORS)
app.use(cors());
app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(multer({
    storage: diskStorage,
    fileFilter: fileFilter
}).single('image'));

app.use('/auth', authRouter);
app.use('/feed', postRouter);

app.use((error, req, res, next) => {
    const { data, message, statusCode } = error;
    res.status(statusCode).json({
        message,
        data
    });
});

mongoose.connect(mongoURI)
    .then(() => {
        console.log("Connected to MongoDB successfully");

        const io = socketIo.init(server); // Initialize Socket.IO with HTTP server
        io.on('connection', (socket) => {
            console.log('A user connected');
            socket.on('disconnect', () => {
                console.log('User disconnected');
            });
        });

        server.listen(8080, () => {
            console.log("Server is running on port 8080");
        });
    })
    .catch(err => {
        console.log(err);
    });
