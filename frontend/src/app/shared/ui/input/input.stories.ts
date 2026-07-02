// filename: src/app/shared/ui/input/input.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input';

const meta: Meta<InputComponent> = {
  title: 'UI/Input',
  component: InputComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
  },
};
export default meta;
type Story = StoryObj<InputComponent>;

export const Default: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    invalid: false,
    errorMessage: '',
  },
};

export const Password: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const WithError: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    invalid: true,
    errorMessage: 'Please enter a valid email address.',
    // ↑ invalid=true triggers red border via [class.border-red-500]
  },
};

export const NoLabel: Story = {
  args: {
    label: '',
    placeholder: 'Search...',
  },
};
