# node-window-manager
Manage windows in macOS, Windows and Linux

# Install
To install this package, just run
```bash
$ npm install window-manager
```

# Quick start

The following example shows how to get the currently focused window's title and hide it.

```javascript
const { getActiveWindow } = require('window-manager');

const window = getActiveWindow();

// Prints the currently focused window title.
console.log(window.getTitle());

// Hide the window.
window.hide();
```

# Documentation

## Methods

`getActiveWindow`

- Returns [`Window`](#class-window)

## Class `Window`

### `new Window(windowHandle)`

- `windowHandle` number - A window handle.

### Methods

`Window.getBounds`

- Returns:
  - `left` number
  - `top` number
  - `right` number
  - `bottom` number

`Window.getTitle`

- Returns string

`Window.getWidth`

- Returns number

`Window.getHeight`

- Returns number

`Window.move`

Moves the window to x, y position and sets new width and height.

- `x` number - Window x position
- `y` number - Window y position
- `width` number - Window's new width
- `height` number - Window`s new height

`Window.setState`

Sets the window state, for example minimizes it.

- `state` [`WindowState`](#enum-windowstate) - the window state

`Window.show`

Shows the window.

`Window.hide`

Hides the window.

`Window.minimize`

Minimizes the window.

`Window.restore`

Restores the window.

`Window.maximize`

Maximizes the window.

`Window.setTopMost`

Toggles window top most setting.

- `toggle` boolean

## Enum `WindowState`

```javascript
const { WindowState } = require('window-manager');
```

Windows states: 
- `HIDE`
- `SHOWNORMAL`
- `SHOWMINIMIZED`
- `MAXIMIZE`
- `SHOWMAXIMIZED`
- `SHOWNOACTIVATE`
- `SHOW`
- `MINIMIZE`
- `SHOWMINNOACTIVE`
- `SHOWNA`
- `RESTORE`
- `SHOWDEFAULT`
- `FORCEMINIMIZE`