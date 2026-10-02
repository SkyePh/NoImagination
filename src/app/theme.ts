import { computed, Injectable, signal } from '@angular/core';

const FALLBACKS = ['#5c6570', '#6b7280', '#9ca3af', '#e5e7eb'] as const;

export interface ColorSlot {
  index: number;
  label: string;
  role: string;
  raw: string;
  picker: string;
  invalid: boolean;
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly rawColors = signal(['', '', '', '']);

  readonly slots = computed<ColorSlot[]>(() =>
    this.rawColors().map((raw, index) => {
      const normalized = normalizeHex(raw);
      return {
        index,
        label: `Color ${index + 1}`,
        role: ROLES[index],
        raw,
        picker: normalized ?? FALLBACKS[index],
        invalid: raw.trim().length > 0 && normalized === null,
      };
    }),
  );

  readonly cssVars = computed<Record<string, string>>(() => {
    const colors = this.slots().map((slot, index) =>
      slot.invalid || !slot.raw.trim() ? FALLBACKS[index] : slot.picker,
    );
    const [c1, c2, c3, c4] = colors;
    const c2Text = contrastText(c2);
    const c2Hover = shade(c2, 0.16);
    const c2Active = shade(c2, 0.28);

    return {
      '--c1': c1,
      '--c1-text': contrastText(c1),
      '--c2': c2,
      '--c2-text': contrastText(c2),
      '--c2-hover': c2Hover,
      '--c2-active': c2Active,
      '--c3': c3,
      '--c3-text': contrastText(c3),
      '--c3-hover': shade(c3, 0.16),
      '--c4': c4,
      '--c4-text': contrastText(c4),
      '--p-primary-color': c2,
      '--p-primary-500': c2,
      '--p-primary-contrast-color': c2Text,
      '--p-primary-hover-color': c2Hover,
      '--p-primary-active-color': c2Active,
      '--p-focus-ring-color': c2,
      '--p-button-text-primary-color': c2,
      '--p-button-text-primary-hover-background': 'transparent',
      '--p-button-text-primary-active-background': 'transparent',
      '--p-button-primary-focus-ring-color': c2,
      '--p-button-primary-background': c2,
      '--p-button-primary-border-color': c2,
      '--p-button-primary-hover-background': c2Hover,
      '--p-button-primary-hover-border-color': c2Hover,
      '--p-form-field-focus-border-color': c2,
      '--p-inputtext-focus-border-color': c2,
      '--p-checkbox-checked-background': c2,
      '--p-checkbox-checked-hover-background': c2Hover,
      '--p-checkbox-checked-border-color': c2,
      '--p-checkbox-checked-hover-border-color': c2Hover,
      '--p-checkbox-checked-focus-border-color': c2,
      '--p-checkbox-focus-ring-color': c2,
      '--p-checkbox-icon-checked-color': c2Text,
      '--p-checkbox-icon-checked-hover-color': c2Text,
      '--p-select-focus-border-color': c2,
      '--p-select-option-selected-background': c2,
      '--p-select-option-selected-color': c2Text,
      '--p-select-option-selected-focus-background': c2Hover,
      '--p-select-option-selected-focus-color': c2Text,
      '--p-list-option-selected-background': c2,
      '--p-list-option-selected-color': c2Text,
      '--p-list-option-selected-focus-background': c2Hover,
      '--p-list-option-selected-focus-color': c2Text,
      '--p-highlight-background': c2,
      '--p-highlight-color': c2Text,
      '--p-highlight-focus-background': c2Hover,
      '--p-highlight-focus-color': c2Text,
    };
  });

  setColor(index: number, value: string): void {
    this.rawColors.update((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  setPalette(colors: readonly string[]): void {
    this.rawColors.set(colors.slice(0, 4));
  }

  reversePalette(): void {
    this.rawColors.update((current) => [...current].reverse());
  }
}

const ROLES = ['Sidebar', 'Primary', 'Secondary', 'Tags'];

export function parseColorHunt(input: string): string[] | null {
  const trimmed = input.trim();
  const fromUrl = /colorhunt\.co\/palette\/([0-9a-fA-F]{24})(?:[/?#]|$)/i.exec(trimmed);
  const bare = /^#?([0-9a-fA-F]{24})$/.exec(trimmed);
  const code = (fromUrl ?? bare)?.[1];
  if (!code) {
    return null;
  }
  return [0, 1, 2, 3].map((index) => `#${code.slice(index * 6, index * 6 + 6).toLowerCase()}`);
}

export function normalizeHex(input: string): string | null {
  const match = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.exec(input.trim());
  if (!match) {
    return null;
  }
  let hex = match[1];
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return `#${hex.toLowerCase()}`;
}

export function contrastText(hex: string): string {
  const [r, g, b] = rgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.58 ? '#1c2430' : '#ffffff';
}

function shade(hex: string, amount: number): string {
  const toward = contrastText(hex) === '#1c2430' ? '#000000' : '#ffffff';
  return mix(hex, toward, amount);
}

function mix(from: string, to: string, amount: number): string {
  const start = rgb(from);
  const end = rgb(to);
  const channel = (index: number) => Math.round(start[index] + (end[index] - start[index]) * amount);
  return toHex(channel(0), channel(1), channel(2));
}

function rgb(hex: string): [number, number, number] {
  return [
    Number.parseInt(hex.slice(1, 3), 16),
    Number.parseInt(hex.slice(3, 5), 16),
    Number.parseInt(hex.slice(5, 7), 16),
  ];
}

function toHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}
