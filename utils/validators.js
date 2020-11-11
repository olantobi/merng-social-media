const { Types } = require('mongoose');

module.exports.validateRegisterInput = (
    username,
    email,
    password,
    confirmPassword
) => {
    const errors = {};

    if (username.trim() === ''){
        errors.username = 'Username must not be empty';
    }

    if (email.trim() === ''){
        errors.email = 'Email must not be empty';
    } else {
        const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;
        if (!email.match(regEx)) {
            errors.email = 'Email must be a valid email address';
        }
    }

    if (password === '') {
        errors.password = 'Password must not be empty';
    } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    }

    return {
        errors, 
        valid: Object.keys(errors).length < 1
    }
}

module.exports.validateLoginInput = (username, password) => {
    const errors = {};

    if (username.trim() === ''){
        errors.username = 'Username must not be empty';
    }

    if (password === ''){
        errors.username = 'Password must not be empty';
    }

    return {
        errors, 
        valid: Object.keys(errors).length < 1
    }
}

module.exports.validateObjectId = (...objectIds) => {
    const errors = {};

    for (let objectId of objectIds) {
        if (!Types.ObjectId.isValid(objectId)) {
            console.log(objectId, ' is invalid');
            errors.id = 'Invalid id provided';
            break;
        }
    } 

    return {
        errors, 
        valid: Object.keys(errors).length < 1
    }
}
