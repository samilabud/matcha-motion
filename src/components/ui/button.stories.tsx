import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: { children: "Add to cart" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = { args: { variant: "primary" } };
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Disabled: Story = { args: { disabled: true } };

/** Matrix of every Figma variant × size. This is the visual-regression target. */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 items-center justify-items-start gap-4">
      {(["primary", "secondary", "ghost"] as const).flatMap((variant) =>
        (["sm", "md", "lg"] as const).map((size) => (
          <Button key={`${variant}-${size}`} variant={variant} size={size}>
            {variant} / {size}
          </Button>
        )),
      )}
    </div>
  ),
};
