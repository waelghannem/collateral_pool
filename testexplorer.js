const axios = require('axios');
axios.get('https://explorer.hostmasternode.com/insight-api/addr/' + 'hLWtSQPD9h3pwP9EDkmMaQNhrRxQFLVAzy' + '/?noTxList=1')
                .then(async (response) => {
                    console.log(response.data.balance);
                }) .catch(error => {
                    console.log('https://explorer.hostmasternode.com/insight-api/addr/' + 'hLWtSQPD9h3pwP9EDkmMaQNhrRxQFLVAzy' + '/?noTxList=1')
                    if (error.response) {
                        if (error.response.data == "Invalid address: Checksum mismatch. Code:1") {
                            console.log({ success: false, cause: error.response.data });
                        } else {
                            console.log({ success: false, cause: error });
                        }
                    } else {
                        console.log({ success: false, cause: error });
                    }
                });
