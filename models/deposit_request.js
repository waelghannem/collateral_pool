const mongoose = require('mongoose')
const Address = require('../models/address')



const DepositStatusSchema = mongoose.Schema({
    status : {
        type : String,
        required : true
    },
    cause : {
        type : String
    },
    dateOfSubscription : {
        type: Date, default: Date.now()
    }
})

const DepositRequestSchema = mongoose.Schema({
    user : {
        type : String,
        required : true
    },
    address : {
        type : String,
        required : true
    },
    deposit_address : {
	type : String,
	required : true
    },
    amount : {
        type : String,
        required : true
    },
    type : {
        type : String,
        reqtypeuired : true
    },
    coin : {
        type : String,
        required : true
    },
    dateOfSubscription : {
        type: Date, default: Date.now()
    },
    status : {
        type: [], default : []
    }
})

const DepositRequest = module.exports = mongoose.model('DepositRequest',DepositRequestSchema)



