import type { Component, Option, ValidOption } from '../../types/index';
import { createElement } from '../../utils/create-element.ts';
import { getValidOptions } from '../../utils/validation';
import {
  DEFAULT_DURATION,
  MIN_DURATION,
  MAX_DURATION,
  Routes,
  WheelState,
} from '../../constants';
import { loadOptionsFromStorage } from '../../utils/local-storage.ts';
import { Wheel } from './wheel.ts';
import {
  loadSoundStateFromStorage,
  saveSoundStateToStorage,
} from '../../utils/local-storage.ts';

type Router = {
  navigate(route: string): void;
};

export class DecisionPicker implements Component {
  private element: HTMLElement | null = null;
  private options: Option[] = [];
  private validOptions: ValidOption[] = [];
  private wheel: Wheel | null = null;
  private pickedOptionElement: HTMLElement | null = null;
  private soundButtonElement: HTMLButtonElement | null = null;
  private backButton: HTMLButtonElement | null = null;
  private soundButton: HTMLButtonElement | null = null;
  private durationInput: HTMLInputElement | null = null;
  private pickButton: HTMLButtonElement | null = null;
  private currentState: WheelState = WheelState.INITIAL;
  private currentPickedOption: ValidOption | null = null;
  private router: Router;
  private soundEnabled = true;

  constructor(router: Router) {
    this.router = router;
    this.loadOptions();
    this.soundEnabled = loadSoundStateFromStorage();
  }

  private static createHeaderElement(): HTMLElement {
    return createElement({
      tagName: 'h1',
      className: 'app-title',
      textContent: 'Инструмент принятия решений',
    });
  }

