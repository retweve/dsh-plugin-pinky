// 零依赖清单测试：只读仓库内文件，不做网络/系统调用。
// 运行：node --test "tests/*.test.mjs"（或 npm test）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const readJSON = (p) => JSON.parse(read(p));

test('package.json：必填字段与 MIT 许可', () => {
  const pkg = readJSON('package.json');
  assert.equal(pkg.name, 'dsh-plugin-pinky');
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  assert.equal(pkg.license, 'MIT');
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.dsh.bundle.patch, './cordis.patch.yml');
  assert.ok(pkg.files.includes('cordis.patch.yml'));
});

test('package.json.files 中的文件都真实存在', () => {
  const pkg = readJSON('package.json');
  const files = pkg.files.filter((f) => !f.includes('*'));
  for (const rel of files) {
    assert.ok(fs.existsSync(path.join(ROOT, rel)), `缺失文件：${rel}`);
  }
});

test('本地化文件结构一致', () => {
  const en = readJSON('locale/en.json');
  const zh = readJSON('locale/zh.json');
  for (const [lang, locale] of [['en', en], ['zh', zh]]) {
    assert.equal(typeof locale.meta?.title, 'string', `${lang}.meta.title`);
    assert.equal(typeof locale.meta?.description, 'string', `${lang}.meta.description`);
    assert.ok(locale.meta.title.length > 0 && locale.meta.description.length > 0, `${lang} 文案为空`);
  }
});

test('cordis.patch.yml：挂载官方 MCP 客户端的关键行', () => {
  const yml = read('cordis.patch.yml');
  for (const needle of [
    'insert:',
    'id: mcp-pinky',
    "name: '@deepseek-ai/dsh-mcp-client'",
    'serverName: pinky',
    'transport: stdio',
    'command:',
    'args:',
    'toolCallTimeoutMs: 120000',
    'failOnStartupError: false',
  ]) {
    assert.ok(yml.includes(needle), `cordis.patch.yml 缺少：${needle}`);
  }
});

test('README 的许可证说明与 LICENSE 一致', () => {
  const readme = read('README.md');
  assert.match(readme, /MIT/);
  assert.ok(fs.existsSync(path.join(ROOT, 'LICENSE')), '缺少 LICENSE 文件');
});
