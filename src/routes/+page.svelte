<svelte:head>
  <title>Giełda Wierzytelności</title>
  <meta name="description" content="Recruitment task" />
</svelte:head>

<script lang="ts">
  import { onMount } from 'svelte'
  import { flip } from 'svelte/animate'
  import { send, receive } from './crossFade.js'

  const baseUrl = `http://rekrutacja-webhosting.it.krd.pl/api/Recruitment`

  let labels: string[] = []
  let items: any[] = []
  let filteredItems: any[] = []

  let searchTerm: string = ''
  let activeLabel: string = 'Name'
  let sortDirection: number = 1
  
  let loading: boolean = false
  let error: string = ''

  let sortItems = (sortBy: string) => {
    activeLabel = sortBy
    sortDirection = -1 * sortDirection
    if (sortDirection == 1) filteredItems = filteredItems.sort((a, b) => (a[sortBy] > b[sortBy] ? 1 : -1))
    if (sortDirection == -1) filteredItems = filteredItems.sort((a, b) => (a[sortBy] < b[sortBy] ? 1 : -1))
  }

  let filterList = async () => {
    try {
      if (!searchTerm) {
        filteredItems = items
        return
      }
      
      loading = true
      let response = await fetch(`${baseUrl}/GetFilteredDebts`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-type': 'application/json' },
        body: `"${searchTerm}"`
      })
      filteredItems = await response.json()
      searchTerm = ''
      loading = false
    } catch(error: any) {
      error = "Nie można pobrać danych z serwera"
    }
  }

  let fetchData = async () => {
    try {
      loading = true
      let response = await fetch(`${baseUrl}/GetTopDebts`)
      let entities = await response.json()
      entities.forEach((entity: any) => {
        let {Name, NIP, Value, Date} = entity
        let newItem = ({Name, NIP, Value, Date})
        labels = Object.keys(newItem)
        items = [newItem, ...items]
        filteredItems = items
      })
      loading = false
    } catch(error: any) {
      error = "Nie można pobrać danych z serwera"
    }
  }

  onMount(() => fetchData())
</script>

<main>
  <section class="search">
    <form class="rim" on:submit|preventDefault={() => filterList()}>
      <label for="searchInput"><div>Podaj NIP lub nazwę dłużnika</div></label>
      <input id="searchInput" type="text" bind:value={searchTerm}>
      <button>Szukaj</button>
    </form>
  </section>

  <section class="filter rim">
    {#if error}
      <div class="error">{error}</div>
    {/if}

    <div class="labels">
      {#each labels as label}
        <div class={label === activeLabel ? 'label active' : 'label'} on:click={() => sortItems(label)}>
          {#if label === ''} -
          {:else if label === 'Name'} Dłużnik
          {:else if label === 'NIP'} NIP
          {:else if label === 'Value'} Kwota zadłużenia
          {:else if label === 'Date'} Data powstania zobowiązania
          {:else} {label}
          {/if}

          {#if sortDirection === 1} ▲
          {:else} ▼
          {/if}
        </div>
      {/each}
    </div>

    {#if loading}
      <div class="spinner"><span></span></div>
    {:else}
      {#each filteredItems as item (item)}
        <ul class="items" in:receive="{{key: item.Id}}" out:send="{{key: item.Id}}" animate:flip={{ duration: 400 }}>
          <li class="item">{item.Name}</li>
          <li class="item">{item.NIP}</li>
          <li class="item">{item.Value}</li>
          <li class="item">{new Date(item.Date).toLocaleDateString()}</li>
        </ul>
      {/each}
    {/if}
  </section>
</main>

<style lang="less">
  .search {
    background: var(--color-darkblue);
    color: var(--color-white);
    label {
      text-transform: uppercase;
      margin-bottom: var(--font-size-1);
    }
    input, button {
      padding: calc(var(--font-size-1)/2);
      margin: calc(var(--font-size-1)/2) 0;
      outline: none;
    }
    button {
      padding-left: 5rem;
      padding-right: 5rem;
      background: var(--color-red);
      color: var(--color-white);
      transform: translateX(-0.5rem);
      text-transform: uppercase;
    }
  }
  .filter {
    padding-top: 0;
    .labels, .items {
      display: grid;
      padding: calc(var(--font-size-1)/2) 0;

      @media (min-width: 640px) {
        grid-template-columns: 2fr 1fr;
      }
      @media (min-width: 960px) {
        grid-template-columns: 2fr 1fr 1fr 1fr;
        text-align: right;
        .item:first-of-type, .label:first-of-type {
          text-align: left;
        }
      }
    }
    .labels {
      color: var(--color-lightgray);
      text-transform: uppercase;
      align-items: end;
      cursor: pointer;
      .label.active {
        color: var(--color-black);
        transition: .4s;
      }
    }
    .items {
      border-top: 1px solid var(--color-lightgray);
      color: var(--color-darkblue);
      font-size: calc(var(--font-size-1) * 0.75);
      font-weight: var(--font-regular);
    }
    .spinner {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      span {
        width: 10rem;
        height: 10rem;
        border: 5px solid var(--color-darkblue);
        border-top: 5px solid transparent;
        border-radius: 100vw;
        display: inline-flex;
        animation: spin 1s ease-in-out infinite
      }
    }
    .error {
      font-size: var(--font-size-1);
      padding-top: var(--font-size-1);
      color: var(--color-red);
    }
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>