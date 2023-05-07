const path = require('path');
const fs = require('fs-extra');
const { TSCONFIG_DEFAULT_DATA, message } = require('./helper/constants');
const { readFilesFromDir } = require('./helper/utils');
const VS = require('./helper/vscodeWrapper');
const vscode = new VS();
const { customCommandsFolder } = vscode.config();

const writeTsConfig = (cwd = vscode.root()) => {
    const cypressRoot = path.join(
        cwd,
        path.normalize(customCommandsFolder.split('cypress')[0]),
        'cypress'
    );
    const tsconfigPath = path.join(cypressRoot, 'tsconfig.json');
    fs.outputFileSync(
        tsconfigPath,
        TSCONFIG_DEFAULT_DATA(_.repeat(' ', vscode.tabConfig('.json'))),
        'utf-8'
    );
    vscode.show('info', message.TSCONFIG_GENERATED);
    vscode.openDocument(tsconfigPath);
};

const checkTsConfigExist = (cwd) => {
    const tsconfig = readFilesFromDir({
        name: 'tsconfig',
        extension: '.json',
        cwd
    });
    return tsconfig.length > 0;
};

const createDefaultTsConfig = (cwd) => {
    const hasConfig = checkTsConfigExist(cwd);
    if (hasConfig) {
        vscode.show('err', message.TSCONFIG_EXIST);
    } else {
        writeTsConfig(cwd);
    }
};

module.exports = {
    checkTsConfigExist,
    writeTsConfig,
    createDefaultTsConfig
};
