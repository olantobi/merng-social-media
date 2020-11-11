const { UserInputError, AuthenticationError } = require('apollo-server');

const Post = require('../../models/Post');
const { validateObjectId } = require('../../utils/validators');
const checkAuth = require('../../utils/checkAuth');

module.exports = {
    Query: {
        async getPosts() {
            try {
                const post = await Post.find().sort({ createdAt: -1 });
                return post;
            } catch (err) {
                throw new Error(err);
            }
        },

        async getPost(_, { postId }) {
            const { errors, valid } = validateObjectId(postId);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post;
                } 
                
                throw new Error('Post not found');
            } catch (err) {
                throw new Error(err);
            }
        }
    },
    Mutation: {
        async createPost(_, { body }, context) {
            const user = checkAuth(context);            

            if (body.trim() == '') {
                throw new Error('Post body must not be empty');
            }

            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString()
            });

            const post = await newPost.save();

            context.pubsub.publish('NEW_POST', {
                newPost: post
            });

            return post;
        },

        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);
            const { errors, valid } = validateObjectId(postId);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }
            try {
                const post = await Post.findById(postId);
                if (user.username === post.username) {
                    post.delete();
                    return 'Post deleted successfully';
                }
                throw new Error("You can't delete this post");
            } catch (err) {
                throw new AuthenticationError('Action not allowed');
            }            
        },

        async likePost(_, { postId }, context) {
            const { username } = checkAuth(context);
            const { errors, valid } = validateObjectId(postId);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const post = await Post.findById(postId);
            if (!post) {
                throw new UserInputError('Post not found');
            }            
            if (post.likes.find(like => like.username === username)) {
                // Post already liked. Unlike it
                post.likes = post.likes.filter(like => like.username !== username);
                post.save();
            } else {
                post.likes.push({
                    username, 
                    createdAt: new Date().toISOString()
                })
                post.save();
            }
            return post;
        }
    },
    Subscription: {
        newPost: {
            subscribe: (_, __, { pubsub }) => pubsub.asyncIterator('NEW_POST')
        }
    }
}
