// models/linkflairs.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LinkFlairSchema = new Schema({
    linkFlairID: {
        type: String,
        required: true,
        unique: true
    },
    content: { 
        type: String, 
        required: true 
    }
});

module.exports = mongoose.model('LinkFlair', LinkFlairSchema);