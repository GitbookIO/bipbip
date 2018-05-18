/* @flow */
import {
    runSuite,
    type SuiteSpec,
    type SuiteInput,
    type SuiteResult,
    type SuiteOptions
} from './suite';

export type BenchmarkSpec = {
    suites: SuiteSpec[]
};

export type BenchmarkInput = {
    suites: SuiteInput[]
};

export type BenchmarkResult = {
    suites: SuiteResult[]
};

export type BenchmarkOptions = SuiteOptions & {
    reporter: Reporter,
    previous: ?BenchmarkResult
};

/*
 * Execute a set of benchmarks.
 */
async function runBenchmark(
    input: BenchmarkInput,
    options: BenchmarkOptions
): Promise<BenchmarkResult> {
    const { reporter, previous } = options;
    const total = input.suites.length;

    reporter.onStart();

    const suites = await input.suites.reduce(async (prev, suite, index) => {
        const results = await prev;

        reporter.onSuiteStart({ index, total, suite });

        const result = await runSuite(suite, options);
        const previousResult = previous
            ? previous.suites.find(prevSuite => prevSuite.name == suite.name)
            : null;

        reporter.onSuiteEnd({
            index,
            total,
            suite,
            result,
            previous: previousResult
        });

        return results.concat([result]);
    }, []);

    reporter.onDone();

    return {
        suites
    };
}

export { runBenchmark };
