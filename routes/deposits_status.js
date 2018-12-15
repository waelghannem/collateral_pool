/* const express = require('express')
const router = express.Router()
const Address = require('../models/address')
const DepositStatus = require('../models/deposit_status')

const DepositRequest = require('../models/deposit_request')

const jwt = require('jsonwebtoken')
const passport = require('passport')
const config = require('../config/database')
const exec = require('child_process').exec;
var bitcoin_rpc = require('node-bitcoin-rpc')
const bcrypt = require('bcryptjs')


router.post('/addDepositStatus',(req, res, next) => {

    console.log(req.body)
   let newDepositStatus = new DepositStatus({
       deposit_id : req.body.deposit_id,
       status : req.body.status
       })


   function addDepositStatus(newDepositStatus,callback){
    newDepositStatus.save(callback)
}

addDepositStatus(newDepositStatus, (err,depositStatus)=>{
       if(err){
           console.log('failed to add depositStatus ', err)
           res.json({success:false,msg:'failed to add depositStatus ', err})
       }else {
           console.log('depositStatus added')
           res.json({success:true,msg:'depositStatus added'})
       }
   })
})





router.post('/getDepositStatusByDeposit_id',(req, res, next) => {
    console.log(req.body.deposit_id)
	DepositStatus.find({deposit_id:req.body.deposit_id}, function (err, data) {
        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no deposit status ",data)
            res.json({ success: false, message: "no deposit status " });
        }else {

            res.json({ success: true, depositStatus: data});
                    
        }
    });
})



router.post('/getAllDepositStatus',(req, res, next) => {
	DepositStatus.find({}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no deposit status ",data)
            res.json({ success: false, message: "no deposit status " });
        }else {

            res.json({ success: true, depositStatus: data});
                    
        }
    });
})

router.get('/:id', function (req, res) {

    DepositStatus.findOne({_id:req.params.id},(err,depositStatus) => {
        if(!err){
			if(depositStatus){
            res.json({success:true,depositStatus:depositStatus})
        }else {
            res.json({ success: false, message: "no deosit status found" });

        }
    }else {
        res.json({ success: false, message: err });
    }
    })
  });

  router.delete('/:id', function (req, res) {
    DepositStatus.findOneAndRemove({_id: req.params.id},function(err,data)
    {
        if(err){
            res.json({ success: false, message: err });
        } else if (!data){
            res.json({ success: false, message: "no deposit status found" });
        }else {
            res.json({ success: true, message: "deposit status deleted from db",data});
        }
    });
  });

  


router.post('/deleteDepositStatusByDeposit_id',(req, res, next) => {

    DepositStatus.find({deposit_id:req.body.deposit_id}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no deposit status ",data)
            res.json({ success: false, message: "no deposit status request " });
        }else {
                    DepositStatus.deleteMany({deposit_id:req.body.deposit_id}, function (err, deletedfield) {
                        if (err) {
                            console.log('err deletemany ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good deletemany  ',deletedfield)
                            res.json({ success: true, message: "deposit status deleted from db"});
                        }
                      });
        }
    });
})


router.post('/deleteAllDepositStatus',(req, res, next) => {
    
	DepositStatus.find({}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no deposit status ",data)
            res.json({ success: false, message: "no deposit status found " });
        }else {
                    DepositStatus.deleteMany({}, function (err, deletedfield) {
                        if (err) {
                            console.log('err deletemany ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good deletemany  ',deletedfield)
                            res.json({ success: true, message: "deposit status deleted from db"});
                        }
                      });
        }
    });
})

router.post('/updateDepositStatus',function(req,res) {

    Coin.findOne({_id: req.body.id}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (!data){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {
            data.status = req.body.status
            data.save((err,updatedDepostStatus)=>{
                if(err){
                    res.json({success:false,msg:'failed to update deposit status ', err})
                }else {
                    res.json({success:true,msg:'deposit status updated'})
                }
            }
            )
        }
    });
    
    
})


module.exports = {router: router}*/