// models/comments.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    commentID: {
        type: String,
        required: true,
        unique: true
    },
    content: { 
        type: String, 
        required: true 
    },
    commentIDs: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'Comment' 
    }],
    commentedBy: { 
        type: String, 
        required: true 
    },
    commentedDate: { 
        type: Date, 
        required: true 
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

module.exports = mongoose.model('Comment', CommentSchema);
