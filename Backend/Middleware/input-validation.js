const {check} = require('express-validator');

module.exports.register_validator =[
    check('name').isAlpha().withMessage({
        message: 'Name should contain only alphabets',
    }),
    check('username').isAlphanumeric().withMessage({
        message: 'username should only contain alphanumeric characters'
    }),
    check('password').isLength({min:8}).withMessage({
        message: 'Password length should be more than 8 characters'
    }),
    check('email').isEmail().withMessage({
        message: 'Please enter valid e-mail'
    })
];