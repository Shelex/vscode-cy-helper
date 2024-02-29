# vscode-cy-helper

[![SWUbanner](./assets/standWithUkraine.png)](https://vshymanskyy.github.io/StandWithUkraine/)

Cypress extension for vs code.
(Forked due to publish issues with original repository)

[![Gitter](https://badges.gitter.im/vscode-cy-helper/community.png)](https://gitter.im/vscode-cy-helper/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge) [![License](https://img.shields.io/badge/License-Apache%202.0-blue.png)](https://opensource.org/licenses/Apache-2.0) ![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/shevtsov.vscode-cy-helper?label=Installs)

## Available functionality

### Custom commands

-   [Go to definition](./docs/custom_commands.md#open-cypress-custom-command-definition)
-   [References](./docs/custom_commands.md#find-cypress-custom-commands-references)
-   [Find unused commands](./docs/custom_commands.md#find-not-used-cypress-custom-commands)
-   [Generate type definitions file for custom commands](./docs/custom_commands.md#generate-type-definitions-for-cypress-custom-commands)
-   [Create default tsconfig file](./docs/custom_commands.md#create-default-tsconfig-file)

### Other

-   [Open cypress window](./docs/other.md#open-cypress-window)
-   [Keypress events snippets inside cy.type autocompletion](./docs/other.md#keypress-events-snippets-inside-cy.type-autocompletion)
-   [jQuery locators autocompletion](./docs/other.md#jquery-locators-autocompletion)
-   [JSON Schema generation](./docs/other.md#generate-json-schema)

### Gherkin (cucumber)

-   [References](./docs/gherkin.md#find-cucumber-step-definition-references)
-   [Find unused steps](./docs/gherkin.md#find-not-used-cucumber-step-definitions)
-   [Tag autocompletion](./docs/gherkin.md#tag-autocompletion)

### Alias

-   [Alias autocompletion](./docs/alias.md#alias-autocompletion)
-   [Alias go to definition](./docs/alias.md#alias-definition)

### Task

-   [cy.task autocompletion](./docs/tasks.md#cypress-task-autocompletion)
-   [cy.task go to definition](./docs/tasks.md#cypress-task-definition)

### Fixtures

-   [Fixture path autocompletion](./docs/fixtures.md#fixtures-autocompletion)
-   [Fixture path go to definition](./docs/fixtures.md#fixtures-definition)

## Configuration

| setting                                             | description                                                                                                                                                                                             | default                                                                                                                                                                                                                                                                                                         |
| :-------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cypressHelper.commandForOpen`                      | command used for opening cypress                                                                                                                                                                        | `npx cypress open`                                                                                                                                                                                                                                                                                              |
| `cypressHelper.commandForRun`                       | command used for running cypress                                                                                                                                                                        | `npx cypress run`                                                                                                                                                                                                                                                                                               |
| `cypressHelper.customCommandsFolder`                | path to folder with custom commands                                                                                                                                                                     | `cypress/support`                                                                                                                                                                                                                                                                                               |
| `cypressHelper.typeDefinitionFile`                  | file to save generated custom commands                                                                                                                                                                  | `cypress/support/customCommands.d.ts`                                                                                                                                                                                                                                                                           |
| `cypressHelper.typeDefinitionExcludePatterns`       | array of glob patterns that should be excluded from types generation                                                                                                                                    | [`**/*.ts`]                                                                                                                                                                                                                                                                                                     |
| `cypressHelper.includeAnnotationForCommands`        | include comments before custom command to type definition file                                                                                                                                          | false                                                                                                                                                                                                                                                                                                           |
| `cypressHelper.typeDefinitionOnSave`                | generate type definitions file for custom commands on save                                                                                                                                              | false                                                                                                                                                                                                                                                                                                           |
| `cypressHelper.menuItems`                           | display menu items or lenses for commands                                                                                                                                                               | `{ `<br/>`"OpenCypress": true,`<br/>`"RunCypress": false,`<br/>`"ItOnly": true,`<br/>`"ItSkip": false,`<br/>`"GenerateCustomCommandTypes": true,`<br/>`"GoToCustomCommand": true,`<br/> `"FindCustomCommandReferences": true,`<br/>`"FindStepDefinitionReferences": true`<br/>`"SchemaGenerator": true`<br/>`}` |
| `cypressHelper.jqueryLocators`                      | configuration for jquery locators autocomplete                                                                                                                                                          | `{ `<br/>`"enabled": true,`<br/>`"commandsForAutocompletion": ["get", "find", "filter"],`<br/>`"includePatterns": [],`<br/>`"excludePatterns": [],`<br/> `"customAttributes": [],`<br/>`}`                                                                                                                      |
| `cypressHelper.fixtureAutocompletionCommands`       | cypress commands that accept fixture path as argument to add fixture path autocompletion                                                                                                                | `["fixture"]`                                                                                                                                                                                                                                                                                                   |
| `cypressHelper.aliasAutocompletionForCurrentFile`   | To enable alias autocompletion just for current file                                                                                                                                                    | `false` (aliases will be searched in current folder)                                                                                                                                                                                                                                                            |
| `cypressHelper.cucumberFixtureAutocompleteOnQuotes` | If you want fixture autocompletion in cucumber scenarios (using fixtures as parameters) you can enable it by setting `true`                                                                             | false                                                                                                                                                                                                                                                                                                           |
| `cypressHelper.enableCommandReferenceProvider`      | In case you have type definitions, native Find all References will return duplicates for commands. To avoid it set this parameter to `false`                                                            | true                                                                                                                                                                                                                                                                                                            |
| `cypressHelper.cucumberTagsAutocomplete`            | Set `enable: true` for cucumber feature autocomplete on `@`. Array of tags could be specified. Option to add [cypress-allure-plugin](https://www.npmjs.com/package/@shelex/cypress-allure-plugin) tags. | `{`<br/>`"enable": false,`<br/>`"tags": ["focus"],`<br/>`"allurePlugin": false`<br/>`}`                                                                                                                                                                                                                         |
| `cypressHelper.reuseTerminalInstance`               | By default executes `commandForOpen` in same terminal instance. To spawn new instance for each cypress opening set it to `false`                                                                        | true                                                                                                                                                                                                                                                                                                            |
| `cypressHelper.cypressCodeLensePattern`             | To enable code lenses (Cypress Open, Cypress Run, Set 'only') just for specific glob pattern, useful when project has other types of tests                                                              | all files with `.js`, `.ts`, `.feature` extension inside `cypress` folder                                                                                                                                                                                                                                       |

## License

Copyright 2022 Oleksandr Shevtsov. This project is licensed under the Apache 2.0 License.
