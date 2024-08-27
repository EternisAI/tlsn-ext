import { db } from '../entries/Background/db';
import { RequestHistory } from '../entries/Background/rpc';
import { sha256 } from '../utils/misc';
import { getCacheByTabId } from '../entries/Background/cache';

export type Bookmark = {
  id?: string;
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
      const storage = await localStorage.getItem(bookmarksId);
      return storage ? JSON.parse(storage) : [];
    } catch (e) {
      return [];
    }
  }

  async saveBookmarkIds(bookmarkIds: string[]): Promise<void> {
    const bookmarksId = await sha256('bookmarks');
    try {
      await localStorage.setItem(bookmarksId, JSON.stringify(bookmarkIds));
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
    const bookmark: Bookmark = this.convertRequestToBookmark(request, id);

    await this.addBookmarkId(id);

    await localStorage.setItem(id, JSON.stringify(bookmark));
  }

  async addBookMarks(requests: RequestHistory[]) {
    await Promise.all(requests.map((request) => this.addBookmark(request)));
  }

  async getBookmark(id: string): Promise<Bookmark | null> {
    try {
      const existing = await localStorage.getItem(id);
      return existing ? JSON.parse(existing) : null;
    } catch (e) {
      return null;
    }
  }

  async getBookmarks(): Promise<Bookmark[]> {
    const bookmarkIds = await this.getBookmarkIds();
    const bookmarks = await Promise.all(
      bookmarkIds.map((id) => this.getBookmark(id)),
    );
    return bookmarks.filter((bookmark) => bookmark !== null) as Bookmark[];
  }

  async deleteBookmark(id: string): Promise<void> {
    const hashId = await sha256(id);
    await localStorage.removeItem(hashId);
  }

  convertRequestToBookmark(request: RequestHistory, id: string) {
    // const cache = getCacheByTabId(request.tabId);
    // const req = cache.get<RequestLog>(requestId);

    const bookmark: Bookmark = {
      requestId: request.id,
      id,
      url: request.url,
      targetUrl: request.url,
      method: request.method,
      type: 'main_frame',
      title: request.url,
      description: '',
      responseSelector: '',
      valueTransform: '',
      icon: '',
    };
    return bookmark;
  }
}
