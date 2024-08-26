import { db } from '../entries/Background/db';
import { RequestHistory } from '../entries/Background/rpc';
import { sha256 } from '../utils/misc';

import { defaultProviders } from '../utils/defaultProviders';

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
    await this.addBookmarkId(id);
    const request_ = { ...request, id };
    await localStorage.setItem(id, JSON.stringify(request_));
  }

  async addBookMarks(requests: RequestHistory[]) {
    await Promise.all(requests.map((request) => this.addBookmark(request)));
  }

  async getBookmark(id: string): Promise<RequestHistory | null> {
    try {
      const existing = await localStorage.getItem(id);
      return existing ? JSON.parse(existing) : null;
    } catch (e) {
      return null;
    }
  }

  async getBookmarks(): Promise<RequestHistory[]> {
    const bookmarkIds = await this.getBookmarkIds();
    const bookmarks = await Promise.all(
      bookmarkIds.map((id) => this.getBookmark(id)),
    );
    return bookmarks.filter(
      (bookmark) => bookmark !== null,
    ) as RequestHistory[];
  }

  async deleteBookmark(id: string): Promise<void> {
    await localStorage.removeItem(id);
  }
}
