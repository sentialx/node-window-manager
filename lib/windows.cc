#include <napi.h>
#include <windows.h>
#include <math.h>
#include <atlstr.h>
#include <iostream>

typedef int(__stdcall *lp_GetScaleFactorForMonitor)(HMONITOR, DEVICE_SCALE_FACTOR *);

Napi::Number getActiveWindow(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, (int64_t)GetForegroundWindow());
}

Napi::Number getMonitorFromWindow(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();
  return Napi::Number::New(env, (int64_t)MonitorFromWindow((HWND)info[0].As<Napi::Number>().Int64Value(), 0));
}

Napi::Object getWindowBounds(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  RECT rect;
  GetWindowRect((HWND)info[0].As<Napi::Number>().Int64Value(), &rect);

  Napi::Object obj = Napi::Object::New(env);

  obj.Set("x", rect.left);
  obj.Set("y", rect.top);
  obj.Set("width", rect.right - rect.left);
  obj.Set("height", rect.bottom - rect.top);

  return obj;
}

Napi::Number getMonitorScaleFactor(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  HMODULE hShcore = LoadLibraryA("SHcore.dll");
  lp_GetScaleFactorForMonitor f = (lp_GetScaleFactorForMonitor)GetProcAddress(hShcore, "GetScaleFactorForMonitor");

  DEVICE_SCALE_FACTOR sf;
  f((HMONITOR)info[0].As<Napi::Number>().Int64Value(), &sf);

  return Napi::Number::New(env, (double)sf / 100);
}

Napi::Number getWindowProcessId(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  DWORD pid = 0;
  GetWindowThreadProcessId((HWND)info[0].As<Napi::Number>().Int64Value(), &pid);

  return Napi::Number::New(env, (int)pid);
}

Napi::String getProcessPath(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  DWORD pid = info[0].As<Napi::Number>().Int64Value();
  HANDLE handle = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid);

  DWORD dwSize = MAX_PATH;
  wchar_t exeName[MAX_PATH];

  QueryFullProcessImageNameW(
      handle,
      0,
      exeName,
      &dwSize);

  std::wstring ws(exeName);
  std::string str(ws.begin(), ws.end());

  return Napi::String::New(env, str);
}

Napi::Boolean setWindowBounds(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  Napi::Object bounds = info[1].As<Napi::Object>();

  MoveWindow(
      (HWND)info[0].As<Napi::Number>().Int64Value(),
      bounds.Get("x").ToNumber(), bounds.Get("y").ToNumber(),
      bounds.Get("width").ToNumber(),
      bounds.Get("height").ToNumber(),
      true);

  return Napi::Boolean::New(env, true);
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "getActiveWindow"), Napi::Function::New(env, getActiveWindow));
  exports.Set(Napi::String::New(env, "getWindowProcessId"), Napi::Function::New(env, getWindowProcessId));
  exports.Set(Napi::String::New(env, "getProcessPath"), Napi::Function::New(env, getProcessPath));
  exports.Set(Napi::String::New(env, "getMonitorFromWindow"), Napi::Function::New(env, getMonitorFromWindow));
  exports.Set(Napi::String::New(env, "getMonitorScaleFactor"), Napi::Function::New(env, getMonitorScaleFactor));
  exports.Set(Napi::String::New(env, "getWindowBounds"), Napi::Function::New(env, getWindowBounds));
  exports.Set(Napi::String::New(env, "setWindowBounds"), Napi::Function::New(env, setWindowBounds));
  return exports;
}

NODE_API_MODULE(addon, Init)