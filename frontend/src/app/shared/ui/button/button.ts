import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './button.html',
  styleUrl: './button.css',
})
export class ButtonComponent {
  @Input() label = 'Button';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger'  = 'primary';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;

  @Output() pressed = new EventEmitter<void>();

  get buttonClasses(): string[] {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition disabled:pointer-events-none disabled:cursor-default';

    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400',
      secondary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-gray-400',
      danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    };

    return [base, variants[this.variant], this.fullWidth ? 'w-full' : ''];
  }

  handleClick(): void {
    if (!this.disabled && !this.loading) {
      this.pressed.emit();
    }
  }
}
