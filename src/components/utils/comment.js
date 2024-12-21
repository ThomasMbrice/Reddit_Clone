// components/Comment.js
import { useEffect, useState } from 'react';
import Time from './Time';
import * as api from '../../api';

const Comment = ({ comment, onReply, level = 0, isGuest, authState }) => {
    const [commentVoteData, setCommentVoteData] = useState({
        votes: 0,
        votedBy: []
    });

    useEffect(() => {
        if (comment) {
            setCommentVoteData({
                votes: comment.votes || 0,
                votedBy: comment.votedBy || []
            });
        }
    }, [comment]);

    if (!comment) return null;

    const indent = level * 20;

    const handleVote = async (isUpvote) => {
        if (authState?.type === 'guest' || !authState?.user) {
            alert('Please log in to vote');
            return;
        }
    
        const user = authState.user.user;
        
        if (user.reputation < 50) {
            alert('You need at least 50 reputation to vote');
            return;
        }
    
        if (comment.commentedBy === user.displayName) {
            alert('You cannot vote on your own comment');
            return;
        }
    
        try {
            const voteFunction = isUpvote ? api.upvoteComment : api.downvoteComment;
            const response = await voteFunction(comment.commentID, user.displayName);
            setCommentVoteData({
                votes: response.data.votes,
                votedBy: response.data.votedBy
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Error voting on comment');
        }
    };

    return (
        <div style={{ marginLeft: `${indent}px`, borderLeft: '1px solid #ccc', paddingLeft: '10px' }} className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">{comment.commentedBy}</span>
                <span> | </span>
                <span><Time date={comment.commentedDate}/></span>
                <span> | </span>
                
                <div className="vote-controls">
                    <button
                        onClick={() => handleVote(true)}
                        disabled={authState?.type === 'guest'}
                        style={{opacity: authState?.type === 'guest' ? 0.5 : 1}}
                    >
                        ▲
                    </button>
                    <span>{commentVoteData.votes}</span>
                    <button
                        onClick={() => handleVote(false)}
                        disabled={authState?.type === 'guest'}
                        style={{opacity: authState?.type === 'guest' ? 0.5 : 1}}
                    >
                        ▼
                    </button>
                </div>
            </div>
            <p className="my-2">{comment.content}</p>
            {!isGuest && (
                <button 
                    onClick={() => onReply(comment._id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    Reply
                </button>
            )}

            {Array.isArray(comment.commentIDs) && comment.commentIDs.length > 0 && (
                <div className="mt-4">
                    {comment.commentIDs.map(reply => (
                        <Comment 
                            key={`comment-${reply._id || reply}`}
                            comment={reply}
                            onReply={onReply}
                            level={level + 1}
                            isGuest={isGuest}
                            authState={authState}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comment;