import type { ElementOptions } from '../types';


export function createElement<T extends HTMLElement>(options: ElementOptions): T {
    const { tagName, className, textContent, attributes, children, listeners } = options;

    const element = document.createElement(tagName) as T;

    if (className) {
        if (Array.isArray(className)) {
            element.classList.add(...className);
        } else {
            element.classList.add(className);
        }
    }

    if (textContent !== undefined) {
        element.textContent = textContent;
    }


    if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
    }


    if (children) {
        element.replaceChildren(...children);
    }


    if (listeners) {
        Object.entries(listeners).forEach(([event, listener]) => {
            element.addEventListener(event, listener);
        });
    }

    return element;
}