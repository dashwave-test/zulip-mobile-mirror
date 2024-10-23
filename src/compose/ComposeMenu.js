/* @flow strict-local */
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { ActionSheetIOS, Platform } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { androidEnsureStoragePermission } from '../lightbox/download';
import { androidSdkVersion } from '../reactNativeUtils';
import type { Attachment } from './ComposeMenu';

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

// From the doc:
//   https://github.com/react-native-image-picker/react-native-image-picker/tree/v4.10.2#options
// > Only iOS version >= 14 & Android version >= 13 support [multi-select]
const kShouldOfferImageMultiselect =
  Platform.OS === 'ios' || androidSdkVersion() >= 33;

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;
  const _ = useContext(TranslationContext);
  const { showActionSheetWithOptions } = useActionSheet();

  const handleActionSheetSelection = useCallback(
    buttonIndex => {
      if (buttonIndex === 0) {
        // Handle upload files
      } else if (buttonIndex === 1) {
        // Handle upload picture
      } else if (buttonIndex === 2) {
        // Handle take picture
      } else if (buttonIndex === 3) {
        if (insertVideoCallLink) {
          insertVideoCallLink();
        }
      }
    },
    [insertVideoCallLink],
  );

  const handleOpenActionSheet = useCallback(() => {
    const options = [
      _('Upload a file'),
      _('Upload a picture'),
      _('Take a picture'),
      insertVideoCallLink !== null ? _('Add a video call') : null,
      _('Cancel'),
    ].filter(Boolean);

    const cancelButtonIndex = options.length - 1;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex },
        handleActionSheetSelection,
      );
    } else {
      showActionSheetWithOptions(
        { options, cancelButtonIndex },
        handleActionSheetSelection,
      );
    }
  }, [handleActionSheetSelection, insertVideoCallLink, _, showActionSheetWithOptions]);

  return (
    <MenuButton onPress={handleOpenActionSheet} IconComponent={IconAttach} />
  );
}
