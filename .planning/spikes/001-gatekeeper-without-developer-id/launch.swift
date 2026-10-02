import AppKit
import CoreServices

let appURL = URL(fileURLWithPath: CommandLine.arguments[1])
func emit(_ value: [String: Any]) {
    let data = try! JSONSerialization.data(withJSONObject: value, options: [.sortedKeys])
    print(String(data: data, encoding: .utf8)!)
    fflush(stdout)
}
do {
    // Public quarantine API. This simulates a web download, not a real browser test.
    let properties: [String: Any] = [
        kLSQuarantineAgentNameKey as String: "Lecat research probe",
        kLSQuarantineTypeKey as String: kLSQuarantineTypeWebDownload as String,
        kLSQuarantineTimeStampKey as String: Date(),
        kLSQuarantineDataURLKey as String: "https://github.com/lferraro1103/Lecat-Markdown/releases/tag/v3.2.0-macos.2",
    ]
    try (appURL as NSURL).setResourceValue(properties, forKey: .quarantinePropertiesKey)
    let observed = try (appURL as NSURL).resourceValues(forKeys: [.quarantinePropertiesKey])
    emit(["phase": "quarantine", "metadata": String(describing: observed)])
} catch {
    emit(["phase": "quarantine", "error": error.localizedDescription])
    exit(2)
}
let config = NSWorkspace.OpenConfiguration()
config.createsNewApplicationInstance = true
config.arguments = ["--audit"]
var finished = false
var outcome: Int32 = 3
NSWorkspace.shared.openApplication(at: appURL, configuration: config) { application, error in
    if let error = error as NSError? {
        emit(["phase": "launch", "status": "blocked-or-failed", "domain": error.domain,
              "code": error.code, "message": error.localizedDescription])
        outcome = 1
    } else {
        emit(["phase": "launch", "status": "launched", "pid": application?.processIdentifier ?? -1])
        outcome = 0
    }
    finished = true
}
let deadline = Date().addingTimeInterval(20)
while !finished && Date() < deadline {
    RunLoop.current.run(until: Date().addingTimeInterval(0.1))
}
if !finished { emit(["phase": "launch", "status": "timeout-or-pending-ui"]) }
exit(outcome)
