import type { Component } from '../types';
import { Routes } from '../constants';
import { Router } from '../utils/router';
import { OptionsList } from './OptionsList/options-list.ts';
import { DecisionPicker } from './DecisionPicker/decision-picker.ts';
import { ErrorPage } from './error-page';

export class App implements Component {
  private element: HTMLElement;
  private router: Router;
  private currentView: { render(): HTMLElement; destroy?(): void } | null =
    null;

  constructor() {
    // Create main container
    this.element = document.createElement('div');
    this.element.className = 'app-container';

    this.router = new Router();

    this.setupRoutes();
  }

  public render(): HTMLElement {
    return this.element;
  }

  private setupRoutes(): void {
    this.router
      .addRoute(Routes.OPTIONS_LIST, () => {
        this.renderView(new OptionsList(this.router));
      })
      .addRoute(Routes.DECISION_PICKER, () => {
        this.renderView(new DecisionPicker(this.router));
      })
      .setNotFoundCallback(() => {
        this.renderView(new ErrorPage(this.router));
      });
  }

  private renderView(view: { render(): HTMLElement; destroy?(): void }): void {
    if (this.currentView?.destroy) {
      this.currentView.destroy();
    }

    this.currentView = view;
    this.element.replaceChildren(view.render());
  }
}
