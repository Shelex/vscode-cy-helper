const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const glob = require('fast-glob');
const VS = require('./vscodeWrapper');
const vscode = new VS();

const cypressExists = (cwd) => {
    const cypressFolder = glob
        .sync(`**/cypress`, {
            onlyDirectories: true,
            cwd: cwd,
            suppressErrors: true,
            absolute: true,
            ignore: '**/node_modules/**'
        })
        .shift();

    if (!cypressFolder) {
        return;
    }

    const relativeToCwdCRoot = path.normalize(path.join(cypressFolder, '..'));
    return relativeToCwdCRoot;
};

const readWorkspaces = (opts) => {
    const files = [];

    for (const workspace of vscode.workspaces()) {
        if (!cypressExists(workspace)) {
            return;
        }

        opts = _.defaults(opts, {
            cwd: workspace
        });

        const workspaceFiles = readFilesFromDir(opts);

        files.push(...workspaceFiles);
    }

    return files;
};

/**
 * Read files recursively from directory
 * @param {object} opts
 * @param {string} opts.folder
 * @param {string} opts.cwd
 * @param {string} opts.name
 * @param {object} opts.extension
 */
const readFilesFromDir = (opts) => {
    opts = _.defaults(opts, {
        name: '',
        extension: '.[j|t]s',
        cwd: vscode.root()
    });

    if (!cypressExists(opts.cwd)) {
        return [];
    }

    try {
        const filePattern = `**/${opts.name || '*'}${opts.extension || ''}`;

        const folder =
            opts.folder && path.normalize(opts.folder).replace(/\\/g, '/');

        const pattern = folder ? `${folder}/${filePattern}` : filePattern;

        const files = glob.sync(pattern, {
            onlyFiles: true,
            absolute: true,
            suppressErrors: true,
            ignore: '**/node_modules/**',
            cwd: opts.cwd
        });
        return files.filter((f) => f.includes('.'));
    } catch (er) {
        vscode.show('error', er.message);
        return [];
    }
};

/**
 * Check if given path existing
 * @param {string} filepath
 */
const fileExist = (filepath) => fs.pathExistsSync(filepath);

/**
 * Read file content
 * @param {string} filepath
 */
const readFile = (filepath) =>
    (fs.pathExistsSync(path.resolve(filepath)) &&
        fs.readFileSync(path.resolve(filepath), 'utf-8')) ||
    null;

/**
 * write object to json file
 * @param {object} obj - object that would be converted to json
 * @param {string} path - fs path to write file
 */
const writeJsonFile = (obj, path) => {
    fs.writeJsonSync(path, obj, { spaces: 4 });
};

/**
 * Prompts user to reload editor window in order for configuration change to take effect.
 */
function promptToReloadWindow(event) {
    const shouldReload = event.affectsConfiguration('cypressHelper');

    if (!shouldReload) {
        return;
    }

    const action = 'Reload';
    vscode
        .show(
            'info',
            `Please reload window in order for changes in extension "Cypress Helper" configuration to take effect.`,
            false,
            action
        )
        .then((selectedAction) => {
            if (selectedAction === action) {
                vscode.execute('workbench.action.reloadWindow');
            }
        });
}

module.exports = {
    readWorkspaces,
    readFilesFromDir,
    readFile,
    fileExist,
    writeJsonFile,
    promptToReloadWindow
};
