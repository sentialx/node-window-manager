# node-window-manager

> NOTE: The package works currently only on Windows. Any pull request or issue is really appreciated.

Manage windows in Windows, macOS and Linux

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

// Hide the window.
window.hide();
```

# Documentation

## Object `Rectangle`

- `x` number
- `y` number
- `width` number
- `height` number

## Object `Process`

- `id` number - the process id
- `name` string - the process file name
- `path` string - the process path

## Object `Point`

- `x` number
- `y` number

## Class `WindowManager`

### Methods

#### `WindowsManager.getActiveWindow()`

- Returns [`Window`](#class-window)

#### `WindowManager.getWindows()`

- Returns [`Window`](#class-window)[]

#### `WindowManager.getMonitorFromWindow(window: Window)`

- Returns `number` - the monitor handle.

#### `WindowManager.getScaleFactor(monitor: number)`

- Returns `number` - the monitor scale factor.

#### `WindowManager.getMousePoint()`

- Returns `Point` - the mouse point.

### Events

#### Event 'window-activated'

Returns:

- `Window`

Emitted when a window has been activated.

## Class `Window`

This class is similar to Electron's [`BrowserWindow`](https://electronjs.org/docs/api/browser-window) class.

### `new Window(handle: Buffer)`

### Instance properties

- `handle` number - the window handle
- `process` Process - the window owner process

### Methods

#### `Window.getBounds()`

- Returns `Rectangle`

#### `Window.getTitle()`

- Returns `string`

#### `Window.setBounds(bounds: Rectangle)`

Resizes and moves the window to the supplied bounds. Any properties that are not supplied will default to their current values.

```javascript
window.setBounds({ height: 50 });
```

#### `Window.show()`

Shows the window.

#### `Window.hide()`

Hides the window.

#### `Window.minimize()`

Minimizes the window.

#### `Window.restore()`

Restores the window.

#### `Window.maximize()`

Maximizes the window.

#### `Window.setAlwaysOnTop(toggle: boolean)`

Sets whether the window should show always on top of other windows.

#### `Window.setMaximizable(toggle: boolean)`

Sets whether the window should be maximizable.

#### `Window.setMinimizable(toggle: boolean)`

Sets whether the window should be minimizable.

#### `Window.setResizable(toggle: boolean)`

Sets whether the window should be resizable.

#### `Window.isMaximizable()`

Determines whether the window is maximizable.

Returns `boolean`

#### `Window.isMaximizable()`

Determines whether the window is maximizable.

Returns `boolean`

#### `Window.isResizable()`

Determines whether the window is resizable.

Returns `boolean`

#### `Window.bringToTop()`

Brings the window to top and focuses it.

#### `Window.setOpacity(opacity: number)`

- `opacity` - a value between 0 and 1.

Sets the window opacity.

#### `Window.getOpacity()`

Gets the window opacity

Returns `number` between 0 and 1.

# Projects using `node-window-manager`

- [Multrin](https://github.com/sentialx/multrin)
