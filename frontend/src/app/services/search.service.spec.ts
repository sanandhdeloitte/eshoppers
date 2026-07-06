import { TestBed }       from '@angular/core/testing';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchService);
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialise with an empty term', () => {
    expect(service.term()).toBe('');
  });

  it('update() should set the search term', () => {
    service.update('laptop');
    expect(service.term()).toBe('laptop');
  });

  it('update() should replace existing term', () => {
    service.update('phone');
    service.update('tablet');
    expect(service.term()).toBe('tablet');
  });

  it('update() should handle empty string', () => {
    service.update('phone');
    service.update('');
    expect(service.term()).toBe('');
  });

  it('reset() should clear the term back to empty string', () => {
    service.update('headphones');
    service.reset();
    expect(service.term()).toBe('');
  });

  it('reset() on already empty term should stay empty', () => {
    service.reset();
    expect(service.term()).toBe('');
  });

  it('update() with whitespace should store whitespace as-is', () => {
    service.update('   ');
    expect(service.term()).toBe('   ');
  });
});
