import { TestBed }                              from '@angular/core/testing';
import { HttpClientTestingModule,
         HttpTestingController }                from '@angular/common/http/testing';
import { UserService }                          from './user.service';
import { environment }                          from '../../../../environments/environment';

const API = `${environment.apiUrl}/users`;

describe('UserService', () => {
  let service:  UserService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [UserService],
    }).compileComponents();
    service  = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => expect(service).toBeTruthy());

  // registerUser
  it('registerUser() should POST to /users/register', () => {
    const user = { name: 'John', email: 'j@test.com', password: 'pass123' };
    service.registerUser(user).subscribe(res => {
      expect(res.success).toBe(true);
    });
    const req = httpMock.expectOne(`${API}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(user);
    req.flush({ success: true, message: 'Registered' });
  });

  // loginUser
  it('loginUser() should POST email and password', () => {
    service.loginUser('j@test.com', 'pass').subscribe(res => {
      expect(res.token).toBe('tok');
    });
    const req = httpMock.expectOne(`${API}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'j@test.com', password: 'pass' });
    req.flush({ success: true, user: { sub: '1' }, token: 'tok' });
  });

  // guestLogin
  it('guestLogin() should POST name and phone', () => {
    service.guestLogin('Guest', '1234567890').subscribe(res => {
      expect(res.success).toBe(true);
    });
    const req = httpMock.expectOne(`${API}/guest-login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Guest', phone: '1234567890' });
    req.flush({ success: true, user: { sub: 'g-1', isGuest: true }, token: 'guest-tok' });
  });
});
