const VS = require('./helper/vscodeWrapper');
const vscode = new VS();
const {
    FOCUS_TAG,
    FOCUS_TAG_FORMATTED,
    ONLY_BLOCK,
    message,
    IT,
    SPECIFY,
    SKIP_BLOCK
} = require('./helper/constants');

const setTag = (kind, scenarioIndex, isCucumber) => {
    const editor = vscode.activeTextEditor();

    if (!editor) {
        return;
    }

    !scenarioIndex && vscode.show('err', message.NO_TEST);

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

        const indexOfSpecify = text.indexOf(SPECIFY.BLOCK);

        const testNotFound = [
            ...Object.values(IT),
            ...Object.values(SPECIFY)
        ].every((block) => text.indexOf(block) === -1);

        testNotFound && vscode.show('err', message.NO_TEST);

        const block = indexOfSpecify === -1 ? IT.BLOCK : SPECIFY.BLOCK;

        const newText = text.replace(
            block,
            `${block.slice(0, -1)}${kind === 'skip' ? SKIP_BLOCK : ONLY_BLOCK}(`
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
