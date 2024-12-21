import React, { useEffect, useState } from 'react';
import Time from '../utils/Time';
import Comment from '../utils/comment';
import * as api from '../../api'; 

const PostView = ({ onNavigate, postID, authState }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voteCount, setVoteCount] = useState(0); // new state 
  const [views, setViews] = useState(0);

  useEffect(() => { // dynamically count number of votes
      if (post) {
          setVoteCount(post.votes || 0);
      }
  }, [post]);

  useEffect(() => {
    if (post) {
      setVoteCount(post.votes || 0);
      setViews(post.views || 0);
    }
  }, [post]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await api.fetchPost(postID);
        setPost(response.data);

        setViews((prevViews) => prevViews + 1);

        await api.incrementViews(postID);
      } catch (err) {
        setError('Error loading post: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postID]);


  const handleCommentClick = (commentID) => {
    onNavigate('newComment', { postID, parentCommentID: commentID }); 
};

const handleVote = async (postId, isUpvote) => {
  if (authState?.type === 'guest' || !authState?.user) {
    alert('Please log in to vote');
    return;
  }

  const user = authState.user.user;
  
  if (user.reputation < 50) {
    alert('You need at least 50 reputation to vote');
    return;
  }

  if (post.postedBy === user.displayName) {
    alert('You cannot vote on your own post');
    return;
  }

  // Find existing vote
  const existingVote = post.votedBy?.find(vote => vote.user === user.displayName);
  
  // If they've already voted this way, remove their vote
  if (existingVote && ((isUpvote && existingVote.vote === 1) || (!isUpvote && existingVote.vote === -1))) {
    try {
      const response = await api.removeVote(postId, user.displayName);
      setVoteCount(response.data.votes);
    } catch (error) {
      alert(error.response?.data?.message || 'Error removing vote');
    }
    return;
  }

  // If they've already voted the other way, don't allow direct switch
  if (existingVote) {
    alert('Remove your existing vote before voting in the other direction');
    return;
  }

  // Add new vote
  try {
    const voteFunction = isUpvote ? api.upvotePost : api.downvotePost;
    const response = await voteFunction(postId, user.displayName);
    setVoteCount(response.data.votes);
  } catch (error) {
    alert(error.response?.data?.message || 'Error voting on post');
  }
};

  const buildCommentTree = (comment, level = 0) => {
    if (!comment) return null;

    const indent = level * 20;
    return (
      <div 
        key={comment._id}
        style={{ marginLeft: `${indent}px`, borderLeft: '1px solid #ccc', paddingLeft: '10px' }} 
        className="mb-4"
      >
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-medium">{comment.commentedBy}</span>
          <span> | </span>
          <span><Time date={comment.commentedDate} /></span>
        </div>
        <p className="my-2">{comment.content}</p>
        <button 
          onClick={() => handleCommentClick(comment._id)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Reply
        </button>
        <div className="mt-4" style={{display:'flex', flexDirection:'column'}}>
        {comment.commentIDs?.map(reply => (// will react fragment fix this?
          <React.Fragment key={reply._id}>
            {buildCommentTree(reply, level + 1)} 
          </React.Fragment>
        ))}
        </div>
      </div>
    );
  };

  const countTotalComments = (comments) => {
    if (!comments) return 0;
    let total = comments.length;

    const countReplies = (comment) => {
        if (comment?.commentIDs?.length > 0) {
            total += comment.commentIDs.length;
            comment.commentIDs.forEach(reply => {
                countReplies(reply);
            });
        }
    };

    comments.forEach(comment => {
        countReplies(comment);
    });

    return total;
};

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (!post) return <div>Post not found</div>;

const totalComments = countTotalComments(post.commentIDs);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-bold">{post.communityName}</span>
          <span> | </span>
          <span><Time date={post.postedDate} /></span>
        </div>
        
        <div className="mt-2 text-sm text-gray-600">
          Posted by {post.postedBy}
        </div>

        <h1 className="mt-2 text-2xl font-bold">
          {post.title}
        </h1>

        {(post.linkFlair || post.linkFlairID?.content) && (
                <div className="mt-2">
                    <span className="link-flair">
                        {post.linkFlair || post.linkFlairID?.content}
                    </span>
                </div>
            )}


        <p className="mt-4 text-gray-800">
          {post.content}
        </p>

        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">

        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">

  <div className="vote-controls" style={{
    display: 'flex',
    alignItems: 'center',
    gap: '5px'
  }}>
    <button
      className='voting'
      onClick={() => handleVote(post.postID, true)}
      style={{
        opacity: authState?.type === 'guest' ? 0.5 : 1,
        cursor: authState?.type === 'guest' ? 'not-allowed' : 'pointer',
        background: 'none',
        border: 'none',
        padding: '5px',
        fontSize: '1.2em'
      }}
      disabled={authState?.type === 'guest'}
    > ▲ </button>
    <span>{voteCount}</span>
    <button
      onClick={() => handleVote(post.postID, false)}
    style={{
        opacity: authState?.type === 'guest' ? 0.5 : 1,
        cursor: authState?.type === 'guest' ? 'not-allowed' : 'pointer',
        background: 'none',
        border: 'none',
        padding: '5px',
        fontSize: '1.2em'
      }}
      disabled={authState?.type === 'guest'}
    >▼</button>
  </div>
  </div>

          <span>{views} views | </span>
          <span>{totalComments} comments | </span>
        </div>

        {authState?.type !== 'guest' && ( // stops add comment bttn from appearing
        <button
          onClick={() => handleCommentClick(null)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add a comment
        </button>
        )} 

        <hr className="mt-6 border-t border-gray-300" />
      </div>

      <div className="mt-6">
      {post.commentIDs?.map(comment => (
                    <Comment
                        key={comment._id}
                        comment={{
                          ...comment,
                          commentID: comment.commentID  // Add this line to ensure commentID exists
                      }}              
                        onReply={authState?.type !== 'guest' ? handleCommentClick : undefined}
                        isGuest={authState?.type === 'guest'}
                        authState={authState}
                        />
                ))}

      </div>
    </div>
  );
};

export default PostView;