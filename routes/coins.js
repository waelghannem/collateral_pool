const express = require('express')
const router = express.Router()
const Address = require('../models/address')
const Coin = require('../models/coin')


var multer  = require('multer')
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './public/coin_images');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});



const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
var upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});



router.post('/addCoin',upload.single('coin_image'), (req, res, next) => {

    console.log("this is coin's image",req.file)
    let newCoin = new Coin({
        name: req.body.name,
        deposit_address: req.body.deposit_address,
        collateral : req.body.collateral,
	image_url : "http://144.202.19.2:3014/static/coin_images/"+req.file.originalname,
	pricePerBTC : req.body.pricePerBTC,
	powerOfTenBTC : req.body.powerOfTenBTC,
	pricePerDollar : req.body.pricePerDollar,
	powerPerOfDOllar : req.body.powerOfTenDollar,
	sign : req.body.sign,
	ROI : req.body.ROI,
	coin_unit : req.body.coin_unit,
	description : req.body.description
    })


    function addCoin(newCoin, callback) {
        newCoin.save(callback)
    }

    addCoin(newCoin, (err, user) => {
        if (err) {
            console.log('failed to add coin ', err)
            res.json({ success: false, msg: 'failed to add coin ', err })
        } else {
            console.log('coin added')
            res.json({ success: true, msg: 'coin added' })
        }
    })
})


router.post('/getCoin', (req, res, next) => {
    console.log('getcoin: req.body.name ',req.body)
    Coin.findOne({ name: req.body.name }, (err, coin) => {
        if (!err) {
            if (coin) {
                
                res.json({ coin: coin })
            } else {
                res.json({ msg: "no data found" })
            }
        } else {
            res.json({ msg: err })
        }
    })
})


router.post('/getParticipants', (req, res, next) => {
    console.log('getParticipants: req.body.name ',req.body)
    Coin.findOne({ name: req.body.name }, (err, coin) => {
        if (!err) {
            if (coin) {
                
                res.json({ success:true,participants: coin.participants })
            } else {
                res.json({ success:false,msg: "no participants found" })
            }
        } else {
            res.json({ success:false,msg: err })
        }
    })
})


router.get('/getAllCoins', (req, res, next) => {
    Coin.find({},{ participants: { $slice: 0 } }, function (err, data) {

        if (err) {
            console.log("err ", err)
            res.json({ success: false, message: err });
        } else if (data.length == 0) {
            console.log("no field ", data)
            res.json({ success: false, message: "no field " });
        } else {

            res.json({ success: true, coins: data });

        }
    });
})

router.post('/deleteCoin', (req, res, next) => {
    Coin.findOne({ name: req.body.name }, function (err, data) {

        if (err) {
            console.log("err ", err)
            res.json({ success: false, message: err });
        } else if (!data) {
            console.log("no field ", data)
            res.json({ success: false, message: "no field " });
        } else {
            Coin.deleteOne({ name: req.body.name }, function (err, deletedfield) {
                if (err) {
                    console.log('err delete one ', err)
                    res.json({ success: false, message: err });
                } else {
                    console.log('good delete one  ', deletedfield)
                    res.json({ success: true, message: "coin deleted from db" });
                }
            });
        }
    });
})


router.post('/deleteAllCoins', (req, res, next) => {
    Coin.find({}, function (err, data) {

        if (err) {
            console.log("err ", err)
            res.json({ success: false, message: err });
        } else if (data.length == 0) {
            console.log("no field ", data)
            res.json({ success: false, message: "no field " });
        } else {
            Coin.deleteMany({}, function (err, deletedfield) {
                if (err) {
                    console.log('err deletemany ', err)
                    res.json({ success: false, message: err });
                } else {
                    console.log('good deletemany  ', deletedfield)
                    res.json({ success: true, message: "coins deleted from db" });
                }
            });
        }
    });
})


router.post('/deposit', (req, res, next) => {


    const newAddress = new Address({
        owner: req.body.owner,
        address: req.body.address
    })
    const participant = {
        address: newAddress,
        amount: req.body.amount,
        type: req.body.type
    }

    Coin.findOne({ name: req.body.name }, function (err, data) {

        if (err) {
            console.log("err ", err)
            res.json({ success: false, message: err });
        } else if (!data) {
            console.log("no field ", data)
            res.json({ success: false, message: "no field " });
        } else {
            data.participants.push(participant)
            data.save((err, user) => {
                if (err) {
                    console.log('failed to add coin ', err)
                    res.json({ success: false, msg: 'failed to add coin ', err })
                } else {
                    console.log('coin added')
                    res.json({ success: true, msg: 'coin added' })
                }
            }
            )
            /*  Coin.findOneAndUpdate({name : req.body.name}, {$set:{address:address, fee: fee }}, {new: false}, function(err, doc){
                 if (err) {
                     res1.json({ success: false, message: err });}
                 else {
                     res1.json({ success: true, message: "participant added to"+req.body.name });
                 }
             }); */
        }
    });

})




router.post('/updateCoin', upload.single('coin_image'),(req, res, next) => {
	console.log("req.body is ",req.body)
        if(req.body.id){
            Coin.findById(req.body.id, function (err, coin) {
                if (err) res.json({ success: false, message: "no field " });
                if(req.body.name){
                    coin.set({ name: req.body.name });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if(req.body.collateral){
                    coin.set({ collateral: req.body.collateral });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if(req.body.deposit_address){
                    coin.set({ deposit_address: req.body.deposit_address });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if (req.body.description){
                    coin.set({ description: req.body.description });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if (req.file){
                    coin.set({  image_url : "http://144.202.19.2:3014/static/coin_images/"+req.file.originalname});
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }
                else {
                    res.json({ success: false, message: "yu need to use which field you want to modify" }); 
                }
              });
        }else if(req.body.name){
            Coin.findOne({ name: req.body.name }, function (err, coin) {
                if (err) res.json({ success: false, message: "no field " });
                if(req.body.newName){
                    coin.set({ name: req.body.newName });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if(req.body.collateral){
                    coin.set({ collateral: req.body.collateral });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if(req.body.deposit_address){
                    coin.set({ deposit_address: req.body.deposit_address });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }else if (req.body.description){
                    coin.set({ description: req.body.description });
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
                    });
                }
                else if (req.file){
                    coin.set({  image_url : "http://144.202.19.2:3014/static/coin_images/"+req.file.originalname});
                    coin.save(function (err1, updatedcoin) {
                        if (err) res.json({ success: false, message: err1 });
                        res.json({success: true,updatedCoin : updatedcoin});
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

module.exports = { router: router }
