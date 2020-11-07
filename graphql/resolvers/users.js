const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UserInputError } = require('apollo-server');

const User = require('../../models/User');
const { SECRET_KEY } = require('../../config');
const { validateRegisterInput, validateLoginInput } = require('../../utils/validators');

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
    },
    Mutation: {
        async login(_, { username, password }) {
            const { errors, valid } = validateLoginInput(username, password);
            if (!valid) {
                throw new UserInputError('Errors', { errors });
            }

            const user = await User.findOne({ username });
            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', { errors });
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', { errors });
            }

            const token = generateToken(user);

            return {
                ...user._doc,
                id: user._id,
                token
            }
        },
       async register(
            _, 
            { 
                registerInput : { username, email, password, confirmPassword }
            }, 
            context, 
            info
        ) {
            await validations(username, email, password, confirmPassword);

            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const savedUser = await newUser.save();
            const token = generateToken(savedUser);

            return {
                ...res._doc,
                id: res._id,
                token
            }
        }
    }
}

function generateToken(user) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRET_KEY, { expiresIn: '1h' });
}

async function validations(username, email, password, confirmPassword) {
    const { valid, errors } = validateRegisterInput(username, email, password, confirmPassword);
    if (!valid) {
        throw new UserInputError('Errors', { errors });
    }

    const user = await User.findOne({ username });
    if (user) {
        throw new UserInputError('Username is taken', {
            errors: {
                username: 'This username is taken'
            }
        });
    }
}
