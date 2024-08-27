export type Bookmark = {
  url: string;
  targetUrl: string;
  method: string;
  type: string;
  title: string;
  description: string;
  responseSelector: string;
  valueTransform: string;
  icon?: string;
};

export const defaultBookmarks: Bookmark[] = [
  {
    url: 'https://dummyjson.com/products/1',
    targetUrl: 'https://dummyjson.com/products/1',
    method: 'GET',
    type: 'main_frame',
    title: 'Dummy JSON',
    description: 'Dummy example',
    responseSelector: '(?<="email":)"(.*?)"',
    valueTransform: '"email":%s',
  },
  {
    url: 'https://x.com/i/api/2/badge_count/badge_count.json',
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
