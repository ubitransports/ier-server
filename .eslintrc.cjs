module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'plugin:prettier/recommended',
    ],
    plugins: ['import', 'unused-imports'],
    parserOptions: {
        ecmaVersion: 2018,
        // allows `import`
        sourceType: 'module',
    },
    rules: {
        // Disable some opinionated rules from @vue/prettier/@typescript-eslint ruleset
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',

        //import plugin
        // https://github.com/import-js/eslint-plugin-import
        'import/no-extraneous-dependencies': 'error',
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'parent',
                    'sibling',
                    'index',
                ],
                'newlines-between': 'never',
                alphabetize: { order: 'asc', caseInsensitive: true },
                pathGroups: [
                    {
                        pattern: '@/**',
                        group: 'internal',
                    },
                ],
            },
        ],

        // unused-imports plugin config:
        // https://www.npmjs.com/package/eslint-plugin-unused-imports
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'error',
            {
                vars: 'all',
                varsIgnorePattern: '^_',
                args: 'after-used',
                argsIgnorePattern: '^_',
            },
        ],

        // overrides
        '@typescript-eslint/consistent-type-imports': 'error',
    },
}
