const bitcoin_rpc = require('node-bitcoin-rpc')
const exec = require('child_process').exec;

function getbalance(file,cmd) {
    console.log("try get balance ",file, " ",cmd)
        return new Promise(function (resolve, reject) {
            exec(`sh ${file} ${cmd}`, (err, stdout, stderr) => {
		//console.log("result is ",err," ",stdout," ",stderr)
                if (err) {
                    reject(err)
                } else if (stderr) {
                    reject(stderr)
                } else {
			console.log("stdout = ",stdout)
                        resolve(stdout)
			console.log("after resolving")
                }
            });
    })
}



(async function(){

    var credentials =   {
        name:"hmn",
        rpc_user: "",
        rpc_password: "",
        rpc_port: 9998,
        hostname:"localhost",
        CREATE_MASTERNODE_FILE : "./HMN_coin.sh"
    }

    try {
        var balance = await getbalance("getbalance.sh","hostmasternode-cli")
        console.log("balance is ",typeof(Number(balance)))
    } catch (error) {
	console.log(error)
        
    }
})()
