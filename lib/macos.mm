#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <ApplicationServices/ApplicationServices.h>
#include <napi.h>
#include <string>
#include <map>
#include <thread>
#include <fstream>

extern "C" AXError _AXUIElementGetWindow(AXUIElementRef, CGWindowID* out);

// CGWindowID to AXUIElementRef windows map
std::map<int, AXUIElementRef> windowsMap;

bool _requestAccessibility(bool showDialog) {
  NSDictionary* opts = @{static_cast<id> (kAXTrustedCheckOptionPrompt): showDialog ? @YES : @NO};
  return AXIsProcessTrustedWithOptions(static_cast<CFDictionaryRef> (opts));
}

Napi::Boolean requestAccessibility(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  return Napi::Boolean::New(env, _requestAccessibility(true));
}

NSDictionary* getWindowInfo(int handle) {
  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    if ([windowNumber intValue] == handle) {
        // Retain property list so it doesn't get release w. windowList
        CFRetain((CFPropertyListRef)info);
        CFRelease(windowList);
        return info;
    }
  }

  if (windowList) {
    CFRelease(windowList);
  }
  return NULL;
}

AXUIElementRef getAXWindow(int pid, int handle) {
  auto app = AXUIElementCreateApplication(pid);

  CFArrayRef windows;
  AXUIElementCopyAttributeValues(app, kAXWindowsAttribute, 0, 100, &windows);

  for (id child in  (NSArray *)windows) {
    AXUIElementRef window = (AXUIElementRef) child;

    CGWindowID windowId;
    _AXUIElementGetWindow(window, &windowId);

    if (windowId == handle) {
      // Retain returned window so it doesn't get released with rest of list
      CFRetain(window);
      CFRelease(windows);
      return window;
    }
  }

  if (windows) {
    CFRelease(windows);
  }
  return NULL;
}

void cacheWindow(int handle, int pid) {
  if (_requestAccessibility(false)) {
    if (windowsMap.find(handle) == windowsMap.end()) {
      windowsMap[handle] = getAXWindow(pid, handle);
    }
  }
}

void cacheWindowByInfo(NSDictionary* info) {
  if (info) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];
    // Release dictionary info property since we're done with it
    CFRelease((CFPropertyListRef)info);
    cacheWindow([windowNumber intValue], [ownerPid intValue]);
  }
}

void findAndCacheWindow(int handle) {
  cacheWindowByInfo(getWindowInfo(handle));
}

AXUIElementRef getAXWindowById(int handle) {
  auto win = windowsMap[handle];

  if (!win) {
    findAndCacheWindow(handle);
    win = windowsMap[handle];
  }

  return win;
}

Napi::Array getWindows(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  std::vector<Napi::Number> vec;

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    auto app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];
    auto path = app ? [app.bundleURL.path UTF8String] : "";

    if (app && path != "") {
      vec.push_back(Napi::Number::New(env, [windowNumber intValue]));
    }
  }

  auto arr = Napi::Array::New(env, vec.size());

  for (int i = 0; i < vec.size(); i++) {
    arr[i] = vec[i];
  }

  if (windowList) {
    CFRelease(windowList);
  }
  
  return arr;
}

Napi::Number getActiveWindow(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    auto app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];

    if (![app isActive]) {
      continue;
    }

    CFRelease(windowList);
    return Napi::Number::New(env, [windowNumber intValue]);
  }

  if (windowList) {
    CFRelease(windowList);
  }
  return Napi::Number::New(env, 0);
}

Napi::Object initWindow(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);

  if (wInfo) {
    NSNumber *ownerPid = wInfo[(id)kCGWindowOwnerPID];
    NSRunningApplication *app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];

    auto obj = Napi::Object::New(env);
    obj.Set("processId", [ownerPid intValue]);
    obj.Set("path", [app.bundleURL.path UTF8String]);

    cacheWindow(handle, [ownerPid intValue]);

    return obj;
  }

  return Napi::Object::New(env);
}

Napi::String getWindowTitle(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);

  if (wInfo) {
    NSString *windowName = wInfo[(id)kCGWindowName];
    return Napi::String::New(env, [windowName UTF8String]);
  }

  return Napi::String::New(env, "");
}

