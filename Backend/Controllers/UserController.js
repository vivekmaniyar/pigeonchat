const mongoose = require('mongoose');
const User = require('../Models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator');
const UserController = require('../Controllers/UserController');

module.exports.register = function(req, res) {

    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = [];
        errors.array().forEach(element=>{
            error.push({
                name: "Validation error",
                message: element.msg.message
            });
        });
        res.status(422).json(
            (error.length == 1)?(error[0]):(error)
        );
    }else{
        User.findOne({
            username: req.body.username
        }).exec()
        .then(result =>{
            if(result){
                res.status(400).json({
                    message: 'User with this username already exists'
                });
                return;
            }else{
                const user = new User({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    username: req.body.username,
                    password: bcrypt.hashSync(req.body.password,10),
                    email: req.body.email,
                    profileimage: req.body.profileimage
                });
                return user; 
            }
        })
        .then(data => {
            if(data){
                data.save().then(result=>{
                    res.status(201).json({
                        message: 'User registered',
                        _id: result._id,
                        name: result.name,
                        username: result.username,
                        password: result.password,
                        email: result.email,
                        profileimage: result.profileimage
                    })
                })
                .catch(err => {
                    res.status(500).json({
                        name: err.name,
                        message: err.message
                    });
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                name: err.name,
                message: err.message
            });
        })
    }
};

module.exports.login = function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        res.status(422).json({
            name: "Missing details",
            message: "Username or password is missing"
        })
    }else{
        User.findOne({
            username: username
        }).exec()
        .then(result=>{
            if(!result){
                res.status(404).json({
                    name: "Not Found",
                    message: "User not found"
                });
                return;
            }else if(result.isBlocked){
                res.status(403).json({
                    name: "Forbidden",
                    message: "User is blocked"
                });
                return;
            }
            else{
                return result;
            }
        })
        .then(user=>{
            if(user){
                if(bcrypt.compareSync(password,user.password)){
                    var token = jwt.sign({
                        userId: user._id,
                        username: user.username
                    },process.env.JWT_SECRET,
                    {
                        expiresIn: '12h'
                    });
    
                    res.status(200).json({
                        _id: user._id,
                        name: user.name,
                        username: user.username,
                        email: user.email,
                        profileimage: user.profileimage,
                        token: token
                    });
                }else{
                    res.status(400).json({
                        name: "Wrong details",
                        message: "Either username or password is wrong"
                    });
                }
            }
        })
        .catch(err=>{
            res.status(500).json({
                name: err.name,
                message: err.message
            });
        })
    }
    
};

module.exports.searchUser = function(req, res) {
    let search = req.query.search;
    let userId = req.body.userId;
    let regex = new RegExp(search, 'i');

    User.find({
        $and: [{
            _id: {
                $ne: userId
            }
        }, {
            $or: [{
                username: regex
            }, {
                name: regex
            }]
        }]
    })
    .select('_id name username email profileimage')
    .exec().then(result=>{
        if(result.length == 0){
            res.status(404).json({
                name: "Not Found",
                message: "User not found"
            });
        }else{
            res.status(200).json(result);
        }
    }).catch(err=>{
        res.status(500).json({
            name: err.name,
            message: err.message
        });
    })
};

module.exports.adminloginpage = function(req, res) {
    res.render('adminlogin');
};

module.exports.adminlogin = function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    if(!username || !password){
        res.status(400).json({
            name: "Missing details",
            message: "Username or password is missing"
        })
    }else{
        User
        .findOne({
            username: username
        })
        .exec()
        .then(result=>{
            if(!result){
                res.status(404).json({
                    name: "Not Found",
                    message: "User not found"
                });
                return;
            }else{
                return result;
            }
        }
        )
        .then(user=>{
            if(user.isAdmin == true){
                return user;
            }else{
                res.status(401).json({
                    name: "Unauthorized",
                    message: "You are not authorized to access this page"
                });
            }
        })
        .then(user=>{
            if(user){
                if(bcrypt.compareSync(password,user.password)){
                    var token = jwt.sign({
                        userId: user._id,
                        username: user.username,
                        isAdmin: user.isAdmin
                    },process.env.JWT_SECRET,
                    {
                        expiresIn: '12h'
                    });
    
                    //set token in cookie and redirect to userlist page
                    res.cookie('token', token, {maxAge: 43200000, httpOnly: true});
                    res.redirect('/userlist');
                }else{
                    res.status(400).json({
                        name: "Wrong details",
                        message: "Either username or password is wrong"
                    });
                }
            }
        })
        .catch(err=>{
            res.status(500).json({
                name: err.name,
                message: err.message
            });
        })
    }

};

module.exports.adminlogout = function(req, res) {
    res.clearCookie('token');
    res.redirect('/adminlogin');
};

module.exports.listusers = function(req, res) {
    if(!req.cookies.token){
        res.redirect('/adminlogin');
    }
    else{
        User.find({
            isAdmin: false
        }).select('_id name username email profileimage isAdmin isBlocked').exec().then(result=>{
            //render userlist page
            res.render('userlist', {users: result});
        }).catch(err=>{
            res.status(500).json({
                name: err.name,
                message: err.message
            });
        })
    }
};

module.exports.blockuser = function(req, res) {
    let username = req.body.username;
    let token = req.cookies.token;

    if(!username || !token){
        res.status(400).json({
            name: "Missing details",
            message: "username or token is missing"
        })
    }else{
        User
        .findOne({
            username: username
        })
        .exec()
        .then(result=>{
            if(!result){
                res.status(404).json({
                    name: "Not Found",
                    message: "User not found"
                });
                return;
            }else{
                var decoded = jwt.verify(token, process.env.JWT_SECRET);
                if(decoded.isAdmin == true){
                    return result;
                }else{
                    res.status(401).json({
                        name: "Unauthorized",
                        message: "You are not authorized to access this page"
                    });
                }
            }
        }
        )
        .then(user=>{
            if(user){
                if(user.isBlocked == true){
                    user.isBlocked = false;
                    user.save().then(result=>{
                        res.redirect('/userlist');
                    }).catch(err=>{
                        res.status(500).json({
                            name: err.name,
                            message: err.message
                        });
                    })
                }else{
                    user.isBlocked = true;
                    user.save().then(result=>{
                        res.redirect('/userlist');
                    }).catch(err=>{
                        res.status(500).json({
                            name: err.name,
                            message: err.message
                        });
                    })
                }
            }
        }
        )
        .catch(err=>{
            res.status(500).json({
                name: err.name,
                message: err.message
            });
        })
    }
};



