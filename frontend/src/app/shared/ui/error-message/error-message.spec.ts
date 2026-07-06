import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorMessageComponent }     from './error-message';

describe('ErrorMessageComponent', () => {
  let fixture:   ComponentFixture<ErrorMessageComponent>;
  let component: ErrorMessageComponent;

  const create = async (inputs: Partial<ErrorMessageComponent> = {}) => {
    await TestBed.configureTestingModule({
      imports: [ErrorMessageComponent],
    }).compileComponents();
    fixture   = TestBed.createComponent(ErrorMessageComponent);
    component = fixture.componentInstance;
    Object.assign(component, inputs);   // ← BEFORE detectChanges
    fixture.detectChanges();
    return { fixture, component };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    const { component } = await create();
    expect(component).toBeTruthy();
  });

  it('should render message when provided', async () => {
    const { fixture } = await create({ message: 'Something went wrong' });
    expect(fixture.nativeElement.textContent).toContain('Something went wrong');
  });

  it('should render empty when message is empty string', async () => {
    const { fixture } = await create({ message: '' });
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('default message should be empty string', async () => {
    const { component } = await create();
    expect(component.message).toBe('');
  });
});
