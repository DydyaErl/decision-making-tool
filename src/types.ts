import type { Routes } from './constants';

export type Component = {
  render(): HTMLElement;
  destroy?(): void;
};

export type RouterState = {
  route: (typeof Routes)[keyof typeof Routes];
};

export type Option = {
  id: string;
  title: string;
  weight: string;
};

export type ValidOption = {
  id: string;
  title: string;
  weight: number;
};

export type ElementOptions = {
  tagName: keyof HTMLElementTagNameMap;
  className?: string | string[];
  textContent?: string;
  attributes?: Record<string, string>;
  children?: HTMLElement[];
  listeners?: Record<string, EventListener>;
};
