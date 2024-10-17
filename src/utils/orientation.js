/* @flow strict-local */
import { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';

/**
 * Hook to determine the current orientation (landscape or portrait)
 * of the device.
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState('PORTRAIT');

  useEffect(() => {
    const onChange = ({ window: { width, height } }) => {
      if (width > height) {
        setOrientation('LANDSCAPE');
      } else {
        setOrientation('PORTRAIT');
      }
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    onChange(Dimensions.get('window'));  // Initial check

    return () => subscription?.remove();
  }, []);

  return orientation === 'LANDSCAPE';
}
