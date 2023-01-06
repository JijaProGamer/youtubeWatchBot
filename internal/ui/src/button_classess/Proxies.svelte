<script>
  export let good = [];
  export let bad = [];
  export let untested = [];

  export let container_type = "all";

  function changeContainerr_all() {
    container_type = "all";
  }

  function changeContainer_good() {
    container_type = "good";
  }

  function changeContainer_bad() {
    container_type = "bad";
  }
</script>

<div id="proxy_container">
  <h1 id="type_label">PROXIES</h1>
</div>
<div id="types_container">
  <button
    on:click={changeContainerr_all}
    id="button_all"
    class="type_button{(container_type == 'all' && ' selected_class_button') ||
      ''}">ALL</button
  >
  <button
    on:click={changeContainer_good}
    id="button_good"
    class="type_button{(container_type == 'good' && ' selected_class_button') ||
      ''}">GOOD</button
  >
  <button
    on:click={changeContainer_bad}
    id="button_bad"
    class="type_button{(container_type == 'bad' && ' selected_class_button') ||
      ''}">BAD</button
  >
</div>

<div id="elements_container">
  {#if container_type == "all"}
    {#each untested as proxy, index}
      <div class="element_container proxy_untested">
        <p class="element_num">Proxy #{index + 1}</p>
        <p class="proxy_text">{proxy.data}</p>
      </div>
    {/each}
    {#each good as proxy, index}
      <div class="element_container proxy_good">
        <p class="element_num">Proxy #{untested.length + index + 1}</p>
        <p class="proxy_text">{proxy.data}</p>
        <p class="proxy_time">speed: {proxy.latency}ms</p>
      </div>
    {/each}
    {#each bad as proxy, index}
      <div class="element_container proxy_bad">
        <p class="element_num">Proxy #{good.length + untested.length +index + 1}</p>
        <p class="proxy_text">{proxy.data}</p>
        <p class="proxy_err">{proxy.error.failure}</p>
      </div>
    {/each}
  {:else if container_type == "good"}
    {#each good as proxy, index}
      <div class="element_container proxy_good">
        <p class="element_num">Proxy #{index + 1}</p>
        <p class="proxy_text">{proxy.data}</p>
        <p class="proxy_time">speed: {proxy.latency}ms</p>
      </div>
    {/each}
  {:else if container_type == "bad"}
    {#each bad as proxy, index}
      <div class="element_container proxy_bad">
        <p class="element_num">Proxy #{index + 1}</p>
        <p class="proxy_text">{proxy.data}</p>
        <p class="proxy_err">{proxy.error.failure}</p>
      </div>
    {/each}
  {/if}
</div>
