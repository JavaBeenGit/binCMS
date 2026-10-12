/* ESLint 8 (package.json 의 `npm run lint`: eslint . --ext ts,tsx --max-warnings 0).
 * 규칙은 Vite React-TS 템플릿 기본 + 이 코드베이스에서 실제로 지켜지는 수준. 경고 0 이 CI 조건이라
 * 미준수 규칙은 off 로 명시하고 사유를 적는다(5단계, 2026-10-12). */
module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', '.eslintrc.cjs', 'vite.config.ts'],
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    // antd 콜백·axios 응답에 any 가 남아 있다(수기 타입). OpenAPI 자동 생성(목표)까지 경고로 두면 CI 가 깨지므로 off.
    '@typescript-eslint/no-explicit-any': 'off',
    // `const { boardCode, ...updateData } = values` 처럼 필드를 빼내려는 구조분해는 허용
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
  },
};
