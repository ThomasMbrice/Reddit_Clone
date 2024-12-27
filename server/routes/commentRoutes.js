// server/routes/commentRoutes.js
const express = require('express');
const commentRouter = express.Router();
const CommentModel = require('../models/comments');
const PostModel = require('../models/posts');
const UserModel = require('../models/user');

commentRouter.get('/posts/:postID/comments', async (req, res) => {
    try {
        const post = await PostModel.findById(req.params.postID).populate('commentIDs');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post.commentIDs);
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ message: error.message });
    }
});

//delete
commentRouter.delete('/:commentId', async (req, res) => {
    try {
        const comment = await CommentModel.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const deleteReplies = async (commentIDs) => {
            for (const replyId of commentIDs) {
                const reply = await CommentModel.findById(replyId);
                if (reply?.commentIDs?.length) {
                    await deleteReplies(reply.commentIDs);
                }
                await CommentModel.findByIdAndDelete(replyId);
            }
        };

        if (comment.commentIDs?.length) {
            await deleteReplies(comment.commentIDs);
        }

        await CommentModel.findByIdAndDelete(req.params.commentId);
        res.json({ message: 'Comment and replies deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//edit
commentRouter.patch('/:commentId', async (req, res) => {
    try {
        const { content } = req.body;
        const comment = await CommentModel.findByIdAndUpdate(
            req.params.commentId,
            { content },
            { new: true }
        );
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
 
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
 
commentRouter.patch('/:commentId/upvote', async (req, res) => {
    try {
        const { username } = req.body;
        const comment = await CommentModel.findOne({ commentID: req.params.commentId });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const voteIndex = comment.votedBy.findIndex(vote => vote.user === username);
        const commenter = await UserModel.findOne({ displayName: comment.commentedBy });

        if (voteIndex === -1) {
            comment.votedBy.push({ user: username, vote: 1 });
            comment.votes = (comment.votes || 0) + 1;
            if (commenter) {
                commenter.reputation += 5;
                await commenter.save();
            }
        } else {
            const oldVote = comment.votedBy[voteIndex].vote;
            comment.votes -= oldVote;
            comment.votedBy.splice(voteIndex, 1);
            if (commenter) {
                commenter.reputation -= oldVote === 1 ? 5 : -10;
                await commenter.save();
            }
        }

        await comment.save();
        
        res.json({
            votes: comment.votes,
            votedBy: comment.votedBy
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});

commentRouter.patch('/:commentId/downvote', async (req, res) => {
    try {
        const { username } = req.body;
        const comment = await CommentModel.findOne({ commentID: req.params.commentId });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const voteIndex = comment.votedBy.findIndex(vote => vote.user === username);
        const commenter = await UserModel.findOne({ displayName: comment.commentedBy });

        if (voteIndex === -1) {
            comment.votedBy.push({ user: username, vote: -1 });
            comment.votes = (comment.votes || 0) - 1;
            if (commenter) {
                commenter.reputation -= 10;
                await commenter.save();
            }
        } else {
            const oldVote = comment.votedBy[voteIndex].vote;
            comment.votes -= oldVote;
            comment.votedBy.splice(voteIndex, 1);
            if (commenter) {
                commenter.reputation -= oldVote === 1 ? 5 : -10;
                await commenter.save();
            }
        }

        await comment.save();
        
        res.json({
            votes: comment.votes,
            votedBy: comment.votedBy
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});

commentRouter.patch('/:commentId/removevote', async (req, res) => {
    try {
        const { username } = req.body;
        const comment = await CommentModel.findOne({ commentID: req.params.commentId });
        
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const existingVote = comment.votedBy.find(vote => vote.user === username);
        if (!existingVote) {
            return res.status(404).json({ message: 'No vote found' });
        }

        comment.votedBy = comment.votedBy.filter(vote => vote.user !== username);
        comment.votes = comment.votes - existingVote.vote;

        const commenter = await UserModel.findOne({ displayName: comment.commentedBy });
        if (commenter) {
            commenter.reputation += existingVote.vote === 1 ? -5 : 10;
            await commenter.save();
        }

        await comment.save();
        return res.json({ votes: comment.votes });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = commentRouter;
