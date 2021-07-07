const Discord = require('discord.js');
const moment = require('moment');
const https = require('https');
const { off } = require('process');
const { now } = require('moment');
var jsonata = require("jsonata");
const { count } = require('console');


const client = new Discord.Client();
const prefix = '~'
///////////////////////
// Liquidator 5000   //
///////////////////////
let lastFetch = [];


function getLiquidationsETH() {
  // Reset array if it gets over 100 IDs stored. 
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
      if (d.success) {
        for (i = 0; i < Object.values(d).length; i++) {
          // If ID has not already been posted.... then post.
          if (d.data.list[i] != undefined) {
            if (!(lastFetch.includes(d.data.list[i].id))) {
              // send messgae to liquidations w/ data
              let side = "VOID";
              if (d.data.list[i].side > 1) {
                side = 'SHORT';
              }
              if (d.data.list[i].side < 2) {
                side = 'LONG';
              }
              let t = moment.utc(d.data.list[i].createTime).utcOffset('-0400').format('HH:mm')

              let payload = t + ": " + d.data.list[i].exchangeName + " " + d.data.list[i].originalSymbol + " " + side + " Liquidation: " + d.data.list[i].amount + " " + d.data.list[i].symbol + " ($" + (d.data.list[i].volUsd / 1000000).toFixed(2) + "M) at $" + d.data.list[i].price;
              //client.channels.cache.get('835153133100728370').send(payload);

              lastFetch.push(d.data.list[i].id);

            }
          }
        }
      }
    });
  });

  req.end();
}
setInterval(getLiquidationsETH, 10000); // Run every 30 seconds




///////////////////////
// Command Responses //
///////////////////////
client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLocaleLowerCase();

  // Messari Assets
  if (command === 'top' && args[0] != undefined) {
    const http = require("https");

    const path = "/assets?quote=usd&sort=performance&performanceWindow=" + args[0];

    const options = {
      "method": "GET",
      "hostname": "billboard.service.cryptowat.ch",
      "port": null,
      "path": path,
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
        message.channel.send("Top 10 Crypto Assets by " + args[0].toUpperCase() + " % Change:")


        let counter = 0;
        let i = 0;
        let payload = [];
        while (counter < 10) {
          if (!(d["result"]["rows"][i].name.toString().includes("3X"))) {
            payload.push(d["result"]["rows"][i].symbol + " (" + d["result"]["rows"][i].name + ")");
            counter++;
          }
          i++;
        }
        message.channel.send(payload);

      });
    });

    req.end();
  }
  if (command === 'rvol' && args[0] != undefined) {
    message.channel.send('Fetching fancy relative volume for ' + args[0].toUpperCase() + ".")

    const http = require("https");
    var dFix = Math.round(moment().subtract(21, 'days').valueOf()/1000);
    let path = "/api/v1/quote/candles?contract=" + args[0].toUpperCase() + "&duration=1h&since=" + dFix;

    const options = {
      "method": "GET",
      "hostname": "1token.trade",
      "port": null,
      "path": path,
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

        if (Object.values(data).length > 1) {
          // What hour is it now?
          let now = moment().format('HH');//Returns 16

          for (i = 0; i < Object.values(data).length; i++) {
            // For each day... get the average volume up to the hour of that day.
            //message.channel.send("time -" + data[i].time_close.substring(11,13))
            // If data hour is less than or equal to current requested hour, count. Else - ignore. 
            if (data[i].time.substring(11, 13) <= now) {
              sum += data[i].volume;
              counter++;
            }
          }

          let avg = sum / counter;

          let rvol = data[Object.values(data).length - 1].volume / avg;
          message.channel.send('RVol: ' + rvol)
          //message.channel.send('Total hours qualified ' + counter + ' total volume ' + sum + '`object length - `' + Object.values(data).length)
        }
        else {
          message.channel.send("Coin not supported by API. `Data length of 0`")
        }


      });
    });

    req.end();

  }
  if (command === 'rvol' && args[0] == undefined) {
    message.channel.send('Error - Need symbol after rvol command. (see ~help)')
  }
  // Help Command
  if (command === 'help') {
    message.channel.send('**About KTG Crypto Bot (prefix ~)**\nCommands:\n`help` - command info\n`rvol` - gets 21 day average of volume and compares it to prior days (~rvol TICKER/USD)\n`gas` - fetches gas fee prices from ETH gas station info.\n`social {{command}}` - retrives social sentiment data (LunarCRUSH) and ranks top 10 based on filter. Currently supported: gs - galaxy score, sv -social volume, c - social contibutor mentions (24hrs).')
  }
  // Sleep
  if (command === 'ssheeeesh') {
    message.channel.send('HEY THERE YOU WHIPPER SNAPPER YOU BETTER GET TO BED!!!')
  }
  //Gas Fees ETH
  if (command === 'gas') {
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

        message.channel.send("fast: " + data.fast / 10 + "\nfastest: " + data.fastest / 10 + "\nsafeLow: " + data.safeLow / 10 + "\naverage: " + data.average / 10 + "\nblock_time: " + data.block_time + "\nblockNum: " + data.blockNum + "\nspeed: " + data.speed + "\nsafeLowWait: " + data.safeLowWait + "\navgWait: " + data.avgWait + "\nfastWait: " + data.fastWait + "\nfastestWait: " + data.fastestWait)

      });
    });

    req.end();


  }
  // Search 1Token

  if (command === 'search' && args[0] != undefined) {

      const http = require("https");

      const options = {
        "method": "GET",
        "hostname": "1token.trade",
        "port": null,
        "path": "/api/v1/basic/search-contracts?search=" + args[0],
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
          let result = d.contracts;
          message.channel.send(result);
        });
      });
      
      req.end();
    
  }
  if (command === 'search' && args[0] == undefined) {
    message.channel.send('Error - Need symbol after search command. (see ~help)')
  }
  //Santiment API
  if (command === 'santiment') {
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
  if (command === 'social' && args[0] != undefined) {
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
          if (Object.values(d).length > 1) {
            let set = []
            message.channel.send('Top 10 Galaxy Score Symbols:')
            for (i = 0; i < 10; i++) {
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
          if (Object.values(d).length > 1) {
            let set = []
            message.channel.send('Top 10 Social Volume Symbols:')
            for (i = 0; i < 10; i++) {
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
          if (Object.values(d).length > 1) {
            let set = []
            message.channel.send('Top 10 24hr Social Contributor Symbols:')
            for (i = 0; i < 10; i++) {
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

