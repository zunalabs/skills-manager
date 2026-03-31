import { Skill, Collection } from '../types'

interface CategoryDef {
  id: string
  name: string
  keywords: string[]
}

const CATEGORIES: CategoryDef[] = [
  {
    id: 'coding',
    name: 'Coding',
    keywords: [
      'code', 'coding', 'program', 'function', 'refactor', 'debug', 'typescript',
      'javascript', 'python', 'rust', 'go', 'java', 'csharp', 'c++', 'cpp',
      'react', 'vue', 'angular', 'node', 'api', 'library', 'package', 'module',
      'class', 'interface', 'algorithm', 'data structure', 'implement', 'build',
    ],
  },
  {
    id: 'git',
    name: 'Git & Version Control',
    keywords: [
      'git', 'commit', 'branch', 'merge', 'pull request', 'pr', 'repo', 'repository',
      'diff', 'rebase', 'stash', 'tag', 'release', 'changelog', 'version control',
      'github', 'gitlab', 'bitbucket',
    ],
  },
  {
    id: 'writing',
    name: 'Writing & Docs',
    keywords: [
      'write', 'writing', 'document', 'documentation', 'docs', 'readme', 'markdown',
      'blog', 'content', 'article', 'post', 'essay', 'report', 'summary', 'draft',
      'copywrite', 'copywriting', 'technical writing', 'specification', 'spec',
      'comment', 'annotate', 'explain',
    ],
  },
  {
    id: 'testing',
    name: 'Testing & QA',
    keywords: [
      'test', 'testing', 'spec', 'unit test', 'integration test', 'e2e', 'qa',
      'quality', 'assert', 'mock', 'stub', 'fixture', 'coverage', 'jest', 'vitest',
      'cypress', 'playwright', 'validate', 'verification',
    ],
  },
  {
    id: 'devops',
    name: 'DevOps & Infra',
    keywords: [
      'docker', 'kubernetes', 'k8s', 'deploy', 'deployment', 'ci', 'cd', 'pipeline',
      'terraform', 'ansible', 'helm', 'infra', 'infrastructure', 'cloud', 'aws',
      'gcp', 'azure', 'container', 'server', 'devops', 'nginx', 'linux', 'bash',
      'shell', 'script',
    ],
  },
  {
    id: 'data',
    name: 'Data & Analysis',
    keywords: [
      'data', 'database', 'sql', 'query', 'csv', 'json', 'xml', 'parse', 'transform',
      'etl', 'pipeline', 'analytics', 'analysis', 'chart', 'graph', 'visualiz',
      'pandas', 'numpy', 'table', 'schema', 'migration', 'postgres', 'mysql', 'mongo',
    ],
  },
  {
    id: 'web',
    name: 'Web & Frontend',
    keywords: [
      'html', 'css', 'frontend', 'ui', 'ux', 'design', 'component', 'layout',
      'responsive', 'tailwind', 'style', 'animation', 'accessibility', 'a11y',
      'seo', 'landing page', 'website', 'web app',
    ],
  },
  {
    id: 'security',
    name: 'Security',
    keywords: [
      'security', 'secure', 'auth', 'authentication', 'authorization', 'oauth',
      'jwt', 'token', 'encrypt', 'hash', 'vulnerability', 'pentest', 'audit',
      'permission', 'role', 'access control', 'sanitize', 'xss', 'injection',
    ],
  },
  {
    id: 'ai',
    name: 'AI & LLM',
    keywords: [
      'ai', 'llm', 'gpt', 'claude', 'openai', 'anthropic', 'prompt', 'embedding',
      'vector', 'rag', 'fine-tune', 'model', 'inference', 'agent', 'tool use',
      'machine learning', 'ml', 'neural', 'language model', 'chatbot',
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity',
    keywords: [
      'task', 'todo', 'note', 'calendar', 'email', 'slack', 'notification',
      'reminder', 'schedule', 'plan', 'organize', 'workflow', 'automate',
      'automation', 'productivity', 'manage', 'track', 'project management',
    ],
  },
  {
    id: 'files',
    name: 'Files & System',
    keywords: [
      'file', 'folder', 'directory', 'path', 'read', 'write', 'copy', 'move',
      'rename', 'search', 'find', 'filesystem', 'io', 'stream', 'zip', 'compress',
      'upload', 'download', 'storage',
    ],
  },
  {
    id: 'review',
    name: 'Code Review',
    keywords: [
      'review', 'code review', 'feedback', 'suggestion', 'improve', 'improvement',
      'best practice', 'lint', 'format', 'style guide', 'clean code', 'smell',
      'pattern', 'anti-pattern', 'optimize', 'performance',
    ],
  },
]

function skillText(skill: Skill): string {
  return [
    skill.name,
    skill.description,
    skill.domain,
    ...skill.tags,
    ...skill.keywords,
  ]
    .join(' ')
    .toLowerCase()
}

export function categorizeSkills(skills: Skill[]): Collection[] {
  return CATEGORIES
    .map((cat) => {
      const matched = skills.filter((skill) => {
        const text = skillText(skill)
        return cat.keywords.some((kw) => text.includes(kw.toLowerCase()))
      })
      return {
        id: cat.id,
        name: cat.name,
        skillIds: matched.map((s) => s.id),
      }
    })
    .filter((col) => col.skillIds.length > 0)
    .sort((a, b) => b.skillIds.length - a.skillIds.length)
}
