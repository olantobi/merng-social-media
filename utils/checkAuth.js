const jwt = require('jsonwebtoken');
const { AuthenticationError } = require('apollo-server');

const { SECRET_KEY } = require('../config');

module.exports = (context) => {
    // context = { ... headers }    
    const {req: { headers: { authorization }}} = context;
    if (authorization) {
        const token = authorization.split('Bearer ')[1];
        if (token){
            try {
                const user = jwt.verify(token, SECRET_KEY);
                return user;
            } catch(err) {
                throw new AuthenticationError('Invalid token');
            }
        }
        throw new Error("Authentication token must be 'Bearer [token]'");
    }
    throw new Error('Authorization header must be provided');
}
