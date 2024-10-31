import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  accountNumber: string = '';
  password: string = '';
  url:string='';


  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {    this.url=environment.apiUrl
  }

  ngOnInit() {}

  onLogin() {
    if (!this.accountNumber || !this.password) {
      alert('Please enter both account number and password.');
      return;
    }

    this.authService.login(this.accountNumber, this.password).subscribe({
      next: users => {
        if (users.length > 0) {
          const user = users[0];
          this.authService.setLoggedIn(true);
          this.authService.setLoggedInAccountNumber(user.accountNumber);
          this.authService.setLoggedInUserName(user.name);
          this.router.navigate(['/dashboard']);
        } else {
          alert('Invalid account number or password.');
        }
      },
      error: () => alert('Login failed. Please try again.')
    });``
  }

  onRegister() {
    this.router.navigate(['/auth/register']);
  }



  



}
