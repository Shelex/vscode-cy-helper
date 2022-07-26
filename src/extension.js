const vscode = require('vscode');
const { openSpecFile } = require('./openSpecFile');
const { setTag, clearTag } = require('./testWithOnlyTags');
const { openCustomCommand } = require('./openCustomCommand');
const { generateCustomCommandTypes } = require('./generateCustomCommandTypes');
const { createDefaultTsConfig } = require('./createDefaultTsConfig');
const { regenerateTypes } = require('./generateTypesOnSave');
const {
    findUnusedCustomCommands,
    showCustomCommandReferences
} = require('./customCommandsUsage');
const {
    findUnusedCucumberSteps,
    findCucumberStepUsage
} = require('./cucumberStepsUsage');
const { generateJsonSchema } = require('./generateJsonSchema');
const { removeTags } = require('./helper/terminal');
const { promptToReloadWindow } = require('./helper/utils');
const FixtureCompletionProvider = require('./providers/FixtureCompletionProvider');
const FixtureDefinitionProvider = require('./providers/FixtureDefinitionProvider');
const AliasCompletionProvider = require('./providers/AliasCompletionProvider');
const {
    AliasDefinitionProvider
} = require('./providers/AliasDefinitionProvider');
const {
    CyTaskCompletionProvider
} = require('./providers/CyTaskCompletionProvider');
const {
    CyTaskDefinitionProvider
} = require('./providers/CyTaskDefinitionProvider');
const CucumberTagsProvider = require('./providers/CucumberTagsProvider');
const GQLMockCompletionProvider = require('./90poe/gqlMockCompletionProvider');
const CommandDefinitionProvider = require('./providers/CommandDefinitionProvider');
const CommandReferencesProvider = require('./providers/CommandReferencesProvider');
const StepReferencesProvider = require('./providers/StepReferencesProvider');
const CodeLensForRunProvider = require('./providers/CodeLensForRunProvider');
const TypeKeypressEventsProvider = require('./providers/TypeKeypressEventsProvider');
const JqueryLocatorCompletionProvider = require('./providers/JqueryLocatorCompletionProvider');
const JiraAllureCompletionProvider = require('./providers/JiraAllureLinkCompletionProvider');

const JsAndTsActivationSchema = [
    { scheme: 'file', language: 'javascript' },
    { scheme: 'file', language: 'typescript' }
];

const GherkinActivationSchema = [{ scheme: 'file', language: 'feature' }];

const allLanguagesSchema = [
    ...JsAndTsActivationSchema,
    ...GherkinActivationSchema
];

const activate = (context) => {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'cypressHelper.openSpecFile',
            openSpecFile
        ),
        vscode.commands.registerCommand('cypressHelper.setTag', setTag),
        vscode.commands.registerCommand('cypressHelper.clearTag', clearTag),
        vscode.commands.registerCommand(
            'cypressHelper.openCustomCommand',
            openCustomCommand
        ),
        vscode.commands.registerCommand(
            'cypressHelper.generateCustomCommandTypes',
            generateCustomCommandTypes
        ),
        vscode.commands.registerCommand(
            'cypressHelper.findUnusedCustomCommands',
            findUnusedCustomCommands
        ),
        vscode.commands.registerCommand(
            'cypressHelper.findUnusedCucumberSteps',
            findUnusedCucumberSteps
        ),
        vscode.commands.registerCommand(
            'cypressHelper.findCucumberStepUsage',
            findCucumberStepUsage
        ),
        vscode.commands.registerCommand(
            'cypressHelper.findCustomCommandReferences',
            showCustomCommandReferences
        ),
        vscode.commands.registerCommand(
            'cypressHelper.createDefaultTsConfig',
            createDefaultTsConfig
        ),
        vscode.commands.registerCommand(
            'cypressHelper.generateJsonSchema',
            (file) => generateJsonSchema(file)
        ),
        vscode.languages.registerCompletionItemProvider(
            allLanguagesSchema,
            new FixtureCompletionProvider(),
            '(',
            '/',
            '\\',
            '"',
            "'",
            '`'
        ),
        vscode.languages.registerCompletionItemProvider(
            GherkinActivationSchema,
            new JiraAllureCompletionProvider(),
            '-'
        ),
        vscode.languages.registerCompletionItemProvider(
            JsAndTsActivationSchema,
            new AliasCompletionProvider(),
            "'",
            '"'
        ),
        vscode.languages.registerDefinitionProvider(
            JsAndTsActivationSchema,
            new AliasDefinitionProvider()
        ),
        vscode.languages.registerCompletionItemProvider(
            GherkinActivationSchema,
            new CucumberTagsProvider(),
            '@'
        ),
        vscode.languages.registerCompletionItemProvider(
            JsAndTsActivationSchema,
            new GQLMockCompletionProvider(),
            '(',
            '/',
            '\\'
        ),
        vscode.languages.registerCompletionItemProvider(
            JsAndTsActivationSchema,
            new TypeKeypressEventsProvider(),
            '{'
        ),
        vscode.languages.registerCompletionItemProvider(
            JsAndTsActivationSchema,
            new JqueryLocatorCompletionProvider(),
            '[',
            ':',
            '=',
            ' '
        ),
        vscode.languages.registerCompletionItemProvider(
            JsAndTsActivationSchema,
            new CyTaskCompletionProvider(),
            "'",
            '"'
        ),
        vscode.languages.registerDefinitionProvider(
            JsAndTsActivationSchema,
            new CyTaskDefinitionProvider()
        ),
        vscode.languages.registerDefinitionProvider(
            JsAndTsActivationSchema,
            new CommandDefinitionProvider()
        ),
        vscode.languages.registerDefinitionProvider(
            allLanguagesSchema,
            new FixtureDefinitionProvider()
        ),
        vscode.languages.registerReferenceProvider(
            JsAndTsActivationSchema,
            new CommandReferencesProvider()
        ),
        vscode.languages.registerReferenceProvider(
            JsAndTsActivationSchema,
            new StepReferencesProvider()
        ),
        vscode.languages.registerCodeLensProvider(
            allLanguagesSchema,
            new CodeLensForRunProvider()
        )
    );
    vscode.window.onDidCloseTerminal((terminal) => removeTags(terminal));
    vscode.workspace.onDidChangeConfiguration((event) =>
        promptToReloadWindow(event)
    );
    vscode.workspace.onDidSaveTextDocument((document) =>
        regenerateTypes(document)
    );
};
exports.activate = activate;

const deactivate = () => {};

module.exports = {
    activate,
    deactivate
};
