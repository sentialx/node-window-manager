## Class `Window`

Control open windows.

We try to keep this class similar to Electron's known [`BrowserWindow`](https://electronjs.org/docs/api/browser-window) class, to keep it simple to use.

### new Window(id: number)

- `id` number

### Instance properties

- `id` number
- `processId` number - process id associated with the window
- `path` string - path to executable associated with the window

### Instance methods

#### win.getBounds() `Windows` `macOS`

Returns [`Rectangle`](#object-rectangle)

#### win.setBounds(bounds: Rectangle) `Windows` `macOS`

Resizes and moves the window to the supplied bounds. Any properties that are not supplied will default to their current values.

```javascript
window.setBounds({ height: 50 });
```

#### win.getTitle() `Windows` `macOS`

Returns `string`

#### win.show() `Windows`

Shows the window.

#### win.hide() `Windows`

Hides the window.

#### win.minimize() `Windows` `macOS`

Minimizes the window.

#### win.restore() `Windows` `macOS`

Restores the window.

#### win.maximize() `Windows` `macOS`

Maximizes the window.

#### win.bringToTop() `Windows` `macOS`

Brings the window to top and focuses it.

#### win.setOpacity(opacity: number) `Windows`

- `opacity` - a value between 0 and 1.

Sets the window opacity.

#### win.getOpacity() `Windows`

Gets the window opacity

Returns `number` between 0 and 1.

#### win.getMonitor() `Windows`

> NOTE: on macOS this method returns an `EmptyMonitor` object for compatibility.

Gets monitor which the window belongs to.

Returns [`Monitor`](monitor.md)

#### win.isWindow() `Windows` `macOS`

Returns `boolean` - whether the window is a valid window.

#### win.isVisible() `Windows`
Returns `boolean` - whether the window is visible or not.

#### win.getOwner() `Windows`

Returns `Window`

#### win.setOwner(win: Window | number | null) `Windows`

- `win` Window | number | null
  - pass null to unset window owner.

#### win.getIcon(size: number) `Windows` `macOS`

- `size` number - can be `16`, `32`, `64` or `256`. By default it's `64`.

Returns a png Buffer
