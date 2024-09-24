/* @flow strict-local */

import React from 'react';
import { AppState, Platform } from 'react-native';
import type { AppStateValues as AppStateValuesBusted } from 'react-native/Libraries/AppState/AppState';
// eslint-disable-next-line id-match
import type { ____ViewStyle_Internal } from 'react-native/Libraries/StyleSheet/StyleSheetTypes';
import invariant from 'invariant';

import * as logging from './utils/logging';
import type { BoundedDiff } from './generics';
import { typesEquivalent } from './generics';

// A copy of the same-named type in
// node_modules/react-native/Libraries/StyleSheet/StyleSheetTypes.js, for
// use in ViewStylePropWithout, below.
type GenericStyleProp<+T> = null | void | T | false | '' | $ReadOnlyArray<GenericStyleProp<T>>;

/**
 * `View`'s style prop, but without the style attributes defined in T.
 */
// RN's type for `View`'s style prop is `ViewStyleProp` in
// node_modules/react-native/Libraries/StyleSheet/StyleSheet.js; our
// implementation builds on a copy of that.
export type ViewStylePropWithout<T: { ... }> = GenericStyleProp<
  // Uses unsound $Shape just because the upstream type does, and we're
  // copying that.
  $ReadOnly<$Shape<BoundedDiff<____ViewStyle_Internal, T>>>,
>;

/**
 * Documented app-state values, plus any we've seen in the wild.
 */
type AppStateValues = AppStateValuesBusted | 'unknown';

/**
 * A hook for AppState's current state value, updated on 'change' events.
 *
 * Gives `null` if the state isn't one of the expected values
 * (AppStateValues), and logs to Sentry in that case.
 */
export function useAppState(): null | AppStateValues {
  // Upstream has `?string`… probably they mean `AppStateValues`, but we'll
  // take them at their word and handle the differences by logging, to
  // prompt investigation if needed:
  // - nullish
  // - some string that's not an AppStateValues
  let initialState = AppState.currentState;

  if (
    initialState == null
    || (typeof initialState === 'string'
      && initialState !== 'inactive'
      && initialState !== 'background'
      && initialState !== 'active'
      && initialState !== 'unknown')
  ) {
    // If Flow errors here, adjust cases in the conditional.
    typesEquivalent<AppStateValues, 'inactive' | 'background' | 'active' | 'unknown'>();
    logging.warn(`Unexpected AppState.currentState: ${initialState?.toString() ?? '[nullish]'}`);
    initialState = null;
  }

  const [value, setValue] = React.useState(initialState);
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', setValue);
    return () => sub.remove();
  }, []);
  return value;
}

/**
 * The Android SDK version (e.g., 33 for Android 13 a.k.a. Tiramisu).
 *
 * Throws if called on iOS.
 */
export function androidSdkVersion(): number {
  invariant(Platform.OS === 'android', 'androidSdkVersion called on iOS');

  // Flow isn't refining `Platform` to a type that corresponds to values
  // we'll see on Android. We do expect `Platform.Version` to be a number on
  // Android; see https://reactnative.dev/docs/platform#version. Empirically
  // (and this isn't in the doc yet), it's the SDK version, so for Android
  // 10 it won't be 10, it'll be 29.
  return (Platform.Version: number);
}

/**
 * The Android user-visible version string, with no promised structure.
 */
// This is Build.VERSION.RELEASE as of RN v0.68.5:
//   https://reactnative.dev/docs/platform#constants
//   https://github.com/facebook/react-native/blob/v0.68.5/ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/AndroidInfoModule.java#L69
//   https://developer.android.com/reference/android/os/Build.VERSION#RELEASE
export function androidRelease(): string {
  invariant(Platform.OS === 'android', 'androidRelease called on iOS');

  // Flow isn't refining `Platform` to a type that corresponds to values
  // we'll see on Android.
  //
  // (If changing the implementation, adjust comment below jsdoc.)
  return (Platform.constants.Release: string);
}

/**
 * The manufacturer of the Android device.
 *
 * E.g., "Google", "samsung".
 */
// This is Build.MANUFACTURER as of RN v0.68.7:
//   https://reactnative.dev/docs/platform#constants
//   https://github.com/facebook/react-native/blob/v0.68.7/ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/AndroidInfoModule.java#L73
//   https://developer.android.com/reference/android/os/Build#MANUFACTURER
export function androidManufacturer(): string {
  invariant(Platform.OS === 'android', 'androidManufacturer called on iOS');
  return (Platform.constants.Manufacturer: string);
}

/**
 * "The consumer-visible brand with which the product/hardware will be associated, if any."
 *
 * E.g., "google", "samsung".
 */
// This is Build.BRAND as of RN v0.68.7:
//   https://reactnative.dev/docs/platform#constants
//   https://github.com/facebook/react-native/blob/v0.68.7/ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/AndroidInfoModule.java#L74
//   https://developer.android.com/reference/android/os/Build#BRAND
export function androidBrand(): string {
  invariant(Platform.OS === 'android', 'androidBrand called on iOS');
  return (Platform.constants.Brand: string);
}

/**
 * "The end-user-visible name for the end product."
 *
 * E.g., "Pixel 5", "sdk_gphone64_x86_64", "SM-G960U1".
 */
// This is Build.MODEL as of RN v0.68.7:
//   https://reactnative.dev/docs/platform#constants
//   https://github.com/facebook/react-native/blob/v0.68.7/ReactAndroid/src/main/java/com/facebook/react/modules/systeminfo/AndroidInfoModule.java#L72
//   https://developer.android.com/reference/android/os/Build#MODEL
export function androidModel(): string {
  invariant(Platform.OS === 'android', 'androidModel called on iOS');
  return (Platform.constants.Model: string);
}
