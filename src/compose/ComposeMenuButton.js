/* @flow strict-local */
import React from 'react';
import type { Node } from 'react';
import { Pressable } from 'react-native';
import type { SpecificIconType } from '../common/Icons';

type MenuButtonProps = $ReadOnly<{|
  onPress: () => void | Promise<void>,
  IconComponent: SpecificIconType,
|}>;

export default function MenuButton(props: MenuButtonProps): Node {
  const { onPress, IconComponent } = props;
  return (
    <Pressable onPress={onPress}>
      <IconComponent />
    </Pressable>
  );
}
