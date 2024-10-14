/* @flow strict-local */
import React, { useCallback, useContext, useMemo } from 'react';
import type { Node } from 'react';
import { Pressable } from 'react-native';
import { useActionSheet } from '@expo/react-native-action-sheet';

import { IconImage, IconCamera, IconAttach, IconVideo } from '../common/Icons';
import { TranslationContext } from '../boot/TranslationProvider';

export type Attachment = {|
  +name: string | null,
  +url: string,
|};

type Props = $ReadOnly<{|
  destinationNarrow: Narrow,
  insertAttachments: ($ReadOnlyArray<Attachment>) => Promise<void>,
  insertVideoCallLink: (() => void) | null,
|}>;

const options = [
  { title: 'Upload a file', icon: IconAttach },
  { title: 'Upload a picture', icon: IconImage },
  { title: 'Take a picture', icon: IconCamera },
  { title: 'Add a video call', icon: IconVideo },
  { title: 'Cancel', icon: null },
];

export default function ComposeMenu(props: Props): Node {
  const { insertAttachments, insertVideoCallLink } = props;
  const _ = useContext(TranslationContext);
  const { showActionSheetWithOptions } = useActionSheet();

  const handlePress = useCallback(() => {
    const titles = options.map(opt => _(opt.title));

    showActionSheetWithOptions(
      {
        options: titles,
        cancelButtonIndex: titles.length - 1,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          handleFilesPicker();
        } else if (buttonIndex === 1) {
          handleImagePicker();
        } else if (buttonIndex === 2) {
          handleCameraCapture();
        } else if (buttonIndex === 3 && insertVideoCallLink) {
          insertVideoCallLink();
        }
      },
    );
  }, [_, insertAttachments, showActionSheetWithOptions, insertVideoCallLink]);

  const handleFilesPicker = async () => {
    let response;
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
  };

  const handleImagePicker = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 1.0, includeBase64: false, selectionLimit: 1 },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          const { errorMessage } = response;
          showErrorAlert(_('Error'), errorMessage);
          logging.error('Image picker error', { errorCode: response.errorCode, errorMessage });
          return;
        }
        const { uri, fileName } = response.assets[0];
        insertAttachments([{ name: fileName, url: uri }]);
      },
    );
  };

  const handleCameraCapture = async () => {
    const result = await launchCamera(
      { mediaType: 'photo', saveToPhotos: true, includeBase64: false },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          const { errorMessage } = response;
          showErrorAlert(_('Error'), errorMessage);
          logging.error('Camera capture error', { errorCode: response.errorCode, errorMessage });
          return;
        }
        const { uri, fileName } = response.assets[0];
        insertAttachments([{ name: fileName, url: uri }]);
      },
    );
  };

  return (
    <Pressable onPress={handlePress}>
      {options.map(({ icon: IconComponent }, index) =>
        IconComponent ? <IconComponent key={index} size={24} color="black" /> : null,
      )}
    </Pressable>
  );
}
