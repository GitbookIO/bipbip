/* @flow */
import {
    runScenario,
    type ScenarioSpec,
    type ScenarioInput,
    type ScenarioResult,
    type ScenarioOptions
} from './scenario.js';
import type { Reporter } from './reporters/index.js';

export type SuiteSpec = {
    name: string,
    scenarios: ScenarioSpec[]
};

export type SuiteInput = {
    name: string,
    scenarios: ScenarioInput[]
};

export type SuiteResult = {
    name: string,
    scenarios: ScenarioResult[]
};

export type SuiteOptions = ScenarioOptions & {
    reporter: Reporter
};

/*
 * Execute a suite of scenario.
 */
async function runSuite(
    suite: SuiteInput,
    previous: ?SuiteResult,
    options: SuiteOptions
): Promise<SuiteResult> {
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
