<!-- README.md (ENGLISH - DEFAULT) -->

<p align="center">
  🇺🇸 English | <a href="./README.pt-br.md">🇧🇷 Português</a>
</p>

# 🎯 Gamification - Gamified Requirements Elicitation System (SGLR)

A collaborative platform with gamification elements designed to make requirements elicitation sessions more engaging and productive.

---

## 🛠️ Technologies & Integrations

![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react\&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?logo=typescript\&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12.5.0-FFCA28?logo=firebase\&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.7-06B6D4?logo=tailwindcss\&logoColor=white)

---

## ✨ Key Features

### 🎮 Gamification

* **Scoring System**: Participants earn points for comments, suggestions, and answers
* **Leaderboard**: Real-time ranking with engagement metrics
* **Badges & Recognition**: Rewards for top contributors
* **Team Metrics**: Healthy competition between teams

### 👥 Collaboration Features

* **Requirements Elicitation Sessions**: Create rooms to discuss stories and tasks
* **Real-Time Suggestions**: Add and vote on ideas collaboratively
* **Comment System**: Card-based organized discussions
* **Multiple Teams**: Organize participants into different teams
* **Synchronized Timers**: Time control for each team

### 🔒 Security & Control

* **Password Protection**: Optional for private sessions
* **Access Control**: Only authorized participants can join
* **Owner Management**: Session creator has full control

---

## 🚀 Getting Started

### Prerequisites

* Node.js 18+
* Firebase Project
* Modern browser

### Installation

```bash
git clone <repository-url>
cd app
npm install
```

### Configure Firebase

* Create a project in Firebase Console
* Enable Firestore Database
* Copy the configuration to `src/config/firebase.ts`

### Run in development

```bash
npm run dev
```

---

## 🔥 Firebase

```bash
# Update firestore rules
firebase deploy --only firestore:rules

# Build application
npm run build

# Deploy to Firebase Hosting
npm run deploy

# Full deploy
npm run deploy:all
```

---

## 📊 Quality Analysis

```bash
npm run test:coverage
npm run test:watch
npm run type-check
npm run lint
npm run validate
```

---

## 🔗 Useful Links

* SonarCloud Dashboard
* GitHub Actions
* Firebase Console
* Report Bug
* Suggest Feature

---

## 📈 Project Status


| Métrica | Dashboard |
|---------|-----------|
| **Pipeline CI/CD** | [See Actions](https://github.com/Gurasks/Gamification/actions) |
| **Quality Gate** |  [See SonarCloud](https://sonarcloud.io/summary/new_code?id=Gurasks_Gamification) |
| **Test Coverage** | [See Cobertura](https://sonarcloud.io/component_measures?id=Gurasks_Gamification&metric=coverage) |
| **Bugs** | [See Bugs](https://sonarcloud.io/project/issues?id=Gurasks_Gamification&resolved=false&types=BUG) |
| **Vulnerability** | [See Vulnerabilidades](https://sonarcloud.io/project/issues?id=Gurasks_Gamification&resolved=false&types=VULNERABILITY) |
| **Technical Debts** | [See Dívida](https://sonarcloud.io/component_measures?id=Gurasks_Gamification&metric=sqale_index) |
| **Code Smells** | [See Code Smells](https://sonarcloud.io/project/issues?id=Gurasks_Gamification&resolved=false&types=CODE_SMELL) |