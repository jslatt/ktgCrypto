const Discord = require('discord.js');
const moment = require('moment');
const https = require('https');
const { off } = require('process');


const client = new Discord.Client();
const prefix = '~'

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLocaleLowerCase();

    // RVol
    if(command === 'rvol' && args[0] != undefined) {
        message.channel.send('Fetching relative volume for ' + args[0].toUpperCase() + '/USD.')
        
        const http = require("https");

        // 21 Days Before Today YYYY-MM-DD
        dFix = moment().subtract(21, 'days').format('YYYY-MM-DD')

        let path = "/v1/ohlcv/" + args[0].toUpperCase() + "/USD/history?period_id=1DAY&time_start=" + dFix + "T00%3A00%3A00";

        const options = {
          "method": "GET",
          "hostname": "rest.coinapi.io",
          "port": null,
          "path": path,
          "headers": {
            "X-CoinAPI-Key": "FDE9F5CF-6150-4E05-90A3-69B59255032B",
            "Content-Length": "0"
          }
        };
        const req = http.request(options, function (res) {
          const chunks = [];
        
          res.on("data", function (chunk) {
            chunks.push(chunk);
          });
        
          res.on("end", function () {
            const body = Buffer.concat(chunks);
            let data = JSON.parse(body);
            let sum = 0;
            //data[0].volume_traded
            if(Object.values(data).length > 1) {
              for (i = 0; i < Object.values(data).length; i++){
                sum += data[i].volume_traded;
                //message.channel.send(data[i].volume_traded)
              }
              
              let avg = sum/Object.values(data).length
  
  
              let rvol = data[Object.values(data).length - 2].volume_traded/avg;
              message.channel.send('RVol: ' + rvol)
              //message.channel.send('Avg ' + avg + 'Last ' + data[Object.values(data).length - 2].volume_traded + 'RVol ' +rvol)
            }
            else {
              message.channel.send("Coin not supported by API. `Data length of 0`")
            }


          });
        });
        
        req.end();

    }
    if(command === 'rvol' && args[0] == undefined) {
      message.channel.send('Error - Need symbol after rvol command. (see ~help)')
    }
    // Help Command
    if(command === 'help') {
      message.channel.send('**About KTG Crypto Bot (prefix ~)**\nCommands:\n`help` - command info\n`rvol` - gets 21 day average of volume and compares it to prior days (~rvol TICKER/USD)\n`gas` - fetches gas fee prices from https://docs.ethgasstation.info/gas-price#gas-price')
    }
    //Gas Fees ETH
    if(command === 'gas') {
      const http = require("https");

      const options = {
        "method": "GET",
        "hostname": "ethgasstation.info",
        "port": null,
        "path": "/api/ethgasAPI.json?api-key=9497206193c685176311410a21cde733756b59efcff40bff71cb70349029",
        "headers": {
          "cookie": "__cfduid=d4e59a11a4d25c9aeff3e6da55b6172261619664184; AWSALB=BM40CLkxJ7tu%2FbgCydYp05YIsVgNRlLlABqCKxVT%2BDjS59R2nqQdV%2B7Za4s6RQ1RZhs2zknwbFrDj9TwhfwVnsCkmbc1Jlth07CtjVgcfAEpX%2BG3ZMYtvSc9FPrG; AWSALBCORS=BM40CLkxJ7tu%2FbgCydYp05YIsVgNRlLlABqCKxVT%2BDjS59R2nqQdV%2B7Za4s6RQ1RZhs2zknwbFrDj9TwhfwVnsCkmbc1Jlth07CtjVgcfAEpX%2BG3ZMYtvSc9FPrG",
          "Content-Length": "0"
        }
      };
      
      const req = http.request(options, function (res) {
        const chunks = [];
      
        res.on("data", function (chunk) {
          chunks.push(chunk);
        });
      
        res.on("end", function () {
          const body = Buffer.concat(chunks);
          let data = JSON.parse(body);

          message.channel.send("fast: " + data.fast + "\nfastest: " + data.fastest + "\nsafeLow: " + data.safeLow + "\naverage: " + data.average + "\nblock_time: " + data.block_time + "\nblockNum: " + data.blockNum + "\nspeed: " + data.speed + "\nsafeLowWait: " + data.safeLowWait + "\navgWait: " + data.avgWait + "\nfastWait: " + data.fastWait + "\nfastestWait: " + data.fastestWait)

        });
      });
      
      req.end();


    }
    //Santiment API
    if(command === 'santiment') {
      const http = require("https");

      const options = {
        "method": "POST",
        "hostname": "api.santiment.net",
        "port": null,
        "path": "/graphql",
        "headers": {
          "cookie": "__cfduid=ddb9c04a7d4e1a9de1190c11b0047f5ba1619491547",
          "Content-Type": "application/json",
          "Content-Length": "274"
        }
      };

      const req = http.request(options, function (res) {
        const chunks = [];

        res.on("data", function (chunk) {
          chunks.push(chunk);
        });

        res.on("end", function () {
          const body = Buffer.concat(chunks);
          message.channel.send(body.toString());
        });
      });

      req.write("{\"query\":\"{\\n  getMetric(metric: \\\"social_volume_total\\\") {\\n    timeseriesData(\\n      selector: { slug: \\\"santiment\\\" }\\n      from: \\\"2021-04-01T00:00:00Z\\\"\\n      to: \\\"2021-04-07T00:00:00Z\\\"\\n      interval: \\\"1d\\\"\\n    ) {\\n      datetime\\n      value\\n    }\\n  }\\n}\"}");
      req.end();


    }
    
})

client.login('NzYxMDU4ODI0MTczMTI1NjYz.X3VFQw.JylV4hUkj0KFania0JIeHfo6OLw');

