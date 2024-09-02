- We want the app to be in English and Spanish.
- Check the components in the file for strings that appear in the UI.
- If the components in the file have no strings, or are already translated, don't make any changes.
- If strings need to be translated:

1. Add the import `import { getTranslations } from "next-intl/server"` if the component is a server component, or `import { useTranslations } from "next-intl"` if the component is a client component. Only add the import if it is not already there. Make sure to add the import in alphabetical order.

2. Add the `const t = getTranslations("feature.key")` or `const t = useTranslations("feature.key")` hook to each component where the name of the key is composed of the feature name and a semantic section name, such as `home.header`.

3. Keys must be in snake case.

4. Deeply nest the key to the most specific section. For example, if the key is `home.header`, then the key should be `home.header.title`.

5. Common words that are not part of a feature should be added to the `common` section. For example, "Sign out" should be `common.sign_out`.

6. Change the strings to use the translation: `<h1>Your Settings</h1>` becomes `<h1>t("settings.header.title")</h1>`.

7. Add keys to the `translations/en.json` file.

8. Add the translation to the `translations/es.json` file.

- If this is a page and it contains meta tags, include the meta tags for the feature with the key `feature.meta`. For example, if the feature is `home`, then the meta tags should be included with the key `home.meta`.
