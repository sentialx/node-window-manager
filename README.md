# node-window-manager
> NOTE: The package works currently only on Windows.

Manage windows in macOS, Windows and Linux

# Install
To install this package, just run
```bash
$ npm install window-manager
```

# Quick start

The following example shows how to get the currently focused window's title and hide it.

```javascript
const { windowManager } = require('window-manager');

const window = windowManager.getActiveWindow();

// Prints the currently focused window title.
console.log(window.getTitle());

// Hide the window.
window.hide();
```

# Documentation

## Class `WindowManager`

### Methods

#### `WindowsManager.getActiveWindow()`

- Returns [`Window`](#class-window)

### Events

#### Event 'window-activated'

Returns:
- `Window`

Emitted when a window has been activated.

#### Event 'mouse-up'

Emitted when a mouse button is released.

## Class `Window`

### `new Window(handle: Buffer)`

### Methods

#### `Window.getBounds()`

- Returns:
  - `Rectangle`

#### `Window.getTitle()`

- Returns string

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

# Projects using `node-window-manager`
- [Multrin](https://github.com/sentialx/multrin)
