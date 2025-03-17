import type { RouterState } from '../types';
import { Routes } from '../constants';

type RouteValue = (typeof Routes)[keyof typeof Routes];

function isRouteValue(value: unknown): value is RouteValue {
    return typeof value === 'string' &&
        Object.values(Routes).includes(value as RouteValue);
}

export class Router {
    private currentState: RouterState;
    private routes: Partial<Record<RouteValue, () => void>>;
    private notFoundCallback: (() => void) | null = null;
    private isHandlingRoute = false;

    constructor() {
        this.routes = {};
        this.currentState = { route: Routes.OPTIONS_LIST };
        this.setInitialRoute();
        window.addEventListener('hashchange', this.handleHashChange);
    }

    public addRoute(route: RouteValue, callback: () => void): this {
        this.routes[route] = callback;
        return this;
    }

    public setNotFoundCallback(callback: () => void): this {
        this.notFoundCallback = callback;
        return this;
    }

    public navigate(route: RouteValue): void {
        if (route === this.currentState.route) {
            return;
        }
        window.location.hash = `#${route}`;
    }

    public getCurrentRoute(): RouteValue {
        return this.currentState.route;
    }

    private setInitialRoute(): void {
        const hash = window.location.hash.slice(1);
        if (hash && isRouteValue(hash)) {
            this.currentState = { route: hash };
        } else {
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