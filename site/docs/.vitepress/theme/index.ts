import DefaultTheme from 'vitepress/theme'
import mermaid from 'mermaid'
import { nextTick } from 'vue'
import './style.css'

let renderCount = 0
let currentColorMode: 'dark' | 'light' | undefined

function getColorMode(): 'dark' | 'light' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

function getMermaidThemeVariables(mode: 'dark' | 'light'): Record<string, string> {
  if (mode === 'dark') {
    return {
      background: '#151922',
      mainBkg: '#202838',
      secondBkg: '#172334',
      tertiaryColor: '#2b2435',
      primaryColor: '#202838',
      primaryBorderColor: '#67e8f9',
      primaryTextColor: '#f8fafc',
      secondaryColor: '#243145',
      secondaryBorderColor: '#fbbf24',
      secondaryTextColor: '#f8fafc',
      tertiaryTextColor: '#f8fafc',
      lineColor: '#e2e8f0',
      textColor: '#f8fafc',
      edgeLabelBackground: '#151922',
      actorBkg: '#202838',
      actorBorder: '#67e8f9',
      actorTextColor: '#f8fafc',
      actorLineColor: '#e2e8f0',
      signalColor: '#e2e8f0',
      signalTextColor: '#f8fafc',
      labelBoxBkgColor: '#151922',
      labelBoxBorderColor: '#67e8f9',
      labelTextColor: '#f8fafc',
      noteBkgColor: '#312e1f',
      noteBorderColor: '#fbbf24',
      noteTextColor: '#f8fafc',
      activationBkgColor: '#334155',
      activationBorderColor: '#67e8f9',
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: '15px',
    }
  }

  return {
    background: '#f8fafc',
    mainBkg: '#ffffff',
    secondBkg: '#eef6f8',
    tertiaryColor: '#fff7ed',
    primaryColor: '#ffffff',
    primaryBorderColor: '#176b87',
    primaryTextColor: '#111827',
    secondaryColor: '#eef6f8',
    secondaryBorderColor: '#b45309',
    secondaryTextColor: '#111827',
    tertiaryTextColor: '#111827',
    lineColor: '#334155',
    textColor: '#111827',
    edgeLabelBackground: '#f8fafc',
    actorBkg: '#ffffff',
    actorBorder: '#176b87',
    actorTextColor: '#111827',
    actorLineColor: '#334155',
    signalColor: '#334155',
    signalTextColor: '#111827',
    labelBoxBkgColor: '#f8fafc',
    labelBoxBorderColor: '#176b87',
    labelTextColor: '#111827',
    noteBkgColor: '#fff7ed',
    noteBorderColor: '#b45309',
    noteTextColor: '#111827',
    activationBkgColor: '#e0f2fe',
    activationBorderColor: '#176b87',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontSize: '15px',
  }
}

function configureMermaid(mode = getColorMode()): void {
  currentColorMode = mode
  mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    theme: 'base',
    themeVariables: getMermaidThemeVariables(mode),
    flowchart: {
      htmlLabels: false,
      curve: 'basis',
      nodeSpacing: 54,
      rankSpacing: 68,
    },
    sequence: {
      mirrorActors: false,
      actorMargin: 70,
      boxMargin: 12,
      messageMargin: 48,
      noteMargin: 12,
    },
  })
}

async function renderMermaidBlocks({ force = false }: { force?: boolean } = {}): Promise<void> {
  await nextTick()

  const mode = getColorMode()
  if (currentColorMode !== mode) configureMermaid(mode)

  const selector = force ? 'pre.mermaid' : 'pre.mermaid:not([data-mermaid-rendered])'
  const blocks = Array.from(document.querySelectorAll<HTMLElement>(selector))

  for (const block of blocks) {
    const source = block.dataset.mermaidSource ?? block.textContent ?? ''
    block.dataset.mermaidSource = source
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

function scheduleMermaidRender(options: { force?: boolean } = {}): void {
  requestAnimationFrame(() => {
    void renderMermaidBlocks(options)
  })
  window.setTimeout(() => {
    void renderMermaidBlocks(options)
  }, 120)
  window.setTimeout(() => {
    void renderMermaidBlocks(options)
  }, 500)
}

export default {
  extends: DefaultTheme,
  enhanceApp({ router }) {
    if (typeof window === 'undefined') return

    configureMermaid()

    const render = () => {
      scheduleMermaidRender()
    }

    router.onAfterRouteChanged = render

    new MutationObserver(() => {
      const mode = getColorMode()
      if (mode !== currentColorMode) {
        configureMermaid(mode)
        scheduleMermaidRender({ force: true })
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', render, { once: true })
    } else {
      render()
    }
  },
}
