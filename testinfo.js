
const exec = require('child_process').exec;


function getTransactionInfo(txinfo_script_file, txinfo_cli, txid) {
    return new Promise(function (resolve, reject) {
        exec(`sh ${txinfo_script_file} ${txinfo_cli} ${txid}`, (err, stdout, stderr) => {
            if (err) {
                reject(err)
            } else if (stderr) {
                reject(stderr)
            } else {
                if (stdout) {
                    resolve(stdout)
                } else {
                    reject("tx info error")
                }
            }
        });
    })
}
(async function(){
   try {
    var transactionInfo = await getTransactionInfo('gettransactioninfo.sh', 'hostmasternode-cli', "b93293eb98d66fb855535a724e49cfd15286a96e6f1d8b5aac838b5427220114")
    console.log("typeof transactionInfo ",typeof(transactionInfo))
    //console.log(transactionInfo.details.address)
    var transactionInfojson = JSON.parse(transactionInfo)
    console.log("typeof transactionInfo ",typeof(transactionInfo))
    console.log(transactionInfojson.details.address)
    console.log(transactionInfojson.details)
   } catch (error) {
       console.log(error)
   }

})()
