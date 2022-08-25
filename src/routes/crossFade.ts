import { quintOut } from 'svelte/easing'
import { crossfade } from 'svelte/transition'

const [send, receive] = crossfade({
  fallback(node, params) {
    const style = getComputedStyle(node)

    return {
      easing: quintOut,
      css: t => `transform: ${style.transform === 'none' ? '' : style.transform} scaleY(${t})`
    }
  }
})

export { send, receive }