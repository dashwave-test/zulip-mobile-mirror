import Foundation
import UIKit

@objc(ZLPConstants)
class ZLPConstants: NSObject {
  // For why we include this, see
  //   https://reactnative.dev/docs/0.68/native-modules-ios#exporting-constants
  @objc
  static func requiresMainQueueSetup() -> Bool {
    // UIApplication, which we use in `constantsToExport`, is provided by
    // UIKit. I think that means we should return `true` here. From the doc
    // linked above:
    // > If your module does not require access to UIKit, then you should
    // > respond to `+ requiresMainQueueSetup` with NO.
    return true
  }

  @objc
  func constantsToExport() -> [String: Any]! {
    var result: [String: Any] = [:]
    result["resourceURL"] = Bundle.main.resourceURL!.absoluteString
    result["UIApplication.openSettingsURLString"] = UIApplication.openSettingsURLString
    if #available(iOS 16.0, *) {
      // New name for the notification-settings URL
      // https://developer.apple.com/documentation/uikit/uiapplication/4013180-opennotificationsettingsurlstrin/
      // TODO(ios-16.0): Remove conditional and fallback for 15.4+.
      result["UIApplication.openNotificationSettingsURLString"] = UIApplication.openNotificationSettingsURLString
    }
    if #available(iOS 15.4, *) {
      // Old name for the notification-settings URL
      // https://developer.apple.com/documentation/uikit/uiapplicationopennotificationsettingsurlstring
      // TODO(ios-15.4): Remove conditional.
      result["UIApplicationOpenNotificationSettingsURLString"] = UIApplicationOpenNotificationSettingsURLString
    }
    return result
  }
}
