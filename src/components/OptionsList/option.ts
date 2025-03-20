import type { Option as OptionType, Component } from '../../types';
import { createElement } from '../../utils/create-element.ts';

export class Option implements Component {
  private element: HTMLElement | null = null;
  private option: OptionType;
  private onDelete: (id: string) => void;
  private onUpdate: (
    id: string,
    field: keyof OptionType,
    value: string
  ) => void;

  constructor(
    option: OptionType,
    onDelete: (id: string) => void,
    onUpdate: (id: string, field: keyof OptionType, value: string) => void
  ) {
    this.option = option;
    this.onDelete = onDelete;
    this.onUpdate = onUpdate;
  }

  public render(): HTMLElement {
    this.element = createElement({
      tagName: 'div',
      className: 'option',
      children: [
        this.createIdCell(),
        this.createTitleCell(),
        this.createWeightCell(),
        this.createDeleteCell(),
      ],
    });

    return this.element;
  }

  private createIdCell(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'option-id',
      textContent: this.option.id,
    });
  }

  private createTitleCell(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'option-title',
      children: [
        createElement({
          tagName: 'input',
          className: 'option-title-input',
          attributes: {
            type: 'text',
            value: this.option.title,
            placeholder: 'Enter title',
          },
          listeners: {
            input: (event: Event): void => {
              if (event.target instanceof HTMLInputElement) {
                this.onUpdate(this.option.id, 'title', event.target.value);
              }
            },
          },
        }),
      ],
    });
  }

  private createWeightCell(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'option-weight',
      children: [
        createElement({
          tagName: 'input',
          className: 'option-weight-input',
          attributes: {
            type: 'number',
            value: this.option.weight,
            placeholder: 'Weight',
            min: '0',
            step: '1',
          },
          listeners: {
            input: (event: Event): void => {
              if (event.target instanceof HTMLInputElement) {
                this.onUpdate(this.option.id, 'weight', event.target.value);
              }
            },
          },
        }),
      ],
    });
  }

  private createDeleteCell(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'option-actions',
      children: [
        createElement({
          tagName: 'button',
          className: 'delete-option-btn',
          textContent: '✕',
          attributes: {
            type: 'button',
            title: 'Delete option',
          },
          listeners: {
            click: (): void => {
              this.onDelete(this.option.id);
            },
          },
        }),
      ],
    });
  }
}
