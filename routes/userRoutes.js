// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const PostModel = require('../models/posts');
const CommentModel = require('../models/comments');
const CommunityModel = require('../models/communities');
const UserModel = require('../models/user');

router.use((req, res, next) => {
    console.log(`User Route: ${req.method} ${req.url}`);
    next();
});

router.get('/:displayName/communities', async (req, res) => {
    try {
        console.log('Fetching communities for user:', req.params.displayName);
        
        const communities = await CommunityModel.find({ 
            createdBy: req.params.displayName  
        });

        console.log('Found communities:', communities);
        res.json(communities);
    } catch (error) {
        console.error('Error in getUserCommunities:', error);
        res.status(500).json({ 
            message: 'Error fetching communities',
            error: error.message 
        });
    }
});

router.get('/:displayName/posts', async (req, res) => {
    try {
        const posts = await PostModel.find({ 
            postedBy: req.params.displayName  // This should match the displayName
        })
        .populate('linkFlairID')
        .lean();
        
        res.json(posts);
    } catch (error) {
        console.error('Error in getUserPosts:', error);
        res.status(500).json({ 
            message: 'Error fetching posts',
            error: error.message 
        });
    }
});

router.get('/:displayName/comments', async (req, res) => {
    try {
        const comments = await CommentModel.find({ 
            commentedBy: req.params.displayName
        })
        .lean();
        
        res.json(comments);
    } catch (error) {
        console.error('Error in getUserComments:', error);
        res.status(500).json({ 
            message: 'Error fetching comments',
            error: error.message 
        });
    }
});

router.get('/all', async (req, res) => {
    console.log('GET /users/all route hit');
    try {
        console.log('Attempting to fetch users from database...');
        const users = await UserModel.find({}, '-password');
        console.log('Users fetched:', users);
        res.json(users);
    } catch (error) {
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            message: error.message,
            details: error.stack 
        });
    }
});

router.delete('/:userId', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const communities = await CommunityModel.find({ creator: user.displayName });
        for (const community of communities) {
            for (const postId of community.postIDs) {
                const post = await PostModel.findById(postId);
                if (post) {
                    for (const commentId of post.commentIDs) {
                        await CommentModel.findByIdAndDelete(commentId);
                    }
                    await PostModel.findByIdAndDelete(postId);
                }
            }
            await CommunityModel.findByIdAndDelete(community._id);
        }

        const posts = await PostModel.find({ postedBy: user.displayName });
        for (const post of posts) {
            for (const commentId of post.commentIDs) {
                await CommentModel.findByIdAndDelete(commentId);
            }
            await PostModel.findByIdAndDelete(post._id);
        }

        await CommentModel.deleteMany({ commentedBy: user.displayName });

        await UserModel.findByIdAndDelete(req.params.userId);

        res.json({ message: 'User and all associated content deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:displayName', async (req, res) => {
    try {
        const user = await UserModel.findOne({ displayName: req.params.displayName }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;