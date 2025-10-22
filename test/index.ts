import test from './blobTest';

const data = {
    test: 'success',
    code: 200
};
const options = { type: 'application/json' };
const serializedData = JSON.stringify(data, null, 4);

test(serializedData, options);
