import axios from "axios";

import { globalDeclare } from "./globals";

import useGlobalStore from "@/pages/globalStore";

async function loadPackageTypings(packageName: string) {
  const { currentApp } = useGlobalStore.getState();

  const url = `//${currentApp?.host}`;

  const res = await axios({
    url: `${url}/_/typing/package?packageName=${packageName}`,
    method: "GET",
    headers: {
      "x-laf-develop-token": `${currentApp?.develop_token}`,
    },
  });

  return res.data;
}

/**
 * Typescript import parser
 */
export class ImportParser {
  REGEX_DETECT_IMPORT =
    /(?:(?:(?:import)|(?:export))(?:.)*?from\s+["']([^"']+)["'])|(?:\/+\s+<reference\s+path=["']([^"']+)["']\s+\/>)/g;

  /**
   * Parse ts source code and return dependencies
   * @param {string} source source code
   * @returns
   */
  parseDependencies(source: string) {
    const cleaned = source;
    const DYNAMIC_IMPORT = /import\((['"])(.*?)\1\)/g;

    // parse dynamic imports
    const dynamicImports = [...cleaned.matchAll(DYNAMIC_IMPORT)].map((x) => x[2]);

    // parse static imports
    const staticImports = [...cleaned.matchAll(this.REGEX_DETECT_IMPORT)]
      .map((x) => x[1] ?? x[2])
      .filter((x) => !!x && !x.startsWith("./") && !x.startsWith("../"))
      .map((imp) => {
        return imp;
      });

    return [...new Set([...dynamicImports, ...staticImports])];
  }
}

/**
 * Typescript auto import typings
 */
export class AutoImportTypings {
  _parser = new ImportParser();

  /**
   * Loaded packages
   */
  _loaded: string[] = [];

  /**
   * Parse ts source code and load dependencies
   * @param {string} source ts 代码
   * @returns
   */
  async parse(source: string, monaco: any) {
    const rets = this._parser.parseDependencies(source);
    if (!rets || !rets.length) return;

    const newImports = rets.filter((pkg) => !this.isLoaded(pkg));
    for (const pkg of newImports) {
      await this.loadDeclaration(pkg, monaco);
    }
  }

  /**
   * Load default typings
   */
  loadDefaults(monaco: any) {
    this.addExtraLib({ path: "globals.d.ts", content: globalDeclare, monaco });
    if (!this.isLoaded("@lafjs/cloud")) {
      this.loadDeclaration("@lafjs/cloud", monaco);
    }
    if (!this.isLoaded("globals")) {
      this.loadDeclaration("globals", monaco);
    }
    if (!this.isLoaded("database-proxy")) {
      this.loadDeclaration("database-proxy", monaco);
    }
    if (!this.isLoaded("database-ql")) {
      this.loadDeclaration("database-ql", monaco);
    }
    if (!this.isLoaded("axios")) {
      this.loadDeclaration("axios", monaco);
    }
    if (!this.isLoaded("mongodb")) {
      this.loadDeclaration("mongodb", monaco);
    }
    if (!this.isLoaded("@types/node")) {
      this.loadDeclaration("@types/node", monaco);
    }
    if (!this.isLoaded("ws")) {
      this.loadDeclaration("ws", monaco);
    }
    if (!this.isLoaded("@aws-sdk/client-s3")) {
      this.loadDeclaration("@aws-sdk/client-s3", monaco);
    }
    if (!this.isLoaded("@aws-sdk/s3-request-presigner")) {
      this.loadDeclaration("@aws-sdk/s3-request-presigner", monaco);
    }
  }

  /**
   * Check if package is loaded
   * @param {string} packageName
   * @returns
   */
  isLoaded(packageName: string) {
    return this._loaded.includes(packageName);
  }

  /**
   * Load package declaration files
   * @param {string} packageName
   * @returns
   */
  async loadDeclaration(packageName: string, monaco: any) {
    if (this.isLoaded(packageName)) return;
    try {
      this._loaded.push(packageName);

      const r = await loadPackageTypings(packageName).catch((err: any) => console.error(err));
      if (r?.code) {
        this._loaded = this._loaded.filter((x) => x !== packageName);
        return;
      }

      const rets = r.data || [];
      for (const lib of rets) {
        // 修复包的类型入口文件不为 index.d.ts 的情况
        if (packageName === lib.packageName && lib.path !== `${packageName}/index.d.ts`) {
          const _lib = { ...lib };
          _lib.path = `${packageName}/index.d.ts`;
          this.addExtraLib({ path: _lib.path, content: _lib.content, monaco });
        }
        this.addExtraLib({ path: lib.path, content: lib.content, monaco });
      }
    } catch (error) {
      this._loaded = this._loaded.filter((x) => x !== packageName);
      console.error(`failed to load package: ${packageName} :`, error);
    }
  }

  /**
   * Add extra lib to monaco editor
   * @param {path: string, content: string} param0
   * @returns
   */
  addExtraLib({ path, content, monaco }: { path: string; content: string; monaco: any }) {
    const fullPath = `file:///node_modules/${path}`;
    const defaults = monaco.languages.typescript.typescriptDefaults;
    const loaded = defaults.getExtraLibs();

    if (fullPath in loaded) {
      return;
    }
    try {
      defaults.addExtraLib(content, fullPath);
      monaco.editor.createModel(content, "typescript", monaco.Uri.parse(fullPath));
    } catch (error) {
      console.log(error, fullPath);
      throw error;
    }
  }
}
