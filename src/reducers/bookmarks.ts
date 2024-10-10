import { db } from '../entries/Background/db';
import { RequestHistory, RequestLog } from '../entries/Background/rpc';
import { sha256, getNotaryConfig } from '../utils/misc';
import { DEFAULT_CONFIG_ENDPOINT, CONFIG_CACHE_AGE } from '../utils/constants';
import { getCacheByTabId } from '../entries/Background/cache';
export type Bookmark = {
  id?: string;
  host?: string;
  default?: boolean;
  requestId?: string;
  urlRegex: string;
  targetUrl: string;
  method: string;
  type: string;
  title: string;
  description: string;
  responseSelector: string;
  valueTransform: string;
  icon?: string;
  toNotarize?: boolean;
  notarizedAt?: number;
};

export class BookmarkManager {
  async getBookmarkIds(): Promise<string[]> {
    const bookmarksId = await sha256('bookmarks');
    try {
      const storage = await chrome.storage.sync.get(bookmarksId);
      return storage[bookmarksId] ? JSON.parse(storage[bookmarksId]) : [];
    } catch (e) {
      return [];
    }
  }

  async saveBookmarkIds(bookmarkIds: string[]): Promise<void> {
    const bookmarksId = await sha256('bookmarks');
    try {
      await chrome.storage.sync.set({
        [bookmarksId]: JSON.stringify(bookmarkIds),
      });
    } catch (e) {
      console.error('Error saving bookmark IDs', e);
    }
  }

  async addBookmarkId(bookmarkId: string): Promise<void> {
    const bookmarkIds = await this.getBookmarkIds();
    if (!bookmarkIds.includes(bookmarkId)) {
      bookmarkIds.push(bookmarkId);
      await this.saveBookmarkIds(bookmarkIds);
    }
  }

  async getBookmarkById(id: string): Promise<Bookmark | null> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.find((bookmark) => bookmark.id === id) || null;
  }

  async getBookmark(cid: string): Promise<Bookmark | null> {
    try {
      const existing = await chrome.storage.sync.get(cid);
      if (existing[cid]) {
        const bookmark = JSON.parse(existing[cid], (key, value) => {
          if (
            typeof value === 'string' &&
            value.startsWith('/') &&
            value.endsWith('/')
          ) {
            const parts = value.match(/\/(.*?)\/([gimsuy]*)/);
            if (parts) {
              return new RegExp(parts[1], parts[2]);
            }
          }
          return value;
        });
        return bookmark;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async getDefaultProviders(): Promise<Bookmark[]> {
    const config = await getNotaryConfig();

    for (const bookmark of config.PROVIDERS as Bookmark[]) {
      await this.addBookmark(bookmark);
    }
    return config.PROVIDERS as Bookmark[];
  }

  async findBookmark(
    url: string,
    method: string,
    type: string,
  ): Promise<Bookmark | null> {
    const bookmarks = await this.getBookmarks();

    //console.log('bookmarks', bookmarks);
    return (
      bookmarks.find((bookmark) => {
        //TEST: debug regex

        const regex = new RegExp(bookmark.urlRegex);
        const result =
          regex.test(url) &&
          bookmark.method === method &&
          bookmark.type === type;

        if (
          bookmark.id === '3' &&
          url.includes('getPastOrdersV1') &&
          method === bookmark.method &&
          type === bookmark.type
        ) {
          console.log('request', url, method, type);
          console.log(
            'bookmark',
            bookmark.urlRegex,
            bookmark.method,
            bookmark.type,
          );

          console.log('result', result);
        }

        return result;
      }) || null
    );
  }

  async getBookmarks(): Promise<Bookmark[]> {
    await this.getDefaultProviders();

    const bookmarkIds = await this.getBookmarkIds();
    const bookmarks = await Promise.all(
      bookmarkIds.map((id) => this.getBookmark(id)),
    );
    return bookmarks.filter((bookmark) => bookmark !== null) as Bookmark[];
  }

  async deleteBookmark(bookmark: Bookmark): Promise<void> {
    await chrome.storage.sync.remove([bookmark.id || '']);
  }

  async convertBookmarkToJson(bookmark: Bookmark): Promise<string> {
    const jsonData = JSON.stringify(bookmark, (key, value) => {
      if (value instanceof RegExp) {
        return value.source;
      }
      return value;
    });
    return jsonData;
  }
  async updateBookmark(bookmark: Bookmark): Promise<void> {
    const id = await sha256(bookmark.urlRegex.toString());
    const jsonData = await this.convertBookmarkToJson(bookmark);
    await chrome.storage.sync.set({
      [id]: jsonData,
    });
  }

  async addBookmark(bookmark: Bookmark) {
    const id = await sha256(bookmark.urlRegex.toString());
    const existing = await chrome.storage.sync.get(id);
    if (existing[id]) {
      return;
    }
    const jsonData = await this.convertBookmarkToJson(bookmark);
    await this.addBookmarkId(id);
    await chrome.storage.sync.set({ [id]: jsonData });
  }

  async addBookMarks(bookmarks: Bookmark[]) {
    await Promise.all(bookmarks.map((bookmark) => this.addBookmark(bookmark)));
  }

  async getCurrentTabInfo(): Promise<chrome.tabs.Tab | null> {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          reject(new Error('No active tab found'));
        } else {
          resolve(tabs[0] || null);
        }
      });
    });
  }

  urlToRegex(url: string): string {
    // Escape special regex characters
    const escapedUrl = url.replace(/[-\/\\^$.*+?()[\]{}|]/g, '\\$&');

    // Replace dynamic segments (e.g., numeric IDs)
    // Here we assume segments like '12345' are numeric
    const regexPattern = escapedUrl.replace(/\\d+/g, '\\d+'); // Adjust as needed for other patterns

    // Allow for optional query strings
    const finalPattern = `^${regexPattern}(\\?.*)?$`;

    return finalPattern;
  }

  async convertRequestToBookmark(request: RequestHistory) {
    const currentTabInfo = await this.getCurrentTabInfo();

    const bookmark: Bookmark = {
      requestId: request.id,
      id: await sha256(request?.url || ''),
      urlRegex: new RegExp(this.urlToRegex(request?.url || '')).toString(), // this conversion should be improved
      targetUrl: currentTabInfo?.url || '',
      method: request?.method || '',
      type: request?.type || '',
      title: request.url,
      description: '',
      responseSelector: '',
      valueTransform: '',
      icon: '',
    };
    return bookmark;
  }
}
