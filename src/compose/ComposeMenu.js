/* @flow strict-local */
// $FlowFixMe[untyped-import]
import Color from 'color';
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { Platform, View, Alert, Linking } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { useActionSheet } from '@expo/react-native-action-sheet';

import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { createStyleSheet } from '../styles';
import { IconImage, IconCamera, IconAttach, IconVideo } from '../common/Icons';
import { androidEnsureStoragePermission } from '../lightbox/download';
import { ThemeContext } from '../styles/theme';
import type { SpecificIconType } from '../common/Icons';
import { androidSdkVersion } from '../reactNativeUtils';

export type Attachment = {| +name: string | null, +url: string |};

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

// Choose an appropriate filename for an image to upload.
export const chooseUploadImageFilename = (uri: string, fileName: string): string => {
  const nameWithoutPrefix = fileName.replace(/^rn_image_picker_lib_temp_/, '');

  if (/\.jpe?g$/i.test(uri)) {
    const result = nameWithoutPrefix.replace(/\.heic$/i, '.jpeg');
    if (result !== nameWithoutPrefix) {
      logging.warn('OK, so .HEIC to .jpeg replacement still seems like a good idea.');
    }
    return result;
  }

  return nameWithoutPrefix;
};

// From the doc:
// https://github.com/react-native-image-picker/react-native-image-picker/tree/v4.10.2#options
const kShouldOfferImageMultiselect = Platform.OS === 'ios' || androidSdkVersion() >= 33;

// As of r-n-image-picker v5.3.1, this is needed to ensure that any received
// videos have a `fileName` that includes a filename extension. (Servers
// will interpret the filename extension.) See library implementation.
const kShouldOfferImagePickerMixedMedia = Platform.OS === 'ios' || androidSdkVersion() >= 33;

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;
  const _ = useContext(TranslationContext);

  const { showActionSheetWithOptions } = useActionSheet();

  const options = [
    _('Upload a file'),
    _('Upload a picture'),
    _('Take a picture'),
    insertVideoCallLink ? _('Add a video call') : null,
    _('Cancel'),
  ].filter(Boolean);

  const handleShowOptions = useCallback(() => {
    const cancelButtonIndex = options.length - 1;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      buttonIndex => {
        switch (buttonIndex) {
          case 0:
            handleFilesPicker();
            break;
          case 1:
            handleImagePicker();
            break;
          case 2:
            handleCameraCapture();
            break;
          case 3:
            insertVideoCallLink && insertVideoCallLink();
            break;
          case cancelButtonIndex:
          default:
            break;
        }
      },
    );
  }, [insertVideoCallLink, showActionSheetWithOptions, options]);

  const handleImagePickerResponse = useCallback(response => {
    if (response.didCancel === true) {
      return;
    }

    const errorCode = response.errorCode;
    if (errorCode != null) {
      if (Platform.OS === 'ios' && errorCode === 'permission') {
        Alert.alert(
          _('Permissions needed'),
          _('To upload an image, please grant Zulip additional permissions in Settings.'),
          [
            { text: _('Cancel'), style: 'cancel' },
            {
              text: _('Open settings'),
              onPress: () => {
                Linking.openSettings();
              },
              style: 'default',
            },
          ],
        );
      } else if (errorCode === 'camera_unavailable') {
        showErrorAlert(_('Error'), _('Camera unavailable.'));
      } else {
        const { errorMessage } = response;
        showErrorAlert(_('Error'), errorMessage);
        logging.error('Unexpected error from image picker', {
          errorCode,
          errorMessage: errorMessage ?? '[nullish]',
        });
      }
      return;
    }

    const { assets } = response;

    if (!assets || !assets[0]) {
      showErrorAlert(_('Error'), _('Failed to attach your file.'));
      logging.error('Image picker response gave falsy `assets` or falsy `assets[0]`', {
        '!assets': !assets,
      });
      return;
    }

    const attachments = [];
    let numMalformed = 0;
    assets.forEach((asset, i) => {
      const { uri, fileName } = asset;

      if (uri == null || fileName == null) {
        logging.error('An asset returned from image picker had nullish `url` and/or `fileName`', {
          'uri == null': uri == null,
          'fileName == null': fileName == null,
          i,
        });
        numMalformed++;
        return;
      }

      attachments.push({ name: chooseUploadImageFilename(uri, fileName), url: uri });
    });

    if (numMalformed > 0) {
      if (assets.length === 1 && numMalformed === 1) {
        showErrorAlert(_('Error'), _('Failed to attach your file.'));
        return;
      } else if (assets.length === numMalformed) {
        showErrorAlert(_('Error'), _('Failed to attach your files.'));
        return;
      } else {
        showErrorAlert(_('Error'), _('Failed to attach some of your files.'));
      }
    }

    insertAttachments(attachments);
  }, [_, insertAttachments]);

  const handleImagePicker = useCallback(() => {
    launchImageLibrary(
      {
        mediaType: kShouldOfferImagePickerMixedMedia ? 'mixed' : 'photo',
        quality: 1.0,
        includeBase64: false,
        selectionLimit: kShouldOfferImageMultiselect ? 0 : 1,
      },
      handleImagePickerResponse,
    );
  }, [handleImagePickerResponse]);

  const handleCameraCapture = useCallback(async () => {
    if (Platform.OS === 'android') {
      await androidEnsureStoragePermission({
        title: _('Storage permission needed'),
        message: _('Zulip will save a copy of your photo on your device.'),
      });
    }

    launchCamera(
      {
        mediaType: Platform.OS === 'ios' ? 'mixed' : 'photo',
        saveToPhotos: true,
        includeBase64: false,
      },
      handleImagePickerResponse,
    );
  }, [_, handleImagePickerResponse]);

  const handleFilesPicker = useCallback(async () => {
    let response = undefined;
    try {
      response = await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert(_('Error'), e);
      }
      return;
    }

    insertAttachments(response.map(a => ({ name: a.name, url: a.uri })));
  }, [_, insertAttachments]);

  const styles = useMemo(() => createStyleSheet({ container: { flexDirection: 'row' } }), []);

  return <View style={styles.container} onStartShouldSetResponder={handleShowOptions} />;
}
