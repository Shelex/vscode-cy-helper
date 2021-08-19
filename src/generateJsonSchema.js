const path = require('path');
const { createSchema } = require('genson-js');
const { readFile, writeJsonFile } = require('./helper/utils');
const VS = require('./helper/vscodeWrapper');
const vscode = new VS();

exports.generateJsonSchema = (file) => {
    const fileContent = readFile(file.fsPath);

    const fileName = path.basename(file.fsPath, '.json');

    const directory = path.dirname(file.fsPath);

    let inputJson;

    try {
        inputJson = JSON.parse(fileContent);
    } catch (e) {
        vscode.show('error', `failed to read json: ${e}`);
    }

    const schema = createSchema(inputJson);

    const schemaPath = path.join(directory, `${fileName}Schema.json`);

    writeJsonFile(
        {
            title: fileName,
            ...schema
        },
        schemaPath
    );
};
