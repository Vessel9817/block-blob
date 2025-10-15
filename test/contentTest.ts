import { tryBlob } from './fakeBlobTest';

// Something in tsconfig.json is preventing top-level await
(async () => {
    const data = {
        test: 'success',
        code: 200
    };
    const options = { type: 'application/json' };
    const serializedData = JSON.stringify(data, null, 4);

    tryBlob(serializedData, options)
        .catch((e) => {
            console.log('Successfully prevented the blob from being fetched!');
            console.debug('Full debug output:', e);
        })
        .then((result) => {
            if (result !== undefined) {
                console.error(`Fake blob failed, got: ${result}`);
            }
        });
})();
