const jsonwebtoken = require('jsonwebtoken');

module.exports = function(req, res, next) {
    let token = req.headers.authorization;
    if (token) {
        token = token.split(' ')[1];
        jsonwebtoken.verify(token, process.env.JWT_SECRET, function(err, decoded) {
            if (err) {
                console.log(err);
                res.status(401).json({
                    message: 'Invalid token'
                });
            } else {
                req.body.userId = decoded.userId;
                req.body.username = decoded.username;
                next();
            }
        });
    } else {
        res.status(401).json({
            message: 'No token provided'
        });
    }
};