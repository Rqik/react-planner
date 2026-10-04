import { seed, type Project } from './project';
import { validProject } from './validation';

// Keep the existing key and JSON shape compatible with previously saved plans.
const STORAGE_KEY = 'domplan-project';

export function readStoredProject(): Project {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? 'null',
    );
    if (validProject(stored)) return stored;
  } catch {
    // Storage can be unavailable or contain invalid JSON; start with a template.
  }
  return structuredClone(seed);
}

export function saveStoredProject(project: Project): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    return true;
  } catch {
    return false;
  }
}
