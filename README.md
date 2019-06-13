# node-window-manager

Manage windows in Windows, macOS and ~~Linux~~(WIP)

# Install

To install this package, just run

```bash
$ npm install node-window-manager
```

# Quick start

The following example shows how to get the currently focused window's title and hide it.

```javascript
const { windowManager } = require("window-manager");

const window = windowManager.getActiveWindow();

// Prints the currently focused window title.
console.log(window.getTitle());

// Moves the window.
window.setBounds({ x: 0, y: 0 });
```

# Documentation

## Object `Rectangle`

- `x` number
- `y` number
- `width` number
- `height` number

## Object `WindowInfo`

- `id` number
- `title` string
- `processId` string
- `path` string - path to executable associated with the window
- `bounds` [`Rectangle`](#object-rectangle)
- `opacity` number (`Windows`)
- `owner` [`Window`](#class-window) (`Windows`) - owner window of the current window

## Class `WindowManager`

### Instance methods

#### windowManager.getActiveWindow() `Windows` `macOS`

- Returns [`Window`](#class-window)

#### windowManager.getScaleFactor(monitor: number) `Windows`

- Returns `number` - the monitor scale factor.

#### windowManager.getWindows(monitor: number) `Windows` `macOS`

### Events

#### Event 'window-activated' `Windows` `macOS`

Returns:

- [`Window`](#class-window)

Emitted when a window has been activated.

## Class `Window`

We try to keep this class similar to Electron's known [`BrowserWindow`](https://electronjs.org/docs/api/browser-window) class, to keep it simple to use.

### `new Window(handle: number)`

### Instance properties

- `id` number
- `processId` number - process id associated with the window
- `path` string - path to executable associated with the window

### Instance methods

#### win.getBounds(): [`Rectangle`](#object-rectangle) `Windows` `macOS`

- Returns [`Rectangle`](#object-rectangle)

#### win.setBounds(bounds: Rectangle) `Windows` `macOS`

Resizes and moves the window to the supplied bounds. Any properties that are not supplied will default to their current values.

```javascript
window.setBounds({ height: 50 });
```

#### win.getInfo(): [`WindowInfo`](#object-windowinfo) `Windows` `macOS`

Returns [`WindowInfo`](#object-windowinfo)

#### win.getTitle(): string `Windows` `macOS`

- Returns `string`

#### win.show() `Windows`

Shows the window.

#### win.hide() `Windows`

Hides the window.

#### win.minimize() `Windows` `macOS`

Minimizes the window.

#### win.restore() `Windows` `macOS`

Restores the window.

#### win.maximize() `Windows`

Maximizes the window.

#### win.bringToTop() `Windows` `macOS`

Brings the window to top and focuses it.

#### win.setOpacity(opacity: number) `Windows`

- `opacity` - a value between 0 and 1.

Sets the window opacity.

#### win.getOpacity(): number `Windows`

Gets the window opacity

Returns `number` between 0 and 1.

#### win.getMonitor(): number `Windows`

Gets monitor by window.

Returns `number` - monitor handle.

#### win.isWindow(): boolean `Windows` `macOS`

Returns `boolean` - whether the window is a valid window.
