const _ = require('lodash');
const traverse = require('@babel/traverse');
const VS = require('../helper/vscodeWrapper');
const vscode = new VS();
const { parseText, astExpressionContainsOffset } = require('../parser/AST');
const { getRegisteredTasks } = require('./CyTaskDefinitionProvider');

const shouldHaveCommandAutocomplete = (
    commandNames,
    documentContent,
    offset
) => {
    const AST = parseText(documentContent);

    if (!AST) {
        return;
    }
    let insideCyCommand = false;

    traverse.default(AST, {
        enter(path) {
            // should check if current location is in cy.task
            if (
                _.get(path, 'node.expression.callee.type') ===
                    'MemberExpression' &&
                commandNames.some(
                    (commandName) =>
                        _.get(path, 'node.expression.callee.property.name') ===
                        commandName
                ) &&
                astExpressionContainsOffset(
                    _.get(path, 'node.expression.arguments.0') ||
                        _.get(path, 'node.expression'),
                    offset
                )
            ) {
                insideCyCommand = true;
            }
        }
    });
    return insideCyCommand;
};

class CyTaskCompletionProvider {
    provideCompletionItems(document, position) {
        if (
            !shouldHaveCommandAutocomplete(
                ['task'],
                document.getText(),
                document.offsetAt(position)
            )
        ) {
            return;
        }

        const tasks = getRegisteredTasks(vscode.root(document));

        if (!tasks || !tasks.length) {
            return;
        }

        const taskNames = tasks
            .map((node) =>
                _.get(node, 'key.type') === 'StringLiteral'
                    ? _.get(node, 'key.value')
                    : _.get(node, 'key.name')
            )
            .filter(_.identity);

        const completions = taskNames.map((name) => ({
            label: name,
            // type of completion is Variable
            kind: 11
        }));
        return {
            items: completions
        };
    }
}

module.exports = {
    CyTaskCompletionProvider,
    shouldHaveCommandAutocomplete
};
