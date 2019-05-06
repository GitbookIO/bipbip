/* @flow */
/* eslint-disable no-await-in-loop */
import { Stats } from 'fast-stats';

const NS_PER_SEC = 1e9;
const NS_PER_MS = 1000000;

export type ScenarioSpec = {
    name: string
};

export type ScenarioInput = {
    run: () => any | Promise<any>
} & ScenarioSpec;

export type ScenarioResult = {
    // Number of executions
    executions: number,
    // Average CPU time spent per executions (microseconds)
    time: number,
    // Average real time spent per executions (nanoseconds)
    realTime: number,
    // Error margin (percent)
    error: number
} & ScenarioSpec;

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
    let realTime = 0;

    const stats = new Stats();

    while (restTime > (stats.amean() || 0) && executions < options.executions) {
        executions += 1;

        const startTime = process.hrtime();
        const cpuExecTime = await runScenarioOnce(scenario);
        const diff = process.hrtime(startTime);
        const execTime = diff[0] * NS_PER_SEC + diff[1];

        restTime -= execTime;
        realTime += execTime;

        stats.push(cpuExecTime);
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
        realTime: realTime / executions,
        error
    };
}

/*
 * Execute the scenario once and return a duration of execution (in microseconds).
 */
async function runScenarioOnce(scenario: ScenarioInput): Promise<number> {
    const startUsage = process.cpuUsage();
    const result = scenario.run();

    if (result instanceof Promise) {
        await result;
    }

    const endUsage = process.cpuUsage(startUsage)
    return endUsage.user + endUsage.system;
}

export { runScenario };
