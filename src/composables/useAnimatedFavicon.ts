import { onMounted, onUnmounted } from 'vue'

export function useAnimatedFavicon() {
  const frames: string[] = [
    '/icons/full.png',
    '/icons/blink.png',
  ]

  let interval: ReturnType<typeof setInterval> | undefined
  let index = 0

  const setFavicon = (url: string): void => {
    document
      .querySelectorAll('link[rel="icon"]')
      .forEach((link) => link.remove())

    const link = document.createElement('link')

    link.rel = 'icon'
    link.type = 'image/png'

    link.href = `${url}?v=${index}`

    document.head.appendChild(link)
  }

  onMounted(() => {
    setFavicon(frames[0])

    interval = setInterval(() => {
      index = (index + 1) % frames.length
      setFavicon(frames[index])
    }, 1000)
  })

  onUnmounted(() => {
    if (interval) {
      clearInterval(interval)
    }
  })
}