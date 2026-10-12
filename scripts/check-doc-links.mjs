#!/usr/bin/env node
// 문서 상대 링크 검사. 사용: node scripts/check-doc-links.mjs [루트=현재 디렉터리]
// 깨진 링크가 있으면 "파일:줄  링크" 목록을 출력하고 exit 1.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';

const root = resolve(process.argv[2] ?? '.');
const SKIP_DIRS = new Set(['node_modules', '.git', 'build', 'dist', '.gradle', '.claude', '.superpowers']);
// 구현 계획서는 미래 파일의 본문을 그대로 인용하므로(상대 링크가 그 파일 위치 기준) 검사 대상에서 뺀다.
const SKIP_PATHS = ['docs/superpowers/plans'];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    if (SKIP_PATHS.includes(relative(root, p).replace(/\/g, '/'))) continue;
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (name.endsWith('.md')) yield p;
  }
}

const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
let files = 0, links = 0;
const broken = [];

for (const file of walk(root)) {
  files++;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const m of line.matchAll(LINK_RE)) {
      let target = m[1];
      if (/^(https?:|mailto:|#)/.test(target)) continue;
      links++;
      target = target.split('#')[0];
      if (target === '') continue;
      const abs = resolve(dirname(file), decodeURI(target));
      if (!existsSync(abs)) broken.push(`${relative(root, file)}:${i + 1}  ${m[1]}`);
    }
  });
}

if (broken.length) {
  console.error(`BROKEN (${broken.length}):\n` + broken.join('\n'));
  process.exit(1);
}
console.log(`OK (${links} links in ${files} files)`);
