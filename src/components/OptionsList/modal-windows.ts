import type { Option } from '../../types';
import { createElement } from '../../utils/create-element.ts';
import { parseCSVOptionsData } from '../../utils/validation';


function createPasteListModalContent(dialog: HTMLDialogElement, onConfirm: (options: Option[]) => void): HTMLElement {
    return createElement<HTMLElement>({
        tagName: 'div',
        className: 'modal-content',
        children: [
            createElement<HTMLElement>({
                tagName: 'h3',
                className: 'modal-title',
                textContent: 'Paste Options List',
            }),
            createElement<HTMLElement>({
                tagName: 'p',
                className: 'modal-description',
                textContent: 'Enter your options in CSV format (title, weight), one per line:',
            }),
            createElement<HTMLTextAreaElement>({
                tagName: 'textarea',
                className: 'paste-field',
                attributes: {
                    rows: '6',
                    placeholder: 'Option 1, 10\nOption 2, 5\nOption 3, 15',
                },
            }),
            createModalActions(dialog, onConfirm),
        ],
    });
}


function createModalActions(dialog: HTMLDialogElement, onConfirm: (options: Option[]) => void): HTMLElement {
    return createElement<HTMLElement>({
        tagName: 'div',
        className: 'modal-actions',
        children: [
            createElement<HTMLButtonElement>({
                tagName: 'button',
                className: 'modal-cancel-btn',
                textContent: 'Cancel',
                attributes: { type: 'button' },
                listeners: { click: (): void => dialog.close() },
            }),
            createElement<HTMLButtonElement>({
                tagName: 'button',
                className: 'modal-confirm-btn',
                textContent: 'Confirm',
                attributes: { type: 'button' },
                listeners: {
                    click: (): void => {
                        const textarea = dialog.querySelector<HTMLTextAreaElement>('.paste-field');
                        if (textarea) {
                            const options = parseCSVOptionsData(textarea.value);
                            if (options) onConfirm(options);
                        }
                        dialog.close();
                    },
                },
            }),
        ],
    });
}


function setupModalEventListeners(dialog: HTMLDialogElement): void {
    dialog.addEventListener('click', (event): void => {
        if (event.target === dialog) dialog.close();
    });

    dialog.addEventListener('keydown', (event): void => {
        if (event.key === 'Escape') dialog.close();
    });

    dialog.addEventListener('close', (): void => dialog.remove());
}


export function createPasteListModal(onConfirm: (options: Option[]) => void): HTMLDialogElement {
    const dialog = createElement<HTMLDialogElement>({
        tagName: 'dialog',
        className: 'modal paste-list-modal',
    });

    dialog.append(createPasteListModalContent(dialog, onConfirm));
    setupModalEventListeners(dialog);
    document.body.append(dialog);

    return dialog;
}


function createValidOptionsModalContent(dialog: HTMLDialogElement): HTMLElement {
    return createElement<HTMLElement>({
        tagName: 'div',
        className: 'modal-content',
        children: [
            createElement<HTMLElement>({
                tagName: 'h3',
                className: 'modal-title',
                textContent: 'Not Enough Valid Options',
            }),
            createElement<HTMLElement>({
                tagName: 'p',
                className: 'modal-description',
                textContent: 'Please add at least two valid options. A valid option must have a title and a weight greater than 0.',
            }),
            createElement<HTMLElement>({
                tagName: 'div',
                className: 'modal-actions',
                children: [
                    createElement<HTMLButtonElement>({
                        tagName: 'button',
                        className: 'modal-close-btn',
                        textContent: 'Close',
                        attributes: { type: 'button' },
                        listeners: { click: (): void => dialog.close() },
                    }),
                ],
            }),
        ],
    });
}


export function createAddValidOptionsModal(): HTMLDialogElement {
    const dialog = createElement<HTMLDialogElement>({
        tagName: 'dialog',
        className: 'modal add-valid-options-modal',
    });

    dialog.append(createValidOptionsModalContent(dialog));
    setupModalEventListeners(dialog);
    document.body.append(dialog);

    return dialog;
}