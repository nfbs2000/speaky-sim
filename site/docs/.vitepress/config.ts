import { defineConfig } from 'vitepress'

const repo = 'https://github.com/nfbs2000/speaky-sim'
const analyzedCommit = 'db47da58d'

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[char] ?? char
  })
}

export default defineConfig({
  base: '/speaky-sim/',
  lang: 'ko-KR',
  title: 'Sim Mothership Adapter Contract',
  description:
    'Code notes for request, stream, tool execution, and projection paths in nfbs2000/speaky-sim',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/speaky-sim/favicon.svg' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Sim Mothership Adapter Contract' }],
    [
      'meta',
      {
        property: 'og:description',
        content:
          'Code notes for request payloads, Stream v1 events, tool execution, persistence projection, and compatibility',
      },
    ],
  ],
  markdown: {
    config(md) {
      const defaultFence = md.renderer.rules.fence
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx]
        const info = token.info.trim().split(/\s+/)[0]
        if (info === 'mermaid') {
          return `<pre class="mermaid">${escapeHtml(token.content)}</pre>`
        }
        return defaultFence?.(tokens, idx, options, env, self) ?? ''
      }
    },
  },
  themeConfig: {
    siteTitle: 'Mothership Adapter',
    outline: {
      level: [2, 3],
      label: '이 페이지',
    },
    nav: [
      { text: '개요', link: '/' },
      { text: 'Adapter Map', link: '/mothership-contract/' },
      { text: 'GitHub', link: repo },
    ],
    sidebar: {
      '/mothership-contract/': [
        {
          text: 'Adapter Contract',
          items: [
            { text: 'Adapter Map', link: '/mothership-contract/' },
            { text: '1. Adapter Identity', link: '/mothership-contract/01-adapter-identity' },
            { text: '2. Request Payload', link: '/mothership-contract/02-request-payload' },
            { text: '3. Stream v1', link: '/mothership-contract/03-stream-v1' },
            { text: '4. Tool Execution Bridge', link: '/mothership-contract/04-tool-execution-bridge' },
            { text: '5. Persistence Projection', link: '/mothership-contract/05-persistence-projection' },
            { text: '6. Role / Permission Projection', link: '/mothership-contract/06-role-projection' },
            { text: '7. Completion Gaps', link: '/mothership-contract/07-completion-gaps' },
            { text: '8. Audit / Observability', link: '/mothership-contract/08-audit-observability' },
            { text: '9. Compatibility Matrix', link: '/mothership-contract/09-compatibility-matrix' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: repo }],
    footer: {
      message: 'Code reading notes for nfbs2000/speaky-sim.',
      copyright: `Source snapshot: ${analyzedCommit}`,
    },
    editLink: {
      pattern: `${repo}/edit/pages-src/site/docs/:path`,
      text: '이 문서 수정하기',
    },
    lastUpdated: {
      text: '마지막 업데이트',
      formatOptions: {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    },
  },
})
