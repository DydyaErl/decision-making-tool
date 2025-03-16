import type { Component, Option } from '../../types';
import { createElement } from '../../utils/create-element.ts';
import { hasEnoughValidOptions, isValidJsonFile, parseJSONFile } from '../../utils/validation';
import { createAddValidOptionsModal, createPasteListModal } from './modal-windows.ts';
import { Routes } from '../../constants';

type Router = {
    navigate(route: string): void;
};

export class OptionsControl implements Component {
    private element: HTMLElement | null = null;
    private options: Option[];
    private router: Router;
    private onAddOption: () => void;
    private onClearList: () => void;
    private onOptionsImport: (options: Option[]) => void;

    constructor(
        options: Option[],
        router: Router,
        onAddOption: () => void,
        onClearList: () => void,
        onOptionsImport: (options: Option[]) => void
    ) {
        this.options = options;
        this.router = router;
        this.onAddOption = onAddOption;
        this.onClearList = onClearList;
        this.onOptionsImport = onOptionsImport;
    }

    private static createLoadButton(): HTMLButtonElement {
        return createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'load-list-btn',
            textContent: 'Load from JSON',
            attributes: {
                type: 'button',
                title: 'Load options from a JSON file',
            },
            listeners: {
                click: (): void => {
                    const fileInput = document.querySelector<HTMLInputElement>('#load-list-input');
                    if (fileInput) fileInput.click();
                },
            },
        });
    }


    public render(): HTMLElement {
        this.element = createElement<HTMLElement>({
            tagName: 'div',
            className: 'options-control',
            children: [
                this.createAddButton(),
                this.createPasteButton(),
                this.createClearButton(),
                this.createSaveButton(),
                this.createLoadContainer(),
                this.createStartButton(),
            ],
        });

        return this.element;
    }

    private createAddButton(): HTMLButtonElement {
        return createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'add-option-btn',
            textContent: '+ Add Option',
            attributes: {
                type: 'button',
                title: 'Add new option',
            },
            listeners: { click: this.onAddOption },
        });
    }

    private createPasteButton(): HTMLButtonElement {
        return createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'paste-list-btn',
            textContent: 'Paste List',
            attributes: {
                type: 'button',
                title: 'Paste options list',
            },
            listeners: {
                click: (): void => {
                    const modal = createPasteListModal(this.onOptionsImport);
                    modal.showModal();
                },
            },
        });
    }

    private createClearButton(): HTMLButtonElement {
        return createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'clear-list-btn',
            textContent: 'Clear List',
            attributes: {
                type: 'button',
                title: 'Clear all options',
            },
            listeners: { click: this.onClearList },
        });
    }

    private createSaveButton(): HTMLButtonElement {
        return createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'save-list-btn',
            textContent: 'Save to JSON',
            attributes: {
                type: 'button',
                title: 'Save options to a JSON file',
            },
            listeners: { click: (): void => this.saveListToJson() },
        });
    }

    private createFileInput(): HTMLInputElement {
        return createElement<HTMLInputElement>({
            tagName: 'input',
            attributes: {
                type: 'file',
                id: 'load-list-input',
                accept: '.json',
                hidden: 'true',
            },
            listeners: {
                change: (event: Event): void => {
                    const handleFileChange = async (): Promise<void> => {
                        const input = event.target;
                        if (input instanceof HTMLInputElement && input.files && isValidJsonFile(input.files)) {
                            try {
                                const file = input.files[0];
                                if (file) {
                                    const options = await parseJSONFile(file);
                                    this.onOptionsImport(options);
                                }
                            } catch (error) {
                                console.error('Failed to parse JSON file:', error);
                            }
                        }
                        if (input instanceof HTMLInputElement) {
                            input.value = '';
                        }
                    };

                    void handleFileChange();
                },
            },
        });
    }

    private createLoadContainer(): HTMLElement {
        return createElement<HTMLElement>({
            tagName: 'div',
            className: 'load-list-container',
            children: [
                OptionsControl.createLoadButton(),
                this.createFileInput(),
            ],
        });
    }

    private createStartButton(): HTMLButtonElement {
        return createElement<HTMLButtonElement>({
            tagName: 'button',
            className: 'start-btn',
            textContent: 'Start',
            attributes: {
                type: 'button',
                title: 'Go to decision picker',
            },
            listeners: {
                click: (): void => {
                    if (hasEnoughValidOptions(this.options)) {
                        this.router.navigate(Routes.DECISION_PICKER);
                    } else {
                        const modal = createAddValidOptionsModal();
                        modal.showModal();
                    }
                },
            },
        });
    }


    private saveListToJson(): void {
        try {
            const jsonData = JSON.stringify(this.options, null, 2);
            const blob = new Blob([jsonData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = createElement<HTMLAnchorElement>({
                tagName: 'a',
                attributes: {
                    href: url,
                    download: 'decision-options.json',
                },
            });

            document.body.append(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to save options to JSON:', error);
        }
    }
}