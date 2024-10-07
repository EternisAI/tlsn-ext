import { Identity } from '@semaphore-protocol/identity';
import { sha256 } from '../utils/misc';

export class IdentityManager {
  async getIdentity(): Promise<Identity> {
    const identityStorageId = await sha256('identity');
    try {
      const storage = await chrome.storage.sync.get(identityStorageId);
      return storage[identityStorageId]
        ? JSON.parse(storage[identityStorageId])
        : new Identity();
    } catch (e) {
      return new Identity();
    }
  }

  async saveIdentity(identity: Identity): Promise<void> {
    const identityStorageId = await sha256('identity');
    try {
      await chrome.storage.sync.set({
        [identityStorageId]: JSON.stringify(identity),
      });
    } catch (e) {
      console.error('Error saving identity', e);
    }
  }

  async createIdentity(): Promise<Identity> {
    const identity = new Identity();
    await this.saveIdentity(identity);
    return identity;
  }

  async loadIdentity(privateKey: string): Promise<Identity> {
    const identity = new Identity(privateKey);
    await this.saveIdentity(identity);
    return identity;
  }
}
