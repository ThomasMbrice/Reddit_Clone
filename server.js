const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const { communityRouter, postRouter, commentRouter, linkFlairRouter, authRouter, userRouter } = require('./routes');

const app = express();
const corsOptions = {
    origin: 'http://localhost:3000', // Your React app URL
    credentials: true,               // Allow credentials
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Session configuration
app.use(session({
    secret: 'key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: 'mongodb://127.0.0.1:27017/phreddit',
        ttl: 24 * 60 * 60 // 24 hours in seconds
    }),
    cookie: {
        secure: false,
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Rest of your middleware
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Mount routes
app.use('/communities', communityRouter);
app.use('/posts', postRouter);  
app.use('/comments', commentRouter);
app.use('/linkflairs', linkFlairRouter);
app.use('/auth', authRouter); // for auth
app.use('/users', userRouter);// for user actions

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal server error', 
        error: err.message 
    });
});

mongoose.connect('mongodb://localhost:27017/phreddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});