// models/posts.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new mongoose.Schema({
    postID: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    postedBy: {
        type: String,
        required: true
    },
    postedDate: {
        type: Date,
        required: true
    },
    linkFlairID: {
        type: Schema.Types.ObjectId,
        ref: 'LinkFlair'
    },
    commentIDs: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    views: {
        type: Number,
        default: 0
    },
    votes: { // votes
        type: Number,
        default: 0
    },
    votedBy: [{ // who votes
        user: {
            type: String,  // User's display name/identifier
            required: true
        },
        vote: {
            type: Number,  // 1 for upvote, -1 for downvote
            required: true
        }
    }]
});

module.exports = mongoose.model('Post', PostSchema);
