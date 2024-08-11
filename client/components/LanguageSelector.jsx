import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const languages = [
    'be',
    'de',
    'en-US',
    'es-419',
    'fr-CA',
    'hi',
    'it',
    'ja',
    'ko',
    'pt-BR',
    'sv',
    'uk-UA',
    'zh-CN',
    'zh-TW',
    'tr',
    'ur'
  ];

  const sortedLanguages = ['en-US', ...languages.filter(lang => lang !== 'en-US')];

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <div className="language-selector">
      <label htmlFor="language-select">Select Language: </label>
      <select id="language-select" onChange={handleLanguageChange} value={i18n.language}>
        {sortedLanguages.map((lang) => (
          <option key={lang} value={lang}>
            {lang.toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
