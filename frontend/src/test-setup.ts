import '@angular/compiler';
import { readFileSync }                 from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';
import { fileURLToPath }                from 'node:url';
import { ɵresolveComponentResources }   from '@angular/core';
import { TestBed }                      from '@angular/core/testing';
import { beforeEach }                   from 'vitest';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

function getBaseDir(requestOrigin?: string): string {
  if (!requestOrigin) return process.cwd();

  if (requestOrigin.startsWith('file:')) {
    return dirname(fileURLToPath(requestOrigin));
  }

  if (isAbsolute(requestOrigin)) {
    return dirname(requestOrigin);
  }

  return process.cwd();
}

const resolveFn = (url: string, requestOrigin?: string): Promise<string> => {
  const fullPath = resolve(getBaseDir(requestOrigin), url);
  try {
    return Promise.resolve(readFileSync(fullPath, 'utf-8'));
  } catch (e) {
    console.warn(`[test-setup] Could not resolve: ${fullPath}`, e);
    return Promise.resolve('');
  }
};

beforeEach(async () => {
  await ɵresolveComponentResources(resolveFn);
});
