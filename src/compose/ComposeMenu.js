/* @flow strict-local */
import React, { useContext, useCallback } from 'react';
import type { Node } from 'react';
import { Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useActionSheet } from '@expo/react-native-action-sheet';

import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import type { Attachment } from '../action-sheets';
import { androidEnsureStoragePermission } from '../lightbox/download';
import { androidSdkVersion } from '../reactNativeUtils';

export type ComposeMenuProps = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: (attachments: $ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

export default function ComposeMenu(props: ComposeMenuProps): Node {
  const { insertAttachments, insertVideoCallLink } = props;
  const _ = useContext(TranslationContext);
  const showActionSheetWithOptions = useActionSheet().showActionSheetWithOptions;

  const uploadFile = useCallback(async () => {
    let response = undefined;
    try {
      response = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert(_('Error'), e);
        return;
      }
    }

    if (response) {
      insertAttachments([{ name: response.name, url: response.uri }]);
    }
  }, [insertAttachments, _]);

  const uploadImage = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showErrorAlert(_('Error'), response.errorMessage);
          return;
        }
        insertAttachments(
          response.assets.map(asset => ({
            name: asset.fileName,
            url: asset.uri,
          })),
        );
      },
    );
  }, [insertAttachments, _]);

  const captureImage = useCallback(async () => {
    if (Platform.OS === 'android' && androidSdkVersion() < 29) {
      await androidEnsureStoragePermission({
        title: _('Storage permission needed'),
        message: _('Zulip needs access to your storage to save the captured photo.'),
      });
    }

    launchCamera(
      {
        mediaType: 'photo',
        saveToPhotos: true,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          showErrorAlert(_('Error'), response.errorMessage);
          return;
        }
        insertAttachments(
          response.assets.map(asset => ({
            name: asset.fileName,
            url: asset.uri,
          })),
        );
      },
    );
  }, [insertAttachments, _]);

  const openActionSheet = useCallback(() => {
    const options = [
      _('Upload a file'),
      _('Upload a picture'),
      _('Take a picture'),
      insertVideoCallLink && _('Add a video call'),
      _('Cancel'),
    ].filter(Boolean);

    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            uploadFile();
            break;
          case 1:
            uploadImage();
            break;
          case 2:
            captureImage();
            break;
          case 3:
            if (insertVideoCallLink) {
              insertVideoCallLink();
            }
            break;
          default:
            break;
        }
      },
    );
  }, [showActionSheetWithOptions, uploadFile, uploadImage, captureImage, insertVideoCallLink]);

  return (
    <MenuButton onPress={openActionSheet} IconComponent={IconComposeMenu} />
  );
}
