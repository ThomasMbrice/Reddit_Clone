// server/routes/postRoutes.js
const express = require('express');
const router = express.Router();
const PostModel = require('../models/posts');
const CommunityModel = require('../models/communities');
const mongoose = require('mongoose');
const CommentModel = require('../models/comments');
const UserModel = require('../models/user');

const generateId = require('../models/counter');


// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await PostModel.find()
            .populate('linkFlairID')
            .populate({
                path: 'commentIDs',
                populate: {
                    path: 'commentIDs',
                    populate: {
                        path: 'commentIDs',
                        populate: {
                            path: 'commentIDs'
                        }
                    }
                },
                // Include votes in comment population
                select: 'content commentedBy commentedDate commentIDs votes'
            })
            .lean()
            .exec();

        // Format posts to include vote count
        const formattedPosts = posts.map(post => ({
            ...post,
            voteCount: post.votes || 0
        }));

        res.json(formattedPosts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get single post
router.get('/:postId', async (req, res) => {
    try {
        //console.log('Fetching post with ID:', req.params.postId);
        const post = await PostModel.findOne({ postID: req.params.postId })
            .populate('linkFlairID')
            .populate({
                path: 'commentIDs',
                populate: {
                    path: 'commentIDs',
                    populate: {
                        path: 'commentIDs',
                        populate: {
                            path: 'commentIDs'
                        }
                    }
                },
                select: 'content commentedBy commentedDate commentIDs votes commentID' 
            })
            .lean();        

        if (!post) {
            return res.status(404).json({ 
                message: 'Post not found',
                requestedId: req.params.postId 
            });
        }

        const community = await CommunityModel.findOne({
            postIDs: post._id
        }).lean();

        const response = {
            ...post,
            voteCount: post.votes || 0,
            communityName: community ? community.name : 'Unknown Community',
            communityId: community ? community._id : null
        };

        console.log('Sending post response:', response);
        res.json(response);

    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ 
            message: 'Error fetching post',
            error: error.message,
            requestedId: req.params.postId
        });
    }
});

// In postRoutes.js

router.patch('/:postId/upvote', async (req, res) => {
    try {
        const { username } = req.body;
        const post = await PostModel.findOne({ postID: req.params.postId });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const voteIndex = post.votedBy.findIndex(vote => vote.user === username);
        const poster = await UserModel.findOne({ displayName: post.postedBy });

        if (voteIndex === -1) {
            // Add new upvote
            post.votedBy.push({ user: username, vote: 1 });
            post.votes += 1;
            if (poster) {
                poster.reputation += 5;
                await poster.save();
            }
        } else {
            // Remove existing vote and reverse reputation
            const oldVote = post.votedBy[voteIndex].vote;
            post.votes -= oldVote;
            post.votedBy.splice(voteIndex, 1);
            if (poster) {
                poster.reputation -= oldVote === 1 ? 5 : -10;
                await poster.save();
            }
        }

        await post.save();
        
        res.json({
            votes: post.votes,
            votedBy: post.votedBy
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:postId/downvote', async (req, res) => {
    try {
        const { username } = req.body;
        const post = await PostModel.findOne({ postID: req.params.postId });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const voteIndex = post.votedBy.findIndex(vote => vote.user === username);
        const poster = await UserModel.findOne({ displayName: post.postedBy });

        if (voteIndex === -1) {
            // Add new downvote
            post.votedBy.push({ user: username, vote: -1 });
            post.votes -= 1;
            if (poster) {
                poster.reputation -= 10;
                await poster.save();
            }
        } else {
            const oldVote = post.votedBy[voteIndex].vote;
            post.votes -= oldVote;
            post.votedBy.splice(voteIndex, 1);
            if (poster) {
                poster.reputation -= oldVote === 1 ? 5 : -10;
                await poster.save();
            }
        }

        await post.save();
        
        res.json({
            votes: post.votes,
            votedBy: post.votedBy
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:postId/removevote', async (req, res) => {
    try {
        const { username } = req.body;
        const post = await PostModel.findOne({ postID: req.params.postId });
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Find the user's vote
        const existingVote = post.votedBy.find(vote => vote.user === username);
        if (!existingVote) {
            return res.status(404).json({ message: 'No vote found' });
        }

        post.votedBy = post.votedBy.filter(vote => vote.user !== username);
        post.votes = post.votes - existingVote.vote; 

        const poster = await UserModel.findOne({ displayName: post.postedBy });
        if (poster) {
            poster.reputation += existingVote.vote === 1 ? -5 : 10;
            await poster.save();
        }

        await post.save();
        return res.json({ votes: post.votes });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.patch('/:postId', async (req, res) => {
    try {
      const { title, content, linkFlairID } = req.body;
      const post = await PostModel.findByIdAndUpdate(
        req.params.postId,
        { title, content, linkFlairID },
        { new: true }
      );
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
   
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
});
  

// Create post
router.post('/', async (req, res) => {
    try {
        const { title, content, postedBy, communityId, linkFlairID } = req.body;

        const postID = await generateId('p');

        const post = new PostModel({
            postID,
            title,
            content,
            postedBy,
            postedDate: new Date(),
            linkFlairID: linkFlairID || null,
            commentIDs: [],
            views: 0,
            url: `/posts/${postID}`
        });

        const savedPost = await post.save();

        if (communityId) {
            const community = await CommunityModel.findById(communityId);
            if (community) {
                community.postIDs.push(savedPost._id);
                await community.save();
            }
        }

        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update post views
router.patch('/:postId/views', async (req, res) => {
    try {
        const post = await PostModel.findOneAndUpdate(
            { postID: req.params.postId },
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error updating views:', error);
        res.status(500).json({ message: error.message });
    }
});

// Search posts
router.post('/search', async (req, res) => {
    try {
        const { searchTerms } = req.body;
        
        if (!searchTerms || searchTerms.length === 0) {
            return res.json([]);
        }

        const searchRegex = searchTerms.map(term => new RegExp(term, 'i'));
        
        const posts = await PostModel.find({
            $or: [
                { title: { $in: searchRegex } },
                { content: { $in: searchRegex } }
            ]
        })
        .populate('linkFlairID')
        .populate({
            path: 'commentIDs',
            populate: {
                path: 'commentIDs',
                populate: {
                    path: 'commentIDs',
                    populate: {
                        path: 'commentIDs'
                    }
                }
            }
        })
        .lean()
        .exec();

        const postsWithCommunity = await Promise.all(posts.map(async (post) => {
            const community = await CommunityModel.findOne({
                postIDs: post._id
            }).lean().exec();

            return {
                ...post,
                communityName: community ? community.name : 'Unknown Community',
                communityId: community ? community._id : null
            };
        }));

        res.json(postsWithCommunity);
    } catch (error) {
        console.error('Error searching posts:', error);
        res.status(500).json({ message: error.message });
    }
});

// CREATE COMMENT IS HERE
router.post('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const { content, commentedBy, parentCommentID } = req.body;

    try {
        console.log('Comment creation request:', {
            postId,
            content,
            commentedBy,
            parentCommentID
        });

        const post = await PostModel.findOne({ postID: postId });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const commentID = await generateId('comment');
        const newComment = new CommentModel({
            commentID,
            content,
            commentedBy,
            commentedDate: new Date(),
            commentIDs: []
        });

        const savedComment = await newComment.save();

        if (parentCommentID) {
            // Handle reply
            const parentComment = await CommentModel.findById(parentCommentID);
            if (!parentComment) {
                return res.status(404).json({ message: 'Parent comment not found' });
            }
            parentComment.commentIDs = parentComment.commentIDs || [];
            parentComment.commentIDs.push(savedComment._id);
            await parentComment.save();
        } else {
            // Handle top-level comment
            post.commentIDs = post.commentIDs || [];
            post.commentIDs.push(savedComment._id);
            await post.save();
        }

        res.status(201).json(savedComment);

    } catch (error) {
        console.error('Comment creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.delete('/:postId', async (req, res) => {
    try {
      const post = await PostModel.findById(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
  
      for (const commentId of post.commentIDs) {
        const deleteCommentAndReplies = async (commentId) => {
          const comment = await CommentModel.findById(commentId);
          if (comment) {
            for (const replyId of comment.commentIDs) {
              await deleteCommentAndReplies(replyId);
            }
            await CommentModel.findByIdAndDelete(commentId);
          }
        };
        await deleteCommentAndReplies(commentId);
      }
  
      await PostModel.findByIdAndDelete(req.params.postId);
      
      res.json({ message: 'Post and comments deleted successfully' });
    } catch (error) {
      console.error('Delete error:', error);
      res.status(500).json({ message: error.message });
    }
  });



module.exports = router;