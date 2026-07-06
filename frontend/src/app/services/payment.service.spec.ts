import { TestBed }                        from '@angular/core/testing';
import { HttpClientTestingModule,
         HttpTestingController }          from '@angular/common/http/testing';
import { PaymentService }                 from './payment.service';
import { environment }                    from '../../environments/environment';

const API = `${environment.apiUrl}/payments`;

describe('PaymentService', () => {
  let service:  PaymentService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [PaymentService],
    }).compileComponents();
    service  = TestBed.inject(PaymentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => expect(service).toBeTruthy());

  it('createIntent() should POST amount and items', () => {
    const items = [{ productId: 1, quantity: 2, name: 'X', price: 10, thumbnail: '', stock: 5 }];
    service.createIntent(99.99, items).subscribe(res => {
      expect(res.clientSecret).toBe('secret_123');
    });
    const req = httpMock.expectOne(`${API}/create-intent`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.amount).toBe(99.99);
    expect(req.request.body.items).toEqual(items);
    req.flush({ success: true, clientSecret: 'secret_123' });
  });

  it('createIntent() should handle empty items array', () => {
    service.createIntent(0, []).subscribe();
    const req = httpMock.expectOne(`${API}/create-intent`);
    expect(req.request.body.items).toEqual([]);
    req.flush({ success: true, clientSecret: 'cs_test' });
  });
});
