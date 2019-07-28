#include <napi.h>
#include <shtypes.h>
#include <windows.h>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <string>

typedef int(__stdcall *lp_GetScaleFactorForMonitor)(HMONITOR,
                                                    DEVICE_SCALE_FACTOR *);

struct Process
{
    int pid;
    std::string path;
};

struct Window
{
    Process process;
    int64_t id;
};

template <typename T>
T getValueFromCallbackData(const Napi::CallbackInfo &info,
                           unsigned handleIndex)
{
    return reinterpret_cast<T>(
        info[handleIndex].As<Napi::Number>().Int64Value());
}

std::string toUtf8(const std::wstring &str)
{
    std::string ret;
    int len = WideCharToMultiByte(CP_UTF8, 0, str.c_str(), str.length(), NULL,
                                  0, NULL, NULL);
    if (len > 0)
    {
        ret.resize(len);
        WideCharToMultiByte(CP_UTF8, 0, str.c_str(), str.length(), &ret[0], len,
                            NULL, NULL);
    }
    return ret;
}

Process getWindowProcess(HWND handle)
{
    DWORD pid{0};
    GetWindowThreadProcessId(handle, &pid);

    HANDLE pHandle{OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid)};

    DWORD dwSize{MAX_PATH};
    wchar_t exeName[MAX_PATH]{};

    QueryFullProcessImageNameW(pHandle, 0, exeName, &dwSize);

    auto wspath(exeName);
    auto path = toUtf8(wspath);

    return {static_cast<int>(pid), path};
}

Napi::Object getActiveWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle = GetForegroundWindow();
    auto process = getWindowProcess(handle);

    Napi::Object obj{Napi::Object::New(env)};

    obj.Set("processId", process.pid);
    obj.Set("path", process.path);
    obj.Set("id", reinterpret_cast<int64_t>(handle));

    return obj;
}

std::vector<Window> _windows;

BOOL CALLBACK EnumWindowsProc(HWND hwnd, LPARAM lparam)
{
    auto process = getWindowProcess(hwnd);
    _windows.push_back({process, reinterpret_cast<int64_t>(hwnd)});
    return TRUE;
}

Napi::Array getWindows(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    _windows.clear();
    EnumWindows(&EnumWindowsProc, NULL);

    auto arr = Napi::Array::New(env);
    auto i = 0;
    for (auto _win : _windows)
    {
        if (_win.process.path.empty())
            continue;
        auto obj{Napi::Object::New(env)};
        obj.Set("id", _win.id);
        obj.Set("processId", _win.process.pid);
        obj.Set("path", _win.process.path);
        arr.Set(i++, obj);
    }
    return arr;
}

Napi::Number getMonitorFromWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle = getValueFromCallbackData<HWND>(info, 0);

    return Napi::Number::New(
        env, reinterpret_cast<int64_t>(MonitorFromWindow(handle, 0)));
}

Napi::Object getWindowInfo(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    auto process = getWindowProcess(handle);

    BYTE opacity{};
    GetLayeredWindowAttributes(handle, NULL, &opacity, NULL);

    int bufsize = GetWindowTextLengthW(handle) + 1;
    LPWSTR t = new WCHAR[bufsize];
    GetWindowTextW(handle, t, bufsize);

    std::wstring ws(t);
    std::string title = toUtf8(ws);

    RECT rect{};
    GetWindowRect(handle, &rect);

    Napi::Object bounds{Napi::Object::New(env)};

    bounds.Set("x", rect.left);
    bounds.Set("y", rect.top);
    bounds.Set("width", rect.right - rect.left);
    bounds.Set("height", rect.bottom - rect.top);

    Napi::Object obj{Napi::Object::New(env)};

    obj.Set("bounds", bounds);
    obj.Set("processId", process.pid);
    obj.Set("path", process.path);
    obj.Set("opacity", static_cast<double>(opacity) / 255.);
    obj.Set("title", title);
    obj.Set("owner", GetWindowLongPtrA(handle, GWLP_HWNDPARENT));

    return obj;
}

Napi::Number getMonitorScaleFactor(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    HMODULE hShcore{LoadLibraryA("SHcore.dll")};
    lp_GetScaleFactorForMonitor f{(lp_GetScaleFactorForMonitor)GetProcAddress(
        hShcore, "GetScaleFactorForMonitor")};

    DEVICE_SCALE_FACTOR sf{};
    f(getValueFromCallbackData<HMONITOR>(info, 0), &sf);

    return Napi::Number::New(env, static_cast<double>(sf) / 100.);
}

