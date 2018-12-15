const Output = require('./models/output')


 Output.findOne({ txid: "vrfrfrefe" }, function(err, output)  {
		console.log(err, output)
            if (!err) {
                if (output) {
                    
                    console.log({ output: output })
                } else {
                    console.log({ msg: "no data found" })
                }
            } else {
                    console.log({ msg: err })
            }
        })

