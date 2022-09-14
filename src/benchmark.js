import { runSuite } from './suite.js';

/*
 * Execute a set of benchmarks.
 */
async function runBenchmark(input, previous, options) {
    const { reporter } = options;
    const total = input.suites.length;
    reporter.onStart();
    const suites = await input.suites.reduce(async (prev, suite, index) => {
        const results = await prev;
        reporter.onSuiteStart({
            index,
            total,
            suite
        });
        const previousResult = previous
            ? previous.suites.find(prevSuite => prevSuite.name == suite.name)
            : null;
        const result = await runSuite(suite, previousResult, options);
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
