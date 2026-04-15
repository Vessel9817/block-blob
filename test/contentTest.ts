import { tryBlob } from './fakeBlobTest';

const data = {
    blob: 'fetched',
    code: 200
};
const options = { type: 'application/json' };
const serializedData = JSON.stringify(data, null, 4);

try {
    const result = await tryBlob(serializedData, options);

    if (result !== undefined) {
        console.error(`Fake blob failed, got: ${result}`);
    }
}
catch (e) {
    console.log('Successfully prevented the blob from being fetched!');
    console.debug('Full debug output:', e);
}