Napi::Boolean toggleWindowTransparency(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    bool toggle{info[1].As<Napi::Boolean>()};
    LONG_PTR style{GetWindowLongPtrA(handle, GWL_EXSTYLE)};

    SetWindowLongPtrA(
        handle, GWL_EXSTYLE,
        ((toggle) ? (style | WS_EX_LAYERED) : (style & (~WS_EX_LAYERED))));

    return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowOpacity(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    double opacity{info[1].As<Napi::Number>().DoubleValue()};

    SetLayeredWindowAttributes(handle, NULL, opacity * 255., LWA_ALPHA);

    return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowBounds(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    Napi::Object bounds{info[1].As<Napi::Object>()};
    auto handle{getValueFromCallbackData<HWND>(info, 0)};

    BOOL b{MoveWindow(
        handle, bounds.Get("x").ToNumber(), bounds.Get("y").ToNumber(),
        bounds.Get("width").ToNumber(), bounds.Get("height").ToNumber(), true)};

    return Napi::Boolean::New(env, b);
}

Napi::Boolean setWindowOwner(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    auto newOwner{
        static_cast<LONG_PTR>(info[1].As<Napi::Number>().Int64Value())};

    SetWindowLongPtrA(handle, GWLP_HWNDPARENT, newOwner);

    return Napi::Boolean::New(env, true);
}

Napi::Boolean showWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    std::string type{info[1].As<Napi::String>()};

    DWORD flag{0};

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

    return Napi::Boolean::New(env, ShowWindow(handle, flag));
}

Napi::Boolean bringWindowToTop(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    BOOL b{SetForegroundWindow(handle)};
    SetActiveWindow(handle);
    SetWindowPos(handle, HWND_TOP, 0, 0, 0, 0,
                 SWP_SHOWWINDOW | SWP_NOMOVE | SWP_NOSIZE);

    return Napi::Boolean::New(env, b);
}

Napi::Boolean redrawWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};
    BOOL b{SetWindowPos(handle, 0, 0, 0, 0, 0,
                        SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE |
                            SWP_NOZORDER | SWP_NOOWNERZORDER | SWP_NOACTIVATE |
                            SWP_DRAWFRAME | SWP_NOCOPYBITS)};

    return Napi::Boolean::New(env, b);
}

Napi::Boolean isWindow(const Napi::CallbackInfo &info)
{
    Napi::Env env{info.Env()};

    auto handle{getValueFromCallbackData<HWND>(info, 0)};

    return Napi::Boolean::New(env, IsWindow(handle));
}

Napi::Object Init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "getActiveWindow"),
                Napi::Function::New(env, getActiveWindow));
    exports.Set(Napi::String::New(env, "getMonitorFromWindow"),
                Napi::Function::New(env, getMonitorFromWindow));
    exports.Set(Napi::String::New(env, "getMonitorScaleFactor"),
                Napi::Function::New(env, getMonitorScaleFactor));
    exports.Set(Napi::String::New(env, "setWindowBounds"),
                Napi::Function::New(env, setWindowBounds));
    exports.Set(Napi::String::New(env, "showWindow"),
                Napi::Function::New(env, showWindow));
    exports.Set(Napi::String::New(env, "bringWindowToTop"),
                Napi::Function::New(env, bringWindowToTop));
    exports.Set(Napi::String::New(env, "redrawWindow"),
                Napi::Function::New(env, redrawWindow));
    exports.Set(Napi::String::New(env, "isWindow"),
                Napi::Function::New(env, isWindow));
    exports.Set(Napi::String::New(env, "setWindowOpacity"),
                Napi::Function::New(env, setWindowOpacity));
    exports.Set(Napi::String::New(env, "toggleWindowTransparency"),
                Napi::Function::New(env, toggleWindowTransparency));
    exports.Set(Napi::String::New(env, "setWindowOwner"),
                Napi::Function::New(env, setWindowOwner));
    exports.Set(Napi::String::New(env, "getWindowInfo"),
                Napi::Function::New(env, getWindowInfo));
    exports.Set(Napi::String::New(env, "getWindows"),
                Napi::Function::New(env, getWindows));

    return exports;
}

NODE_API_MODULE(addon, Init)