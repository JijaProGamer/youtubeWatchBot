const path = require("path");

const API = require("youtube-selfbot-api")();

const worker = JSON.parse(process.argv[2]);
const options = JSON.parse(process.argv[3]);
const index = JSON.parse(process.argv[4]);

function communicate(type, message) {
  let typeMessage = typeof message;

  if (typeof message == "object") {
    message = JSON.stringify(message);
  } else message = message.toString();

  process.stdout.write(`CMT_DATA+${type}+${typeMessage}+${message}`);
}

function ask(type, message) {
  return new Promise((resolve, reject) => {
    process.stdin.on("data", (raw_data) => {
      raw_data = raw_data.toString();
      if (raw_data.startsWith("CMT_DATA+")) {
        raw_data = raw_data.substring(9).split("+");

        let type = raw_data.shift();
        let contentType = raw_data.shift();
        let data = raw_data.join("");

        switch (contentType) {
          case "object":
            data = JSON.parse(data);
            break;
          case "boolean":
            data = (data == "true" && true) || false;
            break;
          case "number":
            data = parseFloat(data);
            break;
          case "undefined":
            data = undefined;
            break;
        }

        resolve(data);
      }
    });

    communicate(type, message);
  });
}

(async () => {
  let connection = await API.connectBrowser(options.browserPath, {
    proxyServer: worker.job.proxy,
    userDataDir: path.join(__dirname, `../UDATA/cache/${index}`),
    saveBandwith: true,
    headless: options.headless,
    no_visuals: options.no_visuals,
  });

  let data = connection.data;

  data.on("debug", (debugInfo) => {
    communicate("debug_message", debugInfo);
  });

  data.on("bandwithUsed", (bandwith) => {
    communicate("bandwith_usage", bandwith);
  });

  let browser = await connection.browser();
  let page = await API.handleNewPage(false);

  if (worker.job.login) {
    await API.login(page, worker.job.account, worker.job.account.cookies);
  } else if (worker.job.style == "subscriptions") worker.job.style = "search";

  switch (worker.job.style) {
    case "search":
      API.handleSearchPage(page, worker.job.id);
      break;
    case "subscriptions":
      API.handleSearchPage(page, worker.job.id);
      break;
    case "direct":
      await page.goto(`https://youtube.com/watch?v=${worker.job.id}`, {
        waitUntil: "networkidle2"
      });

      break;
  }

  await API.initWatcher(page);

  let finish_time = worker.job.watchTime

  if(!worker.job.is_live){
    await API.seek(page, 0)
  } else {
    finish_time += (await API.getPlayerStatistics(page)).time
  }

  let liked,disliked,commented

  let worker_interval = setInterval(async () => {
    let current_time = (await API.getPlayerStatistics(page)).time
    if(worker.job.account){
        if(worker.job.account.like && !liked && current_time >= worker.job.account.likeAfter){
            await API.likeVideo(page)
            liked = true
        }

        if(worker.job.account.dislike && !disliked && current_time >= worker.job.account.dislikeAfter){
            await API.dislikeVideo(page)
            disliked = true
        }

        if(worker.job.account.comment && worker.job.account.comment.length > 0 && !commented && current_time >= worker.job.account.commentAfter){
            await API.makeComment(page, worker.job.account.comment)
            commented = true
        }
    }

    communicate("current_time", current_time);

    if(current_time >= finish_time){
        clearInterval(worker_interval)
        process.exit(0)
    }
  }, 500)
})();
