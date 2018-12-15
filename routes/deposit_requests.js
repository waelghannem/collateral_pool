const express = require('express')
const router = express.Router()
const DepositRequest = require('../models/deposit_request')
const DepositStatus = require('../models/deposit_status')
const mongoose = require('mongoose')

router.post('/addDepositRequest',(req, res, next) => {

    const depositstatus = new DepositStatus({
        status : "pending",
        dateOfSubscription : Date.now()
    })
    console.log(req.body)
   let newDepositRequest = new DepositRequest({
       user : req.body.user,
       address : req.body.address,
       deposit_address : req.body.deposit_address,
       amount : req.body.amount,
       type : req.body.type,
       coin : req.body.coin,
       status : new Array(depositstatus)
       })
   function addDepositRequest(newDepositRequest,callback){
    newDepositRequest.save(callback)
}

addDepositRequest(newDepositRequest, (err,user)=>{
       if(err){
           console.log('failed to add DepositRequest ', err)
           res.json({success:false,msg:'failed to add DepositRequest '+err})
       }else {
           console.log('DepositRequest added')
           res.json({success:true,msg:'DepositRequest added'})
       }
   })
})


router.post('/getDepositRequestByUser',(req, res, next) => {
	DepositRequest.find({user:req.body.user}, function (err, data) {
        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {

            res.json({ success: true, depositRequest: data});
                    
        }
    });
})



router.post('/getAllDepositRequest',(req, res, next) => {
	DepositRequest.find({}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {

            res.json({ success: true, depositRequest: data});
                    
        }
    });
})

router.get('/:id', function (req, res) {

    DepositRequest.findOne({_id:req.params.id},(err,depositrequest) => {
        if(!err){
			if(depositrequest){
            res.json({success:true,depositrequest:depositrequest})
        }else {
            res.json({ success: false, message: "no data found" });

        }
    }else {
        res.json({ success: false, message: err });
    }
    })
  });

  router.delete('/:id', function (req, res) {
    DepositRequest.findOneAndRemove({_id: req.params.id},function(err,data)
    {
        if(err){
            res.json({ success: false, message: err });
        } else if (!data){
            res.json({ success: false, message: "no deposit found" });
        }else {
            res.json({ success: true, message: "deposit deleted from db",data});
        }
    });
  });

  


router.post('/deleteDepositRequestByUser',(req, res, next) => {

    DepositRequest.find({user:req.body.user}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no deposit request " });
        }else {
                    DepositRequest.deleteMany({user:req.body.user}, function (err, deletedfield) {
                        if (err) {
                            console.log('err deletemany ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good deletemany  ',deletedfield)
                            res.json({ success: true, message: "deposit request deleted from db"});
                        }
                      });
        }
    });
})


router.post('/deleteAllDepositRequest',(req, res, next) => {
    
	DepositRequest.find({}, function (err, data) {

        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (data.length ==0){
            console.log("no field ",data)
            res.json({ success: false, message: "no deposit request found " });
        }else {
                    DepositRequest.deleteMany({}, function (err, deletedfield) {
                        if (err) {
                            console.log('err deletemany ',err)
                            res.json({ success: false, message: err });
                        }else {
                            console.log('good deletemany  ',deletedfield)
                            res.json({ success: true, message: "deposit request deleted from db"});
                        }
                      });
        }
    });
})

// just for test this method need to be implemented on check_deposit.js
router.post('/updateStatusOfRequest/:id',(req, res, next) => {
	DepositRequest.findOne({_id: req.params.id}, function (err, data) {
        if(err){
            console.log("err ",err)
            res.json({ success: false, message: err });
        }else if (!data){
            console.log("no field ",data)
            res.json({ success: false, message: "no field " });
        }else {
            const depositstatus = new DepositStatus({
                status : req.body.status,
                dateOfSubscription : Date.now()
            })
            data.status.push(depositstatus)
            const latestdate = new Date(Math.max.apply(null, data.status.map(function(e) {
                return new Date(e.dateOfSubscription);
              })));
              console.log("latest date of neweest status is ", latestdate)
            data.save()
            res.json({ success: true, depositRequest: data});
                    
        }
    });
})


router.post('/getLatestStatus/:id',(req, res, next) => {
    id = req.params.id
    //ids = id.map(function(el) { return mongoose.Types.ObjectId(el) })
            DepositRequest.aggregate([
                {$match : {_id : mongoose.Types.ObjectId(id)}},
                {$unwind : "$status"},
                { $group:
                         {
                           _id: "$_id",
                           lastStatusDate: { $last: "$status.dateOfSubscription" }
                         }}]).exec(function(err,data2){
                             if(err){
                                res.json({ success: false, message: err });
                             }else if (data2.length == 0){
                                res.json({ success: false, message: "no status find" });
                             } else {
                                res.json({ success: true, latestStatus: data2}); 
                             }
                         })
                    
        
    });




module.exports = {router: router}
