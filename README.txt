# Fluent Component Overview

This repository houses a **self‑contained React component** exported from the Hatch canvas. All assets are ready to drop into an existing project or preview in the browser with no build step required.

### Files
- `component.jsx` – human‑readable source of the component
- `component.js` – compiled script ready for production use
- `index.html` – standalone demo page showcasing the component
- `storedState.json` – initial data used by Hatch's persistent state hook

### Quick Preview
Open the project in your browser in two different ways:

1. **File mode** – double‑click `index.html` and run it directly from your disk.
2. **Server mode** – serve the folder from a local web server for cleaner file separation:
   ```bash
   python -m http.server 8000
   # or
   npx serve .
   ```

### Usage in React
```jsx
import Component from './component';

function App() {
  return <Component />;
}
```

### Hatch Runtime Features
The component leverages Hatch's `useStoredState` hook to persist data:
- `useStoredState(key, defaultValue)` keeps values across sessions
- Works with both `file://` URLs and served environments
- Automatically falls back to inline data when network access isn't available

The accompanying `index.html` supplies a complete runtime so the component works out of the box in any of these scenarios.

---

Generated on: 04.07.2025, 01:41:18
