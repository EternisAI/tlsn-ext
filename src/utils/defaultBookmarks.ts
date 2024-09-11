import { Bookmark } from '../reducers/bookmarks';

export const defaultBookmarks: Bookmark[] = [
  {
    url: 'https://app.carta.com/profiles/settings/',
    targetUrl: 'https://app.carta.com/profiles/settings/',
    method: 'GET',
    type: 'main_frame',
    title: 'Carta Profile',
    description: '',
    responseSelector: '',
    valueTransform: '',
    icon: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstore-app-images.s3.us-east-1.amazonaws.com%2F4b00d4f0a3be5eae76c93058ddb352dc-400x400.png&f=1&nofb=1&ipt=62c13557d086a2c30079a55774f58bfeb46c8b8554af84f22d0a215febfdffa8&ipo=images',
  },

  // {
  //   url: 'https://dummyjson.com/products/1',
  //   targetUrl: 'https://dummyjson.com/products/1',
  //   method: 'GET',
  //   type: 'main_frame',
  //   title: 'Dummy JSON',
  //   description: 'Dummy example',
  //   responseSelector: '',
  //   valueTransform: '',
  //   icon: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.pngrepo.com%2Fpng%2F243782%2F180%2Fduck.png&f=1&nofb=1&ipt=0ea3a6d225021c76c798832f8ee2fa451799886985705b85851b8a1731bf1c37&ipo=images',
  // },
  {
    url: 'https://api.x.com/1.1/account/settings.json',
    targetUrl: 'https://www.twitter.com/home',
    method: 'GET',
    type: 'xmlhttprequest',
    title: 'Twitter Profile',
    description:
      'Notarize ownership of a twitter profile. To start, go to your own profile',
    responseSelector: '(?<="screen_name":)"(.*?)"',
    valueTransform: '"screen_name":%s',
    icon: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F128%2F5969%2F5969020.png&f=1&nofb=1&ipt=a56216fd08bcdc1487b23d84251395468cb2459709b08c0e19ba893d72d74897&ipo=images',
  },
  {
    requestId: 'FE512M1.72598796970500000000000000000000',
    id: '6aeb2c2b35778d5bac1db5d606f68ddc6a510bac44af1b2231c433aeb5d86fa9',
    url: 'https://bonfire.robinhood.com/portfolio/performance/589423219?chart_style=PERFORMANCE&chart_type=historical_portfolio&display_span=day&include_all_hours=true',
    targetUrl: 'https://robinhood.com/',
    method: 'GET',
    type: 'xmlhttprequest',
    title:
      'https://bonfire.robinhood.com/portfolio/performance/589423219?chart_style=PERFORMANCE&chart_type=historical_portfolio&display_span=day&include_all_hours=true',
    description: '',
    responseSelector: '',
    valueTransform: '',
    icon: '',
  },
  // {
  //   url: 'https://gateway.reddit.com/desktopapi/v1/prefs',
  //   targetUrl: 'https://www.reddit.com/settings',
  //   method: 'GET',
  //   type: 'xmlhttprequest',
  //   title: 'Reddit Profile',
  //   description:
  //     'Notarize ownership of a reddit profile. To start, go to reddit.com/settings',
  //   responseSelector: '(?<="displayText": )"(.*?)"',
  //   valueTransform: '"displayText": %s',
  // },
  // {
  //   url: 'https://chatgpt.com/api/auth/session',
  //   targetUrl: 'https://chatgpt.com',
  //   method: 'GET',
  //   type: 'xmlhttprequest',
  //   title: 'ChatGPT Account',
  //   description:
  //     'Notarize ownership of a ChatGPT account. To start, go to chatgpt.com',
  //   responseSelector: '(?<="email":)"(.*?)"',
  //   valueTransform: '"email":%s',
  // },
];
