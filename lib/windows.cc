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

Napi::Number getMonitorScaleFactor(const Napi::CallbackInfo &info)
{
  Napi::Env env = info.Env();

  HMODULE hShcore = LoadLibraryA("SHcore.dll");
  lp_GetScaleFactorForMonitor f = (lp_GetScaleFactorForMonitor)GetProcAddress(hShcore, "GetScaleFactorForMonitor");

  DEVICE_SCALE_FACTOR sf;
  f((HMONITOR)info[0].As<Napi::Number>().Int64Value(), &sf);

  return Napi::Number::New(env, sf / 100);
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

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
  exports.Set(Napi::String::New(env, "getActiveWindow"), Napi::Function::New(env, getActiveWindow));
  exports.Set(Napi::String::New(env, "getWindowProcessId"), Napi::Function::New(env, getWindowProcessId));
  exports.Set(Napi::String::New(env, "getProcessPath"), Napi::Function::New(env, getProcessPath));
  exports.Set(Napi::String::New(env, "getMonitorFromWindow"), Napi::Function::New(env, getMonitorFromWindow));
  exports.Set(Napi::String::New(env, "getMonitorScaleFactor"), Napi::Function::New(env, getMonitorScaleFactor));
  return exports;
}

NODE_API_MODULE(addon, Init)