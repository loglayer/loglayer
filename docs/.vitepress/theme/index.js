import DefaultTheme from "vitepress/theme";
import "./custom.css";
import { setupTextRotator } from "./text-rotator";

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    // Handle text rotation setup and cleanup on route changes
    router.onAfterRouteChanged = (to) => {
      if (to === "/") {
        // Initialize on main route
        setupTextRotator();
      }
    };
  },
};
