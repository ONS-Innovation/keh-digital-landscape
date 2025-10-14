const {
    defineConfig,
} = require("eslint/config");

const globals = require("globals");
const js = require("@eslint/js");

const {
    FlatCompat,
} = require("@eslint/eslintrc");

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

module.exports = defineConfig([{
    languageOptions: {
        globals: {
            ...globals.node,
        },

        ecmaVersion: "latest",
        sourceType: "module",
        parserOptions: {},
    },

    extends: compat.extends("eslint:recommended", "prettier"),

    rules: {
        "no-console": "off",

        "no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
        }],

        "no-duplicate-imports": "error",

        "no-multiple-empty-lines": ["error", {
            max: 1,
        }],
    },
}]);
