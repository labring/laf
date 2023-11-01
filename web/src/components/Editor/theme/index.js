import { registerExtension } from "vscode/extensions";

var manifest = {
  name: "theme-laf",
  displayName: "Laf Themes",
  description: "The laf function editor themes.",
  categories: ["Themes"],
  version: "1.0.0",
  publisher: "laf team",
  license: "MIT",
  engines: { vscode: "*" },
  contributes: {
    themes: [
      {
        id: "lafEditorTheme",
        label: "lafEditorTheme",
        uiTheme: "lafEditorTheme",
        path: "./themes/laf_editor_theme.json",
      },
      {
        id: "lafEditorDarkTheme",
        label: "lafEditorDarkTheme",
        uiTheme: "lafEditorDarkTheme",
        path: "./themes/laf_editor_dark_theme.json",
      },
    ],
  },

  repository: { type: "git", url: "https://github.com/microsoft/vscode.git" },
  main: undefined,
};

const { registerFileUrl, whenReady } = registerExtension(manifest);
registerFileUrl(
  "./themes/laf_editor_theme.json",
  new URL("./laf_editor_theme.json", import.meta.url).toString(),
  "application/json",
);
registerFileUrl(
  "./themes/laf_editor_dark_theme.json",
  new URL("./laf_editor_dark_theme.json", import.meta.url).toString(),
  "application/json",
);
export { whenReady };
