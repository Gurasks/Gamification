# 🎯 RetroGaming - Plataforma de Refinamento com Gamificação

Uma plataforma colaborativa inspirada no EasyRetro com elementos de gamificação para tornar as sessões de refinamento mais engajantes e produtivas.

![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)
![Firebase](https://img.shields.io/badge/Firebase-11.7.3-orange)
![Tailwind](https://img.shields.io/badge/Tailwind-4.1.7-cyan)

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
