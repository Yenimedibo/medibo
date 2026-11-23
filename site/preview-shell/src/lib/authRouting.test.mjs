import assert from 'node:assert/strict';
import test from 'node:test';
import { appRouteMode } from './authRouting.mjs';

test('public homepage and help pages do not depend on Clerk configuration', () => {
  for (const path of ['/', '/?source=synthetic', '/privacy', '/account-help', '/not-a-route']) {
    assert.equal(appRouteMode(path, false), 'public', path);
    assert.equal(appRouteMode(path, true), 'public', path);
  }
});

test('protected projects and auth pages fail closed when Clerk is missing', () => {
  for (const path of [
    '/courses',
    '/courses/talk-to-ai/#dar/lesson-1',
    '/talk-to-ai/#en/lesson-1',
    '/reality-101/#episode-1',
    '/timeline-map',
    '/workbench/',
    '/sign-in?returnTo=%2Ftimeline-map',
    '/sign-up',
    '/auth/continue?returnTo=%2Fcourses',
  ]) {
    assert.equal(appRouteMode(path, false), 'auth-unavailable', path);
    assert.equal(appRouteMode(path, true), 'clerk', path);
  }
});
