const { UserInputError, AuthenticationError } = require('apollo-server');

const Post = require('../../models/Post');
const { validateObjectId } = require('../../utils/validators');
const checkAuth = require('../../utils/checkAuth');

module.exports = {
    Mutation: {
        createComment: async (_, { postId, body }, context ) => {            
            const { errors, valid } = validateObjectId(postId);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            if (body.trim() === '') {
                throw new UserInputError('Empty comment', {
                    errors: {
                        body: 'Comment body must not be empty'
                    }
                })
            }

            const { username } = checkAuth(context);

            const post = await Post.findById(postId);
            if (post) {
                post.comments.unshift({
                    body,
                    username,
                    createdAt: new Date().toISOString()
                })
                post.save();
                return post;
            }
            throw new UserInputError('Post not found');
        },

        deleteComment: async (_, { postId, commentId }, context) => {            
            const { errors, valid } = validateObjectId(postId, commentId);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const { username } = checkAuth(context);

            const post = await Post.findById(postId);
            if (!post) {
                throw new UserInputError('Post not found');
            }
            
            const commentIndex = post.comments.findIndex(c => c.id === commentId);
            if (post.comments[commentIndex].username !== username) {
                throw new AuthenticationError('Action not allowed');
            }
            post.comments.splice(commentIndex, 1);
            post.save();
            return post;
        }
    }
}
