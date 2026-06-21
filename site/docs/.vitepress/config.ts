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
    'nfbs2000/speaky-sim fork에서 공개 소스로 확인 가능한 Mothership adapter contract 분석',
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
          '공개 Sim-side adapter 코드로 읽는 request, stream, tool bridge, persistence contract',
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
    siteTitle: 'Mothership Contract',
    outline: {
      level: [2, 3],
      label: '이 페이지',
    },
    nav: [
      { text: '개요', link: '/' },
      { text: '계약 문서', link: '/mothership-contract/' },
      { text: '업스트림 동기화', link: '/mothership-contract/09-upstream-sync' },
      { text: 'GitHub', link: repo },
    ],
    sidebar: {
      '/mothership-contract/': [
        {
          text: 'Mothership Contract',
          items: [
            { text: '전체 개요', link: '/mothership-contract/' },
            { text: '1. 공개 범위와 경계', link: '/mothership-contract/01-scope-and-boundary' },
            { text: '2. 코드 지도', link: '/mothership-contract/02-source-map' },
            { text: '3. 요청 계약', link: '/mothership-contract/03-request-contract' },
            { text: '4. Stream v1 계약', link: '/mothership-contract/04-stream-v1-contract' },
            { text: '5. Tool Bridge', link: '/mothership-contract/05-tool-execution-bridge' },
            { text: '6. 저장과 재생', link: '/mothership-contract/06-persistence-and-replay' },
            { text: '7. Workflow Block 계약', link: '/mothership-contract/07-workflow-block-contract' },
            { text: '8. 테스트 매트릭스', link: '/mothership-contract/08-test-matrix' },
            { text: '9. Upstream Sync', link: '/mothership-contract/09-upstream-sync' },
          ],
        },
      ],
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: repo }],
    footer: {
      message:
        'Independent public-source notes for nfbs2000/speaky-sim. Not an official SimStudio document.',
      copyright: `Analyzed source snapshot: ${analyzedCommit}`,
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
