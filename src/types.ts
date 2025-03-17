import type { Routes } from './constants';

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

export class ElementOptions {}