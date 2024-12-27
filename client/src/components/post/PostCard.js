import React, { useState } from 'react';
import Time from '../utils/Time';
import * as api from '../../api';

export default function PostCard({ posts, sortOrder = 'Newest', onPostClick, hideCommonityName = false, authState }) {

  //old methods
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === 'Newest') {
      return new Date(b.postedDate) - new Date(a.postedDate);
    } else if (sortOrder === 'Oldest') {
      return new Date(a.postedDate) - new Date(b.postedDate);
    } else if (sortOrder === 'Active') {
      const getMostRecentCommentDate = (post) => {
        if (!post.commentIDs || post.commentIDs.length === 0) {
          return new Date(post.postedDate);
        }
        return new Date(Math.max(...post.commentIDs.map(comment => 
          new Date(comment.commentedDate || post.postedDate)
        )));
      };
      
      const aLatestComment = getMostRecentCommentDate(a);
      const bLatestComment = getMostRecentCommentDate(b);
      
      if (aLatestComment.getTime() !== bLatestComment.getTime()) {
        return bLatestComment - aLatestComment;
      }
      return new Date(b.postedDate) - new Date(a.postedDate);
    }
    return 0;
  });

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

  return (
    <div className="posts-container" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
      {sortedPosts.map((post) => (
        <div 
          key={post._id}
          className="post"
          onClick={() => onPostClick(post.postID)}
          style={{
            padding: '15px',
            borderBottom: '1px dotted black',
            cursor: 'pointer'
          }}
        >
          <div className="post-header" style={{ marginBottom: '8px' }}>
            {!hideCommonityName && (
              <>
                <span className="community-name" style={{ fontWeight: 'bold' }}>
                  {post.communityName}
                </span>
                <span className="separator"> | </span>
              </>
            )}
            <span className="posted-by">{post.postedBy}</span>
            <span className="separator"> | </span>
            <span className="timestamp"><Time date={post.postedDate}/></span>
          </div>
        
          <h3 className="post-title" style={{ margin: '8px 0'}}>
            {post.title}
          </h3>

          {(post.linkFlair || post.linkFlairID?.content) && (
            <div className="link-flair">
              {post.linkFlair || post.linkFlairID?.content}
            </div>
          )}

          <p className="post-content" style={{ margin: '8px 0' }}>
            {post.content.slice(0, 80)}
            {post.content.length > 80 ? '...' : ''}
          </p>

          <div 
            className="post-stats"
            style={{
              display: 'flex',
              gap: '20px',
              fontSize: '0.9em',
              color: '#666'
            }}
          >
            <span>{post.views} views</span>
            <span>{countTotalComments(post.commentIDs)} comments</span>
            <span>{post.votes || 0} votes</span>
          </div>
        </div>
      ))}
    </div>
  );
}