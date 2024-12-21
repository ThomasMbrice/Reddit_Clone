import { useState } from 'react';
import * as api from '../../api';


export default function NewCommentView({ onNavigate, postID, parentCommentID = null,authState,commentToEdit = null }) {
  //console.log('NewCommentView :', { postID, parentCommentID, commentToEdit });
  const [content, setContent] = useState(commentToEdit?.content || '');
  const [errors, setErrors] = useState({ content: '', username: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = { content: '' };
 
    if (!content || content.length > 500) {
      newErrors.content = 'Comment content is required and must be less than 500 characters.';
    }
    
    setErrors(newErrors);
 
    if (!Object.values(newErrors).some((error) => error)) {
      try {
        if (commentToEdit) {
          await api.editComment(commentToEdit._id, { content });
        } else {
          await api.createComment(postID, {
            content,
            commentedBy: authState.user.user.displayName,
            parentCommentID
          });
        }
        onNavigate('post', { postID });
      } catch (error) {
        setErrors({ content: 'Error saving comment' });
      }
    }
  };
 

  return (
    <div>
     <h2>{commentToEdit ? 'Edit Comment' : 'Add a Comment'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="content">Content: *</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={500}
          ></textarea>
          {errors.content && <p style={{ color: 'red' }}>{errors.content}</p>}
        </div>

        <button type="submit">Submit Comment</button>
      </form>
    </div>
  );
}
