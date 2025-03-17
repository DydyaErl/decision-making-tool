import type { Component } from '../types/index';
import { createElement } from '../utils/create-element.ts';
import { Routes } from '../constants';
import type { Router } from '../utils/router';


export class ErrorPage implements Component {
    private element: HTMLElement | null = null;
    private readonly router: Router;

    constructor(router: Router) {
        this.router = router;
    }


    public render(): HTMLElement {
        this.element = createElement({
            tagName: 'div',
            className: 'error-page',
            children: [
                createElement({
                    tagName: 'h1',
                    className: 'error-title',
                    textContent: 'Ошибка 404',
                }),
                createElement({
                    tagName: 'p',
                    className: 'error-message',
                    textContent: 'Запрашиваемая страница не найдена.',
                }),
                createElement({
                    tagName: 'button',
                    className: 'back-to-main-btn',
                    textContent: '⬅️ Вернуться на главную',
                    attributes: {
                        type: 'button',
                    },
                    listeners: {
                        click: (): void => {
                            this.router.navigate(Routes.OPTIONS_LIST);
                        },
                    },
                }),
            ],
        });

        if (!this.element) throw new Error('Failed to create error page element');
        return this.element;
    }
}