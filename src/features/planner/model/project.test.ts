// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { seed } from './project';
import { createTemplate } from './templates';
import { validProject } from './validation';
import { readStoredProject, saveStoredProject } from './storage';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('project files and persistence', () => {
  it.each(['empty', 'single', 'family'])(
    'round trips the %s template',
    (kind) => {
      const project = createTemplate(kind);
      expect(validProject(JSON.parse(JSON.stringify(project)))).toBe(true);
      expect(saveStoredProject(project)).toBe(true);
      expect(readStoredProject()).toEqual(project);
    },
  );

  it('accepts short hex colors from earlier exported projects', () => {
    const project = structuredClone(seed);
    project.floors[0][0].color = '#fff';
    expect(validProject(project)).toBe(true);
  });

  it('rejects duplicate object IDs, invalid sizes and invalid kinds', () => {
    const duplicate = structuredClone(seed);
    duplicate.floors[0][1].id = duplicate.floors[0][0].id;
    expect(validProject(duplicate)).toBe(false);
    const outside = structuredClone(seed);
    outside.floors[0][0].w = 25;
    expect(validProject(outside)).toBe(false);
    expect(
      validProject({
        name: 'Test',
        floors: [[{ ...seed.floors[0][0], kind: 'script' }]],
      }),
    ).toBe(false);
    expect(validProject(null)).toBe(false);
    expect(validProject({ name: 'Test', floors: [] })).toBe(false);
  });

  it('recovers from corrupt and unavailable browser storage', () => {
    localStorage.setItem('domplan-project', '{broken');
    expect(readStoredProject()).toEqual(seed);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota');
    });
    expect(readStoredProject()).toEqual(seed);
    expect(saveStoredProject(seed)).toBe(false);
  });
});
