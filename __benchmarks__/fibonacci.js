/* global suite,scenario */
/*
 * Examples taken from https://medium.com/developers-writing/fibonacci-sequence-algorithm-in-javascript-b253dc7e320e
 */

function loop(input) {
    let num = input;
    let a = 1;
    let b = 0;
    let temp;

    while (num >= 0) {
        temp = a;
        a += b;
        b = temp;
        num -= 1;
    }

    return b;
}

function recursive(num) {
    if (num <= 1) return 1;

    return recursive(num - 1) + recursive(num - 2);
}

function recursiveWithMemoization(num, memo = {}) {
    if (memo[num]) return memo[num];
    if (num <= 1) return 1;

    memo[num] =
        recursiveWithMemoization(num - 1, memo) +
        recursiveWithMemoization(num - 2, memo);

    return memo[num];
}

suite('fibonaci', () => {
    const INPUT = 20;

    scenario('loop', () => {
        loop(INPUT);
    });

    scenario('recursive', () => {
        recursive(INPUT);
    });

    scenario('recursiveWithMemoization', () => {
        recursiveWithMemoization(INPUT);
    });
});
