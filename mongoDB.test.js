// server/mongoDB.test.js
const mongoose = require('mongoose');
const PostModel = require('./models/posts');
const CommentModel = require('./models/comments');
const { postRouter } = require('./routes');
const express = require('express');
const request = require('supertest');

const app = express();
app.use(express.json());
app.use('/posts', postRouter);

describe('Post Deletion Tests', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://127.0.0.1:27017/phreddit_test');
  });
 
  beforeEach(async () => { // must cleanup bc unique posts ids
    await PostModel.deleteMany({});
    await CommentModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('deleting a post should remove all associated comments', async () => {
    const uniqueId = Date.now().toString();
    const post = new PostModel({
      postID: `test-post-${uniqueId}`,
      title: 'Test Post',
      content: 'Test Content',
      postedBy: 'testuser',
      postedDate: new Date()
    });
    await post.save();

    // Create test comments with unique IDs
    const comment1 = new CommentModel({
      commentID: `test-comment-1-${uniqueId}`,
      content: 'Comment 1',
      commentedBy: 'testuser',
      commentedDate: new Date()
    });
    await comment1.save();

    const comment2 = new CommentModel({
      commentID: `test-comment-2-${uniqueId}`,
      content: 'Comment 2',
      commentedBy: 'testuser',
      commentedDate: new Date(),
      commentIDs: [comment1._id]
    });
    await comment2.save();

    post.commentIDs = [comment2._id];
    await post.save();

    await request(app)
      .delete(`/posts/${post._id}`);

    const comment1Exists = await CommentModel.findById(comment1._id);
    const comment2Exists = await CommentModel.findById(comment2._id);
    const postExists = await PostModel.findById(post._id);

    expect(postExists).toBeNull();
    expect(comment1Exists).toBeNull();
    expect(comment2Exists).toBeNull();
  });
});