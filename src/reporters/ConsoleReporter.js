/* @flow */
import prettyMs from 'pretty-ms';
import colors from 'cli-color';
import Table from 'cli-table';
import { Stats } from 'fast-stats';
import { Spinner } from 'cli-spinner';

import type { ScenarioResult } from '../scenario.js';
import Reporter from './Reporter.js';

type BenchmarkStats = { improved: number, regressed: number, total: number };

/*
 * Reporter that prints the results to the console.
 */
class ConsoleReporter extends Reporter {
    spinner: Spinner;
    stats: Stats;
    start: Date;

    suites: BenchmarkStats;
    scenarios: BenchmarkStats;

    constructor() {
        super();

        this.start = new Date();
        this.spinner = new Spinner();
        this.stats = new Stats();
        this.suites = { improved: 0, regressed: 0, total: 0 };
        this.scenarios = { improved: 0, regressed: 0, total: 0 };
    }

    onStart() {
        this.spinner.setSpinnerDelay(80);
        this.spinner.setSpinnerString(
            ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷'].join('')
        );
        this.spinner.start();
    }

    onDone() {
        this.spinner.stop(true);

        const duration = Date.now() - this.start.getTime();

        const table = new Table({
            chars: {
                top: '',
                'top-mid': '',
                'top-left': '',
                'top-right': '',
                bottom: '',
                'bottom-mid': '',
                'bottom-left': '',
                'bottom-right': '',
                left: '',
                'left-mid': '',
                mid: '',
                'mid-mid': '',
                right: '',
                'right-mid': '',
                middle: ' '
            },
            style: { 'padding-left': 0, 'padding-right': 0 }
        });

        table.push(
            [colors.bold('Result:'), `${this.stats.amean().toFixed(2)}%`],
            [colors.bold('Suites:'), getStatsSummary(this.suites)],
            [colors.bold('Scenarios:'), getStatsSummary(this.scenarios)],
            [colors.bold('Time:'), prettyMs(duration)]
        );

        process.stdout.write(table.toString());
        process.stdout.write(`\n`);
    }

    onError() {}

    onSuiteStart({ suite }: *) {
        this.spinner.stop(true);
        process.stdout.write(`${suite.name}\n`);
    }

    onSuiteEnd({ result }: *) {
        process.stdout.write(`\n`);

        this.suites.total += 1;
    }

    onScenarioStart({ index, total, suite, scenario }: *) {
        this.spinner.setSpinnerTitle(
            `  %s ${colors.bold(scenario.name)} running (${index +
                1} / ${total})`
        );
        this.spinner.start();
    }

    onScenarioEnd({ scenario, result, previous }: *) {
        this.spinner.stop(true);

        const difference = previous
            ? compareScenarioResults(result, previous)
            : 0;

        const opsPerSec = Math.floor(1e9 / result.time);

        this.stats.push(difference);

        process.stdout.write(
            `  ${getDifferenceIcon(difference)} ${colors.bold(scenario.name)}: `
        );

        // Display the ops per seconds if it's relevant
        if (opsPerSec === 0) {
            const duration = prettyMs(result.time / 1000000, {
                msDecimalDigits: 2
            });

            process.stdout.write(`${duration} per call`);
        } else {
            process.stdout.write(
                `${opsPerSec.toLocaleString('en-US')} ops/sec`
            );
        }

        process.stdout.write(
            ` (±${result.error.toFixed(2)}%, ⨉${result.executions})`
        );

        this.scenarios.total += 1;

        if (difference != 0) {
            if (difference > 0) {
                this.scenarios.improved += 1;
            } else {
                this.scenarios.regressed += 1;
            }

            process.stdout.write(
                (difference > 0 ? colors.green : colors.red)(
                    ` [${difference.toFixed(0)}%]`
                )
            );
        }

        process.stdout.write('\n');
    }
}

/*
 * Compare two scenario results to indicate if it's faster or slower.
 * It considers the error margin, and returns 0 if the difference is in the error margin.
 *
 * It returns a percent of progress.
 */
function compareScenarioResults(
    result: ScenarioResult,
    previous: ScenarioResult
): number {
    const error = Math.max(result.error, previous.error);
    const difference = (previous.time - result.time) * 100 / previous.time;

    if (Math.abs(difference) <= error) {
        return 0;
    }

    return difference;
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

    return '✔';
}

/*
 * Generate a summary string for some stats.
 */
function getStatsSummary(stats: BenchmarkStats): string {
    const parts = [];

    if (stats.improved > 0) {
        parts.push(colors.green.bold(`${stats.improved} improved`));
    }

    if (stats.regressed > 0) {
        parts.push(colors.red.bold(`${stats.regressed} regressed`));
    }

    parts.push(`${stats.total} total`);

    return parts.join(', ');
}

export default ConsoleReporter;
