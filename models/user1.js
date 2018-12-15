const mongoose = require('mongoose')
const config = require('../config/database')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const SALT_I = 10;

const UserSchema = mongoose.Schema({
    email:{
        type:String,
        required:true,
        trim:true,
        unique:1
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    name:{
        type:String,
        maxlength:100
    },
    username : {
        type : String,
        required : true
    },
    token:{
        type:String
    },
    dateOfSubscription : {
        type: Date, default: Date.now()
    }
})

UserSchema.pre('save',function(next){
    var user = this;

    if(user.isModified('password')){
        bcrypt.genSalt(SALT_I,function(err,salt){
            if(err) return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password = hash;
                next();
            })
        })
    } else {
        next()
    }
})

UserSchema.methods.comparePassword = function(candidatePassword,cb){
    console.log("conddate = ",candidatePassword)
    console.log("this.password = ",this.password)
    bcrypt.compare(candidatePassword,this.password,function(err,isMatch){
        if(err){ 
            console.log("here is the error")
            return cb(err)};
        cb(null,isMatch);
    })
}

UserSchema.methods.generateToken = function(cb){
    var user = this;
    var token = jwt.sign(user._id.toHexString(),config.SECRET);

    user.token = token;
    user.save(function(err,user){
        if(err) return cb(err);
        cb(null,user)
    })
}

UserSchema.statics.findByToken = function(token,cb){
    var user  = this;

    jwt.verify(token,config.SECRET,function(err,decode){
        user.findOne({"_id":decode,"token":token},function(err,user){
            if(err) return cb(err);
            cb(null,user)
        })
    })
}


UserSchema.methods.deleteToken = function(token,cb){
    var user = this;

    user.update({$unset:{token:1}},(err,user)=>{
        if(err) return cb(err);
        cb(null,user)
    })
}


const User = mongoose.model('User',UserSchema)

module.exports = { User }