Napi::Object getWindowBounds(const Napi::CallbackInfo &info) {
   Napi::Env env{info.Env()};

  int handle = info[0].As<Napi::Number>().Int32Value();

  auto wInfo = getWindowInfo(handle);

  if (wInfo) {
    CGRect bounds;
    CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)wInfo[(id)kCGWindowBounds], &bounds);

    auto obj = Napi::Object::New(env);
    obj.Set("x", bounds.origin.x);
    obj.Set("y", bounds.origin.y);
    obj.Set("width", bounds.size.width);
    obj.Set("height", bounds.size.height);

    return obj;
  }

  return Napi::Object::New(env);
}

Napi::Boolean setWindowBounds(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto bounds = info[1].As<Napi::Object>();

  auto x = bounds.Get("x").As<Napi::Number>().DoubleValue();
  auto y = bounds.Get("y").As<Napi::Number>().DoubleValue();
  auto width = bounds.Get("width").As<Napi::Number>().DoubleValue();
  auto height = bounds.Get("height").As<Napi::Number>().DoubleValue();

  auto win = getAXWindowById(handle);

  if (win) {
    NSPoint point = NSMakePoint((CGFloat) x, (CGFloat) y);
    NSSize size = NSMakeSize((CGFloat) width, (CGFloat) height);

    CFTypeRef positionStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGPointType, (const void *)&point));
    AXUIElementSetAttributeValue(win, kAXPositionAttribute, positionStorage);

    CFTypeRef sizeStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGSizeType, (const void *)&size));
    AXUIElementSetAttributeValue(win, kAXSizeAttribute, sizeStorage);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Boolean bringWindowToTop(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto pid = info[1].As<Napi::Number>().Int32Value();

  auto app = AXUIElementCreateApplication(pid);
  auto win = getAXWindowById(handle);

  AXUIElementSetAttributeValue(app, kAXFrontmostAttribute, kCFBooleanTrue);
  AXUIElementSetAttributeValue(win, kAXMainAttribute, kCFBooleanTrue);

  return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowMinimized(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto toggle = info[1].As<Napi::Boolean>();

  auto win = getAXWindowById(handle);

  if (win) {
    AXUIElementSetAttributeValue(win, kAXMinimizedAttribute, toggle ? kCFBooleanTrue : kCFBooleanFalse);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowMaximized(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto win = getAXWindowById(handle);

  if(win) {
    NSRect screenSizeRect = [[NSScreen mainScreen] frame];
    int screenWidth = screenSizeRect.size.width;
    int screenHeight = screenSizeRect.size.height;

    NSPoint point = NSMakePoint((CGFloat) 0, (CGFloat) 0);
    NSSize size = NSMakeSize((CGFloat) screenWidth, (CGFloat) screenHeight);

    CFTypeRef positionStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGPointType, (const void *)&point));
    AXUIElementSetAttributeValue(win, kAXPositionAttribute, positionStorage);

    CFTypeRef sizeStorage = (CFTypeRef)(AXValueCreate((AXValueType)kAXValueCGSizeType, (const void *)&size));
    AXUIElementSetAttributeValue(win, kAXSizeAttribute, sizeStorage);
  }

  return Napi::Boolean::New(env, true);
}


Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getWindows"),
                Napi::Function::New(env, getWindows));
    exports.Set(Napi::String::New(env, "getActiveWindow"),
                Napi::Function::New(env, getActiveWindow));
    exports.Set(Napi::String::New(env, "setWindowBounds"),
                Napi::Function::New(env, setWindowBounds));
    exports.Set(Napi::String::New(env, "getWindowBounds"),
                Napi::Function::New(env, getWindowBounds));
    exports.Set(Napi::String::New(env, "getWindowTitle"),
                Napi::Function::New(env, getWindowTitle));
    exports.Set(Napi::String::New(env, "initWindow"),
                Napi::Function::New(env, initWindow));
    exports.Set(Napi::String::New(env, "bringWindowToTop"),
                Napi::Function::New(env, bringWindowToTop));
    exports.Set(Napi::String::New(env, "setWindowMinimized"),
                Napi::Function::New(env, setWindowMinimized));
    exports.Set(Napi::String::New(env, "setWindowMaximized"),
                Napi::Function::New(env, setWindowMaximized));
    exports.Set(Napi::String::New(env, "requestAccessibility"),
                Napi::Function::New(env, requestAccessibility));

    return exports;
}

NODE_API_MODULE(addon, Init)
