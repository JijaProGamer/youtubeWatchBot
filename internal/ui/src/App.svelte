<script>
  import axios from "axios";
  import { io } from "socket.io-client";

  let doRequest = (question) => {
    return new Promise((resolve, reject) => {
      axios
        .get(`/internal/${question}`)
        .then((data) => resolve(data.data))
        .catch(reject);
    });
  };

  export let current_workers = [];
  export let finished_workers = [];
  export let queue_workers = [];
  export let logs = [];
  export let start_time = Date.now();
  export let proxies = {};

  export let currentVersion = 0;
  export let latestVersion = 0;

  export let O_NX = "START";
  export let NXT_DATA = "STOP";
  export let options = {};
  export let raw_options = {};
  let socket;

  export let UI_TYPE = "videos";
  import WORKERS_UI from "./button_classess/Workers.svelte";
  import PROXIES_UI from "./button_classess/Proxies.svelte";
  import CONSOLE_UI from "./button_classess/Console.svelte";
  import FILE_EDITOR_UI from "./button_classess/File_editor.svelte";
  import VIDEOS_UI from "./button_classess/Videos.svelte";

  function changeNXT_DATA() {
    if (NXT_DATA !== "WAIT") {
      NXT_DATA = NXT_DATA == "STOP" ? "START" : "STOP";
      O_NX = NXT_DATA == "STOP" ? "START" : "STOP";

      axios.post(`/internal/set_NXT_DATA`, { data: NXT_DATA });
    }
  }

  (async () => {
    options = await doRequest("get_options");
    raw_options = await doRequest("get_raw_options");
    NXT_DATA = await doRequest("NXT_DATA");
    O_NX = NXT_DATA == "STOP" ? "START" : "STOP";

    queue_workers = await doRequest("get_queue_workers");
    current_workers = await doRequest("get_current_workers");
    finished_workers = await doRequest("get_finished_workers");
    logs = await doRequest("get_logs");
    proxies = await doRequest("get_proxy_stats");
    currentVersion = await doRequest("get_version");
    latestVersion = await doRequest("get_latest_version");

    socket = io(`ws://localhost:${options.server_port}`, {
      transports: ["websocket"],
      upgrade: false,
    });

    socket.on("message", (data) => {
      switch (data.type) {
        case "new_options":
          options = data.data;
          break;
        case "change_queue":
          queue_workers = data.data;
          break;
        case "add_worker":
          queue_workers = queue_workers.filter(
            (v) => v.uuid !== data.data.job.uuid
          );

          current_workers.push(data.data);
          current_workers = current_workers;
          break;
        case "remove_worker":
          current_workers = current_workers.filter(
            (v) => v.job.uuid !== data.data.job.uuid
          );

          finished_workers.push(data.data);
          finished_workers = finished_workers;
          break;
        case "add_testing_proxy":
          proxies.untested.push(data);
          proxies = proxies;
          break;
        case "add_good_proxy":
          proxies.untested = proxies.untested.filter(
            (v) => v.data !== data.data
          );

          proxies.good.push(data);
          proxies = proxies;
          break;
        case "add_bad_proxy":
          proxies.untested = proxies.untested.filter(
            (v) => v.data !== data.data
          );

          proxies.bad.push(data);
          proxies = proxies;
          break;
        case "clear_proxies":
          proxies = { untested: [], good: [], bad: [] };
          break
        case "change_start":
          start_time = data.data;
          break
        case "change_PRX":
          NXT_DATA = data.data.nx;
          O_NX = data.data.ox;
          break
        case "clear_workers":
          current_workers = [];
          finished_workers = [];
          queue_workers = [];
          break
        case "update_worker":
          let index = current_workers.findIndex(
            (v) => v.job.uuid == data.data.job.uuid
          );
          current_workers[index] = data.data;

          break;
        case "add_log":
          logs.push(data.data);
          logs = logs;

          break;
      }
    });
  })();
</script>

<main>
  <div id="main_container">
    {#if UI_TYPE == "workers"}
      <WORKERS_UI
        {current_workers}
        {queue_workers}
        {finished_workers}
        {start_time}
      />
    {:else if UI_TYPE == "proxies"}
      <PROXIES_UI
        good={proxies.good}
        bad={proxies.bad}
        untested={proxies.untested}
      />
    {:else if UI_TYPE == "console"}
      <CONSOLE_UI {logs} />
    {:else if UI_TYPE == "file_editor"}
      <FILE_EDITOR_UI {raw_options} />
    {:else if UI_TYPE == "videos"}
      <VIDEOS_UI videos={raw_options.videos} />
    {/if}
  </div>

  <div id="buttons_container">
    <button
      on:click={() => (UI_TYPE = "workers")}
      class="class_button{UI_TYPE == 'workers' ? ' selected_class_button' : ''}"
      id="workers_button">WORKERS</button
    >

    <button
      on:click={() => (UI_TYPE = "proxies")}
      class="class_button{UI_TYPE == 'proxies' ? ' selected_class_button' : ''}"
      id="proxies_button">PROXIES</button
    >

    <button
      on:click={() => (UI_TYPE = "console")}
      class="class_button {UI_TYPE == 'console' ? 'selected_class_button' : ''}"
      id="console_button">CONSOLE</button
    >

    <button
      on:click={() => (UI_TYPE = "file_editor")}
      class="class_button {UI_TYPE == 'file_editor'
        ? 'selected_class_button'
        : ''}"
      id="file_button">PROGRAM SETTINGS</button
    >

    <button
      on:click={() => (UI_TYPE = "videos")}
      class="class_button {UI_TYPE == 'videos' ? 'selected_class_button' : ''}"
      id="videos_button">VIDEOS</button
    >

    <h2
      class="h2_vs version_{latestVersion == currentVersion ? 'latest' : 'old'}"
    >
      VERSION {currentVersion}/{latestVersion}
    </h2>

    <button
      on:click={changeNXT_DATA}
      class="nxt_button state_{NXT_DATA}"
      id="nxt_button">{O_NX}</button
    >
  </div>
</main>
