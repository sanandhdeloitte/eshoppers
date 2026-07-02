// filename: src/app/shared/ui/spinner/spinner.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner';

const meta: Meta<SpinnerComponent> = {
  title: 'UI/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};
export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Small: Story = {
  args: { size: 'sm', label: 'Loading...' },
};

export const Medium: Story = {
  args: { size: 'md', label: 'Loading...' },
};

export const Large: Story = {
  args: { size: 'lg', label: 'Please wait' },
};

export const Centered: Story = {
  args: { size: 'md', label: 'Fetching data...', centered: true },
  decorators: [
    (story) => ({
      template: `<div style="width:400px; height:200px; border:1px dashed #ccc; display:flex; align-items:center">${story()}</div>`,
    }),
  ],
};

export const NoLabel: Story = {
  args: { size: 'md', label: '' },
};
