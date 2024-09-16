export const EXPLORER_API = 'https://explorer.tlsnotary.org';
export const MAX_RECV = 16384;
export const MAX_SENT = 4096;

export const ENCLAVE_ENDPOINT = 'https://notary.eternis.ai';

export const NOTARY_API = `${ENCLAVE_ENDPOINT}`;
export const NOTARY_PROXY = 'wss://inn1.eternis.ai:55688';

export const NOTARY_API_LOCAL = 'http://localhost:7047';
export const NOTARY_PROXY_LOCAL = 'ws://localhost:55688';

export enum Mode {
  Development = 'development',
  Production = 'production',
}

export const MODE: Mode = (process.env.NODE_ENV as Mode) || Mode.Production;

export const EXPECTED_PCRS = {
  '1': 'A0OwVs2Ehcp4kN3YM0dteEYK7SqhYVSOTia+3zIXJmliV9Yj6IBfP2BZRrPYsMaq',
  '2': 'C782kKfD7niAW0qA2cFsf6knoq+LaVkA/6tdyX9g7rngmMCyHTE1/0xQRnm65DRL',
};

export const EXPECTED_PCRS_DEBUG = {
  '1': 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
  '2': 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
};

// 1 second buffer time to prevent spamming of requests
export const BUFFER_TIME = 1000;

export const DEFAULT_PROVIDERS_ENDPOINT =
  'https://eternis-extension-providers.s3.amazonaws.com/default_providers.json';
