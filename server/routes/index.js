const express = require('express');
const communityRouter = require('./communityRoutes');
const postRouter = require('./postRoutes');
const commentRouter = require('./commentRoutes');
const linkFlairRouter = require('./linkFlairRoutes');
const authRouter = require('./authroutes');
const userRouter = require('./userRoutes');


module.exports = {
    communityRouter,
    postRouter,
    commentRouter,
    linkFlairRouter,
    authRouter,
    userRouter
};