  private static createWheelContainer(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'wheel-container',
      children: [
        createElement({
          tagName: 'canvas',
          className: 'wheel-canvas',
          attributes: {
            width: '500',
            height: '500',
          },
        }),
      ],
    });
  }

  private static createPickedOptionElement(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'picked-option',
      textContent: 'Нажмите кнопку "Выбрать", чтобы начать!',
    });
  }

  private static createDurationContainer(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'duration-container',
      children: [
        createElement({
          tagName: 'label',
          className: 'duration-label',
          textContent: '⏱️ Длительность (сек):',
        }),
        createElement({
          tagName: 'input',
          className: 'duration-input',
          attributes: {
            type: 'number',
            min: String(MIN_DURATION),
            max: String(MAX_DURATION),
            value: String(DEFAULT_DURATION),
            step: '1',
          },
        }),
      ],
    });
  }

  public render(): HTMLElement {
    if (this.validOptions.length < 2) {
      console.log('Not enough valid options, redirecting to options list');
      return this.renderRedirectPlaceholder();
    }

    this.element = this.createMainElement();

    this.storeElementReferences();

    this.initializeWheel();

    return this.element;
  }

  public destroy(): void {
    if (this.wheel) {
      this.wheel.destroy();
      this.wheel = null;
    }
  }

  private loadOptions(): void {
    this.options = loadOptionsFromStorage();
    this.validOptions = getValidOptions(this.options);
  }

  private renderRedirectPlaceholder(): HTMLElement {
    // Redirect to options list
    setTimeout(() => {
      this.router.navigate(Routes.OPTIONS_LIST);
    }, 0);

    return createElement({
      tagName: 'div',
      className: 'loading',
      textContent: 'Перенаправление на список опций...',
    });
  }

  private createMainElement(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'decision-picker-view',
      children: [
        DecisionPicker.createHeaderElement(),
        DecisionPicker.createWheelContainer(),
        DecisionPicker.createPickedOptionElement(),
        this.createControlsElement(),
      ],
    });
  }

  private createControlsElement(): HTMLElement {
    return createElement({
      tagName: 'div',
      className: 'decision-controls',
      children: [
        this.createBackButton(),
        this.createSoundButton(),
        DecisionPicker.createDurationContainer(),
        this.createPickButton(),
      ],
    });
  }

  private createBackButton(): HTMLButtonElement {
    return createElement({
      tagName: 'button',
      className: 'back-btn',
      textContent: '⬅️ Назад',
      attributes: {
        type: 'button',
        title: 'Вернуться к списку опций',
      },
      listeners: {
        click: (): void => {
          this.router.navigate(Routes.OPTIONS_LIST);
        },
      },
    });
  }

  private createSoundButton(): HTMLButtonElement {
    return createElement({
      tagName: 'button',
      className: 'sound-btn',
      textContent: this.soundEnabled ? '🔊' : '🔇',
      attributes: {
        type: 'button',
        title: this.soundEnabled ? 'Звук включен' : 'Звук выключен',
      },
      listeners: {
        click: this.toggleSound,
      },
    });
  }

  private createPickButton(): HTMLButtonElement {
    return createElement({
      tagName: 'button',
      className: 'pick-btn',
      textContent: '▶ Выбрать',
      attributes: {
        type: 'button',
        title: 'Запустить выбор решения',
      },
      listeners: {
        click: this.startWheel,
      },
    });
  }

  private storeElementReferences(): void {
    if (!this.element) return;

    this.pickedOptionElement = this.element.querySelector('.picked-option');
    this.soundButtonElement = this.element.querySelector('.sound-btn');
    this.backButton = this.element.querySelector('.back-btn');
    this.soundButton = this.element.querySelector('.sound-btn');
    this.durationInput = this.element.querySelector('.duration-input');
    this.pickButton = this.element.querySelector('.pick-btn');
  }

  private initializeWheel(): void {
    setTimeout(() => {
      if (!this.element) return;

      const wheelCanvas = this.element.querySelector('.wheel-canvas');
      if (!wheelCanvas || !(wheelCanvas instanceof HTMLCanvasElement)) return;

      this.wheel = new Wheel(
        wheelCanvas,
        {
          options: this.validOptions,
          duration: DEFAULT_DURATION,
          soundEnabled: this.soundEnabled,
        },
        this.handleWheelStateChange
      );
    }, 0);
  }

  private handleWheelStateChange = (
    state: WheelState,
    pickedOption: ValidOption | null
  ): void => {
    this.currentState = state;

    if (pickedOption !== null) {
      this.currentPickedOption = pickedOption;
    }

    window.requestAnimationFrame(() => {
      this.updateUI();
    });
  };

  private updateUI(): void {
    if (!this.pickedOptionElement) return;

    this.updatePickedOptionDisplay();
    this.updateControlsState();
  }

  private updatePickedOptionDisplay(): void {
    if (!this.pickedOptionElement) return;

    let message = '';

    switch (this.currentState) {
      case WheelState.INITIAL: {
        message = 'Нажмите кнопку "Выбрать", чтобы начать!';
        this.pickedOptionElement.classList.remove('highlighted');
        break;
      }
      case WheelState.PICKING: {
        message = this.currentPickedOption
          ? this.currentPickedOption.title
          : 'Вращение...';
        this.pickedOptionElement.classList.remove('highlighted');
        break;
      }
      case WheelState.PICKED: {
        message = this.currentPickedOption
          ? this.currentPickedOption.title
          : 'Не удалось выбрать опцию';
        this.pickedOptionElement.classList.add('highlighted');
        break;
      }
    }

    this.pickedOptionElement.textContent = message;
  }

  private updateControlsState(): void {
    if (
      !this.backButton ||
      !this.soundButton ||
      !this.durationInput ||
      !this.pickButton
    )
      return;

    const isDisabled = this.currentState === WheelState.PICKING;

    this.backButton.disabled = isDisabled;
    this.soundButton.disabled = isDisabled;
    this.durationInput.disabled = isDisabled;
    this.pickButton.disabled = isDisabled;

    if (isDisabled) {
      this.backButton.classList.add('disabled');
      this.soundButton.classList.add('disabled');
      this.durationInput.classList.add('disabled');
      this.pickButton.classList.add('disabled');
    } else {
      this.backButton.classList.remove('disabled');
      this.soundButton.classList.remove('disabled');
      this.durationInput.classList.remove('disabled');
      this.pickButton.classList.remove('disabled');
    }
  }

  private toggleSound = (): void => {
    this.soundEnabled = !this.soundEnabled;
    saveSoundStateToStorage(this.soundEnabled);

    if (this.soundButtonElement) {
      const iconContent = this.soundEnabled ? '🔊' : '🔇';
      const titleText = this.soundEnabled ? 'Звук включен' : 'Звук выключен';

      this.soundButtonElement.textContent = iconContent;
      this.soundButtonElement.title = titleText;
    }

    if (this.wheel) {
      this.wheel.updateSoundSetting(this.soundEnabled);
    }
  };

  private startWheel = (): void => {
    if (!this.wheel || this.currentState === WheelState.PICKING) return;

    if (!this.durationInput) return;

    const duration = Number.parseInt(this.durationInput.value, 10);

    if (duration >= MIN_DURATION && duration <= MAX_DURATION) {
      this.wheel.spin(duration);
    } else {
      this.durationInput.reportValidity();
    }
  };
}
