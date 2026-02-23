import { useTranslation } from "react-i18next";

type Language = "pt-BR" | "en";

export const useLanguage = () => {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.language as Language;

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("i18nextLng", lang);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === "pt-BR" ? "en" : "pt-BR";
    changeLanguage(newLang);
  };

  const getFlagEmoji = () => {
    return currentLanguage === "pt-BR" ? "🇧🇷" : "🇺🇸";
  };

  const getLanguageName = () => {
    return currentLanguage === "pt-BR" ? "Português" : "English";
  };

  return {
    t,
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    getFlagEmoji,
    getLanguageName,
  };
};
