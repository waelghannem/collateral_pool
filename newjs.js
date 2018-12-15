const exec = require('child_process').exec;
const Output = require('./models/output')
const Coin = require('./models/coin')
const mongoose = require('mongoose')
const config = require('./config/config').get(process.env.NODE_ENV);


mongoose.Promise = global.Promise;

mongoose.connect(config.DATABASE, { useNewUrlParser: true }, (err) => {
    if (err) {
        console.log('could not connect to database' + err);
    } else {
        console.log('connected to db :' + config.DATABASE);
    }
});


function get_mn_outputs(mn_cli_file) {
    return new Promise(function (resolve, reject) {
        exec(`sh get_mn_outputs.sh ${mn_cli_file}`, (err, stdout, stderr) => {
            if (!err) {
                resolve(stdout)

            } else {
                reject(err)
            }
        });
    })
}


function add_output(newoutput){
    return new Promise(function (resolve, reject) {
        newoutput.save((err, output) => {
            if (err) {
                reject('failed to add output ', err)
                reject({ success: false, msg: 'failed to add output ', err })
            } else {
                console.log('output added')
                resolve({ success: true, msg: 'output added' })
            }
        })
    })
}


function get_outputs(txid){
    return new Promise(function(resolve,reject){
        Output.findOne({ txid: txid }, function(err, output) {
            if (!err) {
                if (output) {
                    
                    resolve({ output: output })
                } else {
                    resolve({ msg: "no data found" })
                }
            } else {
                reject({ msg: err })
            }
        })
    })
}



(async function(){
    var outputs = await get_mn_outputs('hostmasternode-cli')
    var outputsjson = JSON.parse(outputs)
    for(let key of Object.keys(outputsjson)){
        console.log(key)
        console.log(outputsjson[key])
        try {
            var output_db = await get_outputs(key)
            
             if(!output_db.output){
                var newoutput = new Output({
                    txid : key,
                    index : outputsjson[key]
                })
                try {
                    var output_added = await add_output(newoutput)
                } catch (error) {
                    console.log(error)
                }
            } 
        } catch (error) {
            console.log(error)
        }
       

    } 
    console.log("outputs ", outputs)
})() 

