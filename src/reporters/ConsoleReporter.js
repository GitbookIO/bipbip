/* @flow */
import prettyMs from 'pretty-ms';
import colors from 'cli-color';
import { Spinner } from 'cli-spinner';

import Reporter from './Reporter';

/*
 * Reporter that prints the results to the console.
 */
class ConsoleReporter extends Reporter {
    spinner: Spinner;

    constructor() {
        super();

        this.spinner = new Spinner();
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
    }

    onError() {}

    onSuiteStart({ suite }: *) {
        this.spinner.stop(true);
        process.stdout.write(`${suite.name}\n`);
    }

    onSuiteEnd() {
        process.stdout.write(`\n`);
    }

    onScenarioStart({ index, total, suite, scenario }: *) {
        this.spinner.setSpinnerTitle(
            `  %s ${scenario.name} running (${index + 1} / ${total})`
        );
        this.spinner.start();
    }

    onScenarioEnd({ scenario, result, previous }: *) {
        this.spinner.stop(true);

        const duration = prettyMs(result.time / 1000000, {
            msDecimalDigits: 2
        });

        const difference = previous
            ? compareScenarioResults(result, previous)
            : 0;

        process.stdout.write(
            `  ${getDifferenceIcon(difference)} ${
                scenario.name
            }: ${duration} (±${result.error.toFixed(2)}%, ⨉${
                result.executions
            })`
        );

        if (difference != 0) {
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

export default ConsoleReporter;
