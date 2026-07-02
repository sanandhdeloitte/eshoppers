import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IndexedDbService {
  private dbName = 'eshopper-db';
  private storeName = 'users';

  openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'email' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addUser(user: any): Promise<void> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, 'readwrite');
      const store = tx.objectStore(this.storeName);
      const req = store.add(user);
      req.onsuccess = () => resolve();
      req.onerror = () => reject('User already exists');
    });
  }

  async getUserByEmail(email: string): Promise<any> {
    const db = await this.openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(email);
      console.log("request------------------------"+request)
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject('Failed to fetch user');
      };
    });
  }
}
