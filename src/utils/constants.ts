export const EXPLORER_API = 'https://explorer.tlsnotary.org';
export const MAX_RECV = 16384;
export const MAX_SENT = 4096;

export const NOTARY_API = 'http://tlsn.eternis.ai:7047';
export const NOTARY_PROXY = 'wss://inn1.eternis.ai:55688';

export const NOTARY_API_LOCAL = 'http://localhost:7047';
export const NOTARY_PROXY_LOCAL = 'ws://localhost:55688';

export enum Mode {
  Development = 'development',
  Production = 'production',
}

export const MODE: Mode = (process.env.NODE_ENV as Mode) || Mode.Production;
