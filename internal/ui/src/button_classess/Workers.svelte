<script>
  export let current_workers;
  export let finished_workers;
  export let queue_workers;
  export let container_type = "current";

  function changeContainer_current() {
    container_type = "current";
  }
  function changeContainer_finished() {
    container_type = "finished";
  }
  function changeContainer_queue() {
    container_type = "queue";
  }
</script>

<div id="workers_container">
  <h1 id="type_label">WORKERS</h1>
</div>
<div id="types_container">
  <button
    on:click={changeContainer_current}
    id="button_current"
    class="type_button{(container_type == 'current' &&
      ' selected_class_button') ||
      ''}">CURRENT</button
  >
  <button
    on:click={changeContainer_finished}
    id="button_finished"
    class="type_button{(container_type == 'finished' &&
      ' selected_class_button') ||
      ''}">FINISHED</button
  >
  <button
    on:click={changeContainer_queue}
    id="button_queue"
    class="type_button{(container_type == 'queue' &&
      ' selected_class_button') ||
      ''}">QUEUE</button
  >
</div>

<div id="elements_container">
  {#if container_type == "current"}
    {#each current_workers as worker, index}
      <div class="element_container">
        <p class="element_id">#{index + 1}</p>
        <br />
        <div class="element_sort1">
          <p class="element_num">
            WORKER #{worker.totalWorked}/{current_workers.length +
              finished_workers.length +
              queue_workers.length}
          </p>
          <p class="element_duration">
            DURATION: {worker.job.watchTime.toFixed(1)} sec
          </p>
        </div>

        <div class="element_sort2">
          <p class="element_bandwidth">
            BANDWIDTH: {(worker.bandwith / 1e6).toFixed(1)} mb
          </p>
          <p class="element_watchtime">
            WATCH TIME: {worker.current_time.toFixed(1)} sec
          </p>
        </div>
      </div>
    {/each}
  {:else if container_type == "finished"}
    {#each finished_workers as worker, index}
      <div class="element_container proxy_{worker.errors.length > 0 && "bad" || "good"}">
        <p class="element_id">#{index + 1}</p>
        <br />
        <div class="element_sort1">
          <p class="element_num">
            WORKER #{worker.totalWorked}/{current_workers.length +
              finished_workers.length +
              queue_workers.length}
          </p>
          <p class="element_duration">
            DURATION: {worker.job.watchTime.toFixed(1)} sec
          </p>
        </div>

        <div class="element_sort2">
          <p class="element_bandwidth">
            BANDWIDTH: {(worker.bandwith / 1e6).toFixed(1)} mb
          </p>
        </div>
      </div>
    {/each}
  {:else if container_type == "queue"}
    {#each queue_workers as worker, index}
      <div class="element_container">
        <p class="element_id">#{index + 1}</p>
        <br />
        <div class="element_sort1">
          <p class="element_num">
            WORKER #{index + 1}/{current_workers.length +
              finished_workers.length +
              queue_workers.length}
          </p>
          <p class="element_duration">
            DURATION: {worker.watchTime.toFixed(1)} sec
          </p>
        </div>

        <div class="element_sort2">

        </div>
      </div>
    {/each}
  {/if}
</div>
