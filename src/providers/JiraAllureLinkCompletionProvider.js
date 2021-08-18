const _ = require('lodash');
const axios = require('axios').default;
const { stringSimilarity } = require('string-similarity-js');
const Gherkin = require('gherkin');
const GherkinParser = new Gherkin.Parser();
const VS = require('../helper/vscodeWrapper');
const vscode = new VS();
const { jiraAllureAutocomplete } = vscode.config();
const { enable, atlassianApiKey, jiraHost, atlassianUsername } =
    jiraAllureAutocomplete;

// used for caching test cases for specified project
class JiraStorage {
    constructor() {
        this.data = new Map();
    }

    get(project, type) {
        return new Promise((resolve) => {
            const key = `${project}:${type}`;
            resolve(
                this.data.has(key)
                    ? this.data.get(key)
                    : this.updateCache(project, type)
            );
        });
    }

    async updateCache(project, type) {
        const cases = await getAllTestCases(project, type);

        if (cases.length) {
            const key = `${project}:${type}`;
            this.data.set(key, cases);
            return this.data.get(key);
        }

        return [];
    }
}

const ticketStorage = new JiraStorage();

const jiraQuery = (project, type, offset = 0) =>
    `${jiraHost}/rest/api/3/search?jql=project = ${project} AND type = ${type}&startAt=${offset}`;

const getTestCases = async (project, type, offset) => {
    if (atlassianApiKey === '' || jiraHost === '' || atlassianUsername === '') {
        return;
    }

    const query = jiraQuery(project, type, offset);

    const token = Buffer.from(
        `${atlassianUsername}:${atlassianApiKey}`
    ).toString('base64');

    const response = await axios.get(query, {
        headers: {
            Authorization: `Basic ${token}`
        }
    });

    return response;
};

const getAllTestCases = (project, type) => {
    const testCases = [];
    let offset = 0;
    let total = 0;

    return vscode._window
        .withProgress(
            {
                location: 15, // notification
                title: `Reading ${
                    type === 'Test' ? 'XRay test cases' : 'Jira issues'
                } for project "${project}"\n`,
                cancellable: true
            },
            async function (progress, token) {
                token.onCancellationRequested(() => {
                    // eslint-disable-next-line no-console
                    console.log('User canceled the long running operation');
                });

                progress.report({ increment: 0 });

                while (offset < total || total === 0) {
                    const cases = await getTestCases(project, type, offset);
                    // eslint-disable-next-line prefer-destructuring
                    total = cases.data.total;
                    offset += cases.data.maxResults;
                    testCases.push(
                        ...cases.data.issues.map((issue) => ({
                            key: issue.key,
                            summary: issue.fields.summary
                        }))
                    );
                    progress.report({
                        increment: (cases.data.maxResults / total) * 100,
                        message: `${testCases.length}/${total}`
                    });
                }
            }
        )
        .then(() => {
            return testCases;
        });
};

class XrayIdCompletionProvider {
    async provideCompletionItems(document, position, _token, context) {
        if (context.triggerCharacter !== '-' || !enable) {
            return;
        }

        const cucumberPreprocessorUsed = document.languageId === 'feature';

        if (!cucumberPreprocessorUsed) {
            return;
        }

        const start = vscode.Position(position.line, 0);
        const range = vscode.Range(start, position);
        const text = document.getText(range);

        // example: ACC-, ABCD-, ABCDE-
        const pattern = /([A-Z]{3,5}-)/;

        const xrayId = text.match(pattern).pop();
        const projectId = xrayId.split('-').shift();

        // allow this autocomplete just for allure tms link tag
        if (
            (!text.includes('@tms') && !text.includes('@issue')) ||
            !projectId.length
        ) {
            return;
        }

        const type = text.includes('@tms') ? 'Test' : 'Bug';

        const testCases = await ticketStorage.get(projectId, type);

        if (!testCases.length) {
            return;
        }

        const content = document.getText();
        const gherkin = GherkinParser.parse(content);

        // don't allow test case on feature level
        if (position.line <= gherkin.feature.location.line) {
            return;
        }

        const scenarios = gherkin.feature.children.filter((child) =>
            child.keyword.includes('Scenario')
        );

        const scenario = scenarios
            .map((test, index, tests) => {
                const previousTest = index > 0 ? tests[index - 1] : null;
                return {
                    ...test,
                    start: test.location.line,
                    previousEnd: previousTest
                        ? _.get(previousTest, 'examples')
                            ? _.last(_.last(previousTest.examples).tableBody)
                                  .location.line
                            : _.last(previousTest.steps).location.line
                        : 0
                };
            })
            // find test belonging to position between previous test and next test
            .find(
                (matchingTest) =>
                    matchingTest.previousEnd <= position.line + 1 &&
                    position.line + 1 <= matchingTest.start
            );

        const charactersComparison = scenario.name.length < 10 ? 1 : 2;

        const comparison = testCases.map((testCase) => ({
            similarity: (
                stringSimilarity(
                    scenario.name,
                    testCase.summary,
                    charactersComparison
                ) * 100
            ).toFixed(2),
            testCase: testCase.summary,
            id: testCase.key
        }));
        const matches = comparison
            .filter((item) => item.similarity > 0)
            .sort((a, b) => b.similarity - a.similarity);
        return {
            items: matches.map((match, index) => ({
                label: `${match.id} | ${match.testCase}`,
                // insert just numeric id
                insertText: match.id.replace(`${projectId}-`, ''),
                // reverse sorting order as we need to sort by descending numbers
                sortText: `${100 - match.similarity}`,
                // always preselect first match
                preselect: index === 0,
                detail: `title: ${match.testCase}\nsimilarity: ${match.similarity}%
                    `,
                kind: 12
            }))
        };
    }
}

module.exports = XrayIdCompletionProvider;
