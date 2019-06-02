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

	func setBounds(bounds: NSRect) {
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

func getWindowInfoById(_ id: Int) -> [String: Any]? {
	let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]

	for window in windows {
		if (window[kCGWindowNumber as String] as! Int != id) {
			continue;
		}

		let bounds = CGRect(dictionaryRepresentation: window[kCGWindowBounds as String] as! CFDictionary)!
		let appPid = window[kCGWindowOwnerPID as String] as! pid_t
		let app = NSRunningApplication(processIdentifier: appPid)!

		let dict: [String: Any] = [
			"title": window[kCGWindowName as String] as? String ?? "",
			"id": window[kCGWindowNumber as String] as! Int,
			"bounds": [
				"x": bounds.origin.x,
				"y": bounds.origin.y,
				"width": bounds.width,
				"height": bounds.height
			],
			"process": [
				"name": window[kCGWindowOwnerName as String] as! String,
				"id": appPid,
				"path": app.bundleURL!.path
			]
		]

		return dict
	}

	return nil
}

func AXUIWindowArray(processIdentifier pid:pid_t) -> [AXUIElement] {
	let windowList : UnsafeMutablePointer<AnyObject?> = UnsafeMutablePointer<AnyObject?>.allocate(capacity: 1)
	let appRef = AXUIElementCreateApplication(pid)
	AXUIElementCopyAttributeValue(appRef, "AXWindows" as CFString, windowList)
	return windowList.pointee as! [AXUIElement]
}

func AXUIWindowArray() -> [AXUIElement] {
	let runningApplications = NSWorkspace.shared.runningApplications

	var elements: [AXUIElement] = [];

	for app in runningApplications {
		let windows = AXUIWindowArray(processIdentifier: app.processIdentifier)
		elements = elements + windows
	}

	return elements
}


func getAXWindowById(id: Int) -> AXUIElement? {
	let info = getWindowInfoById(id)!
	let process = (info["owner"] as? [String: Any])!
	let windows = AXUIWindowArray(processIdentifier: process["processId"] as! pid_t)

	for window in windows {
		let pos: CGPoint = window.getAttribute(key: "Position")
		let size: CGSize = window.getAttribute(key: "Size")
		let title: String = window.getAttribute(key: "Title")
		let bounds = (info["bounds"] as? [String: Any])!

		if bounds["x"] as? CGFloat == pos.x && 
			bounds["y"] as? CGFloat == pos.y && 
			bounds["width"] as? CGFloat == size.width && 
			bounds["height"] as? CGFloat == size.height && 
			info["title"] as? String == title {
			return window
		}
	}
	
	return nil
}

if (CommandLine.arguments[1] == "getActiveWindow") {
	print(getActiveWindow())
} else if (CommandLine.arguments[1] == "getWindowInfoById") {
	let id = Int(CommandLine.arguments[2])

	print(try! toJson(getWindowInfoById(id!)))
} else if (CommandLine.arguments[1] == "setBounds") {
	let id = Int(CommandLine.arguments[2])!
	let x = CGFloat(Int(CommandLine.arguments[3])!)
	let y = CGFloat(Int(CommandLine.arguments[4])!)
	let width = CGFloat(Int(CommandLine.arguments[5])!)
	let height = CGFloat(Int(CommandLine.arguments[6])!)

	let window = getAXWindowById(id: id)
	
	window?.setBounds(bounds: NSMakeRect(x, y, width, height))
} else if (CommandLine.arguments[1] == "bringToTop") {
	let id = Int(CommandLine.arguments[2])!

	let info = getWindowInfoById(id)!
	let process = (info["process"] as? [String: Any])!
	let appRef = AXUIElementCreateApplication(process["id"] as! pid_t)

	appRef.setAttribute(key: "Frontmost", value: true as CFBoolean)
} else if (CommandLine.arguments[1] == "minimize") {
	let id = Int(CommandLine.arguments[2])!
	let b = Bool(CommandLine.arguments[3])!

	let window = getAXWindowById(id: id)
	window?.setAttribute(key: "Minimized", value: b as CFBoolean)
}

let options = [
	kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: false as CFBoolean
]

AXIsProcessTrustedWithOptions(options as CFDictionary)

exit(0)