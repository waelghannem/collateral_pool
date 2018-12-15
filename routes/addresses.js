const express = require('express')
const router = express.Router()
const Address = require('../models/address')



router.post('/addAddress',(req, res, next) => {

    console.log(req.body)
   let newAddress = new Address({
       address : req.body.address,
       owner : req.body.owner
       })


   function addAddress(newAddress,callback){
    newAddress.save(callback)
}

addAddress(newAddress, (err,user)=>{
       if(err){
           console.log('failed to add address ', err)
           res.json({success:false,msg:'failed to add address ', err})
       }else {
           console.log('address added')
           res.json({success:true,msg:'address added'})
       }
   })
})


router.post('/getAddress',(req, res, next) => {
	Address.findOne({address:req.body.address,owner:req.body.owner},(err,address) => {
        if(!err){
			if(address){
            res.json({address:address})
        }else {
            res.json({msg:"no data found"})
        }
    }else {
        res.json({msg:err})
    }
    })
})



router.post('/getAddressesByOwner',(req, res, next) => {
	Address.find({owner:req.body.owner}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {

            res.json({ success: true, addresses: data});
                    
        }
    });
})



router.post('/getAllAddresses',(req, res, next) => {
	Address.find({}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {

            res.json({ success: true, addresses: data});
                    
        }
    });
})

router.post('/deleteAddress',(req, res, next) => {
	Address.findOne({address: req.body.address, owner:req.body.owner}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (!data){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {
                    Address.deleteOne({address: req.body.address, owner:req.body.owner}, function (err, deletedfield) {
                        if (err) {
                            console.log('err delete one ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good delete one  ',deletedfield)
                            res.json({ success: true, message: "address deleted from db"});
                        }
                      });
        }
    });
})


router.post('/deleteAddressesByOwner',(req, res, next) => {
    console.log("owner is ", req.body.owner)
	Address.find({owner:req.body.owner}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {
                    Address.deleteMany({owner:req.body.owner}, function (err, deletedfield) {
                        if (err) {
                            console.log('err deletemany ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good deletemany  ',deletedfield)
                            res.json({ success: true, message: "address deleted from db"});
                        }
                      });
        }
    });
})


router.post('/deleteAllAddresses',(req, res, next) => {
	Address.find({}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {
                    Address.deleteMany({}, function (err, deletedfield) {
                        if (err) {
                            console.log('err deletemany ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good deletemany  ',deletedfield)
                            res.json({ success: true, message: "address deleted from db"});
                        }
                      });
        }
    });
})









module.exports = {router: router}