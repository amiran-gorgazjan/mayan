module.exports = {
    env: {
        node: true,
        browser: false,
        es2021: true,
    },
    root: true,
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 13,
        sourceType: 'module',
    },
    rules: {
        indent: ['error', 4],
        'arrow-parens': ['error', 'as-needed'],
        'no-return-await': 'off',
        'no-await-in-loop': 'off',
        'no-continue': 'off',
        'no-console': 'off',
        'import/extensions': ['error', 'never', {
            mjs: 'always',
        }],
        'no-restricted-syntax': 0,
    },
};
