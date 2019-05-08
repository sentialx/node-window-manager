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

Napi::String getWindowTitle(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  HWND handle = (HWND)info[0].As<Napi::Number>().Int64Value();

  wchar_t title[256];

  GetWindowTextW(handle, title, sizeof(title));

  std::wstring ws(title);
  std::string str(ws.begin(), ws.end());

  return Napi::String::New(env, str);
}

Napi::Boolean setWindowBounds(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  Napi::Object bounds = info[1].As<Napi::Object>();

  BOOL b = MoveWindow(
      (HWND)info[0].As<Napi::Number>().Int64Value(),
      bounds.Get("x").ToNumber(), bounds.Get("y").ToNumber(),
      bounds.Get("width").ToNumber(),
      bounds.Get("height").ToNumber(),
      true);

  return Napi::Boolean::New(env, b);
}

Napi::Boolean showWindow(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  HWND handle = (HWND)info[0].As<Napi::Number>().Int64Value();
  std::string type = info[1].As<Napi::String>();

  DWORD flag = 0;

  if (type == "show")
    flag = SW_SHOW;
  else if (type == "hide")
    flag = SW_HIDE;
  else if (type == "minimize")
    flag = SW_MINIMIZE;
  else if (type == "restore")
    flag = SW_RESTORE;
  else if (type == "maximize")
    flag = SW_MAXIMIZE;

  BOOL b = ShowWindow(handle, flag);

  return Napi::Boolean::New(env, b);
}

Napi::Boolean bringWindowToTop(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  HWND handle = (HWND)info[0].As<Napi::Number>().Int64Value();

  BOOL b = SetForegroundWindow(handle);

  return Napi::Boolean::New(env, b);
}

Napi::Boolean redrawWindow(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  HWND handle = (HWND)info[0].As<Napi::Number>().Int64Value();

  BOOL b = SetWindowPos(handle, 0, 0, 0, 0, 0, SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE | SWP_DRAWFRAME | SWP_NOCOPYBITS);

  return Napi::Boolean::New(env, b);
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
  exports.Set(Napi::String::New(env, "getWindowTitle"), Napi::Function::New(env, getWindowTitle));
  exports.Set(Napi::String::New(env, "showWindow"), Napi::Function::New(env, getWindowTitle));
  exports.Set(Napi::String::New(env, "bringWindowToTop"), Napi::Function::New(env, bringWindowToTop));
  exports.Set(Napi::String::New(env, "redrawWindow"), Napi::Function::New(env, redrawWindow));

  return exports;
}

NODE_API_MODULE(addon, Init)