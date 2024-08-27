import { db } from '../entries/Background/db';
import { RequestHistory, RequestLog } from '../entries/Background/rpc';
import { sha256 } from '../utils/misc';
import { getCacheByTabId } from '../entries/Background/cache';
import { defaultBookmarks } from '../utils/defaultBookmarks';
export type Bookmark = {
  id?: string;
  default?: boolean;
  requestId?: string;
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

export class BookmarkManager {
  async getBookmarkIds(): Promise<string[]> {
    const bookmarksId = await sha256('bookmarks');
    try {
      const storage = await chrome.storage.local.get(bookmarksId);
      return storage[bookmarksId] ? JSON.parse(storage[bookmarksId]) : [];
    } catch (e) {
      return [];
    }
  }

  async saveBookmarkIds(bookmarkIds: string[]): Promise<void> {
    const bookmarksId = await sha256('bookmarks');
    try {
      await chrome.storage.local.set({
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

  async addBookmark(request: RequestHistory) {
    const id = await sha256(request.url);
    const bookmark: Bookmark = await this.convertRequestToBookmark(request, id);

    await this.addBookmarkId(id);

    await chrome.storage.local.set({ [id]: JSON.stringify(bookmark) });
  }

  async addBookMarks(requests: RequestHistory[]) {
    await Promise.all(requests.map((request) => this.addBookmark(request)));
  }

  async getBookmark(id: string): Promise<Bookmark | null> {
    try {
      const existing = await chrome.storage.local.get(id);
      return existing[id] ? JSON.parse(existing[id]) : null;
    } catch (e) {
      return null;
    }
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const bookmarkIds = await this.getBookmarkIds();
    const bookmarks = await Promise.all(
      bookmarkIds.map((id) => this.getBookmark(id)),
    );

    const allBookmarks = [
      ...defaultBookmarks.map((bookmark) => ({ ...bookmark, default: true })),
      ...bookmarks.filter((bookmark) => bookmark !== null),
    ];
    return allBookmarks as Bookmark[];
  }

  async deleteBookmark(id: string): Promise<void> {
    const hashId = await sha256(id);
    await localStorage.removeItem(hashId);
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

  async convertRequestToBookmark(request: RequestHistory, id: string) {
    const currentTabInfo = await this.getCurrentTabInfo();

    const cache = getCacheByTabId(currentTabInfo?.id || 0);

    console.log('=================');
    console.log('convertRequestToBookmark');
    console.log('currentTabInfo', currentTabInfo?.id);
    console.log('requestId', request.cid);
    console.log('request', request.type);

    const bookmark: Bookmark = {
      requestId: request.id,
      id,
      url: request?.url || '',
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
