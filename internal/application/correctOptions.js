const fs = require("fs");
const to = require("await-to-js").to;

const idValid = require("./idValid.js");
const checkProxy = require("./testProxy.js");
const create_job = require("./create_job");

let options = global.options;

module.exports = () => {
  return new Promise(async (resolve) => {
    if (!options.browserPath) {
    } else {
      if (!fs.existsSync(options.browserPath)) {
      }
    }

    let newVideos = [];

    let newProxies = [];

    if (options.proxies) {
      options.proxies = options.proxies.filter((v) => v.length > 5)
      options.proxies = [...new Set(options.proxies)];
      
      for (let [index, proxy] of options.proxies.entries()) {
        if(proxy.length > 5){
          let breaks = proxy.split(":")
          if(breaks.length == 4){
            options.proxies[index] = `${breaks[2]}:${breaks[3]}@${breaks[0]}:${breaks[1]}`
          }
  
          io.sockets.write({
            type: "add_testing_proxy",
            data: proxy,
          });
        }
      }

      for (let [index, proxy] of options.proxies.entries()) {
        if (options.disable_proxy_tests) {
          let data2 = {
            type: "add_good_proxy",
            latency: 0,
            data: proxy,
          };

          global.proxy_stats.untested = global.proxy_stats.untested.filter(v => v.data !== proxy)
          global.proxy_stats.good.push(data2);
          io.sockets.write(data2);
        } else {
          global.log(`Started checking proxy ${proxy}`);

          let [err, sucess2] = await to(checkProxy(proxy, index));

          if (sucess2) {
            newProxies.push(proxy);
            global.log(
              `Proxy ${proxy} is good, speeds of ${sucess2.latency}ms`
            );

            let data2 = {
              type: "add_good_proxy",
              latency: sucess2.latency,
              data: proxy,
            };

            global.proxy_stats.untested = global.proxy_stats.untested.filter(v => v.data !== proxy)
            global.proxy_stats.good.push(data2);
            io.sockets.write(data2);
          } else {
            global.log(
              `Proxy ${proxy} failed because of ${err.error}`,
              "error"
            );

            let data = {
              type: "add_bad_proxy",
              error: err,
              data: proxy,
            };

            global.proxy_stats.untested = global.proxy_stats.untested.filter(v => v.data !== proxy)
            global.proxy_stats.bad.push(data);
            io.sockets.write(data);
          }
        }
      }

      options.newProxies = newProxies;
    } else {
      let data = {
        type: "add_testing_proxy",
        error: err,
        data: proxy,
      };

      global.proxy_stats.untested.push(data);
      io.sockets.write(data);

      let data2 = {
        type: "add_good_proxy",
        latency: 0,
        data: proxy,
      };

      global.proxy_stats.good.push(data2);
      io.sockets.write(data2);

      options.proxies = ["direct://"];
    }

    for (let video of options.videos) {
      let [err, sucess] = await to(idValid(video.id));

      if (sucess) {
        newVideos.push(video);
      }
    }

    for (let video of newVideos) {
      for (let view = 0; view < video.guest_views || 0; view++) {
        await create_job(video, undefined);
      }

      for (let account of video.accounts || []) {
        await create_job(video, account);
      }
    }

    resolve()
  });
};
