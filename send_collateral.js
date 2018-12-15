var cron = require('node-cron');
const Coin = require('./models/coin')
const exec = require('child_process').exec;




function send_collateral(send_collateral_file, coin_cli, address, amount){
    return new Promise(function(resolve, reject){
        exec(`sh ${send_collateral_file} ${coin_cli} ${address} ${amount}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("restart_server_file error")
                }
            }
        });
    })
}


function get_mn_outputs(mn_cli_file) {
    return new Promise(function (resolve, reject) {
        exec(`sh get_mn_outputs.sh ${mn_cli_file}`, (err, stdout, stderr) => {
            if(err){
                reject(err)
            }else if (stderr) {
                reject(stderr) 
            } else {
               if(stdout){
                   resolve(stdout)
               }else {
                   reject("no outputs founded")
               }
            }
        });
    })
}




function getbalance(file, cmd) {
    console.log("try get balance ")
    return new Promise(function (resolve, reject) {
        exec(`sh ${file} ${cmd}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("restart_server_file error")
                }
            }
        });
    })

}
var task = cron.schedule('*/2 * * * *', async () => {

    try {
        var balance = await getbalance("getbalance.sh", "hostmasternode-cli")
        if(balance >= 1000){
            try {
                var outputs = await get_mn_outputs('hostmasternode-cli')
                console.log("outputs from get_mn_outputs ",outputs)
                var outputsjson = JSON.parse(outputs)
                console.log("2")
                var freeOutput;
                console.log("3")
                var numberOfoutputs = 0
                console.log("4")
            for(let key of Object.keys(outputsjson)){
                console.log("5", numberOfoutputs)
                numberOfoutputs++
            }
            var numberOfoutputsExpected = Math.floor(balance / 1000)
            console.log("6 numberOfoutputsExpected", numberOfoutputsExpected)
            if(numberOfoutputs < numberOfoutputsExpected){
                try {
                    console.log("7")
                    var newCollateral = await send_collateral("send_collateral.sh","hostmasternode-cli","hF8dqj4ysBmq2Kfq9uymGresrsyZsDGg23", 1000)
                    console.log("new collateral transaction sended ",newCollateral)
                } catch (error) {
                    console.log(error)
                }
            } else {
                console.log("6 numberOfoutputsExpected = ", numberOfoutputsExpected, "numberOfoutputs = ",numberOfoutputs)
            }
            } catch (error) {
                console.log(error)

            } 
        }
       
    } catch (error) {
        console.log(error)

    }
    


    console.log("running veery 5 min")
})



module.exports = task


