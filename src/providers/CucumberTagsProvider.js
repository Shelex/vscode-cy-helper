const VS = require('../helper/vscodeWrapper');
const vscode = new VS();
const { allureLabels } = require('../helper/constants');
const { cucumberTagsAutocomplete } = vscode.config();
const { enable, allurePlugin, tags } = cucumberTagsAutocomplete;

const prepareSnippetsForLabel = (label) => {
    const documentation = {
        tms: {
            docs: 'Insert test id',
            updatedLabel: `tms(id)`
        },
        issue: {
            docs: 'Insert issue id',
            updatedLabel: `issue(id)`
        },
        link: {
            docs: 'Insert link url',
            updatedLabel: `link(url)`
        },
        default: {
            docs: 'Insert value',
            updatedLabel: label
        }
    };

    const snippet = documentation[label] || documentation.default;

    const snippets = [
        {
            label: snippet.updatedLabel,
            docs: snippet.docs,
            text: `${label}("\${1:value}")`
        }
    ];

    if (['tms', 'issue', 'link'].includes(label)) {
        const doubleArgumentDocs = {
            tms: 'Insert display name and test id',
            issue: 'Insert display name and issue id',
            link: 'Insert display name and url'
        };

        const updatedLabel = {
            tms: `tms(name,id)`,
            issue: `issue(name,id)`,
            link: `link(name,url)`
        };

        snippets.push({
            label: updatedLabel[label],
            docs: doubleArgumentDocs[label],
            text: `${label}("\${1:name}","\${2:url}")`
        });
    }

    return snippets;
};

class CucumberTagsProvider {
    provideCompletionItems() {
        // break if fixture autocomplete is not needed
        if (!enable) {
            return;
        }
        // prepare completions list
        const completions = tags.map((tag) => ({
            label: tag,
            // type of completion is enum
            kind: 12,
            insertText: tag
        }));

        allurePlugin &&
            allureLabels.forEach((label) => {
                const snippets = prepareSnippetsForLabel(label);

                snippets.forEach((snippet) => {
                    completions.push({
                        label: snippet.label,
                        // type of completion is function
                        documentation: snippet.docs,
                        kind: 2,
                        insertText: vscode.SnippetString(snippet.text)
                    });
                });
            });
        return {
            items: completions
        };
    }
}

module.exports = CucumberTagsProvider;
