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
  
If the accessibility permission is not granted on `macOS`, it opens an accessibility permission request dialog.

The method is required to call before calling the following methods:

- `window.setBounds`
- `window.maximize`
- `window.minimize`
- `window.restore`
- `window.bringToTop`
- `window.getTitle`

Returns `boolean`

#### windowManager.getActiveWindow() `Windows` `macOS`

Returns [`Window`](window.md)

#### windowManager.getWindows() `Windows` `macOS`

Returns [`Window[]`](window.md)

#### windowManager.getMonitors() `Windows`

> NOTE: on macOS this method returns `[]` for compatibility.

- Returns [`Monitor[]`](monitor.md)

#### windowManager.getPrimaryMonitor() `Windows`

> NOTE: on macOS this method returns an `EmptyMonitor` object for compatibility.

- Returns [`Monitor`](monitor.md)

### Events

#### Event 'window-activated' `Windows` `macOS`

Returns:

- [`Window`](window.md)

Emitted when a window has been activated.
