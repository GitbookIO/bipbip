/* eslint-disable no-await-in-loop */
import { Stats } from 'fast-stats';
const NS_PER_SEC = 1e9;
const NS_PER_MS = 1000000;

/*
 * Execute a scenario and return the result of the benchmark.
 */
async function runScenario(scenario, options) {
    let restTime = options.duration * NS_PER_MS;
    let executions = 0;
    const stats = new Stats();

    while (restTime > (stats.amean() || 0) && executions < options.executions) {
        executions += 1;
        const execTime = await runScenarioOnce(scenario);
        restTime -= execTime;
        stats.push(execTime);
    } // Arithmetic Mean

    const mean = stats.amean(); // Margin of Error value

    const moe = stats.moe(); // Compute the error margin

    const error = (moe * 100) / mean;
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

async function runScenarioOnce(scenario) {
    const start = process.hrtime();
    const result = scenario.run();

    if (result instanceof Promise) {
        await result;
    }

    const diff = process.hrtime(start);
    return diff[0] * NS_PER_SEC + diff[1];
}

export { runScenario };
