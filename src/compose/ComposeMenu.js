/* @flow strict-local */
import React, { useCallback, useContext } from 'react';
import type { Node } from 'react';
import { Pressable } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';
import DocumentPicker from 'react-native-document-picker';
import type { DocumentPickerResponse } from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

import { TranslationContext } from '../boot/TranslationProvider';
import type { Narrow } from '../types';
import { showErrorAlert } from '../utils/info';
import { ThemeContext } from '../styles/theme';
import type { SpecificIconType } from '../common/Icons';
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

type MenuButtonProps = $ReadOnly<{|
  onPress: () => void | Promise<void>,
  IconComponent: SpecificIconType,
|}>;

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;
  const _ = useContext(TranslationContext);

  const { showActionSheetWithOptions } = useActionSheet();
  
  const handleImagePickerResponse = response => {
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
  };

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

  const showOptions = () => {
    const options = [
      _('Upload a file'),
      _('Upload a picture'),
      _('Take a picture'),
      insertVideoCallLink ? _('Add a video call') : null,
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
            handleFilesPicker();
            break;
          case 1:
            handleImagePicker();
            break;
          case 2:
            handleCameraCapture();
            break;
          case 3:
            if (insertVideoCallLink) {
              insertVideoCallLink();
            }
            break;
          case 4:
            break;
          default:
            break;
        }
      }
    );
  };

  return <Pressable onPress={showOptions}>{/* You can add an icon or text here */}</Pressable>;
}
