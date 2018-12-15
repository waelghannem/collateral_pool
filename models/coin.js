const mongoose = require('mongoose')
const Address = require('../models/address')


const CoinSchema = mongoose.Schema({
    name : {
        type : String,
        required : true,
	unique : true
    },
    category : {
        type : String,
        required : true
    },
    fee : {
        type : Number,
        required : true
    },
    coin_unit : {
	type : String,
	required : true
    },
    deposit_address : {
        type : String,
        required : true,
	unique : true
    },
    image_url :{
	type : String,
	required : true
    },
    participants : {
        type : [],
        default : []
    },
    masternodes : {
        type : [],
        default : []
    },
    collateral : {
        type : Number,
        required : true
    },
    pricePerBTC : {
	type : Number,
	required : true
    },
    powerOfTenBTC : {
    	type : Number,
	required : true
    },
    pricePerDollar : {
	type : Number,
	required : true
    },
   powerOfTenDollar : {
	type : Number,
	required : true
    },
    description : {
	type : String,
	default : ""
    },
    ROI : {
	type : Number,
	default : 1
     },
    dateOfSubscription : {
        type: Date, default: Date.now()
    }
})

const Coin = module.exports = mongoose.model('Coin',CoinSchema)



