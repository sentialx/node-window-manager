import AppKit

func toJson<T>(_ data: T) throws -> String {
	let json = try JSONSerialization.data(withJSONObject: data)
	return String(data: json, encoding: .utf8)!
}

let windows = CGWindowListCopyWindowInfo([.optionOnScreenOnly, .excludeDesktopElements], kCGNullWindowID) as! [[String: Any]]

func getActiveWindow() -> Int {
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
			"owner": [
				"name": window[kCGWindowOwnerName as String] as! String,
				"processId": appPid,
				"path": app.bundleURL!.path
			]
		]

		return dict
	}

	return nil
}

if (CommandLine.arguments[1] == "getActiveWindow") {
	print(getActiveWindow())
} else if (CommandLine.arguments[1] == "getWindowInfoById") {
	let id = Int(CommandLine.arguments[2])
	print(try! toJson(getWindowInfoById(id!)))
}

exit(0)