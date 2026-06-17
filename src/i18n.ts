import { useState, useEffect } from "react";

const translationCache: Record<string, Record<string, string>> = {
  en: {
    home: "Home",
    discover: "Discover",
    grocery: "Grocery",
    favorites: "Favorites",
    settings: "Settings",
    goodEvening: "Good Evening",
    letsGetCooking: "Let's get cooking, Chef.",
    searchRecipes: "Search recipes...",
    theWeekAhead: "The Week Ahead",
    planAndPrep: "Plan & Prep",
    yourFavorites: "Your Favorites",
    controlRoom: "The Control Room",
    language: "Language",
    notifications: "Notifications",
    appInterfaceLanguage: "App interface language",
    dailyReminders: "Daily Reminders",
    alertTonight: "Alert for tonight's dinner",
    whatsInYourFridge: "What's in your fridge?",
    fridgePlaceholder: "e.g. Chicken, tomatoes, garlic"
  }
};

export function useTranslation(language: string) {
  const [translations, setTranslations] = useState<Record<string, string>>(
    translationCache[language] || translationCache['en']
  );

  useEffect(() => {
    let isMounted = true;
    
    if (translationCache[language]) {
      setTranslations(translationCache[language]);
      return;
    }

    fetch(`/locales/${language}.json?v=${Date.now()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        translationCache[language] = data;
        if (isMounted) {
          setTranslations(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load language:", err);
      });

    return () => {
      isMounted = false;
    };
  }, [language]);

  const t = (key: string): string => {
    return translations[key] || translationCache['en']?.[key] || key;
  };
  
  return { t };
}
