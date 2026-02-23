<p align="center">
  <a href="./README.md">🇺🇸 English</a> | 🇧🇷 Português
</p>

# 🎯 Gamification - Sistema Gamificado de Levantamento de Requisitos (SGLR)

Uma plataforma colaborativa com elementos de gamificação para tornar as sessões de levantamento de requisitos mais engajantes e produtivas.
---

### 🛠️ Tecnologias e Integrações

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.5.0-FFCA28?logo=firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-06B6D4?logo=tailwindcss&logoColor=white)

---

## ✨ Características Principais

### 🎮 Gamificação

- **Sistema de Pontuação**: Os participantes ganham pontos por comentários, sugestões e respostas
- **Tabela de Classificação**: Ranking em tempo real com métricas de engajamento
- **Medalhas e Reconhecimento**: Premiação para os top contribuidores
- **Métricas por Time**: Competição saudável entre equipes

### 👥 Funcionalidades de Colaboração

- **Sessões de levantamento de requisitos**: Crie salas para discussão de histórias e tarefas
- **Sugestões em Tempo Real**: Adicione e vote em ideias colaborativamente
- **Sistema de Comentários**: Discussões organizadas por card
- **Múltiplos Times**: Organize participantes em diferentes equipes
- **Timers Sincronizados**: Controle de tempo para cada time

### 🔒 Segurança e Controle

- **Proteção por Senha**: Opcional para sessões privadas
- **Controle de Acesso**: Apenas participantes autorizados podem entrar
- **Gestão de Dono**: Criador da sessão tem controle total

## 🚀 Começando Rapidamente

### Pré-requisitos

- Node.js 18+
- Firebase Project
- Navegador moderno

### Instalação

1. **Clone o repositório**

    ```bash
    git clone <repository-url>
    cd app
    ```

1. **Instale as dependências**

    ```bash
    npm install
    ```

1. **Configure o Firebase**
    - Crie um projeto no [Firebase Console](https://console.firebase.google.com/u/0/)
    - Ative Firestore Database
    - Copie as configurações para `src/config/firebase.ts`

1. **Execute em desenvolvimento**

    ```bash
    npm run dev
    ```

### 🔥 Firebase

```bash
# Atualizar regras da firestore
firebase deploy --only firestore:rules

# Build da aplicação
npm run build

# Deploy para Firebase Hosting
npm run deploy

# Ou para deploy completo
npm run deploy:all
```

### 📊 Análise de Qualidade

```bash
# Testes com cobertura
npm run test:coverage

# Testes em modo watch
npm run test:watch

# Verificação de tipos
npm run type-check

# Linting
npm run lint

# Validação completa (types, lint, tests)
npm run validate
```

## 🔗 Links Úteis

- [**📊 Dashboard SonarCloud**](https://sonarcloud.io/project/overview?id=Gurasks_Gamification) - Análise detalhada da qualidade do código
- [**⚡ GitHub Actions**](https://github.com/Gurasks/Gamification/actions) - Pipeline de CI/CD e execuções
- [**🔥 Firebase Console**](https://console.firebase.google.com/) - Gerenciamento do backend e banco de dados
- [**🐛 Reportar Bug**](https://github.com/Gurasks/Gamification/issues) - Abrir uma issue no GitHub
- [**💡 Sugerir Melhoria**](https://github.com/Gurasks/Gamification/issues) - Propor novas funcionalidades

## 📈 Status do Projeto

| Métrica | Dashboard |
|---------|-----------|
| **Pipeline CI/CD** |  [Ver Actions](https://github.com/Gurasks/Gamification/actions) |
| **Quality Gate** | [Ver SonarCloud](https://sonarcloud.io/summary/new_code?id=Gurasks_Gamification) |
| **Cobertura de Testes** | [Ver Cobertura](https://sonarcloud.io/component_measures?id=Gurasks_Gamification&metric=coverage) |
| **Bugs** | [Ver Bugs](https://sonarcloud.io/project/issues?id=Gurasks_Gamification&resolved=false&types=BUG) |
| **Vulnerabilidades** |  [Ver Vulnerabilidades](https://sonarcloud.io/project/issues?id=Gurasks_Gamification&resolved=false&types=VULNERABILITY) |
| **Dívida Técnica** | [Ver Dívida](https://sonarcloud.io/component_measures?id=Gurasks_Gamification&metric=sqale_index) |
| **Code Smells** | [Ver Code Smells](https://sonarcloud.io/project/issues?id=Gurasks_Gamification&resolved=false&types=CODE_SMELL) |