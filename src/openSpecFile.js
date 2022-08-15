const path = require('path');
const VS = require('./helper/vscodeWrapper');
const vscode = new VS();
const { fileExist, readFile, readFilesFromDir } = require('./helper/utils');
const { getTerminal } = require('./helper/terminal');
const { commandForOpen, commandForRun } = vscode.config();

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const removeSpaces = (s) => s.replace(/\s/, '\\ ');

const findClosestPackageFolder = (absolutePath) => {
    const cwd = path.dirname(absolutePath);
    return fileExist(path.join(cwd, 'package.json'))
        ? cwd
        : findClosestPackageFolder(cwd);
};

const relativeRootPackage = (absolutePath) => {
    const closestRoot = findClosestPackageFolder(absolutePath);
    return {
        root: closestRoot,
        relativePath: path.relative(closestRoot, absolutePath)
    };
};

exports.openSpecFile = (type, filename) => {
    const pathWithoutSpaces = removeSpaces(filename);

    const absolutePath = pathWithoutSpaces.match(/^[a-z]:\//)
        ? capitalize(pathWithoutSpaces)
        : pathWithoutSpaces;

    const { root, relativePath } = relativeRootPackage(pathWithoutSpaces);

    const terminal = getTerminal(root);
    terminal.show();
    const commandArguments =
        commandForOpen.includes('--e2e') ||
        isCypressV10(vscode.root(absolutePath))
            ? `--config specPattern="${absolutePath}"`
            : `--config testFiles="${absolutePath}"`;

    const exec =
        type === 'run'
            ? { command: commandForRun, arg: `--spec "${relativePath}"` }
            : type === 'open-for-all'
            ? {
                  command: commandForOpen,
                  arg: ''
              }
            : {
                  command: commandForOpen,
                  arg: commandArguments
              };
    terminal.sendText(`${exec.command} ${exec.arg}`);
};

const isCypressV10 = (cwd) => {
    const packageFiles = readFilesFromDir({
        cwd,
        name: 'package',
        extension: '.json'
    });

    if (!packageFiles.length) {
        return;
    }

    const packageFile = packageFiles.shift();

    if (!packageFile) {
        return;
    }

    try {
        const package = JSON.parse(readFile(packageFile));

        const versionString =
            package.dependencies.cypress || package.devDependencies.cypress;

        const version = versionString.match(/[\d\.]+/).shift();

        const majorVersion = version.split('.').shift();

        if (majorVersion >= 10) {
            return true;
        }
    } catch (e) {
        return false;
    }
};
