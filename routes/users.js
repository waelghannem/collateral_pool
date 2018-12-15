const express = require('express')
const router = express.Router()
const bitcoin_rpc = require('node-bitcoin-rpc')
const { auth} = require('../middleware/auth')
const { User } = require('../models/user'); 
const pool_params = require('../config/pool_params')
 

function getNewAddress(hostname, rpc_port, rpc_user, rpc_password, coin) {
    return new Promise(function (resolve, reject) {
        bitcoin_rpc.init(hostname, rpc_port, rpc_user, rpc_password)
        bitcoin_rpc.call('getnewaddress', [], async (err, res) => {
	    console.log("erreur getnewaddress ",err)
	    console.log("res getnewaddress ",res)
            if (err !== null) {
                   console.log("erreur from getnewaddress ",err)
		   reject(err)
            }
            else if (res.error) {
		console.log("error from getnewaddress ",res.error)
                reject(res.error)
            }
            else {
		console.log("works ",res)
                resolve({coin : coin, deposit_address : res.result})
            }
        })
    })

}
router.post('/register',async (req,res)=>{
    console.log("registered user is ",req.body)
    const user = new User(req.body);
    const deposit_addresses = []
    for (credentials of pool_params.COINS_CREDENTIALS) {
        try {
	    console.log("enter to getnewaddress")
	    console.log("credentials : ",credentials.hostname, credentials.rpc_port, credentials.rpc_user, credentials.rpc_password,credentials.name)
            const addressPerCoin = await getNewAddress(credentials.hostname, credentials.rpc_port, credentials.rpc_user, credentials.rpc_password,credentials.name)
	    console.log("this is the new deposit address for the new user ",addressPerCoin)
            deposit_addresses.push(addressPerCoin)
        } catch (error) {
            console.log("error ",error)
        }
    }

    user.deposit_addresses = deposit_addresses
    user.save((err,doc)=>{
        if(err) return res.json({success:false,error:err});
        res.status(200).json({
            success:true,
            user:doc
        })
    })
})

router.post('/login',(req,res)=>{
    console.log("req body : ",req.body)
    User.findOne({'username':req.body.username},(err,user)=>{
        if(!user) {
	console.log("user node found")
	return res.json({isAuth:false,message:'Auth failed, username '+req.body.username+', not found'})}

        user.comparePassword(req.body.password,(err,isMatch)=>{
            if(!isMatch) {
		console.log("wrong password")
		return res.json({
                isAuth:false,
                message:'Wrong password'
            });}
	    console.log("loggedIn")
            user.generateToken((err,user)=>{
                if(err) return res.status(400).send(err);
                res.cookie('auth',user.token).json({
                    isAuth:true,
                    id:user._id,
                    username:user.username,
		    deposit_addresses : user.deposit_addresses,
                    user_token : user.token
                })
            })
        })
    })
})



router.get('/auth',auth,(req,res)=>{
    res.json({
        isAuth:true,
        id:req.user._id,
        email:req.user.email,
        name:req.user.name,
        lastname:req.user.lastname
    })
});


router.get('/logout',auth,(req,res)=>{
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200)
    })
})


router.post('/profile',(req, res, next) => {
	console.log("profile :",req.body)
	User.findOne({username:req.body.username},(err,user) => {
        if(!err){
			if(user){
            res.json({user:user})
        }else {
            res.json({msg:"no data found"})
        }
    }else {
        res.json({msg:err})
    }
    })
})
router.post('/updateUser', (req, res, next) => {
console.log(req.body.passoword) 
   if(req.body.id){
        User.findById(req.body.id, function (err, user) {
            if (err) res.json({ success: false, message: "no field " });
            if(req.body.name){
                user.set({ name: req.body.name });
                user.save(function (err1, updateduser) {
                    if (err) res.json({ success: false, message: err1 });
                    res.json({success: true,updatedUser : updateduser});
                });
            }else if(req.body.username){
                user.set({ username: req.body.username });
                user.save(function (err1, updateduser) {
                    if (err) res.json({ success: false, message: err1 });
                    res.json({success: true,updatedUser : updateduser});
                });
            }else if(req.body.phone){
                user.set({ phone: req.body.phone });
                user.save(function (err1, updateduser) {
                    if (err) res.json({ success: false, message: err1 });
                    res.json({success: true,updatedUser : updateduser});
                });
            }else if (req.body.email){
                user.set({ email: req.body.email });
                user.save(function (err1, updateduser) {
                    if (err) res.json({ success: false, message: err1 });
                    res.json({success: true,updatedUser : updateduser});
                });
            }else if (req.body.passoword){
                user.set({  password : req.body.password});
                user.save(function (err1, updateduser) {
                    if (err) res.json({ success: false, message: err1 });
                    res.json({success: true,updatedUser : updateduser});
                });
            }
            else {
                res.json({ success: false, message: "yu need to use which field you want to modify" }); 
            }
          });
    }else {
        res.json({ success: false, message: "yu need to use search method(by name or id)" });
    }


})
module.exports = {router:router}
