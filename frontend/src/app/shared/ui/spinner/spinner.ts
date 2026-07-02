import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [NgClass],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
})
export class SpinnerComponent {
  @Input() label = 'Loading...';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() centered = false;

  get spinnerClasses(): string[] {
    const sizes = {
      sm: 'h-5 w-5 border-2',
      md: 'h-8 w-8 border-4',
      lg: 'h-12 w-12 border-4',
    };

    return [
      'inline-block animate-spin rounded-full border-slate-200 border-t-blue-600',
      sizes[this.size],
    ];
  }
}
