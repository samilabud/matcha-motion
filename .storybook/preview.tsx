import type { Preview } from "@storybook/nextjs-vite";
import { MotionProvider } from "../src/components/motion/motion-provider";
import { fontVariables } from "../src/lib/fonts";
import "../src/app/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <MotionProvider>
        <div className={`${fontVariables} bg-canvas p-6 font-sans text-fg antialiased`}>
          <Story />
        </div>
      </MotionProvider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Fail story tests on accessibility violations.
    a11y: { test: "error" },
  },
};

export default preview;
