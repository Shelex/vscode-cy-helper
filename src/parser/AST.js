const Parser = require('@babel/parser');
const _ = require('lodash');
const minimatch = require('minimatch');
const {
    readFilesFromDir,
    readFile,
    readWorkspaces
} = require('../helper/utils');
const { CUCUMBER_KEYWORDS, regexp } = require('../helper/constants');
const { parseArguments } = require('./parseArguments');

/**
 * AST tree by file path
 */
const parseJS = (filepath) => {
    try {
        return (
            Parser.parse(readFile(filepath) || '', {
                sourceType: 'module',
                plugins: ['typescript']
            }) || null
        );
    } catch (e) {
        return null;
    }
};

/**
 *
 * AST tree by text
 */
const parseText = (text) => {
    try {
        return (
            Parser.parse(text || '', {
                sourceType: 'module',
                plugins: ['typescript']
            }) || null
        );
    } catch (e) {
        return null;
    }
};

/**
 * Check if statement is `Cypress.Commands.add`
 */
const findCypressCommandAddStatements = (body) => {
    return body.filter(
        (statement) =>
            _.get(statement, 'type') === 'ExpressionStatement' &&
            _.get(statement, 'expression.callee.object.object.name') ===
                'Cypress' &&
            _.get(statement, 'expression.callee.object.property.name') ===
                'Commands' &&
            _.get(statement, 'expression.callee.property.name') === 'add'
    );
};

/**
 * Retrieve list of commands with type definitions
 */
const customCommandsAvailable = (file) => {
    try {
        const fileContent = readFile(file) || '';
        const commands = fileContent
            .split('\n')
            .map((row) => regexp.TS_DEFINITION.exec(row));
        return commands
            .filter(_.identity)
            .map((item) => item.pop().split('(').shift().trim());
    } catch (e) {
        return [];
    }
};

/**
 * Find custom command implementation
 * @param {string} folder - folder with custom commands
 * @param {string} targetCommand - command for search
 */
const cypressCommandLocation = (folder, targetCommand) => {
    const location = readFilesFromDir({ folder })
        .map((filepath) =>
            getCypressAddStatementInFile(filepath, targetCommand)
        )
        .filter(_.identity);
    return location[0] || null;
};

const getCypressAddStatementInFile = (filepath, targetCommand) => {
    const AST = parseJS(filepath);
    if (!AST) {
        return;
    }
    const commands = findCypressCommandAddStatements(AST.program.body);
    const commandNames = commands.map((c) => c.expression.arguments[0].value);

    if (targetCommand && !commandNames.includes(targetCommand)) {
        return;
    }
    const index = targetCommand ? commandNames.indexOf(targetCommand) : 0;
    const commandBody = commands[index];
    return {
        file: filepath,
        loc: commandBody.expression.arguments[0].loc.start
    };
};

/**
 *  - Parse files
 *  - Returns array of commands with types
 */
const typeDefinitions = (
    files,
    excludes,
    options = {
        includeLocationData: false,
        includeAnnotations: false,
        tabSize: 4
    }
) => {
    const commandsFound = [];
    const suitableFiles = files.filter((path) =>
        excludes.every((s) => !minimatch(path, s))
    );

    const typeDefs = _.flatMap(suitableFiles, (file) => {
        const AST = parseJS(file);
        if (!AST) {
            return;
        }
        const commands = findCypressCommandAddStatements(AST.program.body);
        const typeDefBody = commands.map((command) => {
            const { value: commandName, loc } = command.expression.arguments[0];
            commandsFound.push(
                options.includeLocationData
                    ? {
                          name: commandName,
                          path: file,
                          loc: loc
                      }
                    : commandName
            );

            let annotation = '';
            if (options.includeAnnotations) {
                const commentBlock = _.chain(command)
                    .get('leadingComments', [null])
                    .last()
                    .value();
                const comments = commentBlock
                    ? _.get(commentBlock, 'value')
                    : null;

                const space = _.repeat(' ', options.tabSize);

                annotation = comments
                    ? `/*${comments.split('\n').join(space)}*/${space}`
                    : null;
            }

            const argsArray = parseArguments(command.expression.arguments);
            return `${annotation || ''}${commandName}(${argsArray.join(
                ', '
            )}): Chainable<any>;`;
        });
        return typeDefBody;
    }).filter(_.identity);
    return {
        commandsFound: commandsFound,
        typeDefs: typeDefs
    };
};

