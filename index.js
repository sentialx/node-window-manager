const native = require('bindings')('windows-window-manager')

const getActiveWindow = () => {
    return native.getActiveWindow();
}

const moveWindow = (windowHandle, x, y, width, height) => {
    native.moveWindow(windowHandle, x, y, width, height);
}

const getWindowBounds = (windowHandle) => {
    return native.getWindowBounds(windowHandle);
}

const getWindowTitle = (windowHandle) => {
    return native.getWindowTitle(windowHandle);
}
