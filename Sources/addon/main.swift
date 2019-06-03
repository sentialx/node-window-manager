import AppKit
import Cocoa

extension AXValue {
	class func initWith(t: Any) -> AXValue? {
		var t = t
		switch t {
		case is CGPoint:
			return AXValueCreate(AXValueType(rawValue: kAXValueCGPointType)!, &t)!
		case is CGSize:
			return AXValueCreate(AXValueType(rawValue: kAXValueCGSizeType)!, &t)!
		default:
			return nil
		}
	}

	func convertTo<T>() -> T {
		let ptr = UnsafeMutablePointer<T>.allocate(capacity: 1)
		AXValueGetValue(self, AXValueGetType(self), ptr)
		let val = ptr.pointee
		ptr.deallocate()
		return val
	}
}

extension String {
  func CGFloatValue() -> CGFloat? {
    guard let doubleValue = Double(self) else {
      return nil
    }

    return CGFloat(doubleValue)
  }
}

extension AXUIElement {
	func getAttribute<T>(key: String) -> T {
		var ptr: AnyObject?
		AXUIElementCopyAttributeValue(self, "AX\(key)" as CFString, &ptr)
		if key == "Size" ||  key == "Position" {
			let val = ptr as! AXValue
			return val.convertTo()
		}
		return ptr as! T
	}

	func setAttribute<T: AnyObject>(key: String, value: T) {
		AXUIElementSetAttributeValue(self, "AX\(key)" as CFString, value)
	}

	func setBounds(_ bounds: NSRect) {
		setAttribute(key: "Position", value: AXValue.initWith(t: bounds.origin)!)
		setAttribute(key: "Size", value: AXValue.initWith(t: bounds.size)!)
	}
}

func toJson<T>(_ data: T) throws -> String {
	let json = try JSONSerialization.data(withJSONObject: data)
	return String(data: json, encoding: .utf8)!
}

func getActiveWindow() -> Int {
	let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]

	let frontmostAppPID = NSWorkspace.shared.frontmostApplication!.processIdentifier

	for window in windows {
		let windowOwnerPID = window[kCGWindowOwnerPID as String] as! Int

		if windowOwnerPID != frontmostAppPID {
			continue
		}

		// Skip transparent windows
		if (window[kCGWindowAlpha as String] as! Double) == 0 {
			continue
		}

		let bounds = CGRect(dictionaryRepresentation: window[kCGWindowBounds as String] as! CFDictionary)!

		// Skip tiny windows
		let minWinSize: CGFloat = 50
		if bounds.width < minWinSize || bounds.height < minWinSize {
			continue
		}

		return (window[kCGWindowNumber as String] as! Int)
	}
	return -1
}

var windowsMap: [Int: AXUIElement] = [:]

func getAXWindowByInfo(pid: pid_t, bounds: CGRect, title: String) -> AXUIElement? {
	let windows = AXUIWindowArray(processIdentifier: pid)

	for window in windows {
		let pos: CGPoint = window.getAttribute(key: "Position")
		let size: CGSize = window.getAttribute(key: "Size")
		let t: String = window.getAttribute(key: "Title")

		if bounds.origin.x == pos.x && 
			bounds.origin.y == pos.y && 
			bounds.width == size.width && 
			bounds.height == size.height && 
			title == t {
			return window
		}
	}
	
	return nil
}

func isWindow(_ id: Int) -> Bool {
	let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]

	for window in windows {
		if (window[kCGWindowNumber as String] as! Int != id) {
			continue;
		}

		return true
	}

	return false
}

func initializeWindow(_ id: Int) -> [String: Any]? {
	let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]

	for window in windows {
		if (window[kCGWindowNumber as String] as! Int != id) {
			continue;
		}

		let bounds = CGRect(dictionaryRepresentation: window[kCGWindowBounds as String] as! CFDictionary)!
		let appPid = window[kCGWindowOwnerPID as String] as! pid_t
		let app = NSRunningApplication(processIdentifier: appPid)!

		windowsMap[window[kCGWindowNumber as String] as! Int] = getAXWindowByInfo(pid: appPid, bounds: bounds, title: window[kCGWindowName as String] as? String ?? "")

		return [
			"id": appPid,
			"path": app.bundleURL!.path
		]
	}

	return [
		"id": "",
		"path": ""
	]
}

func AXUIWindowArray(processIdentifier pid:pid_t) -> [AXUIElement] {
	let appRef = AXUIElementCreateApplication(pid)
	return appRef.getAttribute(key: "Windows")
}

func getTitle(_ id: Int) -> String {
	if let window = windowsMap[id] {
		return window.getAttribute(key: "Title");
	}
	return ""
}

func getBounds(_ id: Int) -> [String: CGFloat] {
	if let window = windowsMap[id] {
		let pos: CGPoint = window.getAttribute(key: "Position")
		let size: CGSize = window.getAttribute(key: "Size")

		return [
			"x": pos.x,
			"y": pos.y,
			"width": size.width,
			"height": size.height
		]
	}

	return [
		"x": 0,
		"y": 0,
		"width": 0,
		"height": 0
	]
}

func setBounds(id: Int, x: CGFloat, y: CGFloat, width: CGFloat, height: CGFloat) {
	if let window = windowsMap[id] {
		window.setBounds(NSMakeRect(x, y, width, height))
	}
}

func bringToTop(_ pid: pid_t) {
	let appRef = AXUIElementCreateApplication(pid)
	appRef.setAttribute(key: "Frontmost", value: true as CFBoolean)
}

func setMinimized(id: Int, toggle: Bool) {
	if let window = windowsMap[id] {
		window.setAttribute(key: "Minimized", value: toggle as CFBoolean)
	}
}

let options = [
	kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true as CFBoolean
]

AXIsProcessTrustedWithOptions(options as CFDictionary)

setbuf(__stdoutp, nil);

while (true) {
	let line = readLine()
	let args = line!.components(separatedBy: " ")

	if (args[0] == "getActiveWindow") {
		print(getActiveWindow())
	} else if (args[0] == "getBounds") {
		print(try! toJson(getBounds(Int(args[1])!)))
	} else if (args[0] == "bringToTop") {
		bringToTop(pid_t(Int(args[1])!))
	} else if (args[0] == "setMinimized") {
		setMinimized(id: Int(args[1])!, toggle: Bool(args[2])!)
	} else if (args[0] == "setBounds") {
		setBounds(
			id: Int(args[1])!, 
			x: CGFloat(Int(args[2])!), 
			y: CGFloat(Int(args[3])!), 
			width: CGFloat(Int(args[4])!),
			height: CGFloat(Int(args[5])!)
		)
	} else if (args[0] == "getTitle") {
		print(getTitle(Int(args[1])!))
	} else if (args[0] == "initializeWindow") {
		print(try! toJson(initializeWindow(Int(args[1])!)))
	} else if (args[0] == "isWindow") {
		let b = isWindow(Int(args[1])!)
		print("\(b)")
	}
}