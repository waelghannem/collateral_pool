const mongoose = require('mongoose')



const CounterSchema = mongoose.Schema({
    sequence_value : {
        type : Number,
        required : true
    }
    
})

const Counter = module.exports = mongoose.model('Counter',CounterSchema)



