import { Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { InputComponent } from '../../../shared/ui/input/input';
import { ErrorMessageComponent } from '../../../shared/ui/error-message/error-message';
import { ModalComponent } from '../../../shared/ui/modal/modal';
import { UserService } from '../../../core/auth/services/user.service';   // ← CHANGED

@Component({
  selector: 'app-signup',
  imports: [FormsModule, ButtonComponent, InputComponent, ErrorMessageComponent, ModalComponent],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class Signup {
  private userService = inject(UserService); 
  private router = inject(Router);

  form = { name: '', email: '', password: '' };
  showSuccessPopup = false;
  errorMessage = '';

  signup(signupform: NgForm): void {
    this.errorMessage = '';
    if (signupform.invalid) return;

    this.userService.registerUser(this.form).subscribe({
      next: () => {
        this.showSuccessPopup = true;
        signupform.resetForm();
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'Registration failed';
      },
    });
  }

  goToSignin(): void {
    this.showSuccessPopup = false;
    this.router.navigate(['/login']);
  }
}
