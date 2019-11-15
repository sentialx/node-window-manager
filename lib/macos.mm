#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <ApplicationServices/ApplicationServices.h>
#include <napi.h>
#include <string>
#include <iostream>
#include <map>

extern "C" AXError _AXUIElementGetWindow(AXUIElementRef, CGWindowID* out);

Napi::Boolean requestAccessibility(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  NSDictionary* opts = @{static_cast<id> (kAXTrustedCheckOptionPrompt): @YES};
  BOOL a = AXIsProcessTrustedWithOptions(static_cast<CFDictionaryRef> (opts));
  
  return Napi::Boolean::New(env, a);
}

std::map<int, AXUIElementRef> m;

AXUIElementRef getAXWindow(int pid, int handle) {
  auto app = AXUIElementCreateApplication(pid);

  NSArray *windows;
  AXUIElementCopyAttributeValues(app, kAXWindowsAttribute, 0, 100, (CFArrayRef *) &windows);

  for (id child in windows) {
    auto window = (AXUIElementRef) child;

    CGWindowID windowId;
    _AXUIElementGetWindow(window, &windowId);

    if (windowId == handle) {
      return window;
    }
  }

  return NULL;
}

Napi::Array getWindows(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  std::vector<Napi::Object> vec;

  for (NSDictionary *info in (NSArray *)windowList) {
    auto obj = Napi::Object::New(env);

    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];
    auto app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];

    obj.Set("id", [windowNumber intValue]);
    obj.Set("processId", [ownerPid intValue]);
    obj.Set("path", app ? [app.bundleURL.path UTF8String] : "");
    m[[windowNumber intValue]] = getAXWindow([ownerPid intValue], [windowNumber intValue]);

    vec.push_back(obj);
  }

  auto arr = Napi::Array::New(env, vec.size());

  for (int i = 0; i < vec.size(); i++) {
    arr[i] = vec[i];
  }

  return arr;
}

Napi::Object getActiveWindow(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  auto app = [NSWorkspace sharedWorkspace].frontmostApplication;

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];

    if ([ownerPid intValue] != app.processIdentifier) continue;

    auto obj = Napi::Object::New(env);

    obj.Set("id", [windowNumber intValue]);
    obj.Set("processId", [ownerPid intValue]);
    obj.Set("path", [app.bundleURL.path UTF8String]);
    m[[windowNumber intValue]] = getAXWindow([ownerPid intValue], [windowNumber intValue]);

    return obj;
  }

  return Napi::Object::New(env);
}

Napi::Object getWindowInfo(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  CGWindowListOption listOptions = kCGWindowListOptionOnScreenOnly | kCGWindowListExcludeDesktopElements;
  CFArrayRef windowList = CGWindowListCopyWindowInfo(listOptions, kCGNullWindowID);

  int handle = info[0].As<Napi::Number>().Int32Value();

  for (NSDictionary *info in (NSArray *)windowList) {
    NSNumber *ownerPid = info[(id)kCGWindowOwnerPID];
    NSNumber *windowNumber = info[(id)kCGWindowNumber];
    NSString *windowName = info[(id)kCGWindowName];
    
    if ([windowNumber intValue] != handle) continue;

    auto app = [NSRunningApplication runningApplicationWithProcessIdentifier: [ownerPid intValue]];

    CGRect bounds;
    CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)info[(id)kCGWindowBounds], &bounds);

    auto obj = Napi::Object::New(env);
    auto boundsObj = Napi::Object::New(env);

    boundsObj.Set("x", bounds.origin.x);
    boundsObj.Set("y", bounds.origin.y);
    boundsObj.Set("width", bounds.size.width);
    boundsObj.Set("height", bounds.size.height);

    obj.Set("id", [windowNumber intValue]);
    obj.Set("processId", [ownerPid intValue]);
    obj.Set("path", [app.bundleURL.path UTF8String]);
    obj.Set("bounds", boundsObj);
    obj.Set("title", [windowName UTF8String]);

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

  auto win = m[handle];

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

  auto pid = info[0].As<Napi::Number>().Int32Value();
  auto app = AXUIElementCreateApplication(pid);

  AXUIElementSetAttributeValue(app, kAXFrontmostAttribute, kCFBooleanTrue);

  return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowMinimized(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};

  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto toggle = info[1].As<Napi::Boolean>();

  auto win = m[handle];

  if (win) {
    AXUIElementSetAttributeValue(win, kAXMinimizedAttribute, toggle ? kCFBooleanTrue : kCFBooleanFalse);
  }

  return Napi::Boolean::New(env, true);
}

Napi::Boolean setWindowMaximized(const Napi::CallbackInfo &info) {
  Napi::Env env{info.Env()};
  auto handle = info[0].As<Napi::Number>().Int32Value();
  auto win = m[handle];

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
    exports.Set(Napi::String::New(env, "getWindowInfo"),
                Napi::Function::New(env, getWindowInfo));
    exports.Set(Napi::String::New(env, "setWindowBounds"),
                Napi::Function::New(env, setWindowBounds));
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