import { Component, computed, inject, signal } from '@angular/core';
import { ThemeService, parseColorHunt } from './theme';
import { Portal } from './portal';

@Component({
  selector: 'app-root',
  imports: [Portal],
  templateUrl: './app.html',
})
export class App {
  protected readonly theme = inject(ThemeService);
  protected readonly paletteLink = signal('');
  private readonly paletteTouched = signal(false);

  protected readonly paletteError = computed(
    () => this.paletteTouched() && this.paletteLink().trim().length > 0 && parseColorHunt(this.paletteLink()) === null,
  );

  protected onColor(index: number, event: Event): void {
    this.theme.setColor(index, (event.target as HTMLInputElement).value);
  }

  protected onPaletteInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.paletteLink.set(value);
    const colors = parseColorHunt(value);
    if (colors) {
      this.theme.setPalette(colors);
      this.paletteTouched.set(false);
    }
  }

  protected onPalettePaste(): void {
    this.paletteTouched.set(true);
  }

  protected onPaletteBlur(): void {
    if (this.paletteLink().trim().length > 0 && parseColorHunt(this.paletteLink()) === null) {
      this.paletteTouched.set(true);
    }
  }
}
