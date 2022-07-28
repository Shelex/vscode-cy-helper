
### Open Cypress window

-   For opening Cypress with current file - click CodeLens "Open Cypress" (button above test).
    Please note that it will execute command from `cypressHelper.commandForOpen` configuration.
-   For marking some tests with `only`/`@focus` tag, or removing - click corresponding CodeLens. Also, you can just close terminal `CypressOpen` to remove all `only` tags from your file.
-   In case this functionality is not needed for your case, it could be disabled by setting configuration `cypressHelper.menuItems.OpenCypress` to `false`

#### How it works:

-   get `cypressHelper.commandForOpen`;
-   open terminal with name `CypressOpen`;
-   send command `%%commandForOpen%% --config testFiles=%%spec%%` to terminal, where `%%spec%%` is opened test file path;
    (`testFiles` option is deprecated in Cypress 10, if `commandForOpen` contains `--e2e` flag OR your package.json contains cypress v10+ as dependency it will add `specPattern=%%spec%%`, to avoid plugin checking package.json just add an `--e2e` flag)
-   after terminal `CypressOpen` is closed - deletes from opened test file all `@focus` or `.only` tags;

![](../assets/openCypress.gif)



### Keypress events snippets inside cy.type autocompletion

Inside cy.type string or template literal argument just type `{` which will trigger autocomplete for [keypress event sequences](https://docs.cypress.io/api/commands/type.html#Arguments)

![](../assets/cyTypeAutocomplete.gif)

### jQuery locators autocompletion

-   Configuration

    -   enabled - boolean, turn on\off autocompletion, default `true`.
    -   commandsForAutocompletion - array[string], cypress commands that should have autocompletion inside string\template literal arguments, default `["get", "find", "filter"]`
    -   includePatterns - array[string], glob patterns for folders where files should have autocompletion inside string\template literal, could be used inside page objects \ locator objects \ file with locator constants, example:`["**/support/locators/**"]` ,default `[]`
    -   excludePatterns - array[string], glob patterns for folders that should be excluded from having autocompletion inside string\template literal, could be used to narrow down or specify folder matching criteris , example:`["**/support/locators/handler/**"]` ,default `[]`
    -   customAttributes - array[string], used to add your attributes to list of autocompletions, example:`["data-cy", "test-data"]` ,default `[]`

-   Usage
    -   type `[` - list with attributes
    -   type `:` - list of jquery pseudo locators
    -   type `=` - list of matching strategies for attribute values
    -   type space - list of relative strategies to query elements (children, direct children, siblings, adjacent)

![](../assets/jqueryLocators.gif)

### Generate JSON Schema

Menu item that appears for json files and generates json schema for further validation with libraries like `ajv` or `@cypress/schema-tools`.
Is enabled by default, to disable set `cypressHelper.menuItems` `SchemaGenerator` to false.
File will have name of source file + `Schema`, like `example.json` => `exampleSchema.json`, and title with source file name, like `example`.

![](../assets/jsonSchema.gif)