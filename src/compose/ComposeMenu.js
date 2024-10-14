/* @flow strict-local */
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { View, Alert, Linking, Pressable } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { createStyleSheet } from '../styles';
import { androidEnsureStoragePermission } from '../lightbox/download';
import { androidSdkVersion } from '../reactNativeUtils';
import { useActionSheet } from '@expo/react-native-action-sheet';

export type Attachment = {|
  +name: string | null,
  +url: string,
|};

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;
  const _ = useContext(TranslationContext);
  const { showActionSheetWithOptions } = useActionSheet();

  const handleActionSheetPress = useCallback(
    async buttonIndex => {
      switch (buttonIndex) {
        case 0:
          await handleFilesPicker();
          break;
        case 1:
          await handleImagePicker();
          break;
        case 2:
          await handleCameraCapture();
          break;
        case 3:
          insertVideoCallLink && insertVideoCallLink();
          break;
        default:
          break;
      }
    },
    [handleFilesPicker, handleImagePicker, handleCameraCapture, insertVideoCallLink]
  );

  const handleFilesPicker = useCallback(async () => {
    let response = undefined;
    try {
      response = (await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      }));
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert(_('Error'), e);
      }
      return;
    }

    insertAttachments(response.map(a => ({ name: a.name, url: a.uri })));
  }, [_, insertAttachments]);

  const handleImagePicker = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 1.0,
        includeBase64: false,
        selectionLimit: 0,
      },
      response => {
        if (!response.didCancel && !response.errorCode && response.assets) {
          insertAttachments(
            response.assets.map(asset => ({
              name: asset.fileName || _(Asset), // Pick a name if not given
              url: asset.uri,
            })),
          );
        }
      }
    );
  }, [insertAttachments]);

  const handleCameraCapture = useCallback(async () => {
    if (Platform.OS === 'android') {
      await androidEnsureStoragePermission({
        title: _('Storage permission needed'),
        message: _('Zulip will save a copy...'),
      });
    }

    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
        includeBase64: false,
      },
      response => {
        if (!response.didCancel && !response.errorCode && response.assets) {
          insertAttachments(
            response.assets.map(asset => ({
              name: asset.fileName || _('Camera Capture'),
              url: asset.uri,
            })),
          );
        }
      }
    );
  }, [insertAttachments, _]);

  const styles = useMemo(
    () =>
      createStyleSheet({
        container: {
          flexDirection: 'row',
        },
      }),
    [],
  );

  const showActionSheet = useCallback(() => {
    const options = [
      _('Upload a file'),
      _('Upload a picture'),
      _('Take a picture'),
      _('Add a video call'),
      _('Cancel'),
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions({ options, cancelButtonIndex }, handleActionSheetPress);
  }, [showActionSheetWithOptions, handleActionSheetPress]);

  return (
    <Pressable onPress={showActionSheet} style={styles.container}>
      <View />
    </Pressable>
  );
}
