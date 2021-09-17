const _ = require('lodash');
const traverse = require('@babel/traverse');
const { parseText, astExpressionContainsOffset } = require('../parser/AST');
const { getTasksFromPlugins } = require('./CyTaskDefinitionProvider');

const shouldHaveTaskAutocomplete = (documentContent, offset) => {
    const AST = parseText(documentContent);

    if (!AST) {
        return;
    }
    let insideCyTask = false;

    traverse.default(AST, {
        enter(path) {
            // should check if current location is in cy.task
            if (
                _.get(path, 'node.expression.callee.type') ===
                    'MemberExpression' &&
                _.get(path, 'node.expression.callee.property.name') ===
                    'task' &&
                astExpressionContainsOffset(
                    _.get(path, 'node.expression.arguments.0'),
                    offset
                )
            ) {
                insideCyTask = true;
            }
        }
    });
    return insideCyTask;
};

class CyTaskCompletionProvider {
    provideCompletionItems(document, position) {
        if (
            !shouldHaveTaskAutocomplete(
                document.getText(),
                document.offsetAt(position)
            )
        ) {
            return;
        }

        const taskNames = getTasksFromPlugins()
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

module.exports = CyTaskCompletionProvider;
