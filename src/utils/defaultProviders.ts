import { RequestHistory } from '../entries/Background/rpc';

export const defaultProviders: RequestHistory[] = [
  {
    url: 'https://dummyjson.com/products/1',
    method: 'GET',
    headers: {
      Host: 'dummyjson.com',
      'sec-ch-ua':
        '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Linux"',
      DNT: '1',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent':
        'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      Referer: 'https://dummyjson.com/products/1',
      'Accept-Encoding': 'identity',
      'Accept-Language':
        'en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-FR;q=0.6,zh-FR;q=0.5,zh;q=0.4,ar-FR;q=0.3,ar;q=0.2',
      Cookie: 'pdfcc=51',
      Connection: 'close',
    },
    maxSentData: 4096,
    maxRecvData: 16384,
    maxTranscriptSize: 16384,
    notaryUrl: 'http://tlsn.eternis.ai:7047',
    websocketProxyUrl: 'wss://inn1.eternis.ai:55688',
    secretHeaders: [
      'sec-ch-ua: "Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
      'sec-ch-ua-mobile: ?0',
      'sec-ch-ua-platform: "Linux"',
      'dnt: 1',
      'upgrade-insecure-requests: 1',
      'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
      'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'sec-fetch-site: same-origin',
      'sec-fetch-mode: navigate',
      'sec-fetch-user: ?1',
      'sec-fetch-dest: document',
      'referer: https://dummyjson.com/products/1',
      'accept-encoding: gzip, deflate, br, zstd',
      'accept-language: en-US,en;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-FR;q=0.6,zh-FR;q=0.5,zh;q=0.4,ar-FR;q=0.3,ar;q=0.2',
      'cookie: pdfcc=51',
    ],
    secretResps: [],
    id: '05e5e81b068d88cf0339cb76855fa3342516bfc7e1012a8c8843ff03e9c78982',
    status: 'success',
  },
];
