const VS = require('./helper/vscodeWrapper');
const vscode = new VS();
const { typeDefinitionOnSave } = vscode.config();
const { getCypressAddStatementInFile } = require('./parser/AST');

exports.regenerateTypes = (document) => {
    if (!typeDefinitionOnSave) {
        return;
    }

    if (
        document.languageId !== 'javascript' &&
        document.languageId !== 'typescript'
    ) {
        return;
    }

    try {
        const command = getCypressAddStatementInFile(document.fileName);
        if (!command) {
            return;
        }
        vscode.execute(
            'cypressHelper.generateCustomCommandTypes',
            document,
            true
        );
    } catch (e) {}
};
