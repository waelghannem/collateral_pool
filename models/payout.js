const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
const Schema = mongoose.Schema;

const payoutEntrySchema = new Schema({
    address: {type:String},
    pourcentage:{type:Number, default:0},
    dateOfaddAddress : {type: Date, default: Date.now()},
    userId : { type: String, required : true}
   });

   module.exports = mongoose.model('Payoutentry', payoutEntrySchema);