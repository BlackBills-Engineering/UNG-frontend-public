import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ru from "./locales/ru.json";
import uz from "./locales/uz.json";

const savedLang = localStorage.getItem('appLang') as 'ru' | 'uz' | null;
const defaultLng = savedLang ?? 'ru';

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    uz: { translation: uz },
  },
  lng: defaultLng,
  fallbackLng: "ru",
  interpolation: { escapeValue: false },
});

export default i18n;
