const passport = require('passport');
const User = require('../models/User/User');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy //JWT Strategy
const ExtractJWT = require('passport-jwt').ExtractJwt; //JWT Extractor
const GoogleStrategy = require('passport-google-oauth20').Strategy; //Google Strategy

//Configure passport to use local strategy

passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',  //username/email field
        },
        async (username, password, done) => {
            try {
                //Find the user
                const user = await User.findOne({ username });
                //If user not found
                if (!user) {
                    return done(null, false, {
                        message: 'User not found'
                    });
                }
                //If user found, check if password is correct
                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid Login Credentials'
                    });
                }
            }
            catch (error) {
                return done(error);
            }
        }
    )
);



//JWT-Options
const options = {
    jwtFromRequest: ExtractJWT.fromExtractors([(req) => {
        let token = null;
        if (req && req.cookies) {
            token = req.cookies['token'];
            return token;
        }
    }]), //Extract the token from the header
    secretOrKey: process.env.JWT_SECRET, //Secret key to verify the token
}

//JWT
passport.use(
    new JWTStrategy(options, async (userDecoded, done) => {
        try {
            //Find the user
            const user = await User.findById(userDecoded.id);
            
            if (user) {
                //If user found, return the user
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        } catch (error) {
            return done(error, false);
        }
    }
    )
);

//Google OAuth
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:5000/api/v1/users/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                //Find the user
                let user = await User.findOne({ googleId: profile.id });

                //destructure the profile object
                const {id, displayName, name, _json:{picture}} = profile
                
                //check if email exists
                let email = ''
                if (Array.isArray(profile?.emails) && profile?.emails?.length>0) {
                    email = profile.emails[0].value
                }
                //Check if user not found
                if(!user)
                {
                    user = await User.create({
                        username: displayName,
                        googleId: id,
                        profilePicture: picture,
                        authMethod: 'google',
                        email
                    });
                }
                done(null,user)
            } catch (error) {
                done(error, null);
            }
        }
    )
)

module.exports = passport;