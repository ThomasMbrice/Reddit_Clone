// routes/communityRoutes.js
const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const CommunityModel = require('../models/communities');
const PostModel = require('../models/posts');
const CommentModel = require('../models/comments'); 

const generateId = require('../models/counter');


router.get('/test', (req, res) => {
    res.json({ message: 'Community routes working' });
});

router.post('/:communityId/join', async (req, res) => {
    console.log('Join route hit with params:', {
        communityId: req.params.communityId,
        body: req.body
    });

    try {
        const community = await CommunityModel.findById(req.params.communityId);
        console.log('Found community:', community);
        
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        const { displayName } = req.body;
        
        if (!community.members) {
            community.members = [];
        }

        if (community.members.includes(displayName)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        community.members.push(displayName);
        const updatedCommunity = await community.save();
        
        console.log('Successfully updated community:', updatedCommunity);
        res.json(updatedCommunity);
    } catch (error) {
        console.error('Join community error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/:communityId/leave', async (req, res) => {
    try {
        const community = await CommunityModel.findOne({ _id: req.params.communityId });
        
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        const { displayName } = req.body;
        community.members = community.members.filter(member => member !== displayName);
        const updatedCommunity = await community.save();
        
        res.json(updatedCommunity);
    } catch (error) {
        console.error('Leave community error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:communityId/posts', async (req, res) => {
    try {
        console.log('Fetching posts for community:', req.params.communityId);

        const community = await CommunityModel.findById(req.params.communityId)
            .populate({
                path: 'postIDs',
                populate: [
                    { 
                        path: 'linkFlairID',
                        select: 'content'
                    },
                    {
                        path: 'commentIDs'
                    }
                ]
            })
            .lean();

        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }

        console.log(`Found community: ${community.name} with ${community.postIDs?.length || 0} posts`);

        // Transform the populated posts
        const posts = (community.postIDs || []).map(post => ({
            ...post,
            communityName: community.name,
            communityId: community._id.toString()
        }));

        res.json(posts);
    } catch (error) {
        console.error('Error fetching community posts:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description, createdBy } = req.body;

        // Getcount
        const communityID = generateId('community');

        const newCommunity = new CommunityModel({
            communityID,
            name,
            creator: createdBy,
            description,
            postIDs: [],  
            startDate: new Date(),
            members: [createdBy]  
        });

        const savedCommunity = await newCommunity.save();
        res.status(201).json(savedCommunity);

    } catch (error) {
        console.error('Error creating community:', error);
        res.status(400).json({ 
            message: error.message || 'Error creating community'
        });
    }
});

// Get all communities
router.get('/', async (req, res) => {
    try {
        const communities = await CommunityModel.find().lean();
        console.log('Found communities:', communities.length);
        res.json(communities);
    } catch (error) {
        console.error('Error fetching communities:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get community members
router.get('/:communityId/members', async (req, res) => {
    try {
        const community = await CommunityModel.findById(req.params.communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        res.json(community.members || []);
    } catch (error) {
        console.error('Error fetching community members:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:displayName/communities', async (req, res) => {
    try {
        const communities = await CommunityModel.find({ 
            creator: req.params.displayName  
        });
        res.json(communities);
    } catch (error) {
        console.error('Error fetching user communities:', error);
        res.status(500).json({ message: error.message });
    }
});

//creator
router.get('/created/:displayName', async (req, res) => {
    try {
        const communities = await CommunityModel.find({ 
            creator: req.params.displayName 
        });
        res.json(communities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// memebr
router.get('/member/:displayName', async (req, res) => {
    try {
        console.log('Finding communities for user:', req.params.displayName);
        const communities = await CommunityModel.find({
            members: req.params.displayName
        });
        console.log('Found communities:', communities);
        res.json(communities);
    } catch (error) {
        console.error('Error finding communities:', error);
        res.status(500).json({ message: error.message });
    }
});

router.get('/:communityId', async (req, res) => {
    try {
        const community = await CommunityModel.findById(req.params.communityId);
        if (!community) {
            return res.status(404).json({ message: 'Community not found' });
        }
        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:communityId', async (req, res) => { // update community on account
    try {
        const { name, description } = req.body;
        const community = await CommunityModel.findByIdAndUpdate(
            req.params.communityId,
            { name, description },
            { new: true }
        );
        res.json(community);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:communityId', async (req, res) => {
    try {
      const community = await CommunityModel.findById(req.params.communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }
      
      for (const postId of community.postIDs) {
        const post = await PostModel.findById(postId);
        if (post) {
          for (const commentId of post.commentIDs) {
            await CommentModel.findByIdAndDelete(commentId);
          }
          await PostModel.findByIdAndDelete(postId);
        }
      }
      
      // Delete community using findByIdAndDelete
      await CommunityModel.findByIdAndDelete(req.params.communityId);
      res.json({ message: 'Community deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error); // Add this debug log
      res.status(500).json({ message: error.message });
    }
  });
  



module.exports = router;