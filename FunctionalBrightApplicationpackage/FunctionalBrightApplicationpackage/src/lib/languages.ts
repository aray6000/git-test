export interface Language {
  id: string;
  name: string;
  aliases?: string[];
}

export const languages: Language[] = [
  { id: 'text', name: 'Plain Text' },
  { id: 'typescript', name: 'TypeScript', aliases: ['ts'] },
  { id: 'javascript', name: 'JavaScript', aliases: ['js'] },
  { id: 'jsx', name: 'JSX' },
  { id: 'tsx', name: 'TSX' },
  { id: 'css', name: 'CSS' },
  { id: 'scss', name: 'SCSS' },
  { id: 'html', name: 'HTML' },
  { id: 'json', name: 'JSON' },
  { id: 'yaml', name: 'YAML', aliases: ['yml'] },
  { id: 'markdown', name: 'Markdown', aliases: ['md'] },
  { id: 'python', name: 'Python', aliases: ['py'] },
  { id: 'ruby', name: 'Ruby', aliases: ['rb'] },
  { id: 'java', name: 'Java' },
  { id: 'c', name: 'C' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#', aliases: ['cs'] },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust', aliases: ['rs'] },
  { id: 'php', name: 'PHP' },
  { id: 'swift', name: 'Swift' },
  { id: 'kotlin', name: 'Kotlin', aliases: ['kt'] },
  { id: 'sql', name: 'SQL' },
  { id: 'shell', name: 'Shell', aliases: ['bash', 'sh'] },
  { id: 'powershell', name: 'PowerShell', aliases: ['ps1'] },
  { id: 'xml', name: 'XML' },
  { id: 'graphql', name: 'GraphQL' },
  { id: 'dockerfile', name: 'Dockerfile' },
  { id: 'docker-compose', name: 'Docker Compose' },
  { id: 'nginx', name: 'Nginx' },
  { id: 'toml', name: 'TOML' },
  { id: 'ini', name: 'INI' },
];

export function getLanguageName(langId: string): string {
  const language = languages.find(l => l.id === langId);
  return language ? language.name : langId;
}
