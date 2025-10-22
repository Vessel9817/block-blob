import { Protocol } from 'devtools-protocol';
import Browser from 'webextension-polyfill';

class BlobBlocker {
    // TODO Update when experimental commands are moved
    // from the experimental tip-of-tree branch to a stable branch
    // https://chromedevtools.github.io/devtools-protocol/tot/
    private static readonly DEBUGGER_VERSION = '1.3';
    private static _singleton?: BlobBlocker;

    public static get singleton(): BlobBlocker {
        BlobBlocker._singleton ??= new BlobBlocker();

        return BlobBlocker._singleton;
    }

    private constructor() {
        // Binding event listeners
        this.onDetach = this.onDetach.bind(this);
        this.onTabCreated = this.onTabCreated.bind(this);
        this.onTabReplaced = this.onTabReplaced.bind(this);
        this.onTabRemoved = this.onTabRemoved.bind(this);
        this.onBeforeRequest = this.onBeforeRequest.bind(this);
        this.listen = this.listen.bind(this);
        this.stopListening = this.stopListening.bind(this);
    }

    async onDetach() {
        this.stopListening();
    }

    async detach(tabId?: number) {
        if (tabId != null) {
            try {
                await chrome.debugger.detach({ tabId });
            }
            catch {
                // Debugger must already be detached
            }
        }
    }

    async attach(tabId?: number) {
        // Asserting that this is an unprivileged tab (e.g, not DevTools)
        if (tabId == null) {
            return;
        }

        const tab = await Browser.tabs.get(tabId);
        const url = tab.url!;

        // Asserting that we have permission to attach here
        if (!/^https?:\/\//i.test(url)) {
            if (!/^file:\/\//i.test(url)) {
                return;
            }
            if (!await Browser.extension.isAllowedFileSchemeAccess()) {
                return;
            }
        }

        // Attaching debugger
        const target = { tabId };

        await chrome.debugger.attach(target, BlobBlocker.DEBUGGER_VERSION);

        // Intercepting requests
        const enableArgs: Protocol.Fetch.EnableRequest = {
            handleAuthRequests: false
        };

        // @ts-expect-error commandParams is a subtype of Record<string, unknown>
        await chrome.debugger.sendCommand(target, 'Fetch.enable', enableArgs);
    }

    // TODO The debugger takes too long to attach to intercept new tabs,
    // need to slow page loading down.
    // This seems to work consistently when a DevTools process is attached
    // to the tab, but they also take a while to attach.
    async onTabCreated(tab: Browser.Tabs.Tab) {
        return await this.attach(tab.id);
    }

    async onTabReplaced(addedTabId: number, removedTabId: number) {
        if (addedTabId !== removedTabId) {
            await Promise.all([
                this.detach(removedTabId),
                this.attach(addedTabId)
            ]);
        }
    }

    async onTabRemoved(tabId?: number) {
        return await this.detach(tabId);
    }

    async onBeforeRequest(
        source: chrome.debugger.DebuggerSession,
        method: string,
        params?: object
    ) {
        const tabId = source.tabId;

        if (method !== 'Fetch.requestPaused' || tabId == null) {
            return;
        }

        const pauseParams = params as Protocol.Fetch.RequestPausedEvent;

        // TODO TESTING
        console.log(pauseParams.request.url);
        console.debug(source, method, pauseParams);

        if (/^blob:/i.test(pauseParams.request.url)) {
            // Failing blob request
            const failArgs: Protocol.Fetch.FailRequestRequest = {
                requestId: pauseParams.requestId,
                errorReason: 'Failed'
            };

            // @ts-expect-error commandParams is a subtype of Record<string, unknown>
            await chrome.debugger.sendCommand({ tabId }, 'Fetch.failRequest', failArgs);
            return
        }

        // Passing all other requests
        const continueArgs: Protocol.Fetch.ContinueRequestRequest = {
            requestId: pauseParams.requestId
        };

        // @ts-expect-error commandParams is a subtype of Record<string, unknown>
        await chrome.debugger.sendCommand({ tabId }, 'Fetch.continueRequest', continueArgs);
    }

    async listen(): Promise<void> {
        if (!chrome.debugger.onDetach.hasListener(this.onDetach)) {
            chrome.debugger.onDetach.addListener(this.onDetach)
        }
        if (!chrome.debugger.onEvent.hasListener(this.onBeforeRequest)) {
            chrome.debugger.onEvent.addListener(this.onBeforeRequest);
        }
        if (!chrome.tabs.onCreated.hasListener(this.onTabCreated)) {
            chrome.tabs.onCreated.addListener(this.onTabCreated);
        }
        if (!chrome.tabs.onReplaced.hasListener(this.onTabReplaced)) {
            chrome.tabs.onReplaced.addListener(this.onTabReplaced);
        }
        if (!chrome.tabs.onRemoved.hasListener(this.onTabRemoved)) {
            chrome.tabs.onRemoved.addListener(this.onTabRemoved);
        }

        const allTargets = await chrome.debugger.getTargets();
        const pages = allTargets.filter(
            (info) => info.tabId != null && !info.attached
        );
        const promises = new Array<Promise<void>>();

        for (const page of pages) {
            promises.push(this.attach(page.tabId));
        }

        await Promise.all(promises);
    }

    async stopListening(): Promise<void> {
        if (chrome.debugger.onDetach.hasListener(this.onDetach)) {
            chrome.debugger.onDetach.removeListener(this.onDetach)
        }
        if (chrome.debugger.onEvent.hasListener(this.onBeforeRequest)) {
            chrome.debugger.onEvent.removeListener(this.onBeforeRequest);
        }
        if (chrome.tabs.onCreated.hasListener(this.onTabCreated)) {
            chrome.tabs.onCreated.removeListener(this.onTabCreated);
        }
        if (chrome.tabs.onReplaced.hasListener(this.onTabReplaced)) {
            chrome.tabs.onReplaced.removeListener(this.onTabReplaced);
        }
        if (chrome.tabs.onRemoved.hasListener(this.onTabRemoved)) {
            chrome.tabs.onRemoved.removeListener(this.onTabRemoved);
        }

        const allTargets = await chrome.debugger.getTargets();
        const pages = allTargets.filter((info) => info.attached);
        const promises = new Array<Promise<void>>();

        for (const page of pages) {
            promises.push(this.detach(page.tabId));
        }

        await Promise.all(promises);
    }
}

export default BlobBlocker.singleton;
