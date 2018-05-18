/* @flow */
/* eslint-disable no-await-in-loop */
import { Stats } from 'fast-stats';

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1000000;

export type ScenarioInput = {
    name: string,
    run: () => any | Promise<any>
};

export type ScenarioResult = {
    name: string,
    // Number of executions
    executions: number,
    // Average time spent per executions (nanoseconds)
    time: number,
    // Error margin (percent)
    error: number
};

export type ScenarioOptions = {
    // Maximum time to spent on a scenario (ms)
    duration: number,
    // Maximum number of executions
    executions: number
};

/*
 * Execute a scenario and return the result of the benchmark.
 */
async function runScenario(
    scenario: ScenarioInput,
    options: ScenarioOptions
): Promise<ScenarioResult> {
    let restTime = options.duration * NS_PER_MS;
    let executions = 0;

    const stats = new Stats();

    while (restTime > (stats.amean() || 0) && executions < options.executions) {
        executions += 1;

        const execTime = await runScenarioOnce(scenario);

        restTime -= execTime;

        stats.push(execTime);
    }

    // Arithmetic Mean
    const mean = stats.amean();

    // Margin of Error value
    const moe = stats.moe();

    // Compute the error margin
    const error = moe * 100 / mean;

    return {
        name: scenario.name,
        executions,
        time: mean,
        error
    };
}

/*
 * Execute the scenario once and return a duration of execution.
 */
async function runScenarioOnce(scenario: ScenarioInput): Promise<number> {
    const start = process.hrtime();
    const result = scenario.run();

    if (result instanceof Promise) {
        await result;
    }

    const diff = process.hrtime(start);
    return diff[0] * NS_PER_SEC + diff[1];
}

/*
 * Compare two scenario results to indicate if it's faster or slower.
 * It considers the error margin, and returns 0 if the difference is in the error margin.
 *
 * It returns a percent of progress.
 */
function compareScenarioResults(result: ScenarioResult, previous: ScenarioResult): number {
    const error = Math.max(result.error, previous.error);
    const difference =
        (previous.time - result.time) *
        100 /
        previous.time;

    if (Math.abs(difference) <= error) {
        return 0;
    }

    return difference;
}

export { runScenario, compareScenarioResults };
