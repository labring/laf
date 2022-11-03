import { i18n } from "@lingui/core";
import { en, cs } from "make-plural/plurals";

i18n.loadLocaleData("en", { plurals: en });
i18n.loadLocaleData("cs", { plurals: cs });

/**
 * Load messages for requested locale and activate it.
 * This function isn't part of the LinguiJS library because there're
 * many ways how to load messages — from REST API, from file, from cache, etc.
 */
export async function activate(locale: string) {
  const { messages } = await import(`../locales/${locale}/message.js`);
  i18n.load(locale, messages);
  i18n.activate(locale);
}
