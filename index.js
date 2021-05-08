const Discord = require('discord.js');
const moment = require('moment');
const https = require('https');
const { off } = require('process');


const client = new Discord.Client();
const prefix = '~'
///////////////////////
// Liquidator 5000   //
///////////////////////
let lastFetch = [];
// Run Every 30 Seconds
function getLiquidationsETC() {
  // Reset array if it gets over 50 IDs stored. 
  if (lastFetch.length > 100) {
    lastFetch = []; 
  }
  
  // Get Last 10 Liquidations
  const http = require("https");

    const options = {
      "method": "GET",
      "hostname": "fapi.bybt.com",
      "port": null,
      "path": "/api/futures/liquidation/order?side=&exName=&symbol=ETC&pageSize=10&pageNum=1&volUsd=1000000",
      "headers": {
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
        d = JSON.parse(body);
        if(Object.values(d).length > 1) {
          for (i = 0; i < Object.values(d).length; i++){
            // If ID has not already been posted.... then post.
            if (!(lastFetch.includes(d.data.list[i].id))){
              // send messgae to liquidations w/ data
             let side = d.data.list[i].side;
             if (side = 2) {
               side = 'SHORT';
             }
             if (side = 1) {
               side = 'LONG';
             }
            t= moment.utc(d.data.list[i].createTime).utcOffset('-0400').format('HH:mm')

            let payload = t + ": " + d.data.list[i].exchangeName + " " + d.data.list[i].originalSymbol + " " + side + " Liquidation: " + d.data.list[i].amount + " " + d.data.list[i].symbol + " ($" + (d.data.list[i].volUsd/1000000).toFixed(2)  + "M) at $" + d.data.list[i].price;
            client.channels.cache.get('835153133100728370').send(payload);

            lastFetch.push(d.data.list[i].id);
            }
            /*else {
              // Remove the already posted ID from the List (keep it clean)
              let index = lastFetch.indexOf(d.data.list[i].id);
              lastFetch.splice(index,1);
            }*/
            // Store IDs for next fetch.
            
          }
        }



      });
    });

    req.end();
}
setInterval(getLiquidationsETC, 5000); // Run every 30 seconds

function getLiquidationsETH() {
  // Reset array if it gets over 50 IDs stored. 
  if (lastFetch.length > 100) {
    lastFetch = []; 
  }
  
  // Get Last 10 Liquidations
  const http = require("https");

    const options = {
      "method": "GET",
      "hostname": "fapi.bybt.com",
      "port": null,
      "path": "/api/futures/liquidation/order?side=&exName=&symbol=ETH&pageSize=10&pageNum=1&volUsd=1000000",
      "headers": {
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
        d = JSON.parse(body);
        if(Object.values(d).length > 1) {
          for (i = 0; i < Object.values(d).length; i++){
            // If ID has not already been posted.... then post.
            if (!(lastFetch.includes(d.data.list[i].id))){
              // send messgae to liquidations w/ data
             let side = d.data.list[i].side;
             if (side = 2) {
               side = 'SHORT';
             }
             if (side = 1) {
               side = 'LONG';
             }
            t= moment.utc(d.data.list[i].createTime).utcOffset('-0400').format('HH:mm')

            let payload = t + ": " + d.data.list[i].exchangeName + " " + d.data.list[i].originalSymbol + " " + side + " Liquidation: " + d.data.list[i].amount + " " + d.data.list[i].symbol + " ($" + (d.data.list[i].volUsd/1000000).toFixed(2)  + "M) at $" + d.data.list[i].price;
            client.channels.cache.get('835153133100728370').send(payload);

            lastFetch.push(d.data.list[i].id);
            }
            /*else {
              // Remove the already posted ID from the List (keep it clean)
              let index = lastFetch.indexOf(d.data.list[i].id);
              lastFetch.splice(index,1);
            }*/
            // Store IDs for next fetch.
            
          }
        }



      });
    });

    req.end();
}
setInterval(getLiquidationsETH, 5000); // Run every 30 seconds




///////////////////////
// Command Responses //
///////////////////////
client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLocaleLowerCase();

    // RVol
    if(command === 'rvol' && args[0] != undefined) {
        message.channel.send('Fetching relative volume for ' + args[0].toUpperCase() + '.')
        
        const http = require("https");

        // 21 Days Before Today YYYY-MM-DD
        dFix = moment().subtract(21, 'days').format('YYYY-MM-DD')

        let path = "/v1/ohlcv/" + args[0].toUpperCase() + "/history?period_id=1DAY&time_start=" + dFix + "T00%3A00%3A00";

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
      //Fancy Rvol
      if(command === 'frvol' && args[0] != undefined) {
        message.channel.send('Fetching fancy relative volume for ' + args[0].toUpperCase()+".")
        
        const http = require("https");

        // 21 Days Before Today YYYY-MM-DD
        dFix = moment().subtract({hours: 504}).format('YYYY-MM-DD')

        let path = "/v1/ohlcv/" + args[0].toUpperCase() + "/history?period_id=1HRS&time_start=" + dFix + "T00%3A00%3A00";

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
            let counter = 0;
            //data[0].volume_traded
            if(Object.values(data).length > 1) {
              // What hour is it now?
              let now = moment().format('HH');//Returns 16

              for (i = 0; i < Object.values(data).length; i++){
                // For each day... get the average volume up to the hour of that day.
                //message.channel.send("time -" + data[i].time_close.substring(11,13))
                // If data hour is less than or equal to current requested hour, count. Else - ignore. 
                if (data[i].time_close.substring(11,13) <= now) {
                  sum+=data[i].volume_traded;
                  counter++;
                }
              }

              message.channel.send('Total hours qualified ' + counter + ' total volume ' + sum + '`object length - `' + Object.values(data).length)
            }
            else {
              message.channel.send("Coin not supported by API. `Data length of 0`")
            }


          });
        });
        
        req.end();

    }
    if(command === 'frvol' && args[0] == undefined) {
      message.channel.send('Error - Need symbol after frvol command. (see ~help)')
    }
    if(command === 'rvol' && args[0] == undefined) {
      message.channel.send('Error - Need symbol after rvol command. (see ~help)')
    }
    // Help Command
    if(command === 'help') {
      message.channel.send('**About KTG Crypto Bot (prefix ~)**\nCommands:\n`help` - command info\n`rvol` - gets 21 day average of volume and compares it to prior days (~rvol TICKER/USD)\n`gas` - fetches gas fee prices from ETH gas station info.\n`social {{command}}` - retrives social sentiment data (LunarCRUSH) and ranks top 10 based on filter. Currently supported: gs - galaxy score, sv -social volume, c - social contibutor mentions (24hrs).')
    }
    // Sleep
    if(command === 'ssheeeesh') {
      message.channel.send('HEY THERE YOU WHIPPER SNAPPER YOU BETTER GET TO BED!!!')
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

          message.channel.send("fast: " + data.fast/10 + "\nfastest: " + data.fastest/10 + "\nsafeLow: " + data.safeLow/10 + "\naverage: " + data.average/10 + "\nblock_time: " + data.block_time + "\nblockNum: " + data.blockNum + "\nspeed: " + data.speed + "\nsafeLowWait: " + data.safeLowWait + "\navgWait: " + data.avgWait + "\nfastWait: " + data.fastWait + "\nfastestWait: " + data.fastestWait)

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
    // LunarCRUSH
    if(command === 'social' && args[0] != undefined) {
      if (args[0] === "gs") {
        const http = require("https");

        const options = {
          "method": "GET",
          "hostname": "api.lunarcrush.com",
          "port": null,
          "path": "/v2?data=market&key=ege97ydfvyqg024tp5dcqr&limit=10&sort=gs&desc=true",
          "headers": {
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
            let d = JSON.parse(body);
            //Get Symbols d.data[0].s
            if(Object.values(d).length > 1) {
              let set = []
              message.channel.send('Top 10 Galaxy Score Symbols:')
              for (i = 0; i < 10; i++){
                set.push(d.data[i].s)
              }
              message.channel.send(set.toString())
            }
  
          });
        });
  
        req.end();
      }
      if (args[0] === "sv") {
        const http = require("https");

        const options = {
          "method": "GET",
          "hostname": "api.lunarcrush.com",
          "port": null,
          "path": "/v2?data=market&key=ege97ydfvyqg024tp5dcqr&limit=10&sort=sv&desc=true",
          "headers": {
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
            let d = JSON.parse(body);
            //Get Symbols d.data[0].s
            if(Object.values(d).length > 1) {
              let set = []
              message.channel.send('Top 10 Social Volume Symbols:')
              for (i = 0; i < 10; i++){
                set.push(d.data[i].s)
              }
              message.channel.send(set.toString())
            }
  
          });
        });
  
        req.end();
      }
      if (args[0] === "c") {
        const http = require("https");

        const options = {
          "method": "GET",
          "hostname": "api.lunarcrush.com",
          "port": null,
          "path": "/v2?data=market&key=ege97ydfvyqg024tp5dcqr&limit=10&sort=c&desc=true",
          "headers": {
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
            let d = JSON.parse(body);
            //Get Symbols d.data[0].s
            if(Object.values(d).length > 1) {
              let set = []
              message.channel.send('Top 10 24hr Social Contributor Symbols:')
              for (i = 0; i < 10; i++){
                set.push(d.data[i].s)
              }
              message.channel.send(set.toString())
            }
  
          });
        });
  
        req.end();
      }

    }
})
//Prod
client.login('NzYxMDU4ODI0MTczMTI1NjYz.X3VFQw.JylV4hUkj0KFania0JIeHfo6OLw');
//Dev
//client.login('ODM4MTk3MjE2MDUyMTE3NTI1.YI3l_Q.MT-sgfwNBVi3myP1lp-adR6Xxrw');

