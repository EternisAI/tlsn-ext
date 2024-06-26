import browser from 'webextension-polyfill';
import { ContentScriptRequest, ContentScriptTypes, RPCServer } from './rpc';
import { BackgroundActiontype, RequestHistory } from '../Background/rpc';
import { urlify } from '../../utils/misc';

const charwise = require('charwise');

(async () => {
  loadScript('content.bundle.js');
  const server = new RPCServer();

  server.on(ContentScriptTypes.connect, async () => {
    const connected = await browser.runtime.sendMessage({
      type: BackgroundActiontype.connect_request,
      data: {
        ...getPopupData(),
      },
    });

    if (!connected) throw new Error('user rejected.');

    return connected;
  });

  server.on(
    ContentScriptTypes.get_history,
    async (request: ContentScriptRequest<{ method: string; url: string }>) => {
      const { method: filterMethod, url: filterUrl } = request.params || {};

      if (!filterMethod || !filterUrl)
        throw new Error('params must include method and url.');

      const response: RequestHistory[] = await browser.runtime.sendMessage({
        type: BackgroundActiontype.get_history_request,
        data: {
          ...getPopupData(),
          method: filterMethod,
          url: filterUrl,
        },
      });

      return response;
    },
  );

  server.on(
    ContentScriptTypes.get_proof,
    async (request: ContentScriptRequest<{ id: string }>) => {
      const { id } = request.params || {};

      if (!id) throw new Error('params must include id.');

      const proof = await browser.runtime.sendMessage({
        type: BackgroundActiontype.get_proof_request,
        data: {
          ...getPopupData(),
          id,
        },
      });

      return proof;
    },
  );

  server.on(
    ContentScriptTypes.notarize,
    async (
      request: ContentScriptRequest<{
        url: string;
        method?: string;
        headers?: { [key: string]: string };
        body?: string;
        notaryUrl?: string;
        websocketProxyUrl?: string;
        maxSentData?: number;
        maxRecvData?: number;
        maxTranscriptSize?: number;
        secretHeaders?: string[];
        secretResps?: string[];
      }>,
    ) => {
      const {
        url,
        method,
        headers,
        body,
        maxSentData,
        maxRecvData,
        maxTranscriptSize,
        notaryUrl,
        websocketProxyUrl,
        secretHeaders,
        secretResps,
      } = request.params || {};

      if (!url || !urlify(url)) throw new Error('invalid url.');

      const proof = await browser.runtime.sendMessage({
        type: BackgroundActiontype.notarize_request,
        data: {
          ...getPopupData(),
          url,
          method,
          headers,
          body,
          maxSentData,
          maxRecvData,
          maxTranscriptSize,
          notaryUrl,
          websocketProxyUrl,
          secretHeaders,
          secretResps,
        },
      });

      return proof;
    },
  );
})();

function loadScript(filename: string) {
  const url = browser.runtime.getURL(filename);
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', url);
  document.body.appendChild(script);
}

function getPopupData() {
  return {
    origin: window.origin,
    position: {
      left: window.screen.width / 2 - 240,
      top: window.screen.height / 2 - 300,
    },
  };
}
