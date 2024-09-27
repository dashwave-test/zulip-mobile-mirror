import React, { useContext, useMemo, useCallback } from 'react';
import type { Node } from 'react';
import { View, Pressable } from 'react-native';
// $FlowFixMe[untyped-import]
import { useActionSheet } from '@expo/react-native-action-sheet';

import { showErrorAlert, showConfirmationDialog } from '../utils/info'; // Import showConfirmationDialog
import { showStreamActionSheet } from '../action-sheets';
import type { ShowActionSheetWithOptions } from '../action-sheets';
import { TranslationContext } from '../boot/TranslationProvider';
import { useDispatch, useSelector, useGlobalSelector } from '../react-redux';
import {
  getAuth,
  getRealmUrl,
  getFlags,
  getSubscriptionsById,
  getStreamsById,
  getOwnUser,
  getSettings,
  getGlobalSettings,
} from '../selectors';
import { ThemeContext, BRAND_COLOR, HIGHLIGHT_COLOR, HALF_COLOR } from '../styles';
import ZulipText from '../common/ZulipText';
import Touchable from '../common/Touchable';
import UnreadCount from '../common/UnreadCount';
import { foregroundColorFromBackground } from '../utils/color';
import { IconPlus, IconDone, IconCaretUp, IconCaretDown } from '../common/Icons';
import StreamIcon from './StreamIcon';
import { useNavigation } from '../react-navigation';

type Props = $ReadOnly<{|
  name: string,
  streamId: number,
  description?: string,
  handleExpandCollapse?: (id: number) => void,
  isCollapsed?: boolean,
  isMuted: boolean,
  isPrivate: boolean,
  isSubscribed?: boolean,
  isWebPublic: boolean | void,
  color?: string,
  backgroundColor?: string,
  unreadCount?: number,
  iconSize: number,
  offersSubscribeButton?: boolean,
  extraPaddingEnd?: number,
  // These stream names are here for a mix of good reasons and (#3918) bad ones.
  // To audit all uses, change `name` to write-only (`-name:`), and run Flow.
  onPress: ({ stream_id: number, name: string, ... }) => void,
  onSubscribeButtonPressed?: ({ stream_id: number, name: string, ... }, newValue: boolean) => void,
|}>;

export default function StreamItem(props: Props): Node {
  const {
    streamId,
    name,
    description,
    color,
    backgroundColor,
    handleExpandCollapse,
    isCollapsed,
    isPrivate,
    isMuted,
    isWebPublic,
    isSubscribed = false,
    iconSize,
    offersSubscribeButton = false,
    unreadCount,
    extraPaddingEnd = 0,
    onPress,
    onSubscribeButtonPressed,
  } = props;

  const realmUrl = useSelector(getRealmUrl);
  const globalSettings = useGlobalSelector(getGlobalSettings);

  const showActionSheetWithOptions: ShowActionSheetWithOptions =
    useActionSheet().showActionSheetWithOptions;
  const _ = useContext(TranslationContext);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const backgroundData = useSelector(state => ({
    auth: getAuth(state),
    ownUser: getOwnUser(state),
    streams: getStreamsById(state),
    subscriptions: getSubscriptionsById(state),
    flags: getFlags(state),
    userSettingStreamNotification: getSettings(state).streamNotification,
  }));

  const { backgroundColor: themeBackgroundColor, color: themeColor } = useContext(ThemeContext);
  const iconColor =
    color !== undefined
      ? color
      : foregroundColorFromBackground(
          backgroundColor !== undefined ? backgroundColor : themeBackgroundColor,
        );
  const textColor =
    backgroundColor !== undefined
      ? (foregroundColorFromBackground(backgroundColor): string)
      : themeColor;

  const styles = useMemo(
    () => ({
      wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: handleExpandCollapse ? 0 : 8,
        paddingLeft: handleExpandCollapse ? 0 : 16,
        paddingRight: extraPaddingEnd + 16,
        backgroundColor,
        opacity: isMuted ? 0.5 : 1,
      },
      collapsePressable: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        paddingLeft: 8,
        paddingRight: 0,
      },
      collapseIcon: {
        marginRight: 8,
      },
      text: {
        flex: 1,
        paddingLeft: 8,
        paddingRight: 8,
      },
      name: {
        color: textColor,
      },
      description: {
        opacity: 0.75,
        fontSize: 12,
      },
    }),
    [backgroundColor, extraPaddingEnd, handleExpandCollapse, isMuted, textColor],
  );

  const collapseButton = handleExpandCollapse && (
    <Pressable style={styles.collapsePressable} onPress={() => handleExpandCollapse(streamId)}>
      {isCollapsed === false ? (
        <IconCaretUp style={styles.collapseIcon} size={20} color={iconColor} />
      ) : (
        <IconCaretDown style={styles.collapseIcon} size={20} color={iconColor} />
      )}
    </Pressable>
  );

  const handleUnsubscribePress = useCallback(
    async () => {
      if (isPrivate) {
        const confirmed = await showConfirmationDialog({
          title: 'Unsubscribe from private stream',
          message: `Are you sure you want to unsubscribe from the private stream "${name}"? You might need an invite to join again.`,
          confirmText: 'Unsubscribe',
          cancelText: 'Cancel',
          destructive: true,
        });

        if (!confirmed) {
          return;
        }
      }

      if (onSubscribeButtonPressed) {
        onSubscribeButtonPressed({ stream_id: streamId, name }, !isSubscribed);
      }
    },
    [isPrivate, name, onSubscribeButtonPressed, streamId, isSubscribed]
  );

  let subscribeButton = null;
  if (offersSubscribeButton) {
    const disabled = !isSubscribed && isPrivate;
    subscribeButton = (
      <Pressable
        onPress={() => {
          if (disabled) {
            showErrorAlert(
              _('Cannot subscribe to stream'),
              _('Stream #{name} is private.', { name }),
              { url: new URL('/help/stream-permissions', realmUrl), globalSettings },
            );
            return;
          }

          if (isSubscribed) {
            handleUnsubscribePress();
          } else {
            onSubscribeButtonPressed({ stream_id: streamId, name }, !isSubscribed);
          }
        }}
        hitSlop={12}
        style={{ opacity: disabled ? 0.1 : 1 }}
      >
        {({ pressed }) =>
          isSubscribed ? (
            <IconDone size={24} color={pressed ? HIGHLIGHT_COLOR : BRAND_COLOR} />
          ) : (
            <IconPlus size={24} color={pressed ? HALF_COLOR : iconColor} />
          )
        }
      </Pressable>
    );
  }

  return (
    <Touchable
      onPress={() => onPress({ stream_id: streamId, name })}
      onLongPress={() => {
        showStreamActionSheet({
          showActionSheetWithOptions,
          callbacks: { dispatch, navigation, _ },
          backgroundData,
          streamId,
        });
      }}
    >
      <View style={styles.wrapper}>
        {collapseButton}
        <StreamIcon
          size={iconSize}
          color={iconColor}
          isMuted={isMuted}
          isPrivate={isPrivate}
          isWebPublic={isWebPublic}
        />
        <View style={styles.text}>
          <ZulipText numberOfLines={1} style={styles.name} text={name} ellipsizeMode="tail" />
          {description !== undefined && description !== '' && (
            <ZulipText
              numberOfLines={1}
              style={styles.description}
              text={description}
              ellipsizeMode="tail"
            />
          )}
        </View>
        <UnreadCount color={iconColor} count={unreadCount} />
        {subscribeButton}
      </View>
    </Touchable>
  );
}

