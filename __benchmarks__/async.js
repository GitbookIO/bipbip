suite('async', () => {
    scenario(
        'basic',
        async () =>
            new Promise(resolve => {
                setTimeout(() => resolve(), 120);
            })
    );
});
