const { shouldHaveCommandAutocomplete } = require('./CyTaskCompletionProvider');
const { traverseForAlias } = require('./AliasDefinitionProvider');

class AliasCompletionProvider {
    provideCompletionItems(document, position) {
        if (
            !shouldHaveCommandAutocomplete(
                'get',
                document.getText(),
                document.offsetAt(position)
            )
        ) {
            return;
        }

        // look for aliases
        const aliases = traverseForAlias(document);
        if (!aliases || !aliases.length) {
            return;
        }
        // prepare completions list
        const completions = aliases.map((a) => ({
            label: `@${a.name}`,
            // type of completion is Variable
            kind: 11
        }));
        if (!completions.length) {
            return;
        }
        return {
            items: completions
        };
    }
}

module.exports = AliasCompletionProvider;
