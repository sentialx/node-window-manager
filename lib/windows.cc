#include <cmath>
#include <cstdint>
#include <iostream>
#include <napi.h>
#include <shtypes.h>
#include <string>
#include <windows.h>

typedef int (__stdcall* lp_GetScaleFactorForMonitor) (HMONITOR, DEVICE_SCALE_FACTOR*);

struct Process {
    int pid;
    std::string path;
};

template <typename T>
T getValueFromCallbackData (const Napi::CallbackInfo& info, unsigned handleIndex) {
    return reinterpret_cast<T> (info[handleIndex].As<Napi::Number> ().Int64Value ());
}

std::wstring get_wstring (const std::string str) {
    return std::wstring (str.begin (), str.end ());
}

std::string toUtf8 (const std::wstring& str) {
    std::string ret;
    int len = WideCharToMultiByte (CP_UTF8, 0, str.c_str (), str.length (), NULL, 0, NULL, NULL);
    if (len > 0) {
        ret.resize (len);
        WideCharToMultiByte (CP_UTF8, 0, str.c_str (), str.length (), &ret[0], len, NULL, NULL);
    }
    return ret;
}

Process getWindowProcess (HWND handle) {
    DWORD pid{ 0 };
    GetWindowThreadProcessId (handle, &pid);

    HANDLE pHandle{ OpenProcess (PROCESS_QUERY_LIMITED_INFORMATION, false, pid) };

    DWORD dwSize{ MAX_PATH };
    wchar_t exeName[MAX_PATH]{};

    QueryFullProcessImageNameW (pHandle, 0, exeName, &dwSize);
    
    CloseHandle(pHandle);

    auto wspath (exeName);
    auto path = toUtf8 (wspath);

    return { static_cast<int> (pid), path };
}

HWND find_top_window (DWORD pid) {
    std::pair<HWND, DWORD> params = { 0, pid };

    BOOL bResult = EnumWindows (
    [] (HWND hwnd, LPARAM lParam) -> BOOL {
        auto pParams = (std::pair<HWND, DWORD>*)(lParam);

        DWORD processId;
        if (GetWindowThreadProcessId (hwnd, &processId) && processId == pParams->second) {
            SetLastError (-1);
            pParams->first = hwnd;
            return FALSE;
        }

        return TRUE;
    },
    (LPARAM)&params);

    if (!bResult && GetLastError () == -1 && params.first) {
        return params.first;
    }

    return 0;
}

Napi::Number getProcessMainWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    unsigned long process_id = info[0].ToNumber ().Uint32Value ();

    auto handle = find_top_window (process_id);

    return Napi::Number::New (env, reinterpret_cast<int64_t> (handle));
}

Napi::Number createProcess (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto path = info[0].ToString ().Utf8Value ();

    std::string cmd = "";

    if (info[1].IsString ()) {
        cmd = info[1].ToString ().Utf8Value ();
    }

    STARTUPINFOA sInfo = { sizeof (sInfo) };
    PROCESS_INFORMATION processInfo;
    CreateProcessA (path.c_str (), &cmd[0], NULL, NULL, FALSE,
                    CREATE_NEW_PROCESS_GROUP | CREATE_NEW_CONSOLE, NULL, NULL, &sInfo, &processInfo);

    return Napi::Number::New (env, processInfo.dwProcessId);
}

Napi::Number getActiveWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle = GetForegroundWindow ();

    return Napi::Number::New (env, reinterpret_cast<int64_t> (handle));
}

std::vector<int64_t> _windows;

BOOL CALLBACK EnumWindowsProc (HWND hwnd, LPARAM lparam) {
    _windows.push_back (reinterpret_cast<int64_t> (hwnd));
    return TRUE;
}

Napi::Array getWindows (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    _windows.clear ();
    EnumWindows (&EnumWindowsProc, NULL);

    auto arr = Napi::Array::New (env);
    auto i = 0;
    for (auto _win : _windows) {
        arr.Set (i++, Napi::Number::New (env, _win));
    }

    return arr;
}

std::vector<int64_t> _monitors;

BOOL CALLBACK EnumMonitorsProc (HMONITOR hMonitor, HDC hdcMonitor, LPRECT lprcMonitor, LPARAM dwData) {
    _monitors.push_back (reinterpret_cast<int64_t> (hMonitor));
    return TRUE;
}

Napi::Array getMonitors (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    _monitors.clear ();
    if (EnumDisplayMonitors (NULL, NULL, &EnumMonitorsProc, NULL)) {
        auto arr = Napi::Array::New (env);
        auto i = 0;

        for (auto _mon : _monitors) {

            arr.Set (i++, Napi::Number::New (env, _mon));
        }

        return arr;
    }

    return Napi::Array::New (env);
}

