const mongoose = require('mongoose')
const Address = require('../models/address')


const DepositStatusSchema = mongoose.Schema({
    status : {
        type : String,
        required : true
    },
    dateOfSubscription : {
        type: Date, default: Date.now()
    }
})

const DepositStatus = module.exports = mongoose.model('DepositStatus',DepositStatusSchema)