/**
 * Parse AST body to find cucumber step definition
 * @param {object} body
 */

const findCucumberStepDefinitions = (body) => {
    return body.filter(
        (statement) =>
            _.get(statement, 'type') === 'ExpressionStatement' &&
            _.get(statement, 'expression.type') === 'CallExpression' &&
            _.get(statement, 'expression.callee.type') === 'Identifier' &&
            CUCUMBER_KEYWORDS.includes(
                _.get(statement, 'expression.callee.name')
            )
    );
};

/**
 * Parse AST body to find cucumber type definition expression
 * @param {object} body
 */

const findCucumberTypeDefinition = (body) => {
    return body.filter(
        (statement) =>
            _.get(statement, 'type') === 'ExpressionStatement' &&
            _.get(statement, 'expression.type') === 'CallExpression' &&
            _.get(statement, 'expression.callee.type') === 'Identifier' &&
            _.get(statement, 'expression.callee.name') === 'defineParameterType'
    );
};

/**
 * Traverse files to find custom types declaration
 * @param {string | null} folder - folder with files
 */

const findCucumberCustomTypes = (folder) => {
    const files = readWorkspaces({ folder });

    if (!files) {
        return [];
    }

    const ASTrees = files
        .map((file) => parseJS(file))
        .filter((AST) => AST && AST.program.body);

    const cucumberTypes = ASTrees.map((AST) =>
        findCucumberTypeDefinition(AST.program.body)
    ).map((type) => {
        if (!type.expression) {
            return {};
        }
        const { properties } = type.expression.arguments[0];
        const name = properties.find((p) => p.key.name === 'name').value.value;
        const regexValue = properties.find((p) => p.key.name === 'regexp').value
            .pattern;
        return {
            name: name,
            pattern: regexValue
        };
    });

    return cucumberTypes;
};

/**
 * Find all step definitions in framework
 * @param {string} folder - path to step definitions
 */

const parseStepDefinitions = (folder) => {
    const workspaceFiles = readWorkspaces({ folder });
    const stepDefinitionLocations = _.flatMap(workspaceFiles, (file) => {
        const AST = parseJS(file);
        if (!AST) {
            return;
        }
        return findCucumberStepDefinitions(AST.program.body).map((step) => {
            const stepValue =
                _.get(step, 'expression.arguments.0.type') === 'TemplateLiteral'
                    ? _.get(
                          step,
                          'expression.arguments.0.quasis.0.value.cooked'
                      )
                    : _.get(step, 'expression.arguments.0.value');
            return {
                [stepValue]: {
                    path: file,
                    loc: step.expression.arguments[0].loc.start
                }
            };
        });
    });

    return stepDefinitionLocations.filter(_.identity);
};

const astLocationInsidePosition = (loc, position) => {
    if (!loc || !position) {
        return;
    }
    // current position after cy.type argument start
    return (
        _.get(loc, 'start.line') <= position.line + 1 &&
        _.get(loc, 'start.column') <= position.character &&
        // current position before cy.type argument end
        _.get(loc, 'start.line') >= position.line + 1 &&
        _.get(loc, 'end.column') >= position.character
    );
};

const astExpressionContainsOffset = (expression, offset) => {
    if (!expression || !offset) {
        return;
    }
    // current offset in range of expression
    return (
        _.get(expression, 'start') <= offset &&
        _.get(expression, 'end') >= offset
    );
};

module.exports = {
    parseJS,
    parseText,
    astLocationInsidePosition,
    astExpressionContainsOffset,
    cypressCommandLocation,
    getCypressAddStatementInFile,
    typeDefinitions,
    parseStepDefinitions,
    findCucumberCustomTypes,
    customCommandsAvailable
};
