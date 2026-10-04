// @vitest-environment jsdom
import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it } from 'vitest';
import { App } from './app';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let container: HTMLDivElement;

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  act(() =>
    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    ),
  );
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

it('opens the editor immediately and connects object properties to undo', () => {
  expect(container.querySelector('svg.plan')).not.toBeNull();
  expect(container.querySelectorAll('.room-row')).toHaveLength(8);
  const room = container.querySelector<HTMLButtonElement>('.room-row')!;
  act(() => room.click());
  expect(container.textContent).toContain('СВОЙСТВА ОБЪЕКТА');
  const remove = container.querySelector<HTMLButtonElement>('button.danger')!;
  act(() => remove.click());
  expect(container.querySelectorAll('.room-row')).toHaveLength(7);
  act(() =>
    container
      .querySelector<HTMLButtonElement>('[aria-label="Отменить"]')!
      .click(),
  );
  expect(container.querySelectorAll('.room-row')).toHaveLength(8);
});

it('opens templates and creates an empty project', () => {
  const newProject = [...container.querySelectorAll('button')].find((button) =>
    button.textContent?.includes('Новый проект'),
  )!;
  act(() => newProject.click());
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  const emptyTemplate = [
    ...document.querySelectorAll<HTMLButtonElement>('.template-card'),
  ].find((button) => button.textContent?.includes('Чистый лист'))!;
  act(() => emptyTemplate.click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(container.querySelectorAll('.room-row')).toHaveLength(0);
  expect(
    container.querySelector<HTMLInputElement>(
      '[aria-label="Название проекта"]',
    )!.value,
  ).toBe('Новый проект');
});
