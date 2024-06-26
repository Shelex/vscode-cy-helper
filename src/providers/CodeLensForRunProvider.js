const { minimatch } = require('minimatch');
const VS = require('../helper/vscodeWrapper');
const vscode = new VS();
const {
    IT,
    SPECIFY,
    FOCUS_TAG_FORMATTED,
    SCENARIO,
    DESCRIBE_KEYWORD,
    CONTEXT_KEYWORD,
    FEATURE,
    DESCRIBE,
    CONTEXT
} = require('../helper/constants');

const { menuItems, cypressCodeLensePattern } = vscode.config();

class CodeLensForRunProvider {
    provideCodeLenses(document) {
        if (!menuItems.OpenCypress && !menuItems.RunCypress) {
            return;
        }

        if (!minimatch(document.fileName, cypressCodeLensePattern)) {
            return;
        }

        this.codeLenses = [];
        const cucumberPreprocessorUsed = document.languageId === 'feature';

        const texts = document.getText().split('\n');

        const defaultTag = cucumberPreprocessorUsed ? '"@focus"' : '".only"';

        const isTest = (line) => {
            const text = line && line.text && line.text.trim();

            if (!text) {
                return false;
            }

            return [
                FEATURE,
                SCENARIO,
                ...Object.values(DESCRIBE),
                ...Object.values(CONTEXT),
                ...Object.values(IT),
                ...Object.values(SPECIFY)
            ].some((block) => text.startsWith(block));
        };

        return texts
            .map((text, index) => ({ text, index }))
            .filter((line) => isTest(line))
            .reduce((lenses, line) => {
                const { text, index } = line;
                const { range } = document.lineAt(index);

                const usedSkip = (text) =>
                    text &&
                    [IT.SKIP, SPECIFY.SKIP, DESCRIBE.SKIP, CONTEXT.SKIP].some(
                        (block) => text.trim().startsWith(block)
                    );

                const tagToClear = usedSkip(text.trim())
                    ? '".skip"'
                    : defaultTag;

                const usedSkipOrOnly = (text) =>
                    text &&
                    [IT, SPECIFY, CONTEXT, DESCRIBE]
                        .flatMap((entity) => [entity.ONLY, entity.SKIP])
                        .some((block) => text.trim().startsWith(block));

                const isSuiteLine =
                    text &&
                    (text.trim().startsWith(DESCRIBE_KEYWORD) ||
                        text.trim().startsWith(CONTEXT_KEYWORD) ||
                        text.trim().startsWith(FEATURE));

                const useClearTagLense =
                    cucumberPreprocessorUsed && index > 0 && texts[index - 1]
                        ? texts[index - 1]
                              .trim()
                              .startsWith(FOCUS_TAG_FORMATTED)
                        : usedSkipOrOnly(text);

                menuItems.OpenCypress &&
                    isSuiteLine &&
                    lenses.push(
                        vscode.codeLens(range, {
                            title: 'Open Cypress with all specs',
                            tooltip: 'run CypressHelper.commandForOpen command',
                            command: 'cypressHelper.openSpecFile',
                            arguments: ['open-for-all', document.fileName]
                        })
                    );

                menuItems.OpenCypress &&
                    !isSuiteLine &&
                    lenses.push(
                        vscode.codeLens(range, {
                            title: 'Open Cypress',
                            tooltip:
                                'open test file with command configured in CypressHelper.commandForOpen',
                            command: 'cypressHelper.openSpecFile',
                            arguments: ['open', document.fileName]
                        })
                    );

                menuItems.RunCypress &&
                    isSuiteLine &&
                    lenses.push(
                        vscode.codeLens(range, {
                            title: 'Run Cypress with all specs',
                            tooltip: 'run CypressHelper.commandForRun command',
                            command: 'cypressHelper.openSpecFile',
                            arguments: ['run-for-all', document.fileName]
                        })
                    );

                menuItems.RunCypress &&
                    !isSuiteLine &&
                    lenses.push(
                        vscode.codeLens(range, {
                            title: 'Run Cypress',
                            tooltip:
                                'run test file with command configured in CypressHelper.commandForRun',
                            command: 'cypressHelper.openSpecFile',
                            arguments: ['run', document.fileName]
                        })
                    );
                if (useClearTagLense) {
                    lenses.push(
                        vscode.codeLens(range, {
                            title: `Clear ${tagToClear}`,
                            tooltip: `clear ${tagToClear}`,
                            command: 'cypressHelper.clearTag',
                            arguments: [index, cucumberPreprocessorUsed]
                        })
                    );
                }

                ['only', 'skip'].forEach((tagKind) => {
                    const isSkip = tagKind === 'skip';
                    const configName = isSkip ? 'ItSkip' : 'ItOnly';

                    if (isSkip && cucumberPreprocessorUsed) {
                        return;
                    }

                    if (!menuItems[configName] || useClearTagLense) {
                        return;
                    }

                    const tag = isSkip ? '".skip"' : defaultTag;

                    lenses.push(
                        vscode.codeLens(range, {
                            title: `Set ${tag}`,
                            tooltip: `set ${tag}`,
                            command: 'cypressHelper.setTag',
                            arguments: [
                                tagKind,
                                index,
                                cucumberPreprocessorUsed
                            ]
                        })
                    );
                });
                return lenses;
            }, []);
    }
}

module.exports = CodeLensForRunProvider;