Napi::Number getMonitorFromWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle = getValueFromCallbackData<HWND> (info, 0);

    return Napi::Number::New (env, reinterpret_cast<int64_t> (MonitorFromWindow (handle, 0)));
}

Napi::Object initWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    auto process = getWindowProcess (handle);

    Napi::Object obj{ Napi::Object::New (env) };

    obj.Set ("processId", process.pid);
    obj.Set ("path", process.path);

    return obj;
}

Napi::Object getWindowBounds (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    RECT rect{};
    GetWindowRect (handle, &rect);

    Napi::Object bounds{ Napi::Object::New (env) };

    bounds.Set ("x", rect.left);
    bounds.Set ("y", rect.top);
    bounds.Set ("width", rect.right - rect.left);
    bounds.Set ("height", rect.bottom - rect.top);

    return bounds;
}

Napi::String getWindowTitle (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    int bufsize = GetWindowTextLengthW (handle) + 1;
    LPWSTR t = new WCHAR[bufsize];
    GetWindowTextW (handle, t, bufsize);

    std::wstring ws (t);
    std::string title = toUtf8 (ws);

    return Napi::String::New (env, title);
}

Napi::Number getWindowOpacity (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    BYTE opacity{};
    GetLayeredWindowAttributes (handle, NULL, &opacity, NULL);

    return Napi::Number::New (env, static_cast<double> (opacity) / 255.);
}

Napi::Number getWindowOwner (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    return Napi::Number::New (env, GetWindowLongPtrA (handle, GWLP_HWNDPARENT));
}

Napi::Number getMonitorScaleFactor (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    HMODULE hShcore{ LoadLibraryA ("SHcore.dll") };
    lp_GetScaleFactorForMonitor f{ (
    lp_GetScaleFactorForMonitor)GetProcAddress (hShcore, "GetScaleFactorForMonitor") };

    DEVICE_SCALE_FACTOR sf{};
    f (getValueFromCallbackData<HMONITOR> (info, 0), &sf);

    return Napi::Number::New (env, static_cast<double> (sf) / 100.);
}

Napi::Boolean toggleWindowTransparency (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    bool toggle{ info[1].As<Napi::Boolean> () };
    LONG_PTR style{ GetWindowLongPtrA (handle, GWL_EXSTYLE) };

    SetWindowLongPtrA (handle, GWL_EXSTYLE, ((toggle) ? (style | WS_EX_LAYERED) : (style & (~WS_EX_LAYERED))));

    return Napi::Boolean::New (env, true);
}

Napi::Boolean setWindowOpacity (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    double opacity{ info[1].As<Napi::Number> ().DoubleValue () };

    SetLayeredWindowAttributes (handle, NULL, opacity * 255., LWA_ALPHA);

    return Napi::Boolean::New (env, true);
}

Napi::Boolean setWindowBounds (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    Napi::Object bounds{ info[1].As<Napi::Object> () };
    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    BOOL b{ MoveWindow (handle, bounds.Get ("x").ToNumber (), bounds.Get ("y").ToNumber (),
                        bounds.Get ("width").ToNumber (), bounds.Get ("height").ToNumber (), true) };

    return Napi::Boolean::New (env, b);
}

Napi::Boolean setWindowOwner (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    auto newOwner{ static_cast<LONG_PTR> (info[1].As<Napi::Number> ().Int64Value ()) };

    SetWindowLongPtrA (handle, GWLP_HWNDPARENT, newOwner);

    return Napi::Boolean::New (env, true);
}

Napi::Boolean showWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    std::string type{ info[1].As<Napi::String> () };

    DWORD flag{ 0 };

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

    return Napi::Boolean::New (env, ShowWindow (handle, flag));
}

Napi::Boolean bringWindowToTop (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };
    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    BOOL b{ SetForegroundWindow (handle) };

    HWND hCurWnd = ::GetForegroundWindow ();
    DWORD dwMyID = ::GetCurrentThreadId ();
    DWORD dwCurID = ::GetWindowThreadProcessId (hCurWnd, NULL);
    ::AttachThreadInput (dwCurID, dwMyID, TRUE);
    ::SetWindowPos (handle, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE);
    ::SetWindowPos (handle, HWND_NOTOPMOST, 0, 0, 0, 0, SWP_NOSIZE | SWP_NOMOVE);
    ::SetForegroundWindow (handle);
    ::AttachThreadInput (dwCurID, dwMyID, FALSE);
    ::SetFocus (handle);
    ::SetActiveWindow (handle);

    return Napi::Boolean::New (env, b);
}

