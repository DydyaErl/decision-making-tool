export type Option = {
  id: string;
  title: string;
  weight: string;
};

export type ValidOption = {
  id: string;
  title: string;
  weight: number;
  color?: string;
};

export type ElementOptions = {
  tagName: string;
  className?: string | string[];
  textContent?: string;
  attributes?: Record<string, string>;
  children?: HTMLElement[];
  listeners?: Record<string, EventListenerOrEventListenerObject>;
};

export type RouterState = {
  route: string;
  params?: Record<string, string>;
};

export type WheelOptions = {
  options: ValidOption[];
  duration: number;
  soundEnabled: boolean;
};

export type Component = {
  render(): HTMLElement;
  destroy?(): void;
};
