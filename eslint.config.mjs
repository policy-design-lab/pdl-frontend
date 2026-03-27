import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import unusedImports from "eslint-plugin-unused-imports";
import eslintConfigPrettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

const importExtensions = [".js", ".jsx", ".ts", ".tsx"];

const sharedRules = {
    ...reactPlugin.configs.recommended.rules,
    ...jsxA11yPlugin.configs.recommended.rules,
    ...eslintConfigPrettier.rules,
    "prettier/prettier": ["warn", {
        endOfLine: "auto",
        operatorLinebreak: "after",
        printWidth: 120
    }],
    "function-paren-newline": "off",
    "implicit-arrow-linebreak": "off",
    "no-confusing-arrow": "off",
    "operator-linebreak": "off",
    "brace-style": [
        "error",
        "1tbs",
        {
            allowSingleLine: true
        }
    ],
    camelcase: "off",
    "comma-dangle": ["error", "never"],
    "default-case": "off",
    "import/extensions": [
        "error",
        "ignorePackages",
        {
            js: "never",
            jsx: "never",
            ts: "never",
            tsx: "never"
        }
    ],
    "import/no-extraneous-dependencies": 0,
    "import/no-unresolved": ["error", { caseSensitive: false }],
    "import/prefer-default-export": "off",
    "jsx-a11y/control-has-associated-label": "off",
    "max-len": [
        "warn",
        {
            code: 120,
            tabWidth: 4,
            ignoreComments: true,
            ignoreTrailingComments: true,
            ignoreUrls: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
            ignoreRegExpLiterals: true
        }
    ],
    "no-console": [
        "error",
        {
            allow: ["error", "warn"]
        }
    ],
    "no-mixed-operators": "warn",
    "no-multi-spaces": [
        "error",
        {
            ignoreEOLComments: true
        }
    ],
    "no-param-reassign": [
        "error",
        {
            props: false
        }
    ],
    "no-underscore-dangle": "off",
    "no-unused-expressions": [
        "error",
        {
            allowShortCircuit: true
        }
    ],
    "no-unused-vars": "off",
    "no-use-before-define": "off",
    "object-curly-spacing": ["error", "always"],
    "prefer-destructuring": "off",
    quotes: [
        "error",
        "double",
        {
            avoidEscape: true
        }
    ],
    "quote-props": [
        "error",
        "consistent-as-needed",
        {
            keywords: false,
            unnecessary: true,
            numbers: false
        }
    ],
    semi: ["error", "always"],
    "react/destructuring-assignment": "off",
    "react/jsx-curly-newline": "off",
    "react/jsx-filename-extension": [
        "error",
        {
            extensions: [".jsx", ".tsx"]
        }
    ],
    "react/jsx-indent": ["error", 4],
    "react/jsx-indent-props": ["error", 4],
    "react/jsx-one-expression-per-line": "off",
    "react/jsx-props-no-spreading": "off",
    "react/jsx-tag-spacing": "error",
    "react/jsx-wrap-multilines": "off",
    "react/jsx-uses-react": "error",
    "react/jsx-uses-vars": "error",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/require-default-props": "off",
    "react/static-property-placement": ["warn", "static public field"],
    "react-hooks/rules-of-hooks": "off",
    "react-hooks/exhaustive-deps": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": [
        "warn",
        {
            vars: "all",
            varsIgnorePattern: "^_",
            args: "after-used",
            argsIgnorePattern: "^_"
        }
    ]
};

export default [
    {
        ignores: ["build/**", "coverage/**", "node_modules/**", "webpack.*.js"]
    },
    {
        ...js.configs.recommended,
        files: ["**/*.{js,jsx,ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2018,
            sourceType: "module",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                ...globals.es2021
            }
        },
        plugins: {
            import: importPlugin,
            react: reactPlugin,
            "react-hooks": reactHooksPlugin,
            "jsx-a11y": jsxA11yPlugin,
            "unused-imports": unusedImports,
            prettier: prettierPlugin
        },
        settings: {
            react: {
                version: "detect"
            },
            "import/parsers": {
                "@typescript-eslint/parser": [".ts", ".tsx"]
            },
            "import/resolver": {
                alias: {
                    map: [["@components", "./src/components/"]],
                    extensions: importExtensions
                },
                node: {
                    moduleDirectory: ["src", "node_modules"],
                    extensions: importExtensions
                }
            }
        },
        rules: sharedRules
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            }
        },
        plugins: {
            "@typescript-eslint": tsPlugin
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": "off",
            "no-undef": "off",
            "no-unused-expressions": "off",
            "@typescript-eslint/no-unused-expressions": [
                "error",
                {
                    allowShortCircuit: true
                }
            ]
        }
    }
];
