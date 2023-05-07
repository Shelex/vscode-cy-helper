module.exports = {
    FOCUS_TAG: '@focus ',
    FOCUS_TAG_FORMATTED: '@focus',
    DESCRIBE: {
        BLOCK: 'describe(',
        ONLY: 'describe.only(',
        SKIP: 'describe.skip('
    },
    CONTEXT: {
        BLOCK: 'context(',
        ONLY: 'context.only(',
        SKIP: 'context.skip('
    },
    SPECIFY: {
        BLOCK: 'specify(',
        ONLY: 'specify.only(',
        SKIP: 'specify.skip('
    },
    IT: {
        BLOCK: 'it(',
        ONLY: 'it.only(',
        SKIP: 'it.skip('
    },
    ONLY_BLOCK: '.only',
    SKIP_BLOCK: '.skip',
    TERMINAL_NAME: 'CypressOpen',
    FEATURE: 'Feature',
    SCENARIO: 'Scenario',
    DESCRIBE_KEYWORD: 'describe',
    CONTEXT_KEYWORD: 'context',
    CYPRESS_COMMAND_ADD: 'Cypress.Commands.add',
    CUCUMBER_KEYWORDS: ['given', 'when', 'then', 'Given', 'When', 'Then'],
    message: {
        NO_COMMAND: 'Custom command not found',
        NO_COMMAND_DETECTED: (err) => `Custom command not detected: ${err}`,
        NO_COMMAND_LOCATION: (command, location) =>
            `Definition location for command "${command}" not found at "${location}"`,
        NO_TEST: 'Test not found',
        NO_STEP: 'Step definition not found',
        NO_COMMAND_DUPLICATES: 'Command duplicates not found',
        TSCONFIG_GENERATED: 'default tsconfig.json file created',
        TSCONFIG_EXIST: 'tsconfig.json file already exist',

        INVALID_SYNTAX: (subject) =>
            `Incorrect command syntax:\n${toString(subject)}`,
        DUPLICATED_COMMANDS: (subject) =>
            `Duplicated commands:\n${toString(subject)}`,

        GENERATED_TYPES: 'Type definitions generated and saved',
        NEW_COMMANDS: (commands) =>
            `Added command types: ${commands.join(', ')}`,
        REMOVED_COMMANDS: (commands) =>
            `Removed command types: ${commands.join(', ')}`,

        DEFAULT_NO_ITEMS_QUICKMENU: 'Items for quick pick menu not found',

        UNUSED_COMMANDS_FOUND: (quantity) =>
            `Found ${quantity} not used Cypress custom commands:`,
        UNUSED_COMMANDS_NOT_FOUND: 'No unused Cypress custom commands found',

        REFERENCE_COMMAND_FOUND: (quantity, target) =>
            `Found ${quantity} usages of command "${target}":`,
        REFERENCE_NOT_FOUND: (target) => `No references found for: "${target}"`,

        UNUSED_STEPS_FOUND: (quantity) =>
            `Found ${quantity} not used Step Definitions:`,
        UNUSED_STEPS_NOT_FOUND: 'No unused step definitions found',

        REFERENCE_STEPS_FOUND: (quantity, target) =>
            `Found ${quantity} usages of step: "${target}":`,
        REFERENCE_STEPS_NOT_FOUND: (target) =>
            `Not found usage for step: "${target}"`,
        FIXTURES_UPDATED: (items) => `Updated fixtures:\n${toString(items)}`,
        FIXTURES_CREATED: (items) => `Created new fixtures:\n${toString(items)}`
    },
    regexp: {
        TS_DEFINITION: /^ +(.*)\(.*: Chainable<any>;.*?$/m,
        STEP_DEFINITION: /['"`/](.*?)['"`/]/g,
        COMMAND_DECLARATION: /['"`].*?['"`]/g,
        COMMAND_USAGE: /\.(.*?)\(/g,
        QUOTES: /['"`]/g
    },
    allureLabels: [
        'AS_ID',
        'parentSuite',
        'suite',
        'subSuite',
        'epic',
        'feature',
        'story',
        'severity',
        'owner',
        'issue',
        'tms',
        'link'
    ],
    TSCONFIG_DEFAULT_DATA: (spaceFn) => `{
${spaceFn}"compilerOptions": {
${spaceFn}${spaceFn}"allowJs": true,
${spaceFn}${spaceFn}"baseUrl": "../node_modules",
${spaceFn}${spaceFn}"types": [
${spaceFn}${spaceFn}${spaceFn}"cypress"
${spaceFn}${spaceFn}],
${spaceFn}${spaceFn}"noEmit": true
${spaceFn}},
${spaceFn}"include": [
${spaceFn}${spaceFn}"**/*.*"
${spaceFn}]
}`
};

const toString = (subject) => subject.join('\n');
