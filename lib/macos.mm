#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <AppKit/NSWorkspace.h>
#include <napi.h>
#include <string>

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

    CGRect bounds;
    CGRectMakeWithDictionaryRepresentation((CFDictionaryRef)info[(id)kCGWindowBounds], &bounds);

    obj.Set("id", [windowNumber intValue]);
    obj.Set("processId", [ownerPid intValue]);
    obj.Set("path", app ? std::string([app.bundleURL.path UTF8String]) : "");

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
    obj.Set("path", std::string([app.bundleURL.path UTF8String]));

    return obj;
  }

  return Napi::Object::New(env);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "getWindows"),
                Napi::Function::New(env, getWindows));
    exports.Set(Napi::String::New(env, "getActiveWindow"),
                Napi::Function::New(env, getActiveWindow));

    return exports;
}

NODE_API_MODULE(addon, Init)