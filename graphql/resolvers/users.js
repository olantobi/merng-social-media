const User = require('../../models/User');

module.exports = {
    Query: {
        async getUsers() {
            try {
                const user = await User.find();
                return user;
            } catch (err) {
                throw new Error(err);
            }
        }
    }
}