// api.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true
});

export const fetchCommunities = () => api.get('/communities'); // routes to comm
export const fetchPosts = () => api.get('/posts'); // routes to post
export const fetchPostsByCommunity = (communityId) => api.get(`/communities/${communityId}/posts`); // routes to comm
export const fetchLinkFlairs = () => api.get('/linkflairs'); // routes to linkflair 
export const fetchPost = (postId) => api.get(`/posts/${postId}`); // routes to post

export const createLinkFlair = (flairData) => { // routes to linflair
    console.log("data being logged:", flairData); // debuggnig
    return api.post('/linkflairs', flairData);
};

export const incrementViews = (postId) => api.patch(`/posts/${postId}/views`); // routes to post

export const searchPosts = (searchTerms) => api.post('/posts/search', { searchTerms });// specical routes to search 


//updoot and downdoot controls
export const upvotePost = (postId, username) => 
    api.patch(`/posts/${postId}/upvote`, { username });
export const downvotePost = (postId, username) => 
    api.patch(`/posts/${postId}/downvote`, { username });

export const upvoteComment = (commentId, username) => 
    api.patch(`/comments/${commentId}/upvote`, { username });
export const downvoteComment = (commentId, username) => 
    api.patch(`/comments/${commentId}/downvote`, { username });

// New post creation

// New community creation
export const createCommunity = (communityData) => api.post('/communities', communityData); // routes to comm

export const getCommunityMembers = (communityId) => api.get(`/communities/${communityId}/members`); // routes to comm

export const createPost = (postData) => { //routes to post  
    return api.post('/posts', {
        title: postData.title,
        content: postData.content,
        postedBy: postData.postedBy,
        linkFlairID: postData.linkFlairID,
        communityId: postData.communityId
    });
};

export const createComment = async (postId, commentData) => { // very spcial routes to comment
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
            content: commentData.content,
            commentedBy: commentData.commentedBy,
            parentCommentID: commentData.parentCommentID || null
        });
        return response.data;
    } catch (error) {
        console.error('Error creating comment:', error);
        throw {
            error: error.response?.data || error.message,
            status: error.response?.status,
            postID: postId,
            content: commentData.content
        };
    }
};

// User Authentication
export const signUp = (userData) => api.post('/auth/signup', {
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    displayName: userData.displayName,
    password: userData.password
});

export const login = (credentials) => api.post('/auth/login', {
    email: credentials.email,
    password: credentials.password
});

export const checkAuth = () => api.get('/auth/check');

export const logout = () => api.post('/auth/logout');

// User Profile/Reputation
export const updateUserReputation = (userId, change) => api.patch(`/users/${userId}/reputation`, { change });
export const getUserProfile = (displayName) => api.get(`/users/${displayName}`);

// User profile endpoints
export const getUserPosts = (userId) => api.get(`/users/${userId}/posts`);
export const getUserComments = (userId) => api.get(`/users/${userId}/comments`);
//export const getUserCommunities = (userId) => api.get(`/users/${userId}/communities`);

// Edit endpoints
export const editPost = (postId, postData) => 
    api.patch(`/posts/${postId}`, postData);
    
export const editComment = (commentId, commentData) => 
    api.patch(`/comments/${commentId}`, commentData);
   
// Delete endpoints
export const deletePost = (postId) => api.delete(`/posts/${postId}`);

export const deleteComment = (commentId) => 
    api.delete(`/comments/${commentId}`);
  
// community edpoints
export const joinCommunity = (communityId, displayName) => 
    api.post(`/communities/${communityId}/join`, { displayName });

export const leaveCommunity = (communityId, displayName) => 
    api.post(`/communities/${communityId}/leave`, { displayName });

export const getUserCommunities = (displayName) => 
    api.get(`/communities/${displayName}/communities`);

export const editCommunity = (communityId, updateData) => 
    api.patch(`/communities/${communityId}`, updateData);
  
export const deleteCommunity = (communityId) => 
    api.delete(`/communities/${communityId}`);

export const getUserCreatedCommunities = (displayName) => 
    api.get(`/communities/created/${displayName}`);

export const getUserMemberCommunities = (displayName) => 
    api.get(`/communities/member/${displayName}`);

export const getAllUsers = () => api.get('/users/all'); // shows correct REP

export const deleteUser = (userId) => api.delete(`/users/${userId}`);

export const removeVote = (postId, username) =>  // final attempt in not allowing multiple voting
    api.patch(`/posts/${postId}/removevote`, { username });

export const removeCommentVote = (commentId, username) => 
    api.patch(`/comments/${commentId}/removevote`, { username });


  
export default api;