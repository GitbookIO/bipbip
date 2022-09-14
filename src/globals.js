const suites = [];
let currentSuite = null;

function getBenchmark() {
    return {
        suites
    };
}
/*
 * Define a suite of benchmark.
 */

function suite(name, fn) {
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

function scenario(name, run) {
    if (!currentSuite) {
        throw new Error('"scenario()" must be called inside a suite');
    }

    currentSuite.scenarios.push({
        name,
        run
    });
}

export { suite, scenario, getBenchmark };
