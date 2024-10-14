/* @flow strict-local */
// $FlowFixMe[untyped-import]
import React, { useContext } from 'react';
import type { Node } from 'react';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { androidEnsureStoragePermission } from '../lightbox/download';
import * as api from '../api';
import { ensureUnreachable } from '../generics';
import { type Attachment } from './ComposeBox';

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;

  const _ = useContext(TranslationContext);
  const { showActionSheetWithOptions } = useActionSheet();

  const options = [
    _('Upload a file'),
    _('Upload a picture'),
    _('Take a picture'),
    _('Add a video call'),
    _('Cancel'),
  ];

  const handleActionPress = buttonIndex => {
    switch (buttonIndex) {
      case 0:
        props.insertAttachments();
        break;
      case 1:
        props.insertAttachments(/* argument for picture */);
        break;
      case 2:
        props.insertAttachments(/* argument for camera picture */);
        break;
      case 3:
        insertVideoCallLink();
        break;
      case 4:
        // Do nothing as it's the cancel button
        break;
      default:
        ensureUnreachable(buttonIndex);
    }
  };

  return showActionSheetWithOptions(
    {
      options,
      cancelButtonIndex: options.length - 1,
    },
    handleActionPress,
  );
}
