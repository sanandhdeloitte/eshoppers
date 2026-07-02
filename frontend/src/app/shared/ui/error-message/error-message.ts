import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-message',
  standalone: true,
  templateUrl: './error-message.html',
  styleUrl: './error-message.css',
})
export class ErrorMessageComponent {
  @Input() message = '';
}
