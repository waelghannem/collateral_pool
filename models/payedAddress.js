const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const payedAddressSchema = new Schema({
    dateOfPayment : {type: Date, default: Date.now()},
    txid : {type:String, default:"empty"},
    userId : { type : String, required : true}
   });

   module.exports = mongoose.model('PayedAddressSchema', payedAddressSchema);
