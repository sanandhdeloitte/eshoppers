import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi }                        from 'vitest';
import { InputComponent }            from './input';

describe('InputComponent', () => {
  let fixture:   ComponentFixture<InputComponent>;
  let component: InputComponent;


  const create = async (inputs: Partial<InputComponent> = {}) => {
    TestBed.resetTestingModule();                       // ← reset first
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();
    fixture   = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    Object.assign(component, inputs);
    fixture.detectChanges();
    return { fixture, component };
  };


  it('should create', async () => {
    const { component } = await create();
    expect(component).toBeTruthy();
  });

  it('should render label when provided', async () => {
    const { fixture } = await create({ label: 'Email Address' });
    expect(fixture.nativeElement.textContent).toContain('Email Address');
  });

  it('should set input type attribute', async () => {
    const { fixture } = await create({ type: 'password' });
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should set placeholder', async () => {
    const { fixture } = await create({ placeholder: 'Enter email' });
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter email');
  });

  it('writeValue() should update value', async () => {
    const { component } = await create();
    component.writeValue('hello@test.com');
    expect(component.value).toBe('hello@test.com');
  });

  it('writeValue() with null should set empty string', async () => {
    const { component } = await create();
    component.writeValue(null as any);
    expect(component.value).toBe('');
  });

  it('registerOnChange() should store callback', async () => {
    const { component } = await create();
    const fn = vi.fn();
    component.registerOnChange(fn);
    component.onInput({ target: { value: 'test' } } as any);
    expect(fn).toHaveBeenCalledWith('test');
  });

  it('registerOnTouched() should store callback', async () => {
    const { component } = await create();
    const fn = vi.fn();
    component.registerOnTouched(fn);
    component.onBlur();
    expect(fn).toHaveBeenCalled();
  });

  it('setDisabledState() should update isDisabled', async () => {
    const { component } = await create();
    component.setDisabledState(true);
    expect(component.isDisabled).toBe(true);
  });

  it('should show error message when invalid=true and errorMessage set', async () => {
    const { fixture } = await create({ invalid: true, errorMessage: 'Required field' });
    expect(fixture.nativeElement.textContent).toContain('Required field');
  });

  // ── Two fixtures from a SINGLE TestBed instance ───────────────────────
  it('should generate unique inputId', async () => {
    const { component: c1 } = await create();    // resets + configures TestBed
    const id1 = c1.inputId;

    // Create a second fixture WITHOUT re-configuring TestBed
    const f2  = TestBed.createComponent(InputComponent);
    f2.detectChanges();
    const id2 = f2.componentInstance.inputId;

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('onInput() should update value property', async () => {
    const { component } = await create();
    component.onInput({ target: { value: 'typed' } } as any);
    expect(component.value).toBe('typed');
  });
});
