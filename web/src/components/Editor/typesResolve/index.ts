import axios from "axios";

import { globalDeclare } from "./globals";

import useGlobalStore from "@/pages/globalStore";

async function loadPackageTypings(packageName: string) {
  const cacheKey = `package-typings-${packageName}`;
  const cache = localStorage.getItem(cacheKey);

  const getType = async (packageName: string) => {
    const { currentApp } = useGlobalStore.getState();

    const url = `//${currentApp?.host}`;

    const res = await axios({
      url: `${url}/_/typing/package?packageName=${packageName}`,
      method: "GET",
      headers: {
        "x-laf-develop-token": `${currentApp?.develop_token}`,
      },
    });

    if (res.data?.code === 1 || !res.data?.data) {
      localStorage.removeItem(cacheKey);
    } else {
      localStorage.setItem(cacheKey, JSON.stringify(res.data));
    }
    return res.data;
  };

  if (cache) {
    getType(packageName);
    return JSON.parse(cache);
  }

  const r = await getType(packageName);
  return r;
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
    [
      "@lafjs/cloud",
      "globals",
      "database-proxy",
      "database-ql",
      "axios",
      "mongodb",
      "@types/node",
      "ws",
      "@aws-sdk/client-s3",
      "@aws-sdk/s3-request-presigner",
    ].forEach((v) => {
      if (!this.isLoaded(v)) {
        this.loadDeclaration(v, monaco);
      }
    });
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

      const r = await loadPackageTypings(packageName);
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
    } catch (error) {
      console.log(error, fullPath);
      throw error;
    }
  }
}
