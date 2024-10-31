import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { generateTransactionId } from '../../utils/idgenarator';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [FormsModule, MatPaginator, CommonModule, MatTableModule, MatButtonModule, DashboardComponent],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.css']
})
export class TransactionHistoryComponent implements OnInit {

  transactions: any[] = [];
  displayedColumns: string[] = ['transactionId', 'date', 'description', 'amount', 'balance'];
  paginatedTransactions: any[] = [];
  pageSize = 5;
  pageIndex = 0;
  loggedInAccountNumber: string | null = null;
  loggedInUserName: string | null = null;
  dataLoaded: boolean | undefined;
  currentBalance: number = 1500;  // Example starting balance
  userMap: { [key: string]: string } = {}; // Map to store account number to name mapping
  processedTransactionIds: Set<string> = new Set(); // Set to track processed transaction IDs

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.loggedInAccountNumber = this.authService.getLoggedInAccountNumber();
    this.loggedInUserName = this.authService.getLoggedInUserName();

    if (this.loggedInAccountNumber) {
      // Fetch all users to create a map of account numbers to names
      this.http.get<any[]>(`http://localhost:3000/users`).subscribe(users => {
        users.forEach(user => {
          this.userMap[user.accountNumber] = user.name;
        });

        // Fetch transactions
        this.http.get<any[]>(`http://localhost:3000/transactions`).subscribe(data => {
          console.log('Fetched transactions:', data);

          // Filter and process transactions for the logged-in user
          this.transactions = data
            .filter(transaction => 
              (transaction.senderAccountNumber === this.loggedInAccountNumber || 
               transaction.receiverAccountNumber === this.loggedInAccountNumber) &&
              !this.processedTransactionIds.has(transaction.id)  // Prevent duplicate processing
            )
            .map(transaction => {
              this.processedTransactionIds.add(transaction.id);  // Mark transaction as processed

              // Determine transaction direction (debit or credit) and update balance
              const amount = this.adjustTransactionAmount(transaction);
              this.updateBalance(transaction, amount);

              return {
                transactionId: generateTransactionId(),
                date: transaction.date,
                description: this.mapTransactionDescription(transaction),
                amount: amount,
                balance: this.currentBalance // Add running balance to the transaction
              };
            });

          this.updatePaginatedTransactions();
          this.dataLoaded = true;
        });
      });
    }
  }

  // Description for each transaction (credit or debit)
  mapTransactionDescription(transaction: any) {
    if (transaction.senderAccountNumber === this.loggedInAccountNumber) {
      return ` ${this.userMap[transaction.receiverAccountNumber] || transaction.receiverAccountNumber}`;
    } else if (transaction.receiverAccountNumber === this.loggedInAccountNumber) {
      return ` ${this.userMap[transaction.senderAccountNumber] || transaction.senderAccountNumber}`;
    }
    return '';
  }

  // Adjust the amount based on whether it's a debit (negative) or credit (positive)
  adjustTransactionAmount(transaction: any) {
    return transaction.senderAccountNumber === this.loggedInAccountNumber ? 
      -Math.abs(transaction.amount) : Math.abs(transaction.amount);
  }

  // Update the running balance after each transaction
  updateBalance(transaction: any, amount: number) {
    if (transaction.senderAccountNumber === this.loggedInAccountNumber) {
      this.currentBalance += amount; // Debit: balance decreases
    } else if (transaction.receiverAccountNumber === this.loggedInAccountNumber) {
      this.currentBalance += amount; // Credit: balance increases
    }
  }

  // Update the displayed transactions after pagination change
  updatePaginatedTransactions() {
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedTransactions = this.transactions.slice(startIndex, endIndex);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePaginatedTransactions();
  }
}
