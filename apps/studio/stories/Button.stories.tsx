import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/Button';
import { Sparkles, Download, Trash2 } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading...',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const WithIcon: Story = {
  args: {
    variant: 'primary',
    children: (
      <>
        <Sparkles className="mr-2 h-4 w-4" />
        Create Job
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    children: <Download className="h-4 w-4" />,
  },
};

export const Danger: Story = {
  args: {
    variant: 'secondary',
    className: 'bg-[#f87171] hover:bg-[#ef4444] text-white',
    children: (
      <>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </>
    ),
  },
};
