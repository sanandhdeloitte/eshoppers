import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi }                        from 'vitest';
import { ButtonComponent }           from './button';

describe('ButtonComponent', () => {
  let fixture:   ComponentFixture<ButtonComponent>;
  let component: ButtonComponent;

  const create = async (inputs: Partial<ButtonComponent> = {}) => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();
    fixture   = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    Object.assign(component, inputs);   // ← set inputs BEFORE detectChanges
    fixture.detectChanges();
    return { fixture, component };
  };

  afterEach(() => TestBed.resetTestingModule());

  it('should create', async () => {
    const { component } = await create();
    expect(component).toBeTruthy();
  });

  it('should render default label "Button"', async () => {
    const { fixture } = await create();
    expect(fixture.nativeElement.textContent).toContain('Button');
  });

  it('should render custom label', async () => {
    const { fixture } = await create({ label: 'Add to Cart' });
    expect(fixture.nativeElement.textContent).toContain('Add to Cart');
  });

  it('should apply primary variant classes by default', async () => {
    const { component } = await create({ variant: 'primary' });
    expect(component.buttonClasses.join(' ')).toContain('bg-blue-600');
  });

  it('should apply secondary variant classes', async () => {
    const { component } = await create({ variant: 'secondary' });
    expect(component.buttonClasses.join(' ')).toContain('bg-slate-900');
  });

  it('should apply danger variant classes', async () => {
    const { component } = await create({ variant: 'danger' });
    expect(component.buttonClasses.join(' ')).toContain('bg-red-600');
  });

  it('should be disabled when disabled=true', async () => {
    const { fixture } = await create({ disabled: true });
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it('should apply w-full class when fullWidth=true', async () => {
    const { component } = await create({ fullWidth: true });
    expect(component.buttonClasses.join(' ')).toContain('w-full');
  });

  it('should emit pressed event on click', async () => {
    const { component } = await create();
    const spy = vi.fn();
    component.pressed.subscribe(spy);
    component.handleClick();
    expect(spy).toHaveBeenCalled();
  });

  it('should NOT emit pressed when disabled', async () => {
    const { component } = await create({ disabled: true });
    const spy = vi.fn();
    component.pressed.subscribe(spy);
    component.handleClick();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should NOT emit pressed when loading', async () => {
    const { component } = await create({ loading: true });
    const spy = vi.fn();
    component.pressed.subscribe(spy);
    component.handleClick();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should set button type attribute', async () => {
    const { fixture } = await create({ type: 'submit' });
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(btn.type).toBe('submit');
  });

  it('buttonClasses should include base classes', async () => {
    const { component } = await create();
    expect(component.buttonClasses.join(' ')).toContain('rounded-xl');
  });
});
