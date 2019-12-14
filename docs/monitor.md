## Class `Monitor` `Windows`

Control monitors.

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

Returns [`Rectangle`](rectangle.md)

#### monitor.getWorkArea() `Windows`

Gets monitor working area bounds.

Returns [`Rectangle`](rectangle.md)

#### monitor.isPrimary() `Windows`

Whether the monitor is primary.

Returns `boolean`

#### monitor.getScaleFactor() `Windows`

Gets monitor scale factor (DPI).

Returns `number`
