import { useState, useEffect } from 'react';
import * as api from '../../api';
import '../../stylesheets/FinalProject.css';


export default function UserProfileView({ authState, onNavigate }) {
  const [contentType, setContentType] = useState(authState?.user?.user?.isAdmin ? 'users' : 'posts');
  const [userContent, setUserContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState({ show: false, type: null, id: null });
  const [currentReputation, setCurrentReputation] = useState(0);

  useEffect(() => {
    const fetchUserReputation = async () => {
        const userId = authState.user.user.displayName;
        console.log(userId);
        try {
            const response = await api.getUserProfile(userId);
            setCurrentReputation(response.data.reputation);
        } catch (error) {
            console.error('Error fetching reputation:', error);
        }
    };
    fetchUserReputation();
}, [viewingUser, authState.user.user._id]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        let data;

        switch(contentType) {
          case 'users':
            if (authState?.user?.user?.isAdmin) {
              data = await api.getAllUsers();
            }
            break;
          case 'posts':
            data = await api.getUserPosts(viewingUser?.displayName || authState.user.user.displayName);
            break;
          case 'communities':
            data = await api.getUserCreatedCommunities(viewingUser?.displayName || authState.user.user.displayName);
            break;
          case 'comments':
            data = await api.getUserComments(viewingUser?.displayName || authState.user.user.displayName);
            break;
        }
        setUserContent(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentType, authState.user.user.displayName, viewingUser]);

  const renderContent = () => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
  
    switch(contentType) {
      case 'users':
        return renderUserListing();
      
      case 'posts':
        return userContent.map(post => (
          <div key={post._id} className="content-item">
            <div>{post.title}</div>
            <div className="edit-delete-buttons">
              <button onClick={() => handleEdit('post', post._id)}>Edit</button>
              <button onClick={() => handleDelete('post', post._id)}>Delete</button>
            </div>
          </div>
        ));
  
      case 'communities':
        return userContent.map(community => (
          <div key={community._id} className="content-item">
            <div>{community.name}</div>
            <div className="edit-delete-buttons">
              <button onClick={() => handleEdit('community', community._id)}>Edit</button>
              <button onClick={() => handleDelete('community', community._id)}>Delete</button>
            </div>
          </div>
        ));
  
      case 'comments':
        return userContent.map(comment => (
          <div key={comment._id} className="content-item">
            <div>{comment.content?.substring(0, 100)}...</div>
            <div className="edit-delete-buttons">
              <button onClick={() => handleEdit('comment', comment._id)}>Edit</button>
              <button onClick={() => handleDelete('comment', comment._id)}>Delete</button>
            </div>
          </div>
        ));
  
      default:
        return <div>No content available</div>;
    }
  };

  const handleDelete = (type, id) => {
    setShowDeleteDialog({ show: true, type, id });
  };
  
  const handleEdit = async (type, id) => {
    const item = userContent.find(content => content._id === id);
    
    if (type === 'community') {
      console.log('Attempting to edit community:', item); // Debug log
      onNavigate('newCommunity', { communityToEdit: item });
    } else if (type === 'post') {
      onNavigate('newPost', { postToEdit: item });
    } else if (type === 'comment') {
      try {
        const posts = await api.fetchPosts();
        const postWithComment = posts.data.find(post => 
          post.commentIDs.some(comment => comment._id === item._id)
        );
        
        if (postWithComment) {
          // console.log('Navigating:', { //log
          //   postID: postWithComment.postID,
          //   commentToEdit: item 
          // });    
          onNavigate('newComment', { 
            postID: postWithComment.postID,
            commentToEdit: item 
          });
        } else {
          console.error('Could not find post containing comment');
        }
      } catch (error) {
        console.error('Error finding post for comment:', error);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const { type, id, userId } = showDeleteDialog;
      
      if (userId) {
        await api.deleteUser(userId);
        setUserContent(userContent.filter(user => user._id !== userId));
      } else {
        switch (type) {
          case 'community':
            await api.deleteCommunity(id);
            break;
          case 'post':
            await api.deletePost(id);
            break;
          case 'comment':
            await api.deleteComment(id);
            break;
        }
        
        window.location.reload();
        if (type) {
          const data = await api[`getUser${type.charAt(0).toUpperCase() + type.slice(1)}s`](authState.user.user.displayName);
          setUserContent(data.data || []);
        }
      }
      
      setShowDeleteDialog({ show: false, type: null, id: null, userId: null });
      window.location.reload();
    } catch (err) {
      setError(`Error deleting ${showDeleteDialog.type || 'user'}: ${err.message}`);
    }
  };
  

  const handleUserClick = (user) => {
    setViewingUser(user);
    setContentType('posts');
  };

  const returnToAdminView = () => {
    setViewingUser(null);
    setContentType('users');
  };

  const displayHeader = () => {
    const user = viewingUser || authState.user.user;
    return (
      <div className="profile-header">
        <h2>{user.displayName}'s Profile</h2>
        <div className="profile-stats">
          <div className="profile-stat-item">
            <div>Email</div>
            <div>{user.email}</div>
          </div>
          <div className="profile-stat-item">
            <div>Member Since</div>
            <div>{new Date(user.joinDate).toLocaleDateString()}</div>
          </div>
          <div className="profile-stat-item">
            <div>Reputation</div>
            <div>{currentReputation}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderUserListing = () => (
    <div className="user-listing">
      {userContent.map(user => (
        <div key={user._id} className="user-item">
          <button 
            onClick={() => handleUserClick(user)}
            className="user-link"
          >
            {user.displayName} | {user.email} | Reputation: {user.reputation}
          </button>
          {user._id !== authState.user.user._id && (
            <button
              onClick={() => setShowDeleteDialog({ show: true, userId: user._id })}
              className="delete-button"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="profile-container">
      {viewingUser && (
        <button onClick={returnToAdminView} className="return-admin">
          Return to Admin View
        </button>
      )}

      {displayHeader()}

      <div className="content-toggle">
        {authState?.user?.user?.isAdmin && !viewingUser && (
          <button 
            className={contentType === 'users' ? 'active' : ''}
            onClick={() => setContentType('users')}
          >
            All Users
          </button>
        )}
        <button 
          className={contentType === 'posts' ? 'active' : ''}
          onClick={() => setContentType('posts')}
        >
          Posts
        </button>
        <button 
          className={contentType === 'communities' ? 'active' : ''}
          onClick={() => setContentType('communities')}
        >
          Communities
        </button>
        <button 
          className={contentType === 'comments' ? 'active' : ''}
          onClick={() => setContentType('comments')}
        >
          Comments
        </button>
      </div>

      {showDeleteDialog.show && (
        <div className="delete-dialog">
          <p>Are you sure you want to delete this {showDeleteDialog.type}?</p>
          <div>
            <button onClick={handleDeleteConfirm}>Yes, Delete</button>
            <button onClick={() => setShowDeleteDialog({ show: false, type: null, id: null })}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="content-list">
          {renderContent()}
        </div>
      )}
    </div>
  );
}

