module.exports = {
    extends: ['prettier'],
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        'prettier/prettier': 'error',
        'no-var': 'error',
        'newline-per-chained-call': 'off',
        'prefer-template': 'error',
        'arrow-body-style': 'off',
        'prefer-arrow-callback': 'off',
        curly: ['error', 'all'],
        'no-restricted-globals': 'off',
        'no-restricted-syntax': [
            'error',
            'DebuggerStatement',
            'LabeledStatement',
            'WithStatement'
        ],
        'import/prefer-default-export': 'off',
        'no-continue': 'off',
        'no-plusplus': 'off',
        'no-await-in-loop': 'off',
        'no-trailing-spaces': 'warn',
        'no-template-curly-in-string': 'error',
        'no-unused-vars': [
            'warn',
            {
                vars: 'all',
                varsIgnorePattern: '[$]',
                args: 'none'
            }
        ],
        'no-shadow': 'off',
        'import/no-named-as-default': 'off',
        'prefer-destructuring': [
            'warn',
            {
                VariableDeclarator: {
                    object: true,
                    array: false
                },
                AssignmentExpression: {
                    object: true,
                    array: false
                }
            }
        ],
        'no-console': 'warn',
        'getter-return': [
            'warn',
            {
                allowImplicit: true
            }
        ],
        'no-dupe-args': 'error',
        'no-dupe-keys': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-extra-boolean-cast': 'error',
        'no-unreachable': 'error',
        'valid-typeof': 'error',
        'no-invalid-regexp': 'error',
        'no-invalid-this': 'error',
        'default-case': 'warn',
        'switch-colon-spacing': 'error',
        eqeqeq: 'warn',
        'no-fallthrough': 'error',
        'no-implicit-coercion': 'error',
        'no-return-await': 'error',
        'require-await': 'error',
        'no-useless-return': 'error',
        'no-negated-condition': 'warn',
        'no-const-assign': 'error',
        'no-unneeded-ternary': 'warn',
        'no-useless-computed-key': 'error'
    },
    plugins: ['prettier']
};
