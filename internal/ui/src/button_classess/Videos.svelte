<script>
  import axios from "axios";

  import MultiSelect from "./MultiSelect.svelte";
  import Slider from "@bulatdashiev/svelte-slider";

  export let raw_options = {};
  export let videos = raw_options.videos;

  function sendInputChange() {
    return new Promise((resolve, reject) => {
      axios.post(`/internal/set_videos`, videos).then(resolve).catch(reject);
    });
  }

  $: sendInputChange(videos);

  /*
              <h3 class="selector_text">Close server on finish: 
            <button on:click={change_on_finish} class="selector_button proxy_{raw_options.close_server_on_finish == true ? "good" : "bad"}">{raw_options.close_server_on_finish}
          </button></h3>
      
          <h3 class="selector_text">No visuals: 
            <button on:click={change_no_visuals} class="selector_button proxy_{raw_options.no_visuals == true ? "good" : "bad"}">{raw_options.no_visuals}
          </button></h3>
      
          <h3 class="selector_text">Concurrency: 
            <input bind:value={concurrency} class="selector_button">
          </h3>
          
          <p class="proxy_text">{proxy.data}</p>
    */

  // <p class="selector_explanation">When the program finishes, should it close itself?</p>
</script>

<div id="file_editor_container">
  <h1 id="type_label">VIDEOS</h1>
</div>

<div id="elements_container">
  <div class="simple_selectors_1">
    {#each videos as video, index}
      <div class="element_container">
        <p class="element_num">#{index + 1}</p>

        <h3 class="video_selector_text">
          Video URL/ID:
          <input bind:value={video.id} class="video_selector_button" />
        </h3>

        <h3 class="video_selector_text">
          Views with no account:
          <input
            type="number"
            bind:value={video.guest_views}
            class="video_selector_button"
          />
        </h3>

        <h3 class="video_selector_text">
          Watch styles:
          <MultiSelect bind:value={video.style}>
            <option value="search">SEARCH</option>
            <option value="direct">DIRECT</option>
            <option value="subscriptions">SUBSCRIPTIONS</option>
          </MultiSelect>
        </h3>

        <h3 class="selector_text">
          Is livestream:
          <button
            on:click={() => (video.is_live = !video.is_live)}
            class="selector_button proxy_{video.is_live ? 'good' : 'bad'}"
            >{video.is_live}
          </button>
        </h3>

        <h3 class="video_selector_text">
          Watchtime: {video.watchTime[0]}%-{video.watchTime[1]}%
          <Slider max="100" step="1" bind:value={video.watchTime} range order />
        </h3>

        <div class="simple_selectors_1">
          {#each video.accounts as account, index}
            <div class="element_container_small">
              <h3 class="video_selector_text">
                Email:
                <input bind:value={account.email} class="video_selector_button" />
              </h3>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
