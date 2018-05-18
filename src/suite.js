/* @flow */
import Table from 'cli-table';
import prettyMs from 'pretty-ms';
import {
    runScenario,
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
    suite: ScenarioInput,
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
function printSuiteResult(result: SuiteResult, previous: SuiteResult) {
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

        const line = [
            scenario.name,
            `${scenario.executions} executions`,
            `${duration} (±${scenario.error.toFixed(2)}%)`
        ];

        if (previousScenario) {
            const difference =
                (previousScenario.time - scenario.time) *
                100 /
                previousScenario.time;

            line.push(`${difference.toFixed(0)}%`);
        }

        table.push(line);
    });

    process.stdout.write(`${result.name}\n`);
    process.stdout.write(table.toString());
    process.stdout.write('\n');
}

export { runSuite, printSuiteResult };
