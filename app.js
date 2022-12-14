const express = require("express");
const http = require("http");
const gaxios = require("gaxios");

const webApp = express();
const server = http.createServer(webApp);
const io = new (require("socket.io").Server)(server);

webApp.use(express.json());
webApp.use(require("cors")());

const fs = require("fs-extra");

const { spawn } = require("child_process");
const { parse, stringify } = require("yaml");

const killProcesses = (name) => {
  return new Promise((resolve, reject) => {
    let child;

    if (process.platform == "win32") {
      child = spawn("taskkill", ["/f", "/im", `${name}.exe`]);
    } else {
      child = spawn("killall", [name]);
    }

    child.stderr.on("data", (data) => {
      data = data.toString();
    });

    child.on("exit", () => {
      resolve();
    });
  });
};

let logs = [];
let jobs = [];
let current_workers = [];
let workers_finished = [];

let options = parse(fs.readFileSync("./UDATA/options.yaml", "utf-8"));

global.NXT_DATA = "STOP";
global.good_proxies = JSON.parse(fs.readFileSync("./UDATA/ALV_PRX", "utf-8"));

global.server = server;
global.webApp = webApp;

global.options = options;
global.raw_options = options;
global.raw_videos = options.videos;

global.VERSION = fs.readFileSync("./VERSION");
global.io = io;

global.proxy_stats = {
  untested: [],
  good: [],
  bad: [],
};

global.jobs = jobs;

let queue_workers = [];

webApp.get("/api/options", (req, res) => {
  res.send(global.raw_options)
})

webApp.post("/api/options", (req, res) => {
  global.raw_options = { ...req.body, videos: global.raw_videos };
  fs.writeFileSync("./UDATA/options.yaml",stringify(global.raw_options),"utf-8");

  res.sendStatus(200);
})

webApp.get("/api/videos", (req, res) => {
  res.send(global.raw_videos)
})

webApp.post("/api/options", (req, res) => {
  global.raw_options = { ...req.body, videos: global.raw_videos };
  fs.writeFileSync("./UDATA/options.yaml",stringify(global.raw_options),"utf-8");

  res.sendStatus(200);
})

webApp.post("/api/videos", (req, res) => {
  global.raw_videos = [...global.raw_videos, req.body];
  global.raw_options = { ...global.raw_options, videos: req.body };
  fs.writeFileSync("./UDATA/options.yaml", stringify(global.raw_options), "utf-8");

  res.sendStatus(201);
})

webApp.delete("/api/videos", (req, res) => {
  let video = global.raw_videos.find((_, index) => index == req.body.index)
  if(video){
    global.raw_videos = global.raw_videos.filter((_, index) => index !== req.body.index)
    res.sendStatus(200)
  } else {
    res.sendStatus(404)
  }
})

webApp.patch("/api/videos", (req, res) => {
  let video = global.raw_videos.findIndex((_, index) => index == req.body.index)
  if(video > -1){
    global.raw_videos[video] = req.body.video
    res.sendStatus(200)
  } else {
    res.sendStatus(404)
  }
})

webApp.get("/api/status", (req, res) => {
  res.json({
    version: global.VERSION,
    isWorking: global.NXT_DATA == "START",
    proxy_stats: global.proxy_stats,
    worker_stats: {
      finished: workers_finished,
      working: current_workers,
      queue: queue_workers
    }
  });
})

webApp.post("/internal/set_raw_options", (req, res) => {
  global.raw_options = { ...req.body, videos: global.raw_videos };

  fs.writeFileSync(
    "./UDATA/options.yaml",
    stringify(global.raw_options),
    "utf-8"
  );

  res.sendStatus(200);
});

webApp.post("/internal/set_videos", (req, res) => {  
  global.raw_videos = req.body;
  global.raw_options = { ...global.raw_options, videos: req.body };
  fs.writeFileSync(
    "./UDATA/options.yaml",
    stringify(global.raw_options),
    "utf-8"
  );

  res.sendStatus(200);
});

webApp.post("/internal/set_NXT_DATA", (req, res) => {
  global.NXT_DATA = req.body.data;
  start(global.NXT_DATA == "START");

  res.sendStatus(200);
});

webApp.get("/internal/NXT_DATA", (req, res) => {
  res.send(global.NXT_DATA);
});

webApp.get("/internal/get_raw_options", (req, res) => {
  res.json(global.raw_options);
});

webApp.get("/internal/get_options", (req, res) => {
  res.json(options);
});

webApp.get("/internal/get_queue_workers", (req, res) => {
  res.json(queue_workers);
});

webApp.get("/internal/get_current_workers", (req, res) => {
  res.json(current_workers);
});

webApp.get("/internal/get_finished_workers", (req, res) => {
  res.json(workers_finished);
});

webApp.get("/internal/get_logs", (req, res) => {
  res.json(logs);
});

webApp.get("/internal/get_proxy_stats", (req, res) => {
  res.json(proxy_stats);
});

webApp.get("/internal/get_version", (req, res) => {
  res.send(global.VERSION);
});

webApp.get("/internal/get_latest_version", (req, res) => {
  gaxios.request({
    method: "GET",
    url: "https://raw.githubusercontent.com/JijaProGamer/Youtube-View-Bot/master/VERSION",
  }).then((data) => {
    res.send(data.data.toString());
  })
});

function transformData(raw_data, resolve) {
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

    resolve(true, {
      data,
      type,
    });
  } else {
    resolve(false, raw_data);
  }
}

function handleWorker(worker, job, index) {
  return new Promise((resolve, reject) => {
    let cache = worker;
    let errored = false;

    for (let oldWorker of workers_finished) {
      if (!oldWorker.proxy_used) {
        cache = oldWorker;
        cache.proxy_used = true;

        break;
      }
    }

    const worker_process = spawn("node", [
      path.join(__dirname, "/internal/worker.js"),
      JSON.stringify(worker),
      JSON.stringify(options),
      cache.index,
    ]);

    worker.process = worker_process;

    worker_process.stderr.on("data", (data) => {
      data = data.toString();

      if (!worker.stopped) {
        errored = true;

        worker.errors.push(data);
        log(`worker #${worker.index} had an error: ${data}`, "error");
      }
    });

    worker_process.stdout.on("data", (raw_data) => {
      transformData(raw_data, (usable, result) => {
        if (usable) {
          switch (result.type) {
            case "bandwith_usage":
              worker.bandwith += result.data;
              break;
            case "debug_message":
              worker.debug.push(result.data);
              break;
            case "current_time":
              worker.current_time = result.data;
              break;
          }

          io.sockets.write({
            type: "update_worker",
            data: worker,
          });
        }
      });
    });

    worker_process.on("close", () => {
      cache.proxy_used = false;
      worker.proxy_used = false;
      worker.finished = true;
      worker.finish_time = Date.now()

      if (!worker.stopped) {
        if (errored) {
          worker.failed = true;

          reject();
        } else {
          resolve();
        }
      }

      io.sockets.write({
        type: "remove_worker",
        data: worker,
      });
    });
  });
}

const correctOptions = require("./internal/application/correctOptions.js");
const path = require("path");

let currentWorking = 0;
let totalWorked = 0;

function log(message, type) {
  let logObj = {
    type: type || "info",
    message,
    sent: Date.now(),
  };

  logs.push(logObj);

  io.sockets.write({ type: "add_log", data: logObj });
}

global.log = log;

let lastLaunched = Date.now() / 1000 - options.concurrencyInterval;
let shouldWork = false;

require("./internal/application/launchGUI.js");

let interval = setInterval(() => {
  if (shouldWork) {
    killProcesses("software_reporter_tool");

    if (Date.now() / 1000 - options.concurrencyInterval > lastLaunched) {
      if (currentWorking < options.concurrency) {
        let currentJob = totalWorked;
        let job = jobs[totalWorked];
        if (job) {
          let worker = {
            job,
            index: totalWorked,
            totalWorked: totalWorked + 1,
            current_time: 0,
            start_time: Date.now(),
            loaded: false,
            bandwith: 0,
            //loading_bandwith: 0,
            failed: false,
            finished: false,
            stopped: false,
            proxy_used: true,
            debug: [],
            errors: [],
          };

          queue_workers = queue_workers.filter(
            (v) => v.uuid !== worker.job.uuid
          );

          io.sockets.write({
            type: "add_worker",
            data: worker,
          });

          current_workers.push(worker);

          log(`worker #${currentJob + 1} started`, "info");

          handleWorker(worker)
            .then(() => {
              workers_finished.push(worker);
              current_workers = current_workers.filter(
                (v) => v.index !== worker.index
              );

              currentWorking -= 1;

              log(`worker #${currentJob} finished`, "info");
            })
            .catch((err) => {
              workers_finished.push(worker);
              current_workers = current_workers.filter(
                (v) => v.index !== worker.index
              );

              currentWorking -= 1;

              log(`worker #${currentJob} finished with an error`, "error");
            });

          currentWorking += 1;
          totalWorked += 1;
          lastLaunched = Date.now() / 1000;
        }
      }
    }
  }
}, 1000);

async function start(started) {
  if (started) {
    io.sockets.write({
      type: "change_PRX",
      data: { nx: "WAIT", ox: "WAIT" },
    });

    currentWorking = 0;
    totalWorked = 0;

    current_workers = [];
    queue_workers = [];
    workers_finished = [];
    global.jobs = jobs = [];
    global.proxy_stats = {
      untested: [],
      good: [],
      bad: [],
    };

    lastLaunched = Date.now() / 1000 - options.concurrencyInterval;

    options = global.raw_options;
    global.options = options;

    await correctOptions();

    jobs = jobs
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    jobs = global.jobs;
    queue_workers = jobs;

    io.sockets.write({
      type: "change_PRX",
      data: { nx: "START", ox: "STOP" },
    });

    io.sockets.write({
      type: "change_queue",
      data: jobs,
    });

    io.sockets.write({
      type: "change_start",
      data: Date.now(),
    });

    shouldWork = true;
  } else {
    shouldWork = false;

    io.sockets.write({ type: "clear_proxies" });

    for (let worker of current_workers) {
      worker.stopped = true;
      worker.process?.kill("SIGINT");
    }

    io.sockets.write({ type: "clear_workers" });

    io.sockets.write({
      type: "change_PRX",
      data: { nx: "STOP", ox: "START" },
    });
  }
}

require("./internal/application/webAppFiles.js");