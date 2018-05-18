/* @flow */
import type { BenchmarkInput } from './benchmark';
import type { SuiteInput } from './suite';


const suites = [];
let currentSuite: ?SuiteInput = null;


function getBenchmark(): BenchmarkInput {
    return {
        suites
    };
}

/*
 * Define a suite of benchmark.
 */
function suite(name: string, fn: () => void): void {
    currentSuite = {
        name,
        scenarios: []
    };

    fn();

    suites.push(currentSuite);
    currentSuite = null;
}

/*
 * Define a scenario for a benchmark in a suite.
 */
function scenario(name: string, run: () => any | Promise<any>): void {
    if (!currentSuite) {
        throw new Error('"scenario()" must be called inside a suite');
    }

    currentSuite.scenarios.push({
        name, run
    })
}

export {
    suite,
    scenario,
    getBenchmark
}
