import { useState, useEffect } from 'react';
import Banner from './layout/Banner';
import Navbar from './layout/Navbar';
import HomeView from './views/HomeView';
import CommunityView from './views/CommunityView';
import SearchView from './views/SearchView';
import PostView from './views/PostView';
import NewCommunityView from './views/NewCommunityView';
import NewPostView from './views/NewPostView';
import NewCommentView from './views/NewCommentView';
import WelcomePage from './views/welcome';
import UserProfileView from './views/UserProfileView';
import * as api from '../api'; 

export default function Phreddit() {
  const [currentView, setCurrentView] = useState('welcome'); // defults to welcome

  const [authState, setAuthState] = useState(() => {
    const savedAuth = localStorage.getItem('authState');
    try {
      return savedAuth ? JSON.parse(savedAuth) : { type: null, user: null };
    } catch {
      return { type: null, user: null };
    }
  });
  

  useEffect(() => {
    if (authState?.type) {
      localStorage.setItem('authState', JSON.stringify(authState));
    } else {
      localStorage.removeItem('authState');
    }
  }, [authState]);
  
  useEffect(() => {
    // Redirect to home if the user is authenticated on refresh
    if (authState.type) {
      setCurrentView('home');
    } else {
      setCurrentView('welcome');
    }
  }, [authState.type]); // This ensures it runs when `authState.type` changes
  

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const authResponse = await api.checkAuth();
        if (authResponse.data.authenticated) {
          setAuthState({ 
            type: 'user', 
            user: { user: authResponse.data.user } // Match structure
          });
        }
      } catch (err) {
        localStorage.removeItem('authState');
        setAuthState({ type: null, user: null });
      }
    };
  
    checkAuthStatus();
  }, []);
  

  

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authState');
      setAuthState({ type: null, user: null });
      setCurrentView('welcome');
    }
  };
  
  const handleProfileClick = () => { // new
    setCurrentView('profile');
  };
  
  const handleAuth = (authData) => { // changed to account for api 
    setAuthState(authData);
    if (authData.type === 'user') {
      localStorage.setItem('authState', JSON.stringify(authData));
    }
    setCurrentView('home');
  };
  
  
  
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [posts, setPosts] = useState([]);
  const [selectedPostID, setSelectedPostID] = useState(null);
  const [selectedParentCommentID, setSelectedParentCommentID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCommentToEdit, setSelectedCommentToEdit] = useState(null); // the folowing added are for editing comments,comm,posts
  const [selectedCommunityToEdit, setSelectedCommunityToEdit] = useState(null);
  const [selectedPostToEdit, setSelectedPostToEdit] = useState(null);

  useEffect(() => { // this one fetch innit data
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [communitiesResponse, postsResponse, linkFlairsResponse] = await Promise.all([
          api.fetchCommunities(),
          api.fetchPosts(),
          api.fetchLinkFlairs()
        ]);
      
        setCommunities(communitiesResponse.data);

        const initialPosts = postsResponse.data.map(post => {
          const community = communitiesResponse.data.find(
            c => c.postIDs.includes(post._id)
          );
          const linkFlair = linkFlairsResponse.data.find(
            flair => flair._id === post.linkFlairID
          );
          return {
            ...post,
            communityName: community ? community.name : 'Unknown Community',
            linkFlair: linkFlair ? linkFlair.content : null
          };
        });
        setPosts(initialPosts);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is authenticated or guest
    if (authState.type) {
      fetchInitialData();
    }
  }, [authState.type]); // Re-fetch when auth state changes


  // MAIN NAVI
  const navigateTo = async (view, data = null) => {
    if ((view === 'post' || view === 'newComment') && data?.postID) {
      setSelectedPostID(data.postID);
      setSelectedParentCommentID(data?.parentCommentID || null);
      setSelectedCommentToEdit(data?.commentToEdit || null);
    } else if (view === 'newCommunity' && data?.communityToEdit) {
      setSelectedCommunityToEdit(data.communityToEdit);
    } else if (view === 'newPost' && data?.postToEdit) {
      setSelectedPostToEdit(data.postToEdit);
    } else {
      setSelectedPostID(null);
      setSelectedParentCommentID(null);
      setSelectedCommentToEdit(null);
      setSelectedCommunityToEdit(null);
      setSelectedPostToEdit(null);
    }
    setCurrentView(view);
  };
  
  //selection handler
  const handleCommunitySelect = async (community) => {
    try {
        console.log('Selected community:', community);
        
        if (!community || !community._id) {
            console.error('Invalid community data:', community);
            return;
        }

        // Make sure we're using the full _id
        const communityId = community._id.toString();
        console.log('Using community ID:', communityId);

        setSelectedCommunity(community);
        setCurrentView('community');
        
        const response = await api.fetchPostsByCommunity(communityId); // api call
        console.log('Community posts response:', response);

        // Ensure we have an array and transform the posts
        const communityPosts = Array.isArray(response.data) 
            ? response.data.map(post => ({
                ...post,
                communityName: community.name
              }))
            : [];
            
        console.log('Processed posts:', communityPosts);
        setPosts(communityPosts);
    } catch (err) {
        console.error('Error fetching community posts:', err);
        console.error('Error details:', {
            message: err.message,
            response: err.response?.data
        });
        setError(err.message);
    }
};


  // search 
  const onSearch = (query) => {
    setSearchQuery(query);
    navigateTo('search');
  };

  // Home click handler
  const handleHomeClick = async () => {
    try {
      setSelectedCommunity(null);
      const [postsResponse, communitiesResponse] = await Promise.all([
        api.fetchPosts(), // api calls
        api.fetchCommunities()
      ]);

      const allPosts = postsResponse.data.map(post => {
        const community = communitiesResponse.data.find(
          c => c.postIDs.includes(post._id)
        );
        return {
          ...post,
          communityName: community ? community.name : 'Unknown Community',
          linkFlair: post.linkFlairID ? post.linkFlairID.content : null
        };
      });
      setPosts(allPosts);
      navigateTo('home');
    } catch (err) {
      setError(err.message);
      console.error('Error fetching home data:', err);
    }
  };

  const handleCreatePost = () => navigateTo('newPost');
  
  const handleCreateComment = async (postID) => {
    setSelectedPostID(postID);
    navigateTo('newComment');
  };

  const handleCreateCommunity = () => navigateTo('newCommunity');

  // View renderer
  const renderView = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    switch(currentView) {
      case 'home':
        return (
          <HomeView 
            onNavigate={navigateTo} 
            posts={posts} 
            postsCount={posts.length}
            authState={authState}
          />
        );
      case 'community':
        return (
          <CommunityView 
            onNavigate={navigateTo} 
            community={selectedCommunity} 
            posts={posts}
            authState={authState}
          />
        );
      case 'search':
        return (
          <SearchView 
            onNavigate={navigateTo} 
            searchQuery={searchQuery}
            authState={authState}
          />
        );
      case 'post':
        return (
          <PostView 
            onNavigate={navigateTo}
            postID={selectedPostID}
            onCreateComment={handleCreateComment}
            authState={authState}  // stops commenting and updoots
          />
        );
      case 'newCommunity':
        return (
          <NewCommunityView 
            onNavigate={handleCommunitySelect}
            authState={authState}  
            communityToEdit={selectedCommunityToEdit}  
          />
        );
      case 'profile':
        return (
          <UserProfileView 
            authState={authState}
            onNavigate={navigateTo}
          />
        );
      case 'newPost':
        return (
          <NewPostView 
            onNavigate={navigateTo} 
            getMeHome={handleHomeClick}
            postToEdit={selectedPostToEdit}
            authState={authState}  
          />
        );
      case 'newComment':
        return (
          <NewCommentView 
            onNavigate={navigateTo} 
            postID={selectedPostID} 
            parentCommentID={selectedParentCommentID}
            commentToEdit={selectedCommentToEdit}  
            authState={authState}  
          />
        );
      default:
        return <HomeView onNavigate={navigateTo} posts={posts} />;
    }
  };

  if (currentView === 'welcome' && !authState.type) {
    return <WelcomePage onAuth={handleAuth} />;
  }

  return (
    <div>
      <Banner 
        currentView={currentView} 
        onCreatePost={handleCreatePost} 
        onSearch={onSearch}
        authState={authState}
        onHomeClick={handleHomeClick}
        onPhredditClick={() => setCurrentView('welcome')}
        onLogout={handleLogout}
        onProfileClick={handleProfileClick}
      />
      <div className="phreddit-container">
        <Navbar
          communities={communities}
          onHomeClick={handleHomeClick}
          onCreateCommunity={handleCreateCommunity}
          onCommunitySelect={handleCommunitySelect}
          selectedCommunity={selectedCommunity}
          currentView={currentView}
          authState={authState}
        />
        <main className="main">
          {renderView()}
        </main>
      </div>
    </div>

  );
}