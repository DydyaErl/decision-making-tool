import type { ValidOption, WheelOptions } from '../../types/index';
import { WheelState, WHEEL_FULL_ROTATIONS } from '../../constants';


export class Wheel {

    private readonly canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private options: ValidOption[] = [];
    private sectionInfo: Array<{
        option: ValidOption;
        startAngle: number;
        endAngle: number;
    }> = [];
    private totalWeight = 0;
    private wheelAngle = 0;
    private targetAngle = 0;
    private state: WheelState = WheelState.INITIAL;
    private readonly onStateChange: (state: WheelState, option: ValidOption | null) => void;
    private animationEndTime = 0;
    private animationDuration = 0;
    private currentOption: ValidOption | null = null;
    private wheelCanvas: HTMLCanvasElement | null = null;
    private wheelWrapper: HTMLDivElement | null = null;
    private animationFrameId = 0;
    private animationStartTime = 0;
    private spinningSound: HTMLAudioElement | null = null;
    private finishSound: HTMLAudioElement | null = null;
    private soundEnabled = true;


    constructor(
        canvas: HTMLCanvasElement,
        options: WheelOptions,
        onStateChange: (state: WheelState, option: ValidOption | null) => void
    ) {
        this.canvas = canvas;
        const context = canvas.getContext('2d');

        if (!context) {
            throw new Error('Could not get 2D context from canvas');
        }
        this.ctx = context;

        this.onStateChange = onStateChange;
        this.soundEnabled = options.soundEnabled;


        this.initializeOptions(options.options);
        this.initializeSounds();
        this.setupWheelCanvas();


        this.startCheckLoop();
    }


    private static forceReflow(element: HTMLElement): void {
        element.offsetWidth;
    }


    private static getEaseOutCubic(progress: number): number {

        return 1 - Math.pow(1 - progress, 3);
    }


    private static getPointerRadians(degrees: number): number {

        const normalizedDegrees = degrees % 360;


        return ((360 - normalizedDegrees) + 270) % 360 * (Math.PI / 180);
    }


