const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Admin = require('../models/admin')
const config = require('../config/database')


module.exports = function (passport) {
    let opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt")
    opts.secretOrKey = config.secret
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        function getUserByID(id, callback){
            Admin.findById(id, callback)
            }
        getUserByID(jwt_payload._id, function (err, admin) {
            if (err) {
                return done(err, false);
            }
            if (admin) {
                return done(null, admin);
            } else {
                return done(null, false);
            }
        });
    }));
}