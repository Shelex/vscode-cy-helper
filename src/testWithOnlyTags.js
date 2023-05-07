const VS = require('./helper/vscodeWrapper');
const vscode = new VS();
const {
    FOCUS_TAG,
    FOCUS_TAG_FORMATTED,
    ONLY_BLOCK,
    message,
    IT,
    SPECIFY,
    SKIP_BLOCK,
    DESCRIBE,
    CONTEXT
} = require('./helper/constants');

const setTag = (kind, scenarioIndex, isCucumber) => {
    const editor = vscode.activeTextEditor();

    if (!editor) {
        return;
    }

    if (isCucumber) {
        // for gherkin set tag @focus on previous line to execute one test
        const { text: previousLineText } = editor.document.lineAt(
            scenarioIndex - 1
        );
        if (!previousLineText.includes(FOCUS_TAG)) {
            vscode.editDocument(
                vscode.Position(scenarioIndex - 1, 0),
                FOCUS_TAG
            );
        }
    } else {
        // for javascript mocha syntax it.only() is required
        const { text, range } = editor.document.lineAt(scenarioIndex);

        const testNotFound = [
            ...Object.values(IT),
            ...Object.values(DESCRIBE),
            ...Object.values(SPECIFY),
            ...Object.values(CONTEXT)
        ].every((block) => text.indexOf(block) === -1);

        testNotFound && vscode.show('err', message.NO_TEST);

        const entity = [SPECIFY, DESCRIBE, IT, CONTEXT].find(
            (block) => text.indexOf(block.BLOCK) !== -1
        );

        const newText = text.replace(
            entity.BLOCK,
            `${entity.BLOCK.slice(0, -1)}${
                kind === 'skip' ? SKIP_BLOCK : ONLY_BLOCK
            }(`
        );
        vscode.editDocument(range, newText);
    }
};

const clearTag = (scenarioIndex, isCucumber) => {
    const editor = vscode.activeTextEditor();

    if (!editor) {
        return;
    }

    const { text, range } = editor.document.lineAt(
        isCucumber ? scenarioIndex - 1 : scenarioIndex
    );

    const newText = text
        .replace(FOCUS_TAG, '')
        .replace(FOCUS_TAG_FORMATTED, '')
        .replace(ONLY_BLOCK, '')
        .replace(SKIP_BLOCK, '');
    newText.trim() === ''
        ? vscode.editDocument(
              vscode.Range(vscode.Position(range.start.line, 0), range.end),
              ''
          )
        : vscode.editDocument(range, newText);
};

module.exports = {
    setTag,
    clearTag
};
