// models/communities.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommunitySchema = new Schema({
    communityID: {
        type: String,
        required: true,
        unique: true
    },
    name: { 
        type: String, 
        required: true 
    },
    creator: {
        type: String,
        required: true
    },
    description: { 
        type: String, 
        required: true 
    },
    postIDs: [{ 
        type: Schema.Types.ObjectId,
        ref: 'Post'
    }],
    startDate: { 
        type: Date,
        required: true 
    },
    members: [{ 
        type: String
    }]
});

module.exports = mongoose.model('Community', CommunitySchema);

