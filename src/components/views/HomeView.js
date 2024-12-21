import React, { useState, useEffect } from 'react';
import PostCard from '../post/PostCard';
import * as api from '../../api';

export default function HomeView({ posts, onNavigate, authState }) {
  const [sortOrder, setSortOrder] = useState('Newest');
  const [communityResults, setCommunityResults] = useState([]);
  const [otherResults, setOtherResults] = useState([]);

  useEffect(() => {
    const createHomePage = async () => {
      try {
        if (authState?.type === 'user') {
          const userComms = await api.getUserMemberCommunities(authState.user.user.displayName);
          console.log('User communities:', userComms.data);
          console.log('All posts:', posts);

          const memberPosts = posts.filter(post => 
            userComms.data.some(comm => comm.name === post.communityName)
          );

          const otherPosts = posts.filter(post => 
            !userComms.data.some(comm => comm.name === post.communityName)
          );

          console.log('Member posts:', memberPosts);
          console.log('Other posts:', otherPosts);
          
          setCommunityResults(memberPosts);
          setOtherResults(otherPosts);
        } else {
          setOtherResults(posts);
        }
      } catch (error) {
        console.error('Error organizing posts:', error);
      }
    };
    createHomePage();
  }, [posts, authState]);

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePostClick = (postID) => {
    onNavigate('post', { postID }); 
  };
  
  return (
    <div>
      {communityResults.length > 0 && (
        <div className="home-section">
          <h1 className='big_header'>Your Community Posts</h1>
          <p className="counter_p">{communityResults.length} Posts</p>
          
          <div id="main_button_wrapper">
            <button 
              className={`newestbttn ${sortOrder === 'Newest' ? 'active' : ''}`}
              onClick={() => handleSort('Newest')}
            >
              Newest
            </button>
            <button 
              className={`oldestbttn ${sortOrder === 'Oldest' ? 'active' : ''}`}
              onClick={() => handleSort('Oldest')}
            >
              Oldest
            </button>
            <button 
              className={`activebttn ${sortOrder === 'Active' ? 'active' : ''}`}
              onClick={() => handleSort('Active')}
            >
              Active
            </button>
          </div>

          <PostCard 
            posts={communityResults}
            sortOrder={sortOrder}
            onPostClick={handlePostClick}
            authState={authState}
          />
        </div>
      )}

      {otherResults.length > 0 && (
        <div className="home-section">
          {communityResults.length > 0 && <hr className="section-divider" />}
          <h1 className='big_header'>Other Community Posts</h1>
          <p className="counter_p">{otherResults.length} Posts</p>

          <div id="main_button_wrapper">
            <button 
              className={`newestbttn ${sortOrder === 'Newest' ? 'active' : ''}`}
              onClick={() => handleSort('Newest')}
            >
              Newest
            </button>
            <button 
              className={`oldestbttn ${sortOrder === 'Oldest' ? 'active' : ''}`}
              onClick={() => handleSort('Oldest')}
            >
              Oldest
            </button>
            <button 
              className={`activebttn ${sortOrder === 'Active' ? 'active' : ''}`}
              onClick={() => handleSort('Active')}
            >
              Active
            </button>
          </div>

          <PostCard 
            posts={otherResults}
            sortOrder={sortOrder}
            onPostClick={handlePostClick}
            authState={authState}
          />
        </div>
      )}

      {!communityResults.length && !otherResults.length && (
        <div>
          <h1 className='big_header'>No Posts Available</h1>
        </div>
      )}
    </div>
  );
}