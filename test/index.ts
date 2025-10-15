import fakeBlobUriTest from './fakeBlobUriTest';
import fakeBlobTest from './fakeBlobTest';

// Something in tsconfig.json is preventing top-level await
(async () => {
    fakeBlobUriTest();
    await fakeBlobTest();
})();
