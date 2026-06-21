import DefaultTheme from 'vitepress/theme'
import mermaid from 'mermaid'
import { nextTick } from 'vue'
import './style.css'

let renderCount = 0

async function renderMermaidBlocks(): Promise<void> {
  await nextTick()

  const blocks = Array.from(
    document.querySelectorAll<HTMLElement>('pre.mermaid:not([data-mermaid-rendered])')
  )

  for (const block of blocks) {
    const source = block.textContent ?? ''
    const id = `mothership-mermaid-${Date.now()}-${renderCount++}`
    try {
      const { svg } = await mermaid.render(id, source)
      block.innerHTML = svg
      block.dataset.mermaidRendered = 'true'
      block.classList.add('mermaid-rendered')
    } catch (error) {
      block.dataset.mermaidRendered = 'error'
      block.classList.add('mermaid-error')
      console.error('Failed to render Mermaid diagram', error)
    }
  }
}

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'neutral',
      flowchart: {
        htmlLabels: false,
        curve: 'basis',
      },
      sequence: {
        mirrorActors: false,
      },
    })

    const render = () => {
      void renderMermaidBlocks()
    }

    router.onAfterRouteChanged = render

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render, { once: true })
    } else {
      render()
    }
  },
}
