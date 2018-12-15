const JwtStrategy = require('passport-jwt').Strategy;
 const   ExtractJwt = require('passport-jwt').ExtractJwt;
 const User = require('../models/user')
 const config = require('./database')


 module.exports = function(passport){
    let opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")
    opts.secretOrKey = config.secret
    passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
        function getUserByID(id, callback){
            User.findById(id, callback)
            }
        getUserByID(jwt_payload._id, function(err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        });
    }));
 }