module.exports = {
  // Identificação do projeto no SonarCloud
  'sonar.projectKey': 'gurasks_gamification',
  'sonar.organization': 'gurasks',

  // Metadados do projeto
  'sonar.projectName': 'Gamification',
  'sonar.projectVersion': '1.0.0',
  'sonar.projectDescription': 'Sistema gameficado de levantamento de requisitos',

  // Configurações de análise
  'sonar.host.url': 'https://sonarcloud.io',
  'sonar.sourceEncoding': 'UTF-8',

  // Diretórios de source code
  'sonar.sources': 'src',
  'sonar.tests': 'src',
  'sonar.test.inclusions': '**/*.test.tsx,**/*.test.ts,**/*.spec.tsx,**/*.spec.ts',

  // Exclusões para cobertura
  'sonar.coverage.exclusions': '**/*.test.tsx,**/*.test.ts,**/*.spec.tsx,**/*.spec.ts,**/types/**,**/setupTests.ts,**/vite-env.d.ts,**/main.tsx',

  // Cobertura de testes
  'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',

  // TypeScript
  'sonar.typescript.tsconfigPath': 'tsconfig.app.json',
  'sonar.typescript.exclusions': '**/node_modules/**,**/*.d.ts',

  // Quality Gate
  'sonar.qualitygate.wait': true
};