/* @flow */
import { runSuite, type SuiteInput, type SuiteResult } from './suite';

import type { ScenarioOptions } from './scenario';

export type BenchmarkInput = {
    suites: SuiteInput[]
};

export type BenchmarkResult = {
    suites: SuiteResult[]
};

/*
 * Execute a set of benchmarks.
 */
async function runBenchmark(
    input: BenchmarkInput,
    options: ScenarioOptions
): Promise<BenchmarkResult> {
    const suites = await input.suites.reduce(async (prev, suite) => {
        const result = await prev;
        return result.concat([await runSuite(suite, options)]);
    }, []);

    return {
        suites
    };
}

export { runBenchmark };
