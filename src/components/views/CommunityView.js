import React, { useState, useEffect } from 'react';
import PostCard from '../post/PostCard';
import Time from '../utils/Time';
import * as api from '../../api'; 

export default function CommunityView({ community, posts = [], onNavigate, authState,}) { 
  const [sortOrder, setSortOrder] = useState('Newest');
  const [memberCount, setMemberCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isMember, setIsMember] = useState(false); // new

  useEffect(() => {
    if (authState?.type === 'user' && community?.members) {
      setIsMember(community.members.includes(authState.user.user.displayName));
    }
  }, [community, authState]);
  
  useEffect(() => {
    const fetchMemberCount = async () => {
      if (!community?._id) return;
      console.log('CommunityView received props:', {
        community,
        postsCount: posts?.length,
        posts
    });

      try {
        setLoading(true);
        const response = await api.getCommunityMembers(community._id);
        setMemberCount(response.data.length);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching member count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberCount();
  }, [community]);

  useEffect(() => {
    const checkMembership = async () => {
      try {
        if (authState?.type === 'user' && community?._id) {
          const response = await api.getCommunityMembers(community._id);
          const isUserMember = response.data.includes(authState.user.user.displayName);
          setIsMember(isUserMember);
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };

    checkMembership();
  }, [community?._id, authState]);


  useEffect(() => {
    const checkMembership = async () => {
      try {
        if (authState?.type === 'user' && community?._id) {
          const response = await api.getCommunityMembers(community._id);
          setMemberCount(response.data.length);
          setIsMember(response.data.includes(authState.user.user.displayName));
        }
      } catch (error) {
        console.error('Error checking membership:', error);
      }
    };

    checkMembership();
  }, [community?._id, authState]);

  const handleMembership = async () => {
    if (!authState?.type === 'user') return;
    
    setLoading(true);
    try {
      if (isMember) {
        await api.leaveCommunity(community._id, authState.user.user.displayName);
        setIsMember(false);
        setMemberCount(prev => prev - 1);
      } else {
        await api.joinCommunity(community._id, authState.user.user.displayName);
        setIsMember(true);
        setMemberCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Membership action failed:', error);
    } finally {
      setLoading(false);
    }
  };



  if (!community) return null;

  const handleSort = (order) => {
    setSortOrder(order);
  };

  const handlePostClick = (postID) => {
    onNavigate('post', { postID }); 
  };

  return (
    <div className="community-view">
      {/* Community Header Section */}
      <header className="community-header" style={{ marginBottom: '24px' }}>
        <h1 className="big_header" style={{ marginBottom: '12px' }}> {community.name} </h1>
        <p className="community-description" style={{ marginBottom: '12px' }}> {community.description} </p>
        {authState?.type === 'user' && (
          <button 
            onClick={handleMembership}
            disabled={loading}
            className={`membership-button ${isMember ? 'leave' : 'join'}`}
          >
            {loading ? 'Processing...' : isMember ? 'Leave Community' : 'Join Community'}
          </button>
        )}

        <Time date={community.startDate} style={{margin: '10px'}}/>
        <div className="community-stats" style={{ display: 'flex', gap: '8px' }}>
          <span>{posts.length} Posts</span>
          <span>•</span>
          <span>
            {loading ? 'Loading members...' : 
             error ? 'Error loading members' :
             `${memberCount} Members`}
          </span>
        </div>
      </header>

      {/* Sort Buttons */}
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

      {/* Posts Section */}
      <PostCard 
        posts={posts}
        sortOrder={sortOrder}
        onPostClick={handlePostClick}
        hideCommonityName={true}
        authState={authState}
      />
    </div>
  );
}