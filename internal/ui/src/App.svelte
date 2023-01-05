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
  export let proxies = {};

  export let options = {};
  let socket;

  export let UI_TYPE = "proxies";
  import WORKERS_UI from "./button_classess/Workers.svelte";
  import PROXIES_UI from "./button_classess/Proxies.svelte";
  import CONSOLE_UI from "./button_classess/Console.svelte";
  import FILE_EDITOR_UI from "./button_classess/File_editor.svelte";

  function changeContainer_workers() {
    UI_TYPE = "workers";
  }

  function changeContainer_proxies() {
    UI_TYPE = "proxies";
  }

  function changeContainer_console() {
    UI_TYPE = "console";
  }

  function changeContainer_file_editor() {
    UI_TYPE = "file_editor";
  }

  (async () => {
    options = await doRequest("get_options");
    queue_workers = await doRequest("get_queue_workers");
    current_workers = await doRequest("get_current_workers");
    finished_workers = await doRequest("get_finished_workers");
    logs = await doRequest("get_logs");
    proxies = await doRequest("get_proxy_stats");

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
          break;
        case "remove_worker":
          current_workers = current_workers.filter(
            (v) => v.job.uuid !== data.data.job.uuid
          );
          finished_workers.push(data.data);
          break;
        case "add_testing_proxy":
          proxies.untested.push(data);
          proxies = proxies
          break;
        case "add_good_proxy":
          proxies.untested = proxies.untested.filter(
            (v) => v.data !== data.data
          );

          proxies.good.push(data);
          proxies = proxies
          break;
        case "add_bad_proxy":
          proxies.untested = proxies.untested.filter(
            (v) => v.data !== data.data
          );

          proxies.bad.push(data);
          proxies = proxies
          break;
        case "update_worker":
          let index = current_workers.findIndex(
            (v) => v.job.uuid == data.data.job.uuid
          );
          current_workers[index] = data.data;

          break;
        case "add_log":
          logs.push(data.data);
          logs = logs
          
          break;
      }
    });
  })();
</script>

<main>
  {#if UI_TYPE == "workers"}
    <div id="main_container">
      <WORKERS_UI {current_workers} {queue_workers} {finished_workers} />
    </div>
  {:else if UI_TYPE == "proxies"}
    <div id="main_container">
      <PROXIES_UI good={proxies.good} bad={proxies.bad} untested={proxies.untested} />
    </div>
  {:else if UI_TYPE == "console"}
    <div id="main_container">
      <CONSOLE_UI {logs} />
    </div>
  {:else if UI_TYPE == "file_editor"}
    <FILE_EDITOR_UI {current_workers} {queue_workers} {finished_workers} />
  {/if}

  <div id="buttons_container">
    <button
      on:click={changeContainer_workers}
      class="class_button{(UI_TYPE == 'workers' && ' selected_class_button') ||
        ''}"
      id="workers_button">WORKERS</button
    >
    <button
      on:click={changeContainer_proxies}
      class="class_button{(UI_TYPE == 'proxies' && ' selected_class_button') ||
        ''}"
      id="proxies_button">PROXIES</button
    >
    <button
      on:click={changeContainer_console}
      class="class_button{(UI_TYPE == 'console' && ' selected_class_button') ||
        ''}"
      id="console_button">CONSOLE</button
    >
    <button
      on:click={changeContainer_file_editor}
      class="class_button{(UI_TYPE == 'file_editor' &&
        ' selected_class_button') ||
        ''}"
      id="file_button">FILE EDITOR</button
    >

    <h2>VERSION {585}/{1036}</h2>
  </div>
</main>