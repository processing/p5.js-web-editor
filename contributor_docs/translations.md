# Translations Guidelines


*How to contribute with Translations for p5 web editor*
 
## General rules of thumb for translations

In order to simplify the translations process the following rules of thumb were used:

## Technical Part

* There is only one file to translate all the texts in any specific language, which is located under the directory, in respective locale [subdirectory](https://github.com/processing/p5.js-web-editor/tree/develop/translations/locales)
* The new language code must be added to [client/i18n.js](https://github.com/processing/p5.js-web-editor/blob/develop/client/i18n.js#L8)
* New languages will need to be selected using a dropdown in Nav component, specifically in function [renderLanguageMenu.](https://github.com/processing/p5.js-web-editor/blob/develop/client/components/Nav.jsx#L611)
* Need to add `TRANSLATIONS_ENABLED=true` to `.env` to activate dropdown for the languages.

#### Nav.js
Need to add the following code to add a new language as a dropdown menu.
```js
<li className="nav__dropdown-item">
   <button
      onFocus={this.handleFocusForLang}
      onBlur={this.handleBlur}
      value="newLanguageValue"
      onClick={e => this.handleLangSelection(e)}
   >
      new language name in the new language ex: 日本語 (Japanese)
   </button>
</li>
```

#### i18n.js
In terms of `i18n.js`, you will need to update 2 things. One is to import a new language from `date-fns/locale`. The other is to add a new language to `languageMap`.

```js
import { enUS, es, ja, newLanguage } from 'date-fns/locale';
const availableLanguages = ['en-US', 'es-419', 'ja', 'newLanguage'];
```

```js
export function languageKeyToDateLocale(lang) {
  const languageMap = {
    'en-US': enUS,
    'es-419': es,
    'ja': ja
    'newLanguage': newLanguage
  };
  return languageMap[lang];
}
```



## Translations

* Every component should introduce its own subset of keys inside a dictionary named after the component. 
   For instance: If you want to translate AssetList.jsx you need to introduce the following namespace in translations.json :
```json
 "AssetList": {
    "Title": "p5.js Web Editor | My assets",
    "ToggleOpenCloseARIA": "Toggle Open/Close Asset Options",
    "OpenNewTab": "Open in New Tab",
    "HeaderName": "Name",
  }
```
* There are common texts that are present with `Common` prefix, try to check first if the exact label is already present there.
* Every key follows PascalCase case style.
* Every key that is used in an ARIA text should end with the suffix `ARIA`.
* The order of keys inside of appearance should be order of in the order they appear in the source code

## Language Use

The Processing Foundation is specifically invested in expanding the communities of technology and the arts to include and support those who have not had equal access because of their race, gender, class, sexuality, and/or disability. We see software as a medium, something that connects two things. We view it as a means for thinking and making. We believe software, and the tools to learn it, should be accessible to everyone

With those principles in mind, we want to strongly suggest the use of non-gendered terms whenever possible. If it is not possible to avoid, use the most inclusive version. 
For instance, in Spanish translation we tackled that problem with a particular rule of thumb:
Avoid male-gendered words, use instead the letter ‘e’  , we used the ‘e’ approach vs other approaches like ‘x’ or ‘@’ because you also need to think about how screen readers would read the text aloud.

## Background
 
Did you want to know the context?
* The original idea for Alpha Editor in Spanish was addressed in [this issue](https://github.com/processing/p5.js-web-editor/issues/595)
* The discussion regarding which library to use was addressed in [Library](https://github.com/processing/p5.js-web-editor/issues/1447)
* [UI Design](https://github.com/processing/p5.js-web-editor/issues/1434)
* [Language Use](https://github.com/processing/p5.js-web-editor/issues/1509) 



Thanks! 

P5.js Web Editor Community

