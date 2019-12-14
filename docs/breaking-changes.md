# Breaking changes

List of breaking changes between major versions.

## Planned Breaking API Changes (2.0)

### `windowManager.getScaleFactor(monitor: number)`

```typescript
// Deprecated
windowManager.getScaleFactor(windowManager.getActiveWindow().getMonitor());
// Replace with
windowManager.getActiveWindow().getMonitor().getScaleFactor();
```

### `windowManager.requestAccessibility()` `macOS`

The `windowManager.requestAccessibility` method won't be required before each operation on windows anymore. Only on:

- `window.setBounds`
- `window.maximize`
- `window.minimize`
- `window.restore`
- `window.bringToTop`
- `window.getTitle`

### `window.getMonitor(): number`

Now the `window.getMonitor` method returns [`Monitor`](monitor.md) object.

### `window.getInfo()`

`window.getInfo` method has been removed.

```typescript
// Deprecated
const { title } = window.getInfo();
// Replace with
const title = window.getTitle();
```
