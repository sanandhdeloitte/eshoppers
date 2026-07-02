import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly term = signal('');
  update(value: string) { this.term.set(value); }
  reset() { this.term.set(''); }
}
