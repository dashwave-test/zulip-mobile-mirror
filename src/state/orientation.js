/* @flow strict-local */
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState(getOrientation());

  function getOrientation() {
    const { width, height } = Dimensions.get('window');
    return width > height ? 'LANDSCAPE' : 'PORTRAIT';
  }

  useEffect(() => {
    const listener = ({ window: { width, height } }) => {
      setOrientation(width > height ? 'LANDSCAPE' : 'PORTRAIT');
    };
    
    Dimensions.addEventListener('change', listener);

    return () => {
      Dimensions.removeEventListener('change', listener);
    };
  }, []);

  return orientation;
};
