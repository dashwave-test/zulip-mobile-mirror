/* @flow strict-local */
import React from 'react';
import {
  type NavigationAction,
  type NavigationState,
  typeof NavigationContainer,
} from '@react-navigation/native';

export const isReadyRef: {| current: null | boolean |} = React.createRef();
export const navigationContainerRef: {|
  current: null | React$ElementRef<NavigationContainer>,
|} = React.createRef();

const getContainer = () => {
  if (navigationContainerRef.current === null) {
    throw new Error('Tried to use NavigationService before `navigationContainerRef` was set.');
  }
  if (isReadyRef.current !== true) {
    throw new Error('Tried to use NavigationService before `NavigationContainer` was ready.');
  }
  return navigationContainerRef.current;
};

export const getState = (): NavigationState<> => getContainer().getRootState();

export const dispatch = (navigationAction: NavigationAction): void =>
  getContainer().dispatch(navigationAction);
