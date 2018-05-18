/* @flow */
import Table from 'cli-table';
import prettyMs from 'pretty-ms';
import cliColor from 'cli-color';
import {
    runScenario,
    compareScenarioResults,
    type ScenarioInput,
    type ScenarioResult,
    type ScenarioOptions
} from './scenario';

export type SuiteInput = {
    name: string,
    scenarios: ScenarioInput[]
};

export type SuiteResult = {
    name: string,
    scenarios: ScenarioResult[]
};

/*
 * Execute a suite of scenario.
 */
async function runSuite(
    suite: SuiteInput,
    options: ScenarioOptions
): Promise<SuiteResult> {
    const scenarios = await suite.scenarios.reduce(async (prev, scenario) => {
        const result = await prev;
        return result.concat([await runScenario(scenario, options)]);
    }, []);

    return {
        name: suite.name,
        scenarios
    };
}

/*
 * Print result for a suite.
 */
function printSuiteResult(result: SuiteResult, previous: ?SuiteResult) {
    const table = new Table({
        chars: {
            mid: '',
            'left-mid': '',
            'mid-mid': '',
            'right-mid': ''
        }
    });

    result.scenarios.forEach(scenario => {
        const previousScenario = previous
            ? previous.scenarios.find(prev => prev.name == scenario.name)
            : null;
        const duration = prettyMs(scenario.time / 1000000, {
            msDecimalDigits: 2
        });

        const difference =  previousScenario ? compareScenarioResults(scenario, previousScenario) : 0;

        const line = [
            difference >= 0 ? cliColor.green('✔') : cliColor.red('✖'),
            scenario.name,
            `${duration} (±${scenario.error.toFixed(2)}%, ⨉${scenario.executions})`
        ];

        if (previousScenario) {
            if (difference == 0) {
                line.push('-');
            }

            line.push(`${difference.toFixed(0)}%`);
        }

        table.push(line);
    });

    process.stdout.write(`${result.name}\n`);
    process.stdout.write(table.toString());
    process.stdout.write('\n');
}

export { runSuite, printSuiteResult };
