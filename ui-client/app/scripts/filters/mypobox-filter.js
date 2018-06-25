import * as fallBackTranslations from '../locale/translation.json';

export default function i18n($filter) {
    'use strict';
    return function (text) {
        try {
            if (text == null || text == undefined || text == "") {
                return "";
            }
            if (window.mypoboxtables.mypoboxInfo.lang === "ur")
                window.mypoboxtables.mypoboxInfo.lang = "ar"
            var filteredText = window.mypoboxtables.resources.uiTranslationMessages[text] ||
                fallBackTranslations[window.mypoboxtables.mypoboxInfo.lang][text] ||
                window.mypoboxtables.resources.productTranslationMessages[text];
            if (filteredText === undefined) {
                console.log("Missing localization resource: " + text);
                return text;
            } else {
                return filteredText;
            }
        } catch (e) {
            console.log("Missing localization resource: " + text);
            return text;
        }
    };
}