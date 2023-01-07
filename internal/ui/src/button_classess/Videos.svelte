<script>
  import axios from "axios";

  import MultiSelect from "./MultiSelect.svelte";
  import Slider from "@bulatdashiev/svelte-slider";

  export let videos = [];
  let first = false;

  function sendInputChange() {
    if (first) {
      axios.post(`/internal/set_videos`, videos);
    }

    first = true;
  }

  function deleteVideo(video) {
    videos = videos.filter((_, index) => index !== video);
  }

  function deleteAccount(video, account){
    video.accounts = video.accounts.filter((_, index) => index !== account)
    videos = videos
  }

  $: sendInputChange(videos);
</script>

<div id="file_editor_container">
  <h1 id="type_label">VIDEOS</h1>
</div>

<div id="elements_container">
  <button
    class="new_button"
    on:click={() => {
      videos.unshift({
        id: "video id",
        guest_views: 10,
        is_live: false,
        watchTime: [0, 100],
        style: ["search", "direct"],
        accounts: [],
      });

      videos = videos;
    }}>ADD VIDEO</button
  >

  <div class="simple_selectors_1">
    {#each videos as video, index}
      <div class="element_container">
        <button
          on:click={() => deleteVideo(index)}
          class="element_num delete_button">#{index + 1}</button
        >

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

        <div class="advanced_selectors_2">
          <p class="selector_explanation" style="text-align: center;">
            Accounts
          </p>

          <button
            class="new_button"
            on:click={() => {
              video.accounts.unshift({
                email: "your@email.com",
                password: "your password",
                cookies: "optional",
                comment: "",
                dislike: false,
                like: false,
                likeAfter: [0, 0],
                watchTime: [0, 0],
                dislikeAfter: [0, 0],
                commentAfter: [0, 0],
              });

              video.accounts = video.accounts;
            }}>ADD ACCOUNT</button
          >

          {#each video.accounts as account, index}
            <div class="element_container_small">
              <button
                on:click={() => deleteAccount(video, index)}
                class="element_num delete_button_acc">#{index + 1}</button
              >

              <h3 class="video_selector_text">
                Email (Or cookies):
                <input
                  bind:value={account.email}
                  class="video_selector_button"
                />
              </h3>

              <h3 class="video_selector_text">
                Password (Or cookies):
                <input
                  bind:value={account.password}
                  class="video_selector_button"
                />
              </h3>

              <h3 class="video_selector_text">
                Cookies (Or email/password):
                <input
                  bind:value={account.cookies}
                  class="video_selector_button"
                />
              </h3>

              <h3 class="video_selector_text">
                Comment (leave blank if no comment):
                <input
                  bind:value={account.comment}
                  class="video_selector_button"
                />
              </h3>

              <h3 class="selector_text">
                Like:
                <button
                  on:click={() => (account.like = !account.like)}
                  class="selector_button proxy_{account.like ? 'good' : 'bad'}"
                  >{account.like}
                </button>
              </h3>

              <h3 class="selector_text">
                Dislike:
                <button
                  on:click={() => (account.dislike = !account.dislike)}
                  class="selector_button proxy_{account.dislike
                    ? 'good'
                    : 'bad'}"
                  >{account.dislike}
                </button>
              </h3>

              {#if account.like}
                <h3 class="video_selector_text">
                  Like at moment: {account.likeAfter[0]}%-{account
                    .likeAfter[1]}%
                  <Slider
                    max={video.watchTime[1]}
                    min={video.watchTime[0]}
                    step="1"
                    bind:value={account.likeAfter}
                    range
                    order
                  />
                </h3>
              {/if}

              {#if account.dislike}
                <h3 class="video_selector_text">
                  Dislike at moment: {account.dislikeAfter[0]}%-{account
                    .dislikeAfter[1]}%
                  <Slider
                    max={video.watchTime[1]}
                    min={video.watchTime[0]}
                    step="1"
                    bind:value={account.dislikeAfter}
                    range
                    order
                  />
                </h3>
              {/if}

              {#if account.comment.length > 0}
                <h3 class="video_selector_text">
                  Comment at moment: {account.commentAfter[0]}%-{account
                    .commentAfter[1]}%
                  <Slider
                    max={video.watchTime[1]}
                    min={video.watchTime[0]}
                    step="1"
                    bind:value={account.commentAfter}
                    range
                    order
                  />
                </h3>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>
