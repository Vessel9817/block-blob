import assert from 'assert';
import { validate } from 'uuid';
import { fakeBlobURI } from '../src/fakeBlob';

function testHTTP(): void {
    const uri = fakeBlobURI("https://developer.mozilla.org/en-US/docs/Web/API/URL/origin");

    assert.ok(
        uri.startsWith('blob:developer.mozilla.org/'),
        `Fake blob URI doesn't correctly identify website origin, got: ${uri}`
    );
}

function testProtocol(): void {
    const uri = fakeBlobURI("file:///C:/Users/Downloads/secret_evidence.mp4");

    assert.ok(
        uri.startsWith('blob:null/'),
        `Fake blob URI doesn't correctly identify protocol origin, got: ${uri}`
    );
}

function testUUID(): void {
    const uri = fakeBlobURI("https://developer.mozilla.org");
    const uuid = uri.split('/').at(-1);

    assert.ok(
        validate(uuid),
        `Fake blob incorrectly integrates a UUID, got: ${uuid} from ${uri}`
    );
}

export default function test(): void {
    testHTTP();
    testProtocol();
    testUUID();
}
