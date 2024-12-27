import { useState, useEffect } from 'react';
import * as api from '../../api'; // Adjust the path as needed

export default function NewPostView({ onNavigate, getMeHome,authState,postToEdit = null }) {
  const [communities, setCommunities] = useState([]);
  const [linkFlairs, setLinkFlairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [community, setCommunity] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  //const [username, setUsername] = useState('');
  const [linkFlair, setLinkFlair] = useState('');
  const [newLinkFlair, setNewLinkFlair] = useState('');

  const [errors, setErrors] = useState({
    title: '',
    content: '',
    //username: '',
    linkFlair: '',
    community: '',
  });

  // fetch comm for mount 
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [communitiesResponse, linkFlairsResponse] = await Promise.all([
          api.fetchCommunities(),
          api.fetchLinkFlairs()
        ]);
        setCommunities(communitiesResponse.data);
        setLinkFlairs(linkFlairsResponse.data);
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (postToEdit) {
      setTitle(postToEdit.title);
      setContent(postToEdit.content);
      setLinkFlair(postToEdit.linkFlairID?._id || '');

      const findCommunity = async () => {
        try {
          const communitiesResponse = await api.fetchCommunities();
          const community = communitiesResponse.data.find(comm => 
            comm.postIDs.includes(postToEdit._id)
          );
          if (community) {
            setCommunity(community._id);
          }
        } catch (err) {
          console.error('Error finding community:', err);
        }
      };

      findCommunity();  
    }
  }, [postToEdit]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // validatio 
    if (!title || title.length > 100) newErrors.title = 'Title is required and must be less than 100 characters.';
    if (!content) newErrors.content = 'Post content is required.';
    //if (!linkFlair && !newLinkFlair) newErrors.linkFlair = 'Please select or create a link flair.'; no need
    if (!community) newErrors.community = 'Please select a community.';

    setErrors(newErrors);

    if (!Object.values(newErrors).some(error => error)) {
      try {
        let usedLinkFlairID = linkFlair;
        if (newLinkFlair) {
          const newFlairResponse = await api.createLinkFlair({ content: newLinkFlair });
          usedLinkFlairID = newFlairResponse.data._id;
        }
  
        // Create post data object, omitting linkFlairID if it's empty
        const postData = {
          title,
          content,
          communityId: community,
          ...(usedLinkFlairID ? { linkFlairID: usedLinkFlairID } : {})
        };
  
        if (postToEdit) {
          await api.editPost(postToEdit._id, postData);
        } else {
          // Add postedBy only for new posts
          await api.createPost({
            ...postData,
            postedBy: authState.user.user.displayName
          });
        }
        getMeHome();
      } catch (err) {
        console.error('Post operation error:', err);
        setError('Error with post: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>{postToEdit ? 'Edit Post' : 'Create New Post'}</h2>
      <form onSubmit={handleSubmit}>
        {/* community */}
        <div>
          <label htmlFor="community">Community: *</label>
          <select
            id="community"
            value={community}
            onChange={(e) => setCommunity(e.target.value)}
          >
            <option value="">Select a community</option>
            {communities.map((comm) => (
              <option key={comm._id} value={comm._id}>
                {comm.name}
              </option>
            ))}
          </select>
          {errors.community && <p style={{ color: 'red' }}>{errors.community}</p>}
        </div>

        {/* title */}
        <div>
          <label htmlFor="title">Title: *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
          {errors.title && <p style={{ color: 'red' }}>{errors.title}</p>}
        </div>

        {/* link flair */}
        <div>
          <label htmlFor="linkFlair">Link Flair:</label>
          <select
            id="linkFlair"
            value={linkFlair}
            onChange={(e) => {
              setLinkFlair(e.target.value);
              setNewLinkFlair('');
            }}
          >
            <option value="">Select a link flair</option>
            {linkFlairs.map((flair) => (
              <option key={flair._id} value={flair._id}>
                {flair.content}
              </option>
            ))}
          </select>
          <p>Or create a new link flair:</p>
          <input
            type="text"
            value={newLinkFlair}
            onChange={(e) => {
              setNewLinkFlair(e.target.value);
              setLinkFlair('');
            }}
            maxLength={30}
            placeholder="New link flair"
          />
          {errors.linkFlair && <p style={{ color: 'red' }}>{errors.linkFlair}</p>}
        </div>

        {/* content */}
        <div>
          <label htmlFor="content">Content: *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          {errors.content && <p style={{ color: 'red' }}>{errors.content}</p>}
        </div>
        {/* Submit Button */}
        <button type="submit">Submit Post</button>
      </form>
    </div>
  );
}