import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authService: AuthService;
  let router: Router;
  let guard: AuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['isLoggedIn']) },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    });

    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    guard = new AuthGuard(authService, router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should call canActivate', () => {
    const route = {} as ActivatedRouteSnapshot;
    const state = {} as RouterStateSnapshot;
    guard.canActivate(route, state);
    expect(authService.isLoggedIn).toHaveBeenCalled();
  });
});
