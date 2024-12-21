const mongoose = require('mongoose');

/*
Solves the following bug, when creating a ID for example postID we get the size of the data structure+1, the issue becomes that 
if you create a post say post3, then delete post2, and then try and create another post it will be post3 again causing a error, 
So instead of changing how ID works we will change how they are counted 
*/

function generateId(prefix) {
    const id = new mongoose.Types.ObjectId();
    const timestamp = id.getTimestamp().getTime();
    return `${prefix}${timestamp}`;
}

module.exports = generateId;
