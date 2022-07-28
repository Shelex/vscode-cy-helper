const _ = require('lodash');
const path = require('path');
const Gherkin = require('gherkin');
const GherkinParser = new Gherkin.Parser();
const { parseStepDefinitions, findCucumberCustomTypes } = require('./AST');
const { readFile, readWorkspaces } = require('../helper/utils');

/**
 *  Find where cucumber step definitions are stored
 *  by checking package.json for configuration
 */
const getCucumberStepsPath = () => {
    const packages = readWorkspaces({ name: 'package', extension: '.json' });

    if (!packages || !packages.length) {
        return;
    }

    const package = packages.find((package) => {
        const content = JSON.parse(readFile(package) || '{}');
        return content['cypress-cucumber-preprocessor'];
    });

    if (!package) {
        return;
    }

    const cucumberConfig = JSON.parse(readFile(package));

    const cucumberPath = _.get(cucumberConfig, 'nonGlobalStepDefinitions')
        ? 'cypress'
        : _.get(cucumberConfig, 'step_definitions') ||
          path.join('cypress', 'support', 'step_definitions');
    return path.normalize(cucumberPath);
};

const cucumberTypes = [
    {
        name: 'string',
        pattern: '(\\".*\\"|\\\'.*\\\')'
    },
    {
        name: 'word',
        pattern: '[^\\s]+'
    },
    {
        name: 'int',
        pattern: '\\d+'
    },
    {
        name: 'float',
        pattern: '(?=.*d.*)[-+]?d*(?:.(?=d.*))?d*(?:d+[E][+-]?d+)?'
    }
];

const customTypes = () => findCucumberCustomTypes(getCucumberStepsPath());

const allTypes = () => [...cucumberTypes, ...customTypes()];

const getCucumberTypeMatchers = () =>
    allTypes().map(({ name, pattern }) => {
        return {
            name: name,
            pattern: pattern,
            replace: new RegExp(`{${name}}`, 'g')
        };
    });

const PARAMETER = '<.*>';

const PATTERN = (type) => {
    return `(${type}|${PARAMETER})`;
};

/**
 * Replace step definition placeholders with types regexp
 * @param {string} literal
 */
const prepareRegexpForLiteral = (literal, matchers) => {
    let basicTypesLiteral = `^${literal.replace(/\//g, '|')}$`;

    matchers.forEach(({ pattern, replace }) => {
        basicTypesLiteral = basicTypesLiteral.replace(
            replace,
            PATTERN(pattern)
        );
    });

    return new RegExp(basicTypesLiteral, 'g') || null;
};

/**
 * Read all feature files and return where steps used
 */
const parseFeatures = () =>
    _.flatMap(
        readWorkspaces({
            extension: '.feature'
        }),
        (file) => {
            const { feature } = GherkinParser.parse(readFile(file));
            return _.flatMap(feature.children, (child) =>
                child.steps.map((step) => ({
                    step: step.text.replace(/\\/g, ''),
                    loc: step.location,
                    path: file
                }))
            );
        }
    ).filter(_.identity);

/**
 * try parsing step definition and return regexp or null
 * @param {string} literal
 */
const parseRegexp = (literal) => {
    if (literal.startsWith('/') && literal.endsWith('/')) {
        const pureString = literal.replace(/\//g, '');
        try {
            return new RegExp(pureString);
        } catch (e) {
            //swallow this exception, return nothing later
        }
    }
    return null;
};

/**
 * check where step definitions are used
 * @param {*[]} features - feature files
 * @param {*[]} stepDefinitions - step definitions
 */
const calculateUsage = (features, stepDefinitions) => {
    const cucumberTypeMatchers = getCucumberTypeMatchers();
    return stepDefinitions.map((step) => {
        const literal = Object.keys(step)[0];
        const { path, loc } = step[literal];

        const hasNoTypes = !literal.includes('{') && !literal.includes('}');
        const isStepRegexp = parseRegexp(literal);
        const literalRegexp =
            isStepRegexp ||
            prepareRegexpForLiteral(literal, cucumberTypeMatchers);

        const usage =
            hasNoTypes && !isStepRegexp
                ? features.filter((s) => s.step === literal)
                : features.filter((s) => literalRegexp.exec(s.step) !== null);

        const matches = usage.length;

        return {
            step: literal,
            matches: matches,
            usage: usage,
            path: path,
            loc: loc
        };
    });
};

/**
 * -  parse step definitions
 * -  parse feature files
 * -  compare and return usage array
 */
const composeUsageReport = () => {
    const stepDefinitionsParsed = parseStepDefinitions(getCucumberStepsPath());
    const stepsFromFeatures = parseFeatures();
    return calculateUsage(stepsFromFeatures, stepDefinitionsParsed);
};

module.exports = {
    getCucumberStepsPath,
    composeUsageReport,
    parseFeatures,
    calculateUsage
};
