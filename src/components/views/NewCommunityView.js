import React, { useState } from 'react';
import * as api from '../../api'; 

const NewCommunityView = ({ onNavigate,authState, communityToEdit = null }) => {
  const [communityName, setCommunityName] = useState(communityToEdit?.name || '');
  const [communityDescription, setCommunityDescription] = useState(communityToEdit?.description || '');
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const [errors, setErrors] = useState({
    name: '',
    description: ''
  });

  //console.log('NewCommunityView props:', { communityToEdit }); // Debug log


  const validateFields = () => {
    let isValid = true;
    const newErrors = { name: '', description: ''};
    
    if (communityName.length === 0 || communityName.length > 100) {
      newErrors.name = 'Community name cannot be empty and must be less than 100 characters.';
      isValid = false;
    }
    if (communityDescription.length === 0 || communityDescription.length > 500) {
      newErrors.description = 'Community description cannot be empty and must be less than 500 characters.';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateFields()) return;

    try {
      setLoading(true);
      const communityData = {
        name: communityName,
        description: communityDescription,
        createdBy: authState.user.user.displayName,
        creator: authState.user.user.displayName 
      };

      if (communityToEdit) {
        await api.editCommunity(communityToEdit._id, communityData);
      } else {
        const response = await api.createCommunity(communityData);
        onNavigate(response.data);
      }
      window.location.reload();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        name: error.response?.data?.message || 'Error with community'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!communityToEdit) return;
    
    try {
      setLoading(true);
      await api.deleteCommunity(communityToEdit._id);
      window.location.reload();
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        name: 'Error deleting community'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Create Community</h2>
      <form onSubmit={handleSubmit} id="communityForm" style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', width: '100%' }}>
        
        <label htmlFor="communityName" style={{ fontFamily: 'Verdana' }}>
          Community Name: <span style={{ color: 'red' }}>*</span>
          <input
            type="text"
            id="communityName"
            name="communityName"
            value={communityName}
            onChange={(e) => setCommunityName(e.target.value)}
            style={{ width: '500px' }}
            className="form-input"
            disabled={loading}
          />
          {errors.name && <div id="nameError" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.name}</div>}
        </label>
  
        <label htmlFor="communityDescription" style={{ fontFamily: 'Verdana' }}>
          Community Description: <span style={{ color: 'red' }}>*</span>
          <textarea
            id="communityDescription"
            name="communityDescription"
            value={communityDescription}
            onChange={(e) => setCommunityDescription(e.target.value)}
            style={{ width: '500px' }}
            rows="4"
            className="form-input"
            disabled={loading}
          />
          {errors.description && <div id="descriptionError" style={{ color: 'red', fontSize: '0.8rem' }}>{errors.description}</div>}
        </label>
    
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            style={{ margin: '10px', padding: '10px 20px', width: '12rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : communityToEdit ? 'Update Community' : 'Engender Community'}
          </button>

          {communityToEdit && (
            <button
              type="button"
              onClick={() => setShowDeleteDialog(true)}
              style={{ margin: '10px', padding: '10px 20px', width: '12rem' }}
              disabled={loading}
            >
              Delete Community
            </button>
          )}
        </div>
      </form>

      {showDeleteDialog && (
        <div className="delete-dialog">
          <p>Are you sure? This will delete all posts and comments in this community.</p>
          <button onClick={handleDelete}>Yes, Delete</button>
          <button onClick={() => setShowDeleteDialog(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default NewCommunityView;