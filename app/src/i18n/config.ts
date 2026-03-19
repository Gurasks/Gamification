import i18n from "i18next";
import HttpBackend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",

    debug: process.env.NODE_ENV === "development",

    defaultNS: "common",

    ns: [
      "auth",
      "board",
      "card",
      "common",
      "creation",
      "export",
      "home",
      "join",
      "leaderboard",
      "login",
      "metadata",
      "misc",
      "nav",
      "profile",
      "review",
      "sorting",
      "team",
      "validation",
    ],

    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
