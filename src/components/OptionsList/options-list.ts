import type { Component, Option as OptionType } from '../../types';
import { createElement } from '../../utils/create-element.ts';
import { Option } from './option.ts';
import { OptionsControl } from './options-control.ts';
import { loadOptionsFromStorage, saveOptionsToStorage } from '../../utils/local-storage.ts';

type Router = {
    navigate(route: string): void;
};


export class OptionsList implements Component {
    private element: HTMLElement | null = null;
    private options: OptionType[] = [];
    private optionsListContainer: HTMLElement | null = null;
    private nextId = 1;
    private readonly router: Router;

    constructor(router: Router) {
        this.router = router;
        this.loadOptions();
    }


    private static createHeaderRow(): HTMLElement {
        return createElement<HTMLElement>({
            tagName: 'div',
            className: 'option-header',
            children: [
                createElement<HTMLElement>({
                    tagName: 'div',
                    className: 'option-id-header',
                    textContent: 'ID',
                }),
                createElement<HTMLElement>({
                    tagName: 'div',
                    className: 'option-title-header',
                    textContent: 'Название',
                }),
                createElement<HTMLElement>({
                    tagName: 'div',
                    className: 'option-weight-header',
                    textContent: 'Вес',
                }),
                createElement<HTMLElement>({
                    tagName: 'div',
                    className: 'option-actions-header',
                    textContent: 'Действие',
                }),
            ],
        });
    }


    private static createMainStructure(): HTMLElement {
        return createElement<HTMLElement>({
            tagName: 'div',
            className: 'options-list-view',
            children: [
                createElement<HTMLElement>({
                    tagName: 'h1',
                    className: 'app-title',
                    textContent: 'Инструмент принятия решений',
                }),
                createElement<HTMLElement>({
                    tagName: 'div',
                    className: 'options-container',
                    children: [
                        createElement<HTMLElement>({
                            tagName: 'h2',
                            className: 'section-title',
                            textContent: 'Список опций',
                        }),
                        createElement<HTMLElement>({
                            tagName: 'div',
                            className: 'options-list',
                        }),
                    ],
                }),
            ],
        });
    }


    public render(): HTMLElement {
        this.element = OptionsList.createMainStructure();
        this.optionsListContainer = this.element.querySelector('.options-list');
        this.renderOptionsList();

        const optionsControl = new OptionsControl(
            this.options,
            this.router,
            this.addOption.bind(this),
            this.clearList.bind(this),
            this.importOptions.bind(this)
        );

        this.element.append(optionsControl.render());
        return this.element;
    }


    private initializeNextId(): void {
        if (this.options.length === 0) {
            this.nextId = 1; // Reset counter when list is empty
            return;
        }

        const maxId = Math.max(
            ...this.options.map((option) => {
                const idNumber = Number.parseInt(option.id.slice(1), 10);
                return Number.isNaN(idNumber) ? 0 : idNumber;
            })
        );

        this.nextId = maxId + 1;
    }


    private loadOptions(): void {
        this.options = loadOptionsFromStorage();

        // If no options in storage, initialize with a default empty option
        if (this.options.length === 0) {
            this.addOption();
        } else {
            this.initializeNextId();
        }
    }


    private saveOptions(): void {
        saveOptionsToStorage(this.options);
    }


    private generateId(): string {
        return `#${this.nextId++}`;
    }


    private addOption(): void {
        const newOption: OptionType = {
            id: this.generateId(),
            title: '',
            weight: '',
        };

        this.options.push(newOption);
        this.saveOptions();
        this.renderOptionsList();
    }


    private deleteOption(id: string): void {
        this.options = this.options.filter((option) => option.id !== id);

        // Reset next ID if list becomes empty
        if (this.options.length === 0) {
            this.nextId = 1;
            this.addOption(); // Add a default empty option when all are deleted
        }

        this.saveOptions();
        this.renderOptionsList();
    }


    private updateOption(id: string, field: keyof OptionType, value: string): void {
        const optionIndex = this.options.findIndex((option) => option.id === id);

        if (optionIndex !== -1) {
            const currentOption = this.options[optionIndex];
            if (!currentOption) return;

            this.options[optionIndex] = {
                id: currentOption.id,
                title: field === 'title' ? value : currentOption.title,
                weight: field === 'weight' ? value : currentOption.weight,
            };

            this.saveOptions();
        }
    }


    private clearList(): void {
        this.options = [];
        this.nextId = 1;
        this.addOption(); // Add a default empty option when list is cleared
        this.saveOptions();
        this.renderOptionsList();
    }


    private importOptions(newOptions: OptionType[]): void {
        if (newOptions.length === 0) {
            return;
        }


        this.options = [
            ...this.options,
            ...newOptions.map((option) => ({
                ...option,
                id: this.generateId(),
            })),
        ];

        this.saveOptions();
        this.renderOptionsList();
    }


    private renderOptionsList(): void {
        if (!this.optionsListContainer) {
            return;
        }

        const container = this.optionsListContainer;


        container.replaceChildren();

        // Add header row
        container.append(OptionsList.createHeaderRow());


        this.options.forEach((option) => {
            const optionComponent = new Option(
                option,
                this.deleteOption.bind(this),
                this.updateOption.bind(this)
            );

            container.append(optionComponent.render());
        });
    }
}