Napi::Boolean redrawWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };
    BOOL b{ SetWindowPos (handle, 0, 0, 0, 0, 0,
                          SWP_FRAMECHANGED | SWP_NOMOVE | SWP_NOSIZE | SWP_NOZORDER |
                          SWP_NOOWNERZORDER | SWP_NOACTIVATE | SWP_DRAWFRAME | SWP_NOCOPYBITS) };

    return Napi::Boolean::New (env, b);
}

Napi::Boolean isWindow (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    return Napi::Boolean::New (env, IsWindow (handle));
}

Napi::Boolean isWindowVisible (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HWND> (info, 0) };

    return Napi::Boolean::New (env, IsWindowVisible (handle));
}

Napi::Object getMonitorInfo (const Napi::CallbackInfo& info) {
    Napi::Env env{ info.Env () };

    auto handle{ getValueFromCallbackData<HMONITOR> (info, 0) };

    MONITORINFO mInfo;
    mInfo.cbSize = sizeof (MONITORINFO);
    GetMonitorInfoA (handle, &mInfo);

    Napi::Object bounds{ Napi::Object::New (env) };

    bounds.Set ("x", mInfo.rcMonitor.left);
    bounds.Set ("y", mInfo.rcMonitor.top);
    bounds.Set ("width", mInfo.rcMonitor.right - mInfo.rcMonitor.left);
    bounds.Set ("height", mInfo.rcMonitor.bottom - mInfo.rcMonitor.top);

    Napi::Object workArea{ Napi::Object::New (env) };

    workArea.Set ("x", mInfo.rcWork.left);
    workArea.Set ("y", mInfo.rcWork.top);
    workArea.Set ("width", mInfo.rcWork.right - mInfo.rcWork.left);
    workArea.Set ("height", mInfo.rcWork.bottom - mInfo.rcWork.top);

    Napi::Object obj{ Napi::Object::New (env) };

    obj.Set ("bounds", bounds);
    obj.Set ("workArea", workArea);
    obj.Set ("isPrimary", (mInfo.dwFlags & MONITORINFOF_PRIMARY) != 0);

    return obj;
}

Napi::Object Init (Napi::Env env, Napi::Object exports) {
    exports.Set (Napi::String::New (env, "getActiveWindow"), Napi::Function::New (env, getActiveWindow));
    exports.Set (Napi::String::New (env, "getMonitorFromWindow"), Napi::Function::New (env, getMonitorFromWindow));
    exports.Set (Napi::String::New (env, "getMonitorScaleFactor"),
                 Napi::Function::New (env, getMonitorScaleFactor));
    exports.Set (Napi::String::New (env, "setWindowBounds"), Napi::Function::New (env, setWindowBounds));
    exports.Set (Napi::String::New (env, "showWindow"), Napi::Function::New (env, showWindow));
    exports.Set (Napi::String::New (env, "bringWindowToTop"), Napi::Function::New (env, bringWindowToTop));
    exports.Set (Napi::String::New (env, "redrawWindow"), Napi::Function::New (env, redrawWindow));
    exports.Set (Napi::String::New (env, "isWindow"), Napi::Function::New (env, isWindow));
    exports.Set (Napi::String::New (env, "isWindowVisible"), Napi::Function::New (env, isWindowVisible));
    exports.Set (Napi::String::New (env, "setWindowOpacity"), Napi::Function::New (env, setWindowOpacity));
    exports.Set (Napi::String::New (env, "toggleWindowTransparency"),
                 Napi::Function::New (env, toggleWindowTransparency));
    exports.Set (Napi::String::New (env, "setWindowOwner"), Napi::Function::New (env, setWindowOwner));
    exports.Set (Napi::String::New (env, "initWindow"), Napi::Function::New (env, initWindow));
    exports.Set (Napi::String::New (env, "getWindowBounds"), Napi::Function::New (env, getWindowBounds));
    exports.Set (Napi::String::New (env, "getWindowTitle"), Napi::Function::New (env, getWindowTitle));
    exports.Set (Napi::String::New (env, "getWindowOwner"), Napi::Function::New (env, getWindowOwner));
    exports.Set (Napi::String::New (env, "getWindowOpacity"), Napi::Function::New (env, getWindowOpacity));
    exports.Set (Napi::String::New (env, "getMonitorInfo"), Napi::Function::New (env, getMonitorInfo));
    exports.Set (Napi::String::New (env, "getWindows"), Napi::Function::New (env, getWindows));
    exports.Set (Napi::String::New (env, "getMonitors"), Napi::Function::New (env, getMonitors));
    exports.Set (Napi::String::New (env, "createProcess"), Napi::Function::New (env, createProcess));
    exports.Set (Napi::String::New (env, "getProcessMainWindow"), Napi::Function::New (env, getProcessMainWindow));

    return exports;
}

NODE_API_MODULE (addon, Init)
