#include <node.h>
#include <windows.h>
#include <string>

int GetActiveWindow(const v8::FunctionCallbackInfo<v8::Value>& args) {
  v8::Isolate* isolate = args.GetIsolate();
  v8::
}

void Initialize(v8::Local<v8::Object> exports) {
  NODE_SET_METHOD(exports, "getActiveWindow", GetActiveWindow);
}

NODE_MODULE("windows-window-manager", Initialize)