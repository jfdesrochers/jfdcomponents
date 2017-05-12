const yaml = require('js-yaml')
const m = require('mithril')

const setCookie = function(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
};

let currentLang = document.cookie.replace(/(?:(?:^|.*;\s*)currentlang\s*\=\s*([^;]*).*$)|^.*$/, "$1") || navigator.language || navigator.userLanguage || "en"
currentLang = currentLang.substr(0, 2);

let langCache = {}

/**
 * Returns the string identified by the specified key to the current (or specified) language.
 * @param translateKey Identifier for the string to be translated.
 * @param translateToLang [Optional] Use this param to specify a language other than the one currently set. The language must be already loaded.
 * @return The retrieved translation.
 */
const t = function (translateKey, translateToLang) {
    const curLang = translateToLang || currentLang
    if (curLang in langCache) {
        if (translateKey in langCache[curLang]) {
            return langCache[curLang][translateKey]
        } else {
            console.error('[Translator] Key', translateKey, 'is not found for language', curLang)
            return ''
        }
    } else {
        console.error('[Translator] Language', curLang, 'is not loaded into the cache.')
        return ''
    }
}

/**
 * Loads the specified languages into the cache for translation
 * @param langList Object that defines the languages to load in the format: {lang: url}. Ex.: {'en': '/messages/en.yaml', 'fr': '/messages/fr.yaml'}
 * @return Promise that will resolve when all the specified languages have been loaded into the cache.
 */
t.loadLang = function (langList) {
    let allLoad = []
    for (let k in langList) {
        allLoad.push(
            m.request({
                url: langList[k],
                deserialize: yaml.safeLoad
            }).then((o) => {
                langCache[k] = o
            }).catch((e) => {
                throw e
            })
        )
    }
    return Promise.all(allLoad)
}

/**
 * Changes the current language. This function does not load the specified language, it only switched the focus to it.
 * @param newLang The new language to switch to (ex.: 'en').
 */
t.setLang = function (newLang) {
    currentLang = newLang
    setCookie('currentlang', newLang, 60)
}

/**
 * The currently loaded language.
 * @return The language code (ex.: 'en')
 */
t.getLang = function () {
    return currentLang
}

module.exports = t