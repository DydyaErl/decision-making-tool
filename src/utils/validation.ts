import type { Option, ValidOption } from '../types';
import { MIN_VALID_OPTIONS } from '../constants';

type OptionLike = {
    id: unknown;
    title: unknown;
    weight: unknown;
}

function isOptionLike(value: unknown): value is OptionLike {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        'title' in value &&
        'weight' in value
    );
}

type StringRecord = {
    id: string;
    title: string;
    weight: string;
}

function hasValidOptionProperties(value: OptionLike): value is StringRecord {
    return (
        typeof value.id === 'string' &&
        typeof value.title === 'string' &&
        typeof value.weight === 'string'
    );
}

export function isValidOption(value: unknown): value is Option {
    if (!isOptionLike(value)) return false;
    if (!hasValidOptionProperties(value)) return false;

    const trimmedTitle = value.title.trim();
    const trimmedWeight = value.weight.trim();
    const parsedWeight = Number.parseFloat(value.weight);

    if (
        trimmedTitle.length === 0 ||
        trimmedWeight.length === 0 ||
        Number.isNaN(parsedWeight) ||
        parsedWeight <= 0
    ) {
        return false;
    }

    return true;
}


export function getValidOptions(options: unknown[]): ValidOption[] {
    return options
        .filter((option): option is Option => isValidOption(option))
        .map(option => ({
            id: option.id,
            title: option.title,
            weight: Number.parseFloat(option.weight)
        }));
}


export function hasEnoughValidOptions(options: Option[]): boolean {
    const validOptions = getValidOptions(options);
    return validOptions.length >= MIN_VALID_OPTIONS;
}


export function parseCSVOptionsData(text: string): Option[] | null {
    try {
        const lines = text
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            return null;
        }

        return lines.map((line, index) => {
            const [title, weightString] = line.split(',').map((part) => part.trim());

            // Convert to number and check if valid
            const weight = weightString || '';

            return {
                id: `#${index + 1}`,
                title: title || '',
                weight,
            };
        });
    } catch (error) {
        console.error('Failed to parse CSV data:', error);
        return null;
    }
}


export function isValidJsonFile(fileList: FileList | null): boolean {
    if (!fileList || fileList.length !== 1) {
        return false;
    }

    const file = fileList[0];
    if (!file) return false;

    return file.type === 'application/json' || file.name.endsWith('.json');
}

type JsonOption = {
    id: string;
    title: string;
    weight: string | number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function hasRequiredJsonKeys(value: Record<string, unknown>): boolean {
    return ['id', 'title', 'weight'].every(key => key in value);
}

function isStringValue(value: unknown): value is string {
    return typeof value === 'string';
}

function isValidWeightValue(value: unknown): value is string | number {
    return isStringValue(value) || typeof value === 'number';
}

function isValidJsonItem(item: unknown): item is JsonOption {
    if (!isRecord(item)) return false;
    if (!hasRequiredJsonKeys(item)) return false;

    const { id, title, weight } = item;

    return (
        isStringValue(id) &&
        isStringValue(title) &&
        isValidWeightValue(weight)
    );
}

function isUnknownArray(value: unknown): value is unknown[] {
    return Array.isArray(value);
}

function parseJsonContent(content: string): Option[] {
    const data: unknown = JSON.parse(content);

    if (!isUnknownArray(data)) {
        throw new Error('Invalid JSON format: expected an array');
    }

    const validItems = data.filter(isValidJsonItem);
    if (validItems.length !== data.length) {
        throw new Error('Invalid JSON format: some items are invalid');
    }

    return validItems.map((item) => ({
        id: item.id,
        title: item.title,
        weight: String(item.weight),
    }));
}


export function parseJSONFile(file: File): Promise<Option[]> {
    return file.text()
        .then(parseJsonContent)
        .catch((error) => {
            console.error('Failed to parse JSON file:', error);
            throw new Error('Failed to parse JSON file');
        });
}