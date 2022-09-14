import { runScenario } from './scenario.js';

/*
 * Execute a suite of scenario.
 */
async function runSuite(suite, previous, options) {
    const { reporter } = options;
    const total = suite.scenarios.length;
    const scenarios = await suite.scenarios.reduce(
        async (prev, scenario, index) => {
            const results = await prev;
            reporter.onScenarioStart({
                index,
                total,
                suite,
                scenario
            });
            const result = await runScenario(scenario, options);
            const previousResult = previous
                ? previous.scenarios.find(
                      prevScenario => prevScenario.name == scenario.name
                  )
                : null;
            reporter.onScenarioEnd({
                index,
                total,
                suite,
                scenario,
                result,
                previous: previousResult
            });
            return results.concat([result]);
        },
        []
    );
    return {
        name: suite.name,
        scenarios
    };
}

export { runSuite };
