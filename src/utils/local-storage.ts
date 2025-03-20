import type { Option } from '../types';
import { LOCAL_STORAGE_OPTIONS_KEY, LOCAL_STORAGE_SOUND_KEY } from '../constants';

export function saveOptionsToStorage(options: Option[]): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_OPTIONS_KEY, JSON.stringify(options));
    } catch (error) {
        console.error('Failed to save options to localStorage:', error);
    }
}

export function loadOptionsFromStorage(): Option[] {
    try {
        const storedOptions = localStorage.getItem(LOCAL_STORAGE_OPTIONS_KEY);

        if (!storedOptions) {
            return [];
        }


        const isOptionArray = (data: unknown): data is Option[] => {
            if (!Array.isArray(data)) return false;

            return data.every((item) => {
                if (!item || typeof item !== 'object') return false;

                const keys = ['id', 'title', 'weight'];
                return keys.every(key =>
                    Object.prototype.hasOwnProperty.call(item, key) &&
                    typeof Object.getOwnPropertyDescriptor(item, key)?.value === 'string'
                );
            });
        };

        const parsedData: unknown = JSON.parse(storedOptions);

        if (isOptionArray(parsedData)) {
            return parsedData;
        }

        return [];
    } catch (error) {
        console.error('Failed to load options from localStorage:', error);
        return [];
    }
}


export function saveSoundStateToStorage(enabled: boolean): void {
    try {
        localStorage.setItem(LOCAL_STORAGE_SOUND_KEY, JSON.stringify(enabled));
    } catch (error) {
        console.error('Failed to save sound state to localStorage:', error);
    }
}


export function loadSoundStateFromStorage(): boolean {
    try {
        const storedState = localStorage.getItem(LOCAL_STORAGE_SOUND_KEY);

        if (storedState === null) {
            return true; // Default to enabled
        }

        return JSON.parse(storedState) === true;
    } catch (error) {
        console.error('Failed to load sound state from localStorage:', error);
        return true;
    }
}