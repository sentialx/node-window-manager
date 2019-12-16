## Class `Monitor` `Windows`

Control monitors.

> NOTE: Monitors are supported only on `Windows`, but on `macOS` there's a stub object 
called `EmptyMonitor` for better cross-platform compatibility without checking whether 
a returned monitor is `undefined`.

```typescript
import { windowManager } from 'node-window-manager';

// Gets height of the primary window working area.
const { height } = windowManager.getPrimaryWindow().getWorkArea();
```

### new Monitor(id: number)

- `id` number - the monitor handle

### Instance properties

- `id` number

### Instance methods

#### monitor.getBounds() `Windows`

> NOTE: on macOS this method returns `{x: 0, y: 0, width: 0, height: 0}` for compatibility.

- Returns [`Rectangle`](rectangle.md)

#### monitor.getWorkArea() `Windows`

> NOTE: on macOS this method returns `{x: 0, y: 0, width: 0, height: 0}` for compatibility.

Gets monitor working area bounds.

Returns [`Rectangle`](rectangle.md)

#### monitor.isPrimary() `Windows`

> NOTE: on macOS this method returns `false` for compatibility.

Whether the monitor is primary.

Returns `boolean`

#### monitor.getScaleFactor() `Windows`

> NOTE: on macOS this method returns `1` for compatibility.

Gets monitor scale factor (DPI).

- Returns `number`

#### monitor.isValid() `Windows` `macOS`

Returns:
- On `Windows`: `true`
- On `macOS`: `false`, since it's just an `EmptyMonitor` object.
