import js from "@eslint/js";
import globals from "globals";
import babelParser from "@babel/eslint-parser";
import reactPlugin from "eslint-plugin-react";

export default [
  js.configs.recommended,
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react"]
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      react: reactPlugin
    },
    rules: {
      "react/jsx-uses-vars": "error"
    },
    settings: {
      react: {
        version: "detect"
      }
    }
  }
];
