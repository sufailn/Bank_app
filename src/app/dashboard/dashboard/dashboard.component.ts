import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router'; // Import Router
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, RouterLink,MatCardModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  loggedInUserName: string | null = null;
  accoundBalance: string | null = null;
  loggedInAccountNumber: any;
  constructor(private authService: AuthService, private router: Router) {} // Inject Router
  ngOnInit() {


  this.loggedInUserName = this.authService.getLoggedInUserName();

  const accountNumber = this.authService.getLoggedInAccountNumber();
    if (accountNumber) {
      this.authService.getBalance(accountNumber).subscribe(
        (user) => {
          if (user && user.length > 0) {
            this.accoundBalance = user[0].balance; // Assign the balance from the response
          }
        },
        (error) => {
          console.error('Error fetching balance:', error);
        }
      );
    }
  
  }
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']); // Use injected Router for navigation
  }
}
