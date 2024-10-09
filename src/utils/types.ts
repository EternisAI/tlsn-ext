export type Proof = ProofV0 | AttrAttestation;

export type ProofV0 = {
  version?: undefined;
  session: any;
  substrings: any;
  notaryUrl: string;
};

export type AttrAttestation = {
  version: '1.0';
  meta: {
    notaryUrl: string;
    websocketProxyUrl: string;
    pluginUrl?: string;
  };
  signature: string;
  signedSession: string;
  applicationData: string;
  attestations: string;
};

type AssertionOperator = 'exist' | '=' | '!=' | '<' | '>' | '<=' | '>=';
type Assertion = {
  item: string;
  operator: AssertionOperator;
  value: string; //if operator exist then expects empty string
};

export const CONFIG_SIGNING_KEY = '0x02022'; // secp256k1 key

export type NotarizationConfig = {
  EXPECTED_PCRS: {
    [key: string]: string;
  };
  SIGNATURE_PROVIDERS: `0x${string}`; // secp256k1 signature of the stringified PROVIDERS object to avoid any tampering. Signed by CONFIG_SIGNING_KEY;
  PROVIDERS: Array<{
    id: string;
    url: string;
    urlRegex: string;
    targetUrl: string;
    method: string;
    title: string;
    description: string;
    responseSelector: string[]; // regex to extract elements from the response
    assertions: Assertion[]; // assertions that will be made for element selected, in same order as in response selector
    icon: string;
  }>;
};

// const CONFIG_EXAMPLE: Config = {
//   SIGNATURE_PROVIDERS: '0x304502210089f4528b2ab1e4cc',
//   EXPECTED_PCRS: {
//     '1': 'A0OwVs2Ehcp4kN3YM0dteEYK7SqhYVSOTia+3zIXJmliV9Yj6IBfP2BZRrPYsMaq',
//     '2': 'mfIvNWlBpHcMpqXGm+xkpSxBYrFGMvRrXXy0HDhpGR1Wh5cIOauUyapKk4xmajFs',
//   },
//   PROVIDERS: [
//     {
//       id: '0',
//       title: 'Verify Twitter Profile',
//       description:
//         'Notarize ownership of a twitter profile. Go to your own profile to trigger the notarization.',
//       url: 'https://api.x.com/1.1/account/settings.json',
//       urlRegex:
//         '^https:\\/\\/api\\.(x|twitter)\\.com\\/1\\.1\\/account\\/settings\\.json(\\?.*)?$',
//       targetUrl: 'https://www.x.com/home',
//       method: 'GET',
//       responseSelector: ['(?<="screen_name":)"(.*?)"'],
//       assertions: [{ item: 'value', operator: 'exist', value: '' }],
//       icon: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F128%2F5969%2F5969020.png&f=1&nofb=1&ipt=a56216fd08bcdc1487b23d84251395468cb2459709b08c0e19ba893d72d74897&ipo=images',
//     },
//   ],
// };
