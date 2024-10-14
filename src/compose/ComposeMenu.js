/* @flow strict-local */
// $FlowFixMe[untyped-import]
import Color from 'color';
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { Platform, Alert, Linking, Pressable } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { useActionSheet } from '@expo/react-native-action-sheet';
import * as logging from '../utils/logging';
import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { androidEnsureStoragePermission } from '../lightbox/download';
import { androidSdkVersion } from '../reactNativeUtils';

export type Attachment = {|
  +name: string | null,
  +url: string,
|};

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

/**
 * Choose an appropriate filename for an image to upload.
 *
 * On Android, at least, react-native-image-picker gives its own wordy
 * prefix to image files from the camera and from the media library. So,
 * remove those.
 *
 * Sometimes we get an image whose filename reflects one format (what it's
 * stored as in the camera roll), but the actual image has been converted
 * already to another format for interoperability.
 *
 * The Zulip server will infer the file format from the filename's
 * extension, so in this case we need to adjust the extension to match the
 * actual format.  The clue we get in the image-picker response is the extension
 * found in `uri`.
 */
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

const kShouldOfferImageMultiselect =
  Platform.OS === 'ios' || androidSdkVersion() >= 33;

const kShouldOfferImagePickerMixedMedia =
  Platform.OS === 'ios' || androidSdkVersion() >= 33;

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;

  const _ = useContext(TranslationContext);
  const showActionSheetWithOptions = useActionSheet().showActionSheetWithOptions;

  const handleImagePickerResponse = useCallback(
    response => {
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
    },
    [_, insertAttachments],
  );

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
        message: _(
          'Zulip will save a copy of your photo on your device. To do so, Zulip will need permission to store files on your device.',
        ),
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
      response = (await DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
      }): $ReadOnlyArray<DocumentPickerResponse>);
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showErrorAlert(_('Error'), e);
      }
      return;
    }

    insertAttachments(response.map(a => ({ name: a.name, url: a.uri })));
  }, [_, insertAttachments]);

  const handleMenuOptionsPress = useCallback(() => {
    const options = [
      _('Upload a file'),
      _('Upload a picture'),
      _('Take a picture'),
      _('Add a video call'),
      _('Cancel'),
    ];
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex: options.length - 1,
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
          case 4:
          default:
            break;
        }
      },
    );
  }, [handleFilesPicker, handleImagePicker, handleCameraCapture, insertVideoCallLink, showActionSheetWithOptions, _]);

  return <Pressable onPress={handleMenuOptionsPress} />;
}
