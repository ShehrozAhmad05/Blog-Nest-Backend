const passport = require('passport');

const isAuthenticated = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        
        if (err || !user) {
            return res.status(401).json({ 
                message: info ? info?.message: 'Unauthorized' ,
                err: err ? err?.message: undefined
            });
        }

        req.user = user?._id;
        return next();
    })(req, res, next);
};

module.exports = isAuthenticated;
 