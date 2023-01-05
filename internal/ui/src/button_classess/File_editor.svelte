<script>
    export let raw_options;
    export let container_type = "all";
  
    function changeContainerr_all() {
      container_type = "all";
    }
  
    function changeContainerr_errors() {
      container_type = "errors";
    }
  </script>
  
  <div id="console_container">
    <h1 id="type_label">CONSOLE</h1>
  </div>
  <div id="types_container">
    <button
      on:click={changeContainerr_all}
      id="button_all"
      class="type_button{(container_type == 'all' && ' selected_class_button') ||
        ''}">ALL</button
    >
    <button
      on:click={changeContainerr_errors}
      id="button_errors"
      class="type_button{(container_type == 'errors' &&
        ' selected_class_button') ||
        ''}">ERRORS</button
    >
  </div>
  
  <div id="elements_container">
    {#if container_type == "all"}
      {#each logs as log, index}
        <div class="element_container">
          <p class="log_date log_{log.type}">{convert_date(log.sent)}</p>
          <p class="log_text log_{log.type}">{log.message}</p>
        </div>
      {/each}
    {:else if container_type == "errors"}
      {#each logs as log, index}
        {#if log.type == "error"}
          <div class="element_container">
            <p class="log_date log_error">{convert_date(log.sent)}</p>
            <p class="log_text log_error">{log.message}</p>
          </div>
        {/if}
      {/each}
    {/if}
  </div>
  