import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/users';
  private isAuthenticated = false;
  private loggedInAccountNumber: string | null = null;
  private loggedInUserName: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  register(user: any) {
    return this.http.post(this.apiUrl, user);
  }

  login(accountNumber: string, password: string) {
    return this.http.get<any[]>(`${this.apiUrl}?accountNumber=${accountNumber}&password=${password}`);
  }
  
  getBalance(accountNumber: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?accountNumber=${accountNumber}`);
  }
  
  isLoggedIn() {
    return this.isAuthenticated;
  }

  setLoggedIn(status: boolean) {
    this.isAuthenticated = status;
  }

  setLoggedInAccountNumber(accountNumber: string) {
    this.loggedInAccountNumber = accountNumber;
  }

  getLoggedInAccountNumber(): string | null {
    return this.loggedInAccountNumber;
  }

  setLoggedInUserName(userName: string) {
    this.loggedInUserName = userName;
  }

  getLoggedInUserName(): string | null {
    return this.loggedInUserName;
  }

  



  logout() {
    this.isAuthenticated = false;
    this.loggedInAccountNumber = null;
    this.loggedInUserName = null;
    this.router.navigate(['/login']);
  }
}
