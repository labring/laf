import * as path from "path";
import { FUNCTIONS_CONFIG_FILE_SUFFIX_NAME } from "../common/constant";
import { exist, loadYamlFile, remove, writeYamlFile } from "../util/file";

export interface FunctionConfig {
  name: string;
  description?: string;
  tags?: string[];
  websocket?: boolean;
  methods: string[];
}

export function readFunctionConfig(funcName: string): FunctionConfig {
  const funcConfigPath = path.join(process.cwd(), 'functions', funcName + FUNCTIONS_CONFIG_FILE_SUFFIX_NAME)
  return loadYamlFile(funcConfigPath)
}

export function writeFunctionConfig(funcName: string, config: FunctionConfig) {
  const funcConfigPath = path.join(process.cwd(), 'functions', funcName + FUNCTIONS_CONFIG_FILE_SUFFIX_NAME)
  writeYamlFile(funcConfigPath, config)
}

export function existFunctionConfig(funcName: string): boolean {
  const funcConfigPath = path.join(process.cwd(), 'functions', funcName + FUNCTIONS_CONFIG_FILE_SUFFIX_NAME)
  return exist(funcConfigPath)
}

export function removeFunctionConfig(funcName: string) {
  const funcConfigPath = path.join(process.cwd(), 'functions', funcName + FUNCTIONS_CONFIG_FILE_SUFFIX_NAME)
  remove(funcConfigPath)
}