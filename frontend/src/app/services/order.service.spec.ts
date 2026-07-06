import { TestBed }                        from '@angular/core/testing';
import { HttpClientTestingModule,
         HttpTestingController }          from '@angular/common/http/testing';
import { OrderService }                   from './order.service';
import { environment }                    from '../../environments/environment';

describe('OrderService', () => {
  let service:  OrderService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [OrderService],
    }).compileComponents();
    service  = TestBed.inject(OrderService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => expect(service).toBeTruthy());

  it('getOrders() should GET /orders', () => {
    service.getOrders().subscribe(res => {
      expect(res.orders).toHaveLength(1);
    });
    const req = httpMock.expectOne(`${environment.apiUrl}/orders`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      orders: [{
        _id: 'o1', paymentIntentId: 'pi_1', amount: 50,
        currency: 'usd', email: 'j@t.com', items: [],
        status: 'paid', createdAt: new Date().toISOString(),
      }],
    });
  });
});
