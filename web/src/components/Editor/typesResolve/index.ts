import axios from "axios";
import * as monaco from "monaco-editor";

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
      .filter((x) => !!x)
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
  async parse(source: string) {
    const rets = this._parser.parseDependencies(source);
    if (!rets || !rets.length) return;

    const newImports = rets.filter((pkg) => !this.isLoaded(pkg));
    for (const pkg of newImports) {
      await this.loadDeclaration(pkg);
    }
  }

  /**
   * Load default typings
   */
  loadDefaults() {
    this.addExtraLib({ path: "globals.d.ts", content: globalDeclare });
    // if (!this.isLoaded("@lafjs/cloud")) {
    //   this.loadDeclaration("@lafjs/cloud");
    // }
    if (!this.isLoaded("globals")) {
      this.loadDeclaration("globals");
    }
    if (!this.isLoaded("database-proxy")) {
      this.loadDeclaration("database-proxy");
    }
    if (!this.isLoaded("database-ql")) {
      this.loadDeclaration("database-ql");
    }
    if (!this.isLoaded("axios")) {
      this.loadDeclaration("axios");
    }
    // if (!this.isLoaded('cloud-function-engine')) { this.loadDeclaration('cloud-function-engine') }
    if (!this.isLoaded("mongodb")) {
      this.loadDeclaration("mongodb");
    }
    if (!this.isLoaded("@types/node")) {
      this.loadDeclaration("@types/node");
    }
    if (!this.isLoaded("ws")) {
      this.loadDeclaration("ws");
    }
    if (!this.isLoaded("@aws-sdk/client-s3")) {
      this.loadDeclaration("@aws-sdk/client-s3");
    }
    if (!this.isLoaded("@aws-sdk/s3-request-presigner")) {
      this.loadDeclaration("@aws-sdk/s3-request-presigner");
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
  async loadDeclaration(packageName: string) {
    if (this.isLoaded(packageName)) return;
    try {
      const r = await loadPackageTypings(packageName).catch((err: any) => console.error(err));
      if (r?.code) {
        return;
      }

      const rets = r.data || [];
      for (const lib of rets) {
        // 修复包的类型入口文件不为 index.d.ts 的情况
        if (packageName === lib.packageName && lib.path !== `${packageName}/index.d.ts`) {
          const _lib = { ...lib };
          _lib.path = `${packageName}/index.d.ts`;
          this.addExtraLib(_lib);
        }
        this.addExtraLib(lib);
      }

      this._loaded.push(packageName);
    } catch (error) {
      console.error(`failed to load package: ${packageName} :`, error);
    }
  }

  /**
   * Add extra lib to monaco editor
   * @param {path: string, content: string} param0
   * @returns
   */
  addExtraLib({ path, content }: { path: string; content: string }) {
    const fullpath = `file:///node_modules/${path}`;
    const defaults = monaco.languages.typescript.typescriptDefaults;

    const loaded = defaults.getExtraLibs();
    const keys = Object.keys(loaded);

    if (keys.includes(fullpath)) {
      console.log(`${path} already exists in ts extralib`);
      return;
    }
    try {
      defaults.addExtraLib(content, fullpath);
    } catch (error) {
      console.log(error, fullpath, keys);
      throw error;
    }
  }

  getExtraLibs() {
    const defaults = monaco.languages.typescript.typescriptDefaults;
    return defaults.getExtraLibs();
  }
}
