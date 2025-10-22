import { Buffer } from 'buffer';

async function tryBlob(
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

export default async function test(...args: Parameters<typeof tryBlob>): Promise<void> {
    let result;

    try {
        result = await tryBlob(...args);
    }
    catch (e: unknown) {
        console.log('Successfully prevented the blob from being fetched!');
        console.debug('Full debug output:', e);
        return;
    }

    if (result !== undefined) {
        console.error(`Failed to block blob, got: ${result}`);
    }
}
