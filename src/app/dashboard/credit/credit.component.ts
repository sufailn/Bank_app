import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-credit',
  standalone: true,
  imports: [FormsModule, CommonModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './credit.component.html',
  styleUrls: ['./credit.component.css']
})
export class CreditComponent {
  accountNumber: string = '';
  amount: number = 0;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {}

  onCredit() {
    // Basic validation
    if (!this.accountNumber || this.amount <= 0) {
      alert('Please enter a valid account number and amount.');
      return;
    }

    const loggedInAccountNumber = this.authService.getLoggedInAccountNumber();
    console.log('Logged in account number:', loggedInAccountNumber);

    // Step 1: Get the receiver's details
    this.http.get<any[]>(`http://localhost:3000/users?accountNumber=${this.accountNumber}`).subscribe({
      next: (users) => {
        if (users.length > 0) {
          const receiver = users[0];
          console.log('Receiver before update:', receiver);

          // Step 2: Update both receiver and sender balances in parallel
          const receiverUpdated = { ...receiver, balance: receiver.balance + this.amount };

          this.http.get<any[]>(`http://localhost:3000/users?accountNumber=${loggedInAccountNumber}`).subscribe(senderUsers => {
            if (senderUsers.length > 0) {
              const sender = senderUsers[0];
              console.log('Sender before update:', sender);

              const senderUpdated = { ...sender, balance: sender.balance - this.amount };

              // Step 3: Perform parallel balance updates and transaction logs using forkJoin
              forkJoin([
                this.http.put(`http://localhost:3000/users/${receiver.id}`, receiverUpdated),
                this.http.put(`http://localhost:3000/users/${sender.id}`, senderUpdated),
                this.http.post('http://localhost:3000/transactions', {
                  senderAccountNumber: loggedInAccountNumber,
                  receiverAccountNumber: this.accountNumber,
                  date: new Date().toISOString().split('T')[0],
                  description: 'Credit',
                  amount: this.amount,
                  balance: receiverUpdated.balance
                }),
                this.http.post('http://localhost:3000/transactions', {
                  senderAccountNumber: loggedInAccountNumber,
                  receiverAccountNumber: this.accountNumber,
                  date: new Date().toISOString().split('T')[0],
                  description: 'Debit',
                  amount: -this.amount, // Debit from sender
                  balance: senderUpdated.balance
                })
              ]).subscribe({
                next: () => {
                  alert('Credit successful');
                  this.router.navigate(['/dashboard']);
                },
                error: () => alert('Failed to complete the transaction. Please try again later.')
              });
            } else {
              alert('Sender account not found');
            }
          });
        } else {
          alert('Receiver account not found');
        }
      },
      error: () => alert('Failed to fetch user data')
    });
  }
}
