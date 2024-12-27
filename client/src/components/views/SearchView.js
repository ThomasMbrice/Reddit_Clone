import React, { useState, useEffect } from 'react';
import PostCard from '../post/PostCard';
import * as api from '../../api';

export default function SearchView({ searchQuery, onNavigate, authState}) {
  const [sortOrder, setSortOrder] = useState('Newest');
  const [communityResults, setCommunityResults] = useState([]);
  const [otherResults, setOtherResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery) {
        setCommunityResults([]);
        setOtherResults([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const searchTerms = searchQuery.toLowerCase()
          .split(' ')
          .filter(term => !['is', 'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to'].includes(term));

        const response = await api.searchPosts(searchTerms);
        
        if (authState?.type === 'user') {
          const userComms = await api.getUserMemberCommunities(authState.user.user.displayName);
          const memberPosts = response.data.filter(post => 
              userComms.data.some(comm => comm._id === post.communityId)
          );
          const otherPosts = response.data.filter(post => 
              !userComms.data.some(comm => comm._id === post.communityId)
          );
          setCommunityResults(memberPosts);
          setOtherResults(otherPosts);
      }
       else {
          setOtherResults(response.data);
        }
      } catch (err) {
        setError('Error performing search: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [searchQuery, authState]);

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePostClick = (postId) => {
    onNavigate('post', { postID: postId });
  };

  if (loading) return <div>Searching...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="search-view">
      {communityResults.length > 0 && (
        <div className="search-section">
          <h2 className="big_header">Your Communities: {searchQuery}</h2>
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
        <div className="search-section">
          {communityResults.length > 0 && <hr />}
          <h2 className="big_header">Other Communities: {searchQuery}</h2>
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
          <h2 className="big_header">No results found: {searchQuery}</h2>
          <p>No posts found matching your search terms</p>
        </div>
      )}
    </div>
  );
}
