/* @flow */
import {
    runScenario,
    type ScenarioSpec,
    type ScenarioInput,
    type ScenarioResult,
    type ScenarioOptions
} from './scenario';
import type { Reporter } from './reporters';

export type SuiteSpec = {
    name: string,
    scenarios: ScenarioSpec[]
};

export type SuiteInput = SuiteSpec & {
    scenarios: ScenarioInput[]
};

export type SuiteResult = SuiteSpec & {
    scenarios: ScenarioResult[]
};

export type SuiteOptions = ScenarioOptions & {
    reporter: Reporter,
    previous: ?SuiteResult
};

/*
 * Execute a suite of scenario.
 */
async function runSuite(
    suite: SuiteInput,
    options: ScenarioOptions
): Promise<SuiteResult> {
    const { previous, reporter } = options;

    const total = suite.scenarios.length;
    const scenarios = await suite.scenarios.reduce(async (prev, scenario, index) => {
        const results = await prev;

        reporter.onScenarioStart({
            index,
            total,
            suite,
            scenario
        });

        const result =  await runScenario(scenario, options);
        const previousResult = previous
            ? previous.scenarios.find(prev => prev.name == scenario.name)
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
    }, []);

    return {
        name: suite.name,
        scenarios
    };
}

export { runSuite };