    private static getRandomColorString(): string {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 60%)`;
    }


    public spin(durationSeconds: number): void {
        if (this.state === WheelState.PICKING || !this.wheelCanvas) {
            return;
        }


        this.state = WheelState.PICKING;
        this.onStateChange(this.state, null);

        this.prepareSpinningAnimation(durationSeconds);
        this.updateCurrentOption();
    }


    public reset(options: ValidOption[], soundEnabled: boolean): void {
        this.soundEnabled = soundEnabled;
        this.state = WheelState.INITIAL;
        this.currentOption = null;

        this.initializeOptions(options);
        this.resetCanvasAnimation();

        // Update UI
        this.onStateChange(this.state, null);

        // Render initial state
        this.render();
    }


    public destroy(): void {

        cancelAnimationFrame(this.animationFrameId);

        this.stopAllSounds();
        this.removeEventListeners();
        this.restoreOriginalDOM();
    }

   te initializeOptions(optionsList: ValidOption[]): void {
        // Add colors and shuffle options
        this.options = optionsList.map(option => ({
            ...option,
            color: option.color || Wheel.getRandomColorString(),
        }));

        this.options = [...this.options].sort(() => Math.random() - 0.5);


        this.calculateWheelSections();
    }


    private initializeSounds(): void {
        // Spinning sound
        this.spinningSound = new Audio('/sounds/spinning.mp3');
        if (this.spinningSound) {
            this.spinningSound.loop = true;
        }

        // Finish sound
        this.finishSound = new Audio('/sounds/finish.mp3');
    }


    private setupWheelCanvas(): void {
        this.createCanvasWrapper();
        this.render();
    }


    private createCanvasWrapper(): void {
        const canvasParent = this.canvas.parentElement;
        if (!canvasParent) {
            return;
        }


        this.wheelWrapper = document.createElement('div');
        this.wheelWrapper.className = 'wheel-wrapper';
        this.wheelWrapper.style.position = 'relative';
        this.wheelWrapper.style.width = `${this.canvas.width}px`;
        this.wheelWrapper.style.height = `${this.canvas.height}px`;

        this.addPointerToWrapper();


        canvasParent.replaceChild(this.wheelWrapper, this.canvas);
        this.wheelWrapper.append(this.canvas);


        this.wheelCanvas = this.canvas;
        this.canvas.style.transformOrigin = 'center center';
    }


    private addPointerToWrapper(): void {
        if (!this.wheelWrapper) {
            return;
        }

        const pointer = document.createElement('div');
        pointer.className = 'wheel-pointer';
        pointer.style.position = 'absolute';
        pointer.style.top = '0';
        pointer.style.left = '50%';
        pointer.style.transform = 'translateX(-50%)';
        pointer.style.zIndex = '10';

        const triangle = document.createElement('div');
        triangle.style.width = '0';
        triangle.style.height = '0';
        triangle.style.borderLeft = '10px solid transparent';
        triangle.style.borderRight = '10px solid transparent';
        triangle.style.borderBottom = '20px solid red';

        pointer.append(triangle);
        this.wheelWrapper.append(pointer);
    }


    private calculateWheelSections(): void {
        this.sectionInfo = [];
        let startAngle = 0;


        this.totalWeight = this.options.reduce((sum, option) => sum + option.weight, 0);


        for (const option of this.options) {
            const portion = option.weight / this.totalWeight;
            const angleSize = portion * 2 * Math.PI;
            const endAngle = startAngle + angleSize;

            this.sectionInfo.push({
                option,
                startAngle,
                endAngle
            });

            startAngle = endAngle;
        }
    }


    private startCheckLoop(): void {
        this.animationFrameId = requestAnimationFrame(() => {

            if (this.state === WheelState.PICKING) {
                const now = performance.now();


                if (now >= this.animationEndTime) {
                    this.completeAnimation();
                } else {
                    this.updateCurrentOption();
                }
            }


            this.startCheckLoop();
        });
    }


    private prepareSpinningAnimation(durationSeconds: number): void {
        if (!this.wheelCanvas) {
            return;
        }


        this.setupAnimationParameters(durationSeconds);


        this.playSpinningSound();
        this.resetWheelPosition();


        this.startWheelAnimation(durationSeconds);
    }


    private setupAnimationParameters(durationSeconds: number): void {

        const randomAngle = Math.random() * 360;


        const fullRotations = (WHEEL_FULL_ROTATIONS + 3) * 360;
        const targetDegrees = fullRotations + randomAngle;


        this.animationStartTime = performance.now();
        this.animationDuration = durationSeconds * 1000;
        this.animationEndTime = this.animationStartTime + this.animationDuration;


        this.wheelAngle = 0;
        this.targetAngle = targetDegrees;
    }


    private resetWheelPosition(): void {
        if (!this.wheelCanvas) {
            return;
        }


        this.wheelCanvas.style.transition = 'none';
        this.wheelCanvas.style.transform = 'rotate(0deg)';


        Wheel.forceReflow(this.wheelCanvas);
    }


    private startWheelAnimation(durationSeconds: number): void {
        if (!this.wheelCanvas) {
            return;
        }


        this.wheelCanvas.style.transition =
            `transform ${durationSeconds}s cubic-bezier(0.15, 0.85, 0.5, 1)`;
        this.wheelCanvas.style.transform = `rotate(${this.targetAngle}deg)`;


        this.wheelCanvas.addEventListener('transitionend', this.handleTransitionEnd);


        setTimeout(() => {
            if (this.state === WheelState.PICKING) {
                this.completeAnimation();
            }
        }, durationSeconds * 1000 + 50);
    }


    private playSpinningSound(): void {
        if (this.soundEnabled && this.spinningSound) {
            this.spinningSound.currentTime = 0;
            this.spinningSound.play().catch(error => {
                console.error('Error playing spinning sound:', error);
            });
        }
    }


    private updateCurrentOption(): void {
        const option = this.findOptionAtPointer();


        if (option && (!this.currentOption || this.currentOption.id !== option.id)) {
            this.currentOption = option;
            this.onStateChange(this.state, option);
        }
    }


    private handleTransitionEnd = (): void => {
        if (this.state === WheelState.PICKING) {
            this.completeAnimation();
        }


        if (this.wheelCanvas) {
            this.wheelCanvas.removeEventListener('transitionend', this.handleTransitionEnd);
        }
    };


    private completeAnimation(): void {

        if (this.state !== WheelState.PICKING) {
            return;
        }


        this.state = WheelState.PICKED;


        this.stopSpinningSound();
        this.playFinishSound();


        const finalOption = this.findOptionAtPointer();


        this.onStateChange(this.state, finalOption);
    }


    private stopSpinningSound(): void {
        if (this.spinningSound) {
            this.spinningSound.pause();
            this.spinningSound.currentTime = 0;
        }
    }


    private playFinishSound(): void {
        if (this.soundEnabled && this.finishSound) {
            this.finishSound.currentTime = 0;
            this.finishSound.play().catch(error => {
                console.error('Error playing finish sound:', error);
            });
        }
    }


    private resetCanvasAnimation(): void {
        if (!this.wheelCanvas) {
            return;
        }

        this.wheelCanvas.style.transition = 'none';
        this.wheelCanvas.style.transform = 'rotate(0deg)';


        Wheel.forceReflow(this.wheelCanvas);
    }


    private stopAllSounds(): void {
        this.stopSpinningSound();

        if (this.finishSound) {
            this.finishSound.pause();
            this.finishSound.currentTime = 0;
        }
    }


    private removeEventListeners(): void {
        if (this.wheelCanvas) {
            this.wheelCanvas.removeEventListener('transitionend', this.handleTransitionEnd);

            // Reset canvas
            this.wheelCanvas.style.transition = 'none';
            this.wheelCanvas.style.transform = '';
        }
    }


    private restoreOriginalDOM(): void {
        if (this.wheelWrapper && this.wheelCanvas) {
            const parent = this.wheelWrapper.parentElement;
            if (parent) {
                this.wheelCanvas.remove();
                parent.replaceChild(this.wheelCanvas, this.wheelWrapper);
            }
        }
    }


    private findOptionAtPointer(): ValidOption | null {
        if (!this.wheelCanvas || this.options.length === 0) {
            return null;
        }

        const currentDegrees = this.getCurrentRotationDegrees();
        const pointerRadians = Wheel.getPointerRadians(currentDegrees);

        return this.findSectionAtAngle(pointerRadians);
    }


    private getCurrentRotationDegrees(): number {
        if (!this.wheelCanvas) {
            return this.wheelAngle;
        }


        const transformValue = this.wheelCanvas.style.transform;
        const match = transformValue.match(/rotate\(([\d.]+)deg\)/);

        if (match && match[1]) {
            this.wheelAngle = Number.parseFloat(match[1]);
        }


        if (this.state === WheelState.PICKING) {
            const now = performance.now();
            const elapsed = now - this.animationStartTime;

            if (elapsed < this.animationDuration) {
                const progress = elapsed / this.animationDuration;
                const easedProgress = Wheel.getEaseOutCubic(progress);

                const rotationMatch = this.wheelCanvas.style.transform.match(/rotate\(([\d.]+)deg\)/);
                let targetDegrees = 0;

                if (rotationMatch && rotationMatch[1]) {
                    targetDegrees = Number.parseFloat(rotationMatch[1]);
                }

                this.wheelAngle = targetDegrees * easedProgress;
            }
        }

        return this.wheelAngle;
    }


    private findSectionAtAngle(pointerRadians: number): ValidOption | null {
        if (this.options.length === 0) {
            return null;
        }

        const normalizedPointer = pointerRadians % (2 * Math.PI);


        for (const section of this.sectionInfo) {
            if (normalizedPointer >= section.startAngle && normalizedPointer < section.endAngle) {
                return section.option;
            }
        }


        const lastSection = this.sectionInfo.at(-1);
        if (lastSection) {
            const endAngleModular = lastSection.endAngle % (2 * Math.PI);
            if ((lastSection.startAngle <= normalizedPointer && normalizedPointer < 2 * Math.PI) ||
                (0 <= normalizedPointer && normalizedPointer < endAngleModular)) {
                return lastSection.option;
            }
        }


        return this.options.length > 0 ? (this.options[0] ?? null) : null;
    }


    private render(): void {
        this.clearCanvas();
        this.drawWheelSections();
        this.drawCenterElement();
    }


    private clearCanvas(): void {
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);
    }


    private drawWheelSections(): void {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.9;

        for (const section of this.sectionInfo) {
            this.drawSection(section, centerX, centerY, radius);
            this.drawSectionTitle(section, centerX, centerY, radius);
        }
    }


    private drawSection(
        section: { option: ValidOption; startAngle: number; endAngle: number },
        centerX: number,
        centerY: number,
        radius: number
    ): void {
        const { option, startAngle, endAngle } = section;


        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        this.ctx.closePath();


        this.ctx.fillStyle = option.color || '#ccc';
        this.ctx.fill();


        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#333';
        this.ctx.stroke();
    }


    private drawSectionTitle(
        section: { option: ValidOption; startAngle: number; endAngle: number },
        centerX: number,
        centerY: number,
        radius: number
    ): void {
        const { option, startAngle, endAngle } = section;
        const midAngle = (startAngle + endAngle) / 2;
        const angleSize = endAngle - startAngle;


        if (angleSize <= 0.26) {
            return; // Too narrow for text
        }


        this.ctx.save();


        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(midAngle);


        this.ctx.fillStyle = '#000';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.drawTruncatedText(option.title, radius);


        this.ctx.restore();
    }


    private drawTruncatedText(text: string, radius: number): void {

        const maxTextLength = radius * 0.8;


        const textWidth = this.ctx.measureText(text).width;


        if (textWidth <= maxTextLength) {
            this.ctx.fillText(text, radius / 2, 0);
        } else {
            // Calculate how many characters can fit
            const charWidth = textWidth / text.length;
            const maxChars = Math.floor(maxTextLength / charWidth) - 3; // -3 for "..."
            const truncatedText = text.slice(0, maxChars) + '...';
            this.ctx.fillText(truncatedText, radius / 2, 0);
        }
    }


    private drawCenterElement(): void {
        const { width, height } = this.canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.9;

        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = '#fff';
        this.ctx.stroke();
    }
}