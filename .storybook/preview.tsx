import type { Preview } from "@storybook/nextjs-vite";
import { MotionProvider } from "../src/components/motion/motion-provider";
import "../src/app/globals.css";

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Token mode",
      toolbar: { icon: "mirror", items: ["light", "dark"], dynamicTitle: true },
    },
  },
  initialGlobals: { theme: "light" },
  decorators: [
    (Story, { globals }) => {
      if (globals.theme === "dark") document.documentElement.dataset.theme = "dark";
      else delete document.documentElement.dataset.theme;
      return (
        <MotionProvider>
          <div className="bg-canvas p-6 text-fg">
            <Story />
          </div>
        </MotionProvider>
      );
    },
  ],
  parameters: {
    layout: "fullscreen",
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Fail story tests on accessibility violations.
    a11y: { test: "error" },
  },
};

export default preview;
