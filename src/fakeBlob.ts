import { v4 as uuid } from 'uuid';

export function initFakeBlob(href?: string): void {
    URL.createObjectURL = function (obj: Blob | MediaSource): string {
        return fakeBlobURI(href);
    };
}

export function fakeBlobURI(href?: string): string {
    const defaultedHref = href ?? document.location.origin;
    // if the URL origin is "null", .split('://', ...).at(-1) returns "null"
    const origin = new URL(defaultedHref).origin.split('://', 2).at(-1);
    const uri = `blob:${origin}/${uuid()}`;

    return uri;
}
