const path = require('path');
const _ = require('lodash');
const VS = require('./helper/vscodeWrapper');
const vscode = new VS();
const { typeDefinitions } = require('./parser/AST');
const {
    readFile,
    readWorkspaces,
    readFilesFromDir
} = require('./helper/utils');
const { message, regexp } = require('./helper/constants');
const { detectCustomCommand } = require('./openCustomCommand');
const { customCommandsFolder } = vscode.config();

const findCustomCommands = (workspaceFiles) => {
    const { commandsFound } = typeDefinitions(workspaceFiles, [], {
        includeLocationData: true
    });
    return commandsFound.map((found) => {
        const { path, loc } = commandsFound.find(
            (command) => command.name === found.name
        );
        return {
            name: found.name,
            path: path,
            loc: loc
        };
    });
};

const findUnusedCustomCommands = () => {
    const workspaceFiles = readWorkspaces();
    let uniqueCommands = findCustomCommands(workspaceFiles);

    for (const file of workspaceFiles) {
        const content = readFile(file) || '';
        uniqueCommands = uniqueCommands.filter(
            (command) =>
                new RegExp(`\\.${command.name}\\(`, 'g').exec(content) === null
        );
    }

    vscode.showQuickPickMenu(uniqueCommands, {
        mapperFunction: (c) => {
            const fileRelativePath = c.path.replace(
                `${customCommandsFolder}${path.sep}`,
                ''
            );
            return {
                label: c.name,
                detail: `${fileRelativePath}:${c.loc.start.line}`,
                data: c
            };
        },
        header: message.UNUSED_COMMANDS_FOUND(uniqueCommands.length),
        notFoundMessage: message.UNUSED_COMMANDS_NOT_FOUND
    });
};

/**
 * Detect custom command references
 * returns command name and references array
 */
const customCommandReferences = (cwd) => {
    const { commandName: command, err } = detectCustomCommand();
    if (err) {
        vscode.show('err', message.NO_COMMAND_DETECTED(err));
        return;
    }

    if (!command) {
        return;
    }

    const commandName = command.replace(regexp.QUOTES, '');
    const commandPattern = new RegExp(`\\.${commandName}\\(`, 'g');
    const workspaceFiles = readFilesFromDir({ cwd });

    const references = _.flatMap(workspaceFiles, (file) => {
        const content = readFile(file) || '';
        return content.split('\n').map((row, index) => {
            const hasCommand = commandPattern.exec(row);
            if (!hasCommand) {
                return;
            }
            const column = row.indexOf(commandName);
            return {
                path: file,
                loc: {
                    start: {
                        line: index + 1,
                        column: column
                    }
                }
            };
        });
    }).filter(_.identity);

    return {
        commandName: commandName,
        references: references
    };
};

const showCustomCommandReferences = (document) => {
    const cwd = vscode.root(document);
    if (!cwd) {
        return;
    }
    const usage = customCommandReferences(cwd);

    if (!usage) {
        vscode.show('err', message.REFERENCE_NOT_FOUND());
        return;
    }

    const { commandName, references } = usage;
    vscode.showQuickPickMenu(references, {
        mapperFunction: (c) => {
            return {
                label: `${c.path.replace(cwd, '')}:${c.loc.start.line}`,
                data: c
            };
        },
        header: message.REFERENCE_COMMAND_FOUND(references.length, commandName),
        notFoundMessage: message.REFERENCE_NOT_FOUND(commandName)
    });
};

module.exports = {
    findUnusedCustomCommands,
    showCustomCommandReferences,
    customCommandReferences
};
