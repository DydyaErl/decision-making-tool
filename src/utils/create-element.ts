import type { ElementOptions } from '../types';

function applyClassName(
  element: HTMLElement,
  className: string | string[]
): void {
  if (Array.isArray(className)) {
    element.classList.add(...className);
  } else {
    element.classList.add(className);
  }
}

function applyAttributes(
  element: HTMLElement,
  attributes: Record<string, string>
): void {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function applyListeners(
  element: HTMLElement,
  listeners: Record<string, EventListener>
): void {
  Object.entries(listeners).forEach(([event, listener]) => {
    element.addEventListener(event, listener);
  });
}

export function createElement<K extends keyof HTMLElementTagNameMap>(
  options: ElementOptions & { tagName: K }
): HTMLElementTagNameMap[K] {
  const { tagName, className, textContent, attributes, children, listeners } =
    options;

  const element = document.createElement(tagName);

  if (className) {
    applyClassName(element, className);
  }

  if (textContent !== undefined) {
    element.textContent = textContent;
  }

  if (attributes) {
    applyAttributes(element, attributes);
  }

  if (children) {
    element.replaceChildren(...children);
  }

  if (listeners) {
    applyListeners(element, listeners);
  }

  return element;
}
