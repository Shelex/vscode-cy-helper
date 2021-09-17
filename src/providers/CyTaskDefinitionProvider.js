const _ = require('lodash');
const path = require('path');
const traverse = require('@babel/traverse');
const VS = require('../helper/vscodeWrapper');
const vscode = new VS();
const { readFilesFromDir, readFile } = require('../helper/utils');
const { parseText, astExpressionContainsOffset } = require('../parser/AST');

const root = vscode.root();

const getTaskName = (documentContent, offset) => {
    const AST = parseText(documentContent);

    if (!AST) {
        return;
    }
    let taskName;

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
                taskName = _.get(path, 'node.expression.arguments.0.value');
            }
        }
    });
    return taskName;
};

const getCyTaskAstNodes = (fileName) => {
    const fileContent = readFile(fileName);
    const AST = parseText(fileContent);

    if (!AST) {
        return;
    }
    const tasks = [];

    traverse.default(AST, {
        enter(path) {
            // should check if current location is in cy.task
            if (
                _.get(path, 'node.expression.callee.name') === 'on' &&
                _.get(path, 'node.expression.arguments.0.value') === 'task' &&
                _.get(path, 'node.expression.arguments.1.type') ===
                    'ObjectExpression'
            ) {
                const properties = _.get(
                    path,
                    'node.expression.arguments.1.properties'
                );

                tasks.push(
                    ...properties.map((prop) => {
                        prop.path = fileName;
                        return prop;
                    })
                );
            }
        }
    });
    return tasks;
};

const getTasksFromPlugins = () => {
    const pluginsPath = path.join(root, 'cypress', 'plugins');

    const pluginsFiles = readFilesFromDir(pluginsPath);

    if (!pluginsFiles.length) {
        return;
    }

    const nodes = pluginsFiles.flatMap((file) => getCyTaskAstNodes(file));

    return nodes;
};

class CyTaskDefinitionProvider {
    provideDefinition(document, position) {
        const taskName = getTaskName(
            document.getText(),
            document.offsetAt(position)
        );

        if (!taskName) {
            return;
        }

        const taskSource = getTasksFromPlugins().find(
            (node) =>
                _.get(node, 'key.value') === taskName ||
                _.get(node, 'key.name') === taskName
        );

        if (!taskSource) {
            return;
        }

        const { start, end } = taskSource.loc;

        const targetRange = vscode.Range(
            vscode.Position(start.line - 1, start.column),
            vscode.Position(end.line - 1, end.column)
        );
        return vscode.location(vscode.parseUri(taskSource.path), targetRange);
    }
}

module.exports = {
    CyTaskDefinitionProvider,
    getTasksFromPlugins
};
