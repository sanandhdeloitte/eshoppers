import { TestBed }                        from '@angular/core/testing';
import { HttpClientTestingModule,
         HttpTestingController }          from '@angular/common/http/testing';
import { ProductService }                 from './product.service';
import { environment }                    from '../../environments/environment';

const API = `${environment.apiUrl}/products`;

describe('ProductService', () => {
  let service:  ProductService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:   [HttpClientTestingModule],
      providers: [ProductService],
    }).compileComponents();
    service  = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should create', () => expect(service).toBeTruthy());

  // getProducts — no params
  it('getProducts() should GET /products with no params by default', () => {
    service.getProducts().subscribe();
    const req = httpMock.expectOne(r => r.url === API);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys()).toHaveLength(0);
    req.flush({ success: true, products: [], total: 0, page: 1, pageSize: 10 });
  });

  it('getProducts() should include search param when provided', () => {
    service.getProducts({ search: 'phone' }).subscribe();
    const req = httpMock.expectOne(r => r.url === API);
    expect(req.request.params.get('search')).toBe('phone');
    req.flush({ success: true, products: [], total: 0, page: 1, pageSize: 10 });
  });

  it('getProducts() should NOT include search param for empty string', () => {
    service.getProducts({ search: '   ' }).subscribe();
    const req = httpMock.expectOne(r => r.url === API);
    expect(req.request.params.has('search')).toBe(false);
    req.flush({ success: true, products: [], total: 0, page: 1, pageSize: 10 });
  });

  it('getProducts() should include category when not All', () => {
    service.getProducts({ category: 'Fashion' }).subscribe();
    const req = httpMock.expectOne(r => r.url === API);
    expect(req.request.params.get('category')).toBe('Fashion');
    req.flush({ success: true, products: [], total: 0, page: 1, pageSize: 10 });
  });

  it('getProducts() should NOT include category when it is All', () => {
    service.getProducts({ category: 'All' }).subscribe();
    const req = httpMock.expectOne(r => r.url === API);
    expect(req.request.params.has('category')).toBe(false);
    req.flush({ success: true, products: [], total: 0, page: 1, pageSize: 10 });
  });

  it('getProducts() should include sort, page and pageSize', () => {
    service.getProducts({ sort: 'price-desc', page: 2, pageSize: 20 }).subscribe();
    const req = httpMock.expectOne(r => r.url === API);
    expect(req.request.params.get('sort')).toBe('price-desc');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('20');
    req.flush({ success: true, products: [], total: 0, page: 2, pageSize: 20 });
  });

  // getCategories
  it('getCategories() should GET /products/categories', () => {
    service.getCategories().subscribe(res => {
      expect(res.categories).toEqual(['Electronics']);
    });
    const req = httpMock.expectOne(`${API}/categories`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, categories: ['Electronics'] });
  });

  // getProductById
  it('getProductById() should GET /products/:id', () => {
    service.getProductById(5).subscribe(res => {
      expect(res.product.id).toBe(5);
    });
    const req = httpMock.expectOne(`${API}/5`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, product: { id: 5, name: 'Test', description: '', price: 10, category: '', thumbnail: '', stock: 1 } });
  });
});
