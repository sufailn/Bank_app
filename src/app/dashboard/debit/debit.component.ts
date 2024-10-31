import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-debit',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './debit.component.html',
  styleUrls: ['./debit.component.css']
})
export class DebitComponent {
  accountNumber: string = '';
  amount: number = 0;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onDebit() {
    const loggedInAccountNumber = this.authService.getLoggedInAccountNumber();
    if (this.accountNumber !== loggedInAccountNumber) {
      alert('You can only debit from your own account.');
      return;
    }

    this.http.get<any[]>(`http://localhost:3000/users?accountNumber=${this.accountNumber}`).subscribe(users => {
      if (users.length > 0) {
        const user = users[0];
        if (user.balance >= this.amount) {
          user.balance -= this.amount;
          this.http.put(`http://localhost:3000/users/${user.id}`, user).subscribe(() => {
            const transaction = {
              senderAccountNumber: this.accountNumber,
              receiverAccountNumber: this.accountNumber, // Assuming self-debit
              date: new Date().toISOString().split('T')[0],
              description: 'Debit',
              amount: -this.amount,
              balance: user.balance
            };
            this.http.post('http://localhost:3000/transactions', transaction).subscribe(() => {
              alert('Debit successful');
              this.router.navigate(['/dashboard']);
            });
          });
        } else {
          alert('Insufficient balance');
        }
      } else {
        alert('Account not found');
      }
    });
  }
}
