import type { RouterState } from '../types';
import { Routes } from '../constants';

type RouteValue = (typeof Routes)[keyof typeof Routes];

function isRouteValue(value: unknown): value is RouteValue {
    return typeof value === 'string' &&
        (value === '/options-list' || value === '/error');
}

export class Router {
    private currentState: RouterState;
    private routes: Partial<Record<RouteValue, () => void>>;
    private notFoundCallback: (() => void) | null = null;
    private isHandlingRoute = false;

    constructor() {
        this.routes = {};
        this.currentState = { route: Routes.OPTIONS_LIST };

        // Set initial route
        this.setInitialRoute();

        // Listen for hash changes
        window.addEventListener('hashchange', this.handleHashChange);
    }


    public addRoute(route: string, callback: () => void): this {
        if (isRouteValue(route)) {
            this.routes[route] = callback;
        }
        return this;
    }


    public setNotFoundCallback(callback: () => void): this {
        this.notFoundCallback = callback;
        return this;
    }


    public navigate(route: string): void {
        if (route === this.currentState.route) {
            return; // Предотвращаем навигацию к текущему маршруту
        }

        window.location.hash = `#${route}`;

    }


    public getCurrentRoute(): string {
        return this.currentState.route;
    }


    private setInitialRoute(): void {
        const hash = window.location.hash.slice(1);
        if (hash && isRouteValue(hash)) {
            this.currentState = { route: hash };
        } else {
            // Set default route if no hash or invalid route
            window.location.hash = `#${Routes.OPTIONS_LIST}`;
            this.currentState = { route: Routes.OPTIONS_LIST };
        }
    }

    private handleEmptyHash(): void {
        window.location.hash = `#${Routes.OPTIONS_LIST}`;
        this.currentState = { route: Routes.OPTIONS_LIST };
    }

    private handleInvalidRoute(): void {
        if (this.notFoundCallback) {
            window.location.hash = `#${Routes.ERROR}`;
        }
    }

    private executeRouteCallback(route: RouteValue): void {
        this.currentState = { route };

        const callback = this.routes[route];
        if (callback) {
            callback();
        } else if (route !== Routes.ERROR && this.notFoundCallback) {
            this.redirectToError();
        } else if (route === Routes.ERROR && this.notFoundCallback) {
            this.notFoundCallback();
        }
    }

    private redirectToError(): void {
        if (this.notFoundCallback) {
            window.location.hash = `#${Routes.ERROR}`;
            this.currentState = { route: Routes.ERROR };
        }
    }


    private handleHashChange = (): void => {
        if (this.isHandlingRoute) {
            return;
        }

        try {
            this.isHandlingRoute = true;

            const hash = window.location.hash.slice(1);

            if (!hash) {
                this.handleEmptyHash();
                return;
            }

            if (!isRouteValue(hash)) {
                this.handleInvalidRoute();
                return;
            }

            this.executeRouteCallback(hash);
        } finally {
            this.isHandlingRoute = false;
        }
    }
}