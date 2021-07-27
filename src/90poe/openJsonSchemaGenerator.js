const { getTerminal } = require('../helper/terminal');

/**
 * 90poe internal command
 * to execute json schema generator binary
 * but could be used with https://github.com/Shelex/json-schema-gen
 */
exports.openJsonSchemaGenerator = (file) => {
    const terminal = getTerminal();
    terminal.show();
    terminal.sendText(
        `cypress/scripts/qa-json-schema-generator -fixture ${file.fsPath}`
    );
};
