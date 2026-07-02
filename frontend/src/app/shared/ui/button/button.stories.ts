// filename: src/app/shared/ui/button/button.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button';

const meta: Meta<ButtonComponent> = {
  title: 'UI/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'danger'] },
    type:    { control: 'select', options: ['button', 'submit', 'reset'] },
    pressed: { action: 'pressed' },
  },
};
export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: { label: 'Primary Button', variant: 'primary' },
};

export const Secondary: Story = {
  args: { label: 'Secondary Button', variant: 'secondary' },
};

export const Danger: Story = {
  args: { label: 'Delete', variant: 'danger' },
};

export const Loading: Story = {
  args: { label: 'Saving...', variant: 'primary', loading: true },
};

export const Disabled: Story = {
  args: { label: 'Unavailable', variant: 'primary', disabled: true },
};

export const FullWidth: Story = {
  args: { label: 'Full Width', variant: 'primary', fullWidth: true },
};
