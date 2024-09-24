# Debugging

Seeing what the app is doing is an essential part of development.
A variety of tools are available to help us do that.


### Index:

* [Official advice](#rn-upstream) from React Native upstream
* [Debugging our main app code](#main-codebase) in RN,
  especially React and Redux
  * ... [with the Chrome Developer Tools](#chrome-devtools) /
    Remote JS Debugging
  * ... [with React DevTools](#react-devtools)
  * ... [with redux-logger](#redux-logger)
  * ... [with immutable-devtools](#immutable-devtools)
* [Debugging the message list](#webview) in its WebView
  * ... on iOS, [with Safari developer tools](#webview-safari)
  * ... on Android, [with the Chrome Developer Tools](#webview-chrome)
    (different from using it for RN!)
* [Debugging platform-native code](#native) (i.e. not JS)
  * ... on Android, [with `adb logcat`](#adb-logcat)
* [Debugging with Sentry](#sentry)
  * ... [with a testing-only Sentry project](#testing-sentry)
* [Troubleshooting](#troubleshooting)
  * [Remote JS Debugging opens a webpage that never loads.](#debug-remotely-never-loads)


<div id="rn-upstream" />

## Upstream advice from React Native

React Native's documentation has [a "Debugging" page with a wide
variety of tips][rn-debugging].

Definitely read about:
* the **In-App Developer Menu**
* **Reloading JavaScript**
* **In-App Errors and Warnings**

The **Chrome Developer Tools** are also essential; see the next
section here for details.

Other advice on the page may be useful, but feel free to skim or skip.

[rn-debugging]: https://reactnative.dev/docs/debugging


<div id="main-codebase" />

# Tools: React + Redux

These tools connect to the JavaScript environment that React Native
sets up and most of our app code runs in.  They provide JS-level
debugging there, plus useful hooks specific to React and Redux.


<div id="chrome-devtools" />

## Chrome Developer Tools / Remote JS Debugging

React Native supports debugging the app using Chrome's developer tools, in
much the same way you would a web app.  This provides you with prettily
formatted debug messages and helpful additional information.

To use it, start the app.  (Either in the emulator, or see
[here][chrome-devtools-device] for additional instructions to do this
on a physical device.)  Then, [open the Developer Menu][dev-menu].
Here, select "Debug" (formerly "Debug JS Remotely").  This will open a
new tab in your browser, at http://localhost:8081/debugger-ui .  Go to
this tab and open the developer console.

This console will show all console debug output from your app, which means
that you can debug the app with statements like
```js
console.debug(foobar)
```

Additionally, all Redux events are automatically logged to the console.
See discussion of `redux-logger` below.

See also [in the "Troubleshooting" section below](#debug-remotely-never-loads).

[chrome-devtools-device]: https://reactnative.dev/docs/debugging#debugging-on-a-device-with-chrome-developer-tools


<div id="react-devtools">

## React DevTools

The standalone version of the React Developer Tools, an Electron app,
can be used to debug the React component hierarchy in our app.  See
[RN's docs][rn-react-devtools] on how to use it with RN.

As of 2020-01, the latest version (v4) of React DevTools does not
support any released version of React Native; see [its release
notes][react-devtools-v4].  Instead, install v3 with the command
`yarn global add react-devtools@3`.

[rn-react-devtools]: https://reactnative.dev/docs/debugging#react-developer-tools
[react-devtools-v4]: https://reactjs.org/blog/2019/08/15/new-react-devtools.html


<div id="redux-logger" />

## redux-logger: deeper info on Redux events

One extremely useful kind of information for debugging many kinds of issues
-- as well as for getting to understand how the app works! -- is to see the
Redux state, and a log of the Redux actions.

We have exactly that information logged to the console (in the Chrome
Developer Tools; see above), thanks to the middleware
[`redux-logger`](https://github.com/evgenyrodionov/redux-logger).

By default, it logs the previous state and next state of every action that
is dispatched.  You can control its behavior in more detail by editing the
call to `createLogger` in `src/boot/middleware.js`.

* `diff: true` will compute the diff (using
  [`deep-diff`](https://github.com/flitbit/diff#simple-examples)) between the
  old and new states.  For example, the log output for the action
  `SWITCH_NARROW` can look like this:

  ![image](https://user-images.githubusercontent.com/12771126/42355493-3a24885e-8082-11e8-96d9-fc7c59e0d1d0.png)

  This can be especially helpful for seeing what each action really does.

* `predicate` can be used to filter which actions cause a log message.  By
  default, all actions are logged; when looking at a long log, this option
  can help you cut noise and focus on actions relevant to what you're
  studying.

* Many other options exist!  See [the
  doc](https://github.com/evgenyrodionov/redux-logger#options).


<div id="immutable-devtools" />

## immutable-devtools: inspect Immutable.js objects in Chrome

Some of the data in the Redux state is stored in Immutable.js data
structures. It's normally awkward to inspect these data structures; an
`Immutable.Map` object, for example, is full of properties like
`size`, `__altered`, `__hash`, and `__ownerID`, which you have to dig
around to get at a clear representation of the items contained.

[`immutable-devtools`](https://github.com/andrewdavey/immutable-devtools)
fixes this problem in Google Chrome v47+ by installing a "custom
formatter".

(Alternatively, we might have recommended a [Chrome
extension](https://github.com/mattzeunert/immutable-object-formatter-extension),
which `immutable-devtools` mentions in its setup doc. But using the
NPM package provides the formatter for `zulip-mobile` just as
effectively without making widespread changes in behavior when you
browse the Web.)

To enable it, open Chrome Dev Tools and press F1 to open the settings.
In the "Console" section, tick "Enable custom formatters". If it isn't
working, please consult the project's issue tracker before opening an
issue in `zulip-mobile`.


<div id="webview" />

# Tools: Debugging the message list (in WebView)

We render the message list using a native WebView component. Anything
related to the rendering of messages, the behavior of the message list, or
bugs inside it, you can debug with familiar tools.

Debugging is available both for Android and iOS, and on an emulator or
a physical device via a browser's developer tools.

We've defined a function `sendMessage` that can send a message from
within the WebView to React Native-land outside it. This can be used
(with `type: 'debug'`) if you want to see WebView logs alongisde React
Native logs.

To debug code that runs during the initial load of the WebView, add
`alert("pause"); debugger;` where you want a breakpoint. Then open the
WebView and connect the debugger before clearing the alert.


<div id="webview-safari" />

## Debug WebView on iOS

1. Enable debugging on the device

   For iOS Simulator you can skip this step, as it is already enabled.

   To debug on your physical iOS device, go to `Settings > Safari >
   Advanced` and make sure `Web Inspector` is on.

2. Connect to the device

   * Run Safari (even if your browser of choice is something else).
   * If you have not done so already, enable the developer tools by
     going to Safari’s menu, `Preferences > Advanced`, and checking
     the `Show Develop menu in the menu bar` checkbox.
   * In the app you are debugging, make sure you have navigated to a
     screen that is showing a message list.
   * In the `Develop` menu, find your device and select it.

3. Debug

   You now have access to the rich developer tools you might be
   familiar with.  You can inspect HTML elements, CSS styles and
   examine console.log output.


<div id="webview-chrome" />

## Debug WebView on Android

1. Enable debugging on the device

   For the Android emulator you can skip this step, as it is already
   enabled.

   To debug on your physical Android device, go to `Settings > About
   phone`.  Next, tap the `Build number` panel seven times. You will
   get a notice that now you are a developer. Go back to the main
   Settings screen. Go to the new `Developer` options menu and enable
   the `USB debugging` checkbox.

2. Connect to the device

   * Run Chrome.
   * Navigate to `about:inspect`.
   * Check the `Discover USB devices` and the app will appear.

3. Debug

   You now have access to the rich developer tools you might be
   familiar with.  You can inspect HTML elements, CSS styles and
   examine console.log output.


<div id="native" />

# Tools: Native

These tools operate outside the JavaScript environments set up by
either React Native or our WebView for the message list.  They're
essential for debugging our platform-native code which runs outside
those JS environments.


<div id="adb-logcat" />

## `adb logcat`

When running on Android, either in the emulator or on a physical device, you
can use ADB (the Android debugger) to fetch or watch the device's logs.
This will include any messages that you print with a statement like
```js
console.debug(foobar)
```

To see the logs, run `adb logcat`.  This accepts many command-line
flags to filter and control the output, some of them extremely useful
-- see [upstream documentation][logcat].  Start with the section on
[filtering log output][logcat-filtering]; feel free to skim the whole
rest of the document, but definitely read that section.

[logcat]: https://developer.android.com/studio/command-line/logcat
[logcat-filtering]: https://developer.android.com/studio/command-line/logcat#filteringOutput

Example useful command lines with `adb logcat`:

* **`adb logcat -T 100 ReactNativeJS:V *:S`**

  This filters out logs unrelated to the app (along with many things
  that *are* related), but includes anything you print with
  `console.debug`.  It starts with the last 100 matching log lines
  from before you run the command (so it can be helpful for seeing
  something that just happened), and then it keeps running, printing
  any new log messages that come through.  To quit, hit Ctrl-C.

* **`adb logcat -t 100 *:W`**

  This filters out logs at [levels][logcat-filtering] `V`, `D`, and
  `I` (verbose, debug, info), leaving only `W`, `E`, and `F` (warning,
  error, fatal).  It includes errors at these levels from anything on
  the system -- often good because it isn't always predictable what
  tag an important message will come with.  It prints the last 100
  matching messages, and exits.

* `adb logcat -T `**`$(date +%s.%N -d "2 minutes ago")`**` *:W`

  This prints messages since a certain *time*, then keeps running to
  print new log messages that come through.  The `date` command is
  there in order to turn a nice human-formatted time into the format
  `adb logcat` expects.

  (On macOS, your `date` command may not have this feature, because
  it's a version whose UI hasn't changed since the '80s.  You want
  GNU `date`.  `brew install coreutils` will install it, with the name
  `gdate`.)


<div id="sentry" />

# Debugging with Sentry

We use Sentry to get alerts about things going wrong in the app.


<div id="testing-sentry" />

## Testing Sentry itself, with testing-only project

Normally, debug builds of the app (and others that aren't meant to
become published release builds) don't send any data to Sentry.  In
development one sees errors in a more direct way anyway, and we don't
want to get confusing noise into our production Sentry data.  (For
full discussion, see `src/sentryConfig.js`.)

For testing our Sentry reporting itself, though, one wants to send
events to Sentry after all.  To avoid polluting our production Sentry
data, do this by sending them to a Sentry project that's specifically
for testing.  For core developers, we have a project called "testing"
in our Sentry team, but any project will work.

The "DSN" or "client key" is how we tell the Sentry client where to send
events. For Zulip's "testing" project, members of the team can find the DSN
at https://sentry.io/settings/zulip/projects/testing/keys/ .

To send events from the JavaScript layer, paste the DSN into
`src/sentryConfig.js` as the value of `sentryKey`.

To send events from the native Android layer, edit
`android/app/src/main/AndroidManifest.xml` similarly, following the comment
around `io.sentry.dsn`.


# Troubleshooting


<div id="debug-remotely-never-loads" />

## Remote JS Debugging ("Debug") opens a webpage that never loads.

For some reason, React Native may try to open a browser tab for you at
http://10.0.2.2:8081/debugger-ui .
Instead, it should be http://localhost:8081/debugger-ui .

To fix this, simply open http://localhost:8081/debugger-ui in your browser.
This should load the web debugger you expected. Also, if the app was showing
a blank screen before, it should now behave normally.

If you're still experiencing this issue, [open the Developer menu in your app][dev-menu].
Then, go to "Debug server host & port for device". Here, enter `localhost:8081`
and click OK. Now, try to open http://localhost:8081/debugger-ui again and see
if it works.

[dev-menu]: https://reactnative.dev/docs/debugging#accessing-the-in-app-developer-menu
