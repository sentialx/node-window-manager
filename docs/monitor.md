## Class `Monitor` `Windows`

Control monitors.

### new Monitor(id: number)

- `id` number - the monitor handle

### Instance properties

- `id` number

### Instance methods

#### monitor.getBounds() `Windows`

- Returns [`Rectangle`](#object-rectangle)

#### monitor.getWorkArea() `Windows`

Gets monitor working area bounds.

- Returns [`Rectangle`](#object-rectangle)

#### monitor.getInfo() `Windows`

Returns [`MonitorInfo`](#object-monitorinfo)

#### monitor.isPrimary() `Windows`

Whether the monitor is primary.

- Returns `boolean`

#### monitor.getScaleFactor() `Windows`

Gets monitor scale factor (DPI).

- Returns `number`
