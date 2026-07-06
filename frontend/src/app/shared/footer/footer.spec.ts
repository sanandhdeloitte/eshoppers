import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule }       from '@angular/router/testing';
import { Footer }                    from './footer';

describe('Footer', () => {
  let fixture:   ComponentFixture<Footer>;
  let component: Footer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer, RouterTestingModule],
    }).compileComponents();
    fixture   = TestBed.createComponent(Footer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display eSHOPPERS brand name', () => {
    expect(fixture.nativeElement.textContent).toContain('SHOPPERS');
  });

  it('should render a footer element', () => {
    expect(fixture.nativeElement.querySelector('footer')).not.toBeNull();
  });

  it('should contain a link to /home', () => {
    const links = Array.from(
      fixture.nativeElement.querySelectorAll('a')
    ) as HTMLAnchorElement[];
    expect(links.some(a =>
      a.getAttribute('href')?.includes('home') ||
      a.getAttribute('routerlink')?.includes('home')
    )).toBe(true);
  });

  it('should show copyright year in footer', () => {
    expect(fixture.nativeElement.textContent).toContain('2025');
  });
});
