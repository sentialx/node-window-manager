#include <node.h>
#include <windows.h>
#include <string>

void throwError(v8::Isolate* isolate, const char* error) {
  isolate->ThrowException(v8::Exception::TypeError(v8::String::NewFromUtf8(isolate, error)));
}

/**
 * Gets currently focused window.
 * @returns {int} windowHandle
 */
void getActiveWindow(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();

  HWND handle = GetForegroundWindow();

  v8::Local<v8::Number> num = v8::Number::New(isolate, (int)handle);

  args.GetReturnValue().Set(num);
}

/**
 * Moves window to x, y and sets its width and height.
 * @param {int} windowHandle
 * @param {int} x
 * @param {int} y
 * @param {int} width
 * @param {int} height
 */
void moveWindow(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();

  if (!args[0]->IsNumber() || !args[1]->IsNumber() || !args[2]->IsNumber() || !args[3]->IsNumber() || !args[4]->IsNumber()) {
    throwError(isolate, "Wrong arguments");
    return;
  }

  const HWND handle = (HWND)args[0]->Int32Value();
  const size_t x = args[1]->Int32Value();
	const size_t y = args[2]->Int32Value();
	const size_t width = args[3]->Int32Value();
	const size_t height = args[4]->Int32Value();

  MoveWindow(handle, x, y, width, height, true);
}

/**
 * Gets window left, top, right, bottom properties.
 * @param {int} windowHandle
 * @returns {object} the window bounds
 */
void getWindowBounds(const v8::FunctionCallbackInfo<v8::Value>& args) {
   v8::Isolate* isolate = args.GetIsolate();

  if (!args[0]->IsNumber()) {
    throwError(isolate, "Wrong arguments");
    return;
  }

  RECT bounds;
  GetWindowRect((HWND)args[0]->Int32Value(), &bounds);

  v8::Local<v8::Object> obj = v8::Object::New(isolate);
  obj->Set(v8::String::NewFromUtf8(isolate, "left"), v8::Number::New(isolate, (int)bounds.left));
  obj->Set(v8::String::NewFromUtf8(isolate, "top"), v8::Number::New(isolate, (int)bounds.top));
  obj->Set(v8::String::NewFromUtf8(isolate, "right"), v8::Number::New(isolate, (int)bounds.right));
  obj->Set(v8::String::NewFromUtf8(isolate, "bottom"), v8::Number::New(isolate, (int)bounds.bottom));

  args.GetReturnValue().Set(obj);
}

void Initialize(v8::Local<v8::Object> exports) {
  NODE_SET_METHOD(exports, "getActiveWindow", getActiveWindow);
  NODE_SET_METHOD(exports, "moveWindow", moveWindow);
  NODE_SET_METHOD(exports, "getWindowBounds", getWindowBounds);
}

NODE_MODULE(windows_window_manager, Initialize);