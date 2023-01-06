<script>
    import axios from "axios";
     
    export let raw_options = {};
  
    function sendInputChange(newInput){
      return new Promise((resolve, reject) => {
        axios
          .post(`/internal/set_raw_options`, newInput)
          .then(resolve)
          .catch(reject);
      });
    }
  
    let internal_port = raw_options.server_port
    let browser_path = raw_options.browserPath
    let concurrency = raw_options.concurrency
    let concurrencyInterval = raw_options.concurrencyInterval
    let proxyTimeout = raw_options.proxyTimeout
  
    let proxies
    let raw_proxies = raw_options.proxies.join("\n")
  
    function publish_raw_proxies(){
      proxies = raw_proxies.split("\n")
      raw_options.proxies = proxies
  
      axios
          .post(`/internal/set_raw_options`, raw_options)
          .then(() => {})
          .catch(() => {});
    }
  
    $: publish_raw_proxies(raw_proxies)
  
    function change_internal_port() {
      raw_options.server_port = parseInt(internal_port) || 8525
      sendInputChange(raw_options)
    }
  
    function change_browser_path() {
      raw_options.browserPath = browser_path || ""
      sendInputChange(raw_options)
    }
  
    function change_concurrency() {
      raw_options.concurrency = parseInt(concurrency) || 0
      sendInputChange(raw_options)
    }
  
    function change_concurrencyInterval(){
      raw_options.concurrencyInterval = parseInt(concurrencyInterval) || 0
      sendInputChange(raw_options)
    }
  
    function change_proxyTimeout(){
      raw_options.proxyTimeout = parseInt(proxyTimeout) || 0
      sendInputChange(raw_options)
    }
  
    $: change_internal_port(internal_port)
    $: change_concurrency(concurrency)
    $: change_concurrencyInterval(concurrencyInterval)
    $: change_proxyTimeout(proxyTimeout)
    $: change_browser_path(browser_path)
  
    function change_on_finish() {
      raw_options.close_server_on_finish = !raw_options.close_server_on_finish
      sendInputChange(raw_options)
    }
  
    function change_headless() {
      raw_options.headless = !raw_options.headless
      sendInputChange(raw_options)
    }
  
    function change_no_visuals(){
      raw_options.no_visuals = !raw_options.no_visuals
      sendInputChange(raw_options)
    }
  
    function change_disable_proxy_tests(){
      raw_options.disable_proxy_tests = !raw_options.disable_proxy_tests
      sendInputChange(raw_options)
    }
  
    function change_proxy_tested_headless(){
      raw_options.proxy_tested_headless = !raw_options.proxy_tested_headless
      sendInputChange(raw_options)
    }
  </script>
  
  <div id="file_editor_container">
    <h1 id="type_label">FILE EDITOR</h1>
  </div>
  
  <div id="elements_container">
    <p class="selector_explanation" style="text-align: center;">NOTE: You need to restart this app for the settings to apply</p>
    <p class="selector_explanation" style="text-align: center;">You should read the wiki before changing any setting</p>
  
    <div id="simple_selectors_1">
      <h3 class="selector_text">Close server on finish: 
        <button on:click={change_on_finish} class="selector_button proxy_{raw_options.close_server_on_finish == true ? "good" : "bad"}">{raw_options.close_server_on_finish}
      </button></h3>
      <p class="selector_explanation">When the program finishes, should it close itself?</p>
  
      <h3 class="selector_text">Server port: 
        <input bind:value={internal_port} class="selector_button">
      </h3>
      <p class="selector_explanation">The port the internal server listens to</p>
  
      <h3 class="selector_text">Browser path: 
        <input bind:value={browser_path} class="selector_button">
      </h3>
      <p class="selector_explanation">The path of google chrome, the default one may not be always correct</p>
  
      <h3 class="selector_text">Headless: 
        <button on:click={change_headless} class="selector_button proxy_{raw_options.headless == true ? "good" : "bad"}">{raw_options.headless}
      </button></h3>
      <p class="selector_explanation">Should the browsers be invisible? (May reduce CPU Usage)</p>
  
      <h3 class="selector_text">No visuals: 
        <button on:click={change_no_visuals} class="selector_button proxy_{raw_options.no_visuals == true ? "good" : "bad"}">{raw_options.no_visuals}
      </button></h3>
      <p class="selector_explanation">Should the browsers not render the page? (Significantly reduces CPU usage)</p>
  
      <h3 class="selector_text">Concurrency: 
        <input bind:value={concurrency} class="selector_button">
      </h3>
      <p class="selector_explanation">How many browsers can exist at the same time</p>
  
      <h3 class="selector_text">Concurrency Interval: 
        <input bind:value={concurrencyInterval} class="selector_button">
      </h3>
      <p class="selector_explanation">How much to wait before launching the next browser?</p>
  
      <h3 class="selector_text">Proxy Timeout: 
        <input bind:value={proxyTimeout} class="selector_button">
      </h3>
      <p class="selector_explanation">How much to wait for an proxy before erroring?</p>
  
      <h3 class="selector_text">Disable proxy tests: 
        <button on:click={change_disable_proxy_tests} class="selector_button proxy_{raw_options.disable_proxy_tests == true ? "good" : "bad"}">{raw_options.disable_proxy_tests}
      </button></h3>
      <p class="selector_explanation">Act as all proxies are good (Bot may stop if they are not)</p>
  
      <h3 class="selector_text">Headless proxy tests: 
        <button on:click={change_proxy_tested_headless} class="selector_button proxy_{raw_options.proxy_tested_headless == true ? "good" : "bad"}">{raw_options.proxy_tested_headless}
      </button></h3>
      <p class="selector_explanation">Should the proxy test browsers be headless?</p>
    </div>
  
    <div id="advanced_selectors_2">
      <p class="selector_explanation" style="text-align: center;">Proxy list</p>
      <textarea bind:value={raw_proxies} class="many_button"></textarea>
    </div>
  </div>