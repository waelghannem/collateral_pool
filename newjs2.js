const exec = require('child_process').exec;
const Output = require('./models/output')



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
                console.log('failed to add output ', err)
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
        console.log("entered to promise")
	console.log("output model ",Output)
        Output.findOne({ txid: txid }, (err, output) => {
            console.log("get_outputs err ",err)
            console.log("get_outputs output ",output)
            if (!err) {
                if (output) {
                   console.log("from db ",output)
                    resolve({ output: output })
                } else {
		    console.log("from db err ",err)
                    reject({ msg: "no data found" })
                }
            } else {
		console.log("from db error 2 ",err)
                reject({ msg: err })
            }
        })
    })
}
(async function(){
    var outputs = await get_mn_outputs('hostmasternode-cli')
	console.log("outputs ",outputs)
    var outputsjson = JSON.parse(outputs)
    for(let key of Object.keys(outputsjson)){
        console.log(key)
        console.log(outputsjson[key])
        try {
	    console.log("enter here")
            var output_db = await get_outputs(key)
	    console.log("output db ",output_db)
            if(!output_db.output){
                var newoutput = {
                    txid : key,
                    index : outputsjson[key]
                }
                try {
                    var output_added = await add_output()
		console.log("added coin ",outputs_added)
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


