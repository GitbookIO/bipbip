/* @flow */
import Table from 'cli-table';
import prettyMs from 'pretty-ms';
import colors from 'cli-color';
import {
    runScenario,
    compareScenarioResults,
    type ScenarioInput,
    type ScenarioResult,
    type ScenarioOptions
} from './scenario';

import type { SuiteResult } from './suite';

/*
 * Print results for a benchmark.
 */
function reportResults(result: BenchmarkResult, previous: ?BenchmarkResult) {
    result.suites.forEach(suite => {
        const previousSuite = previous
            ? previous.suites.find(prev => prev.name == suite.name)
            : null;

        reportSuiteResult(suite, previousSuite);
        process.stdout.write('\n');
    });
}

/*
 * Print result for a suite.
 */
function reportSuiteResult(result: SuiteResult, previous: ?SuiteResult) {
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
            getDifferenceIcon(difference),
            scenario.name,
            `${duration} (±${scenario.error.toFixed(2)}%, ⨉${scenario.executions})`
        ];

        if (previousScenario) {
            if (difference == 0) {
                line.push('-');
            }

            line.push((difference > 0 ? colors.green : colors.red)(`${difference.toFixed(0)}%`));
        }

        table.push(line);
    });

    process.stdout.write(`${result.name}\n`);
    process.stdout.write(table.toString());
    process.stdout.write('\n');
}

/*
 * Get a visual indicator for a difference between two results.
 */
function getDifferenceIcon(difference: number): string {
    if (difference > 0) {
        return colors.green('✔');
    } else if (difference < 0) {
        return colors.red('✖');
    }

    return '✔'
}

export { reportResults };
