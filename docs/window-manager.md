## `windowManager`

Get monitors and opened windows.

```typescript
import { windowManager } from 'node-window-manager';

windowManager.requestAccessibility();

const window = windowManager.getActiveWindow();

// Prints the currently focused window title.
console.log(window.getTitle());
```

### Instance methods

#### windowManager.requestAccessibility() `macOS`
  Required before any action on macOS.
- Returns `boolean`

#### windowManager.getActiveWindow() `Windows` `macOS`

- Returns [`Window`](#class-window)

#### windowManager.getWindows() `Windows` `macOS`

- Returns [`Window[]`](#class-window)

#### windowManager.getMonitors() `Windows`

- Returns [`Monitor[]`](#class-monitor)

#### windowManager.getPrimaryMonitor() `Windows`

- Returns [`Monitor`](#class-monitor)

### Events

#### Event 'window-activated' `Windows` `macOS`

Returns:

- [`Window`](#class-window)

Emitted when a window has been activated.