// filename: src/app/shared/ui/modal/modal.stories.ts

import type { Meta, StoryObj } from '@storybook/angular';
import { ModalComponent } from './modal';

const meta: Meta<ModalComponent> = {
  title: 'UI/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  argTypes: {
    closed: { action: 'closed' },
  },
};
export default meta;
type Story = StoryObj<ModalComponent>;

export const Open: Story = {
  args: {
    open: true,
    title: 'Confirm Action',
    closeOnBackdrop: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-modal
        [open]="open"
        [title]="title"
        [closeOnBackdrop]="closeOnBackdrop"
        (closed)="closed($event)"
      >
        <p>Are you sure you want to proceed? This action cannot be undone.</p>
        <div modal-actions>
          <button class="rounded-xl bg-blue-600 px-4 py-2 text-white">Confirm</button>
        </div>
      </app-modal>
    `,
    // ↑ Modal uses ng-content so we need a render template
    //   to pass projected content into the slot
  }),
};

export const Closed: Story = {
  args: { open: false, title: 'Hidden Modal' },
  // ↑ Shows nothing — component uses @if (open)
};

export const NoBackdropClose: Story = {
  args: {
    open: true,
    title: 'Cannot Close on Backdrop',
    closeOnBackdrop: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-modal [open]="open" [title]="title" [closeOnBackdrop]="closeOnBackdrop">
        <p>Click outside — nothing happens. Use the × button only.</p>
      </app-modal>
    `,
  }),
};
