# 🎯 Gamification - Sistema Gamificado de Levantamento de Requisitos (SGLR)

Uma plataforma colaborativa inspirada no EasyRetro com elementos de gamificação para tornar as sessões de refinamento mais engajantes e produtivas.
---

### 🛠️ Tecnologias e Integrações

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-11.7.3-FFCA28?logo=firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-06B6D4?logo=tailwindcss&logoColor=white)
<!-- ![CI/CD](https://github.com/gurasks/Gamification/workflows/SonarCloud%20Analysis/badge.svg) -->

---

<!-- ### 🔍 Qualidade e Análise de Código

![SonarCloud Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=Gurasks_Gamification&metric=alert_status)
![SonarCloud Coverage](https://sonarcloud.io/api/project_badges/measure?project=Gurasks_Gamification&metric=coverage)
![SonarCloud Maintainability](https://sonarcloud.io/api/project_badges/measure?project=Gurasks_Gamification&metric=sqale_rating)
![SonarCloud Reliability](https://sonarcloud.io/api/project_badges/measure?project=Gurasks_Gamification&metric=reliability_rating)
![SonarCloud Security](https://sonarcloud.io/api/project_badges/measure?project=Gurasks_Gamification&metric=security_rating)
 -->
---

## ✨ Características Principais

### 🎮 Gamificação

- **Sistema de Pontuação**: Os participantes ganham pontos por comentários, sugestões e respostas
- **Tabela de Classificação**: Ranking em tempo real com métricas de engajamento
- **Medalhas e Reconhecimento**: Premiação para os top contribuidores
- **Métricas por Time**: Competição saudável entre equipes

### 👥 Funcionalidades de Colaboração

- **Sessões de Refinamento**: Crie salas para discussão de histórias e tarefas
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
