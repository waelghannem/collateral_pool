const mongoose = require('mongoose')

const CounterSchema = mongoose.Schema({
    _id: {type: String, required: true},
    seq: { type: Number, default: 0 }
});
var counter = mongoose.model('counter', CounterSchema);

const OutputsSchema = mongoose.Schema({
    txid : {
        type : String,
        required : true
    },
    index : {
        type : String,
        required : true
        },
    indexInMongodb : {type : Number}
})


OutputsSchema.pre('save', function(next) {
    var doc = this;
    counter.findByIdAndUpdate({_id: 'productid'}, {$inc: { seq: 1} }, function(error, counter)   {
        if(error){console.log("error from model ",error)
        return next(error);}
        console.log("next ", counter)  
        doc.indexInMongodb = counter.seq;
        next();
    });
});

const Output = module.exports = mongoose.model('Output',OutputsSchema)