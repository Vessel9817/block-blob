import assert from 'assert';
import { Buffer } from 'buffer';
import { initFakeBlob } from '../src/fakeBlob';

export async function tryBlob(
    blobPart: string,
    options?: BlobPropertyBag
): Promise<string> {
    const blob = new Blob([blobPart], options);
    const url = URL.createObjectURL(blob);
    const res = await fetch(url);

    if (!res.ok) {
       throw new Error(`Failed to fetch blob: ${url}`);
    }

    const result = (await res.body?.getReader().read())?.value;

    URL.revokeObjectURL(url);

    if (result == null) {
       throw new Error(`Fetched blob returned null: ${url}`);
    }

    return Buffer.from(result).toString();
}

async function blobTest(blobPart: string, options?: BlobPropertyBag): Promise<void> {
    const data = await tryBlob(blobPart, options);

    assert.deepStrictEqual(data, blobPart, `Blob fetching failed`);
}

function fakeBlobTest(
    blobPart: string,
    options?: BlobPropertyBag
): void {
    const href = 'https://developer.mozilla.org';
    const blobPartStr = JSON.stringify(blobPart);
    const optionsStr = JSON.stringify(options);
    const hrefStr = JSON.stringify(href);

    function containedFakeBlobTest(
        blobPart: string,
        options: BlobPropertyBag | undefined,
        href: string | undefined
    ) {
        initFakeBlob(href);
        tryBlob(blobPart, options)
            .catch(() => {
                // Expecting fetch to fail because of the fake blob
            })
            .then((result) => {
                if (result !== undefined) {
                    throw new Error(`Fake blob failed, got: ${result}`);
                }
            });
    }

    eval(`containedFakeBlobTest(${blobPartStr}, ${optionsStr}, ${hrefStr});`)
}

export default async function test(): Promise<void> {
    const data = {
        test: 'success',
        code: 200
    };
    const serializedData = JSON.stringify(data, null, 4);

    await blobTest(serializedData, { type: 'application/json' });
    fakeBlobTest(serializedData, { type: 'application/json' });
}
