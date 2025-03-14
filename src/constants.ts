// Application constants
export const LOCAL_STORAGE_OPTIONS_KEY = 'decisionMakerOptions';
export const LOCAL_STORAGE_SOUND_KEY = 'decisionMakerSoundEnabled';
export const DEFAULT_DURATION = 10;
export const MIN_DURATION = 5;
export const MIN_VALID_OPTIONS = 2;
export const WHEEL_FULL_ROTATIONS = 5;


export const enum Routes {
    OPTIONS_LIST = 'options-list',
    DECISION_PICKER = 'decision-picker',
    ERROR = 'error',
}


export const enum WheelState {
    INITIAL = 'initial',
    PICKING = 'picking',
    PICKED = 'picked',
}