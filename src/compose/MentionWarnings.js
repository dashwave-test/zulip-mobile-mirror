/* @flow strict-local */

import React, { useState, useCallback, useContext, forwardRef, useImperativeHandle } from 'react';
import type { AbstractComponent, Node } from 'react';

import type { Stream, Narrow, UserOrBot, Subscription, UserId } from '../types';
import { useSelector } from '../react-redux';
import { TranslationContext } from '../boot/TranslationProvider';
import { getAllUsersById, getAuth } from '../selectors';
import { isPmNarrow } from '../utils/narrow';
import * as api from '../api';
import { showToast } from '../utils/info';

import MentionedUserNotSubscribed from '../message/MentionedUserNotSubscribed';
import { makeUserId } from '../api/idTypes';
import { getFullNameText } from '../users/userSelectors';
import { getRealm } from '../directSelectors';

type Props = $ReadOnly<{|
  narrow: Narrow,
  stream: Subscription | {| ...Stream, in_home_view: boolean |},
|}>;

/**
 * Functions expected to be called by ComposeBox using a ref to this
 *   component.
 */
type ImperativeHandle = {|
  /**
   * Check whether the message text entered by the user contains
   * an @-mention to a user unsubscribed to the current stream, and if
   * so, shows a warning.
   *
   * @param completion The autocomplete option chosend by the user.
   * See JSDoc for AutoCompleteView for details.
   */
  handleMentionSubscribedCheck(completion: string): Promise<void>,

  clearMentionWarnings(): void,
|};

function MentionWarningsInner(props: Props, ref): Node {
  const { stream, narrow } = props;

  const auth = useSelector(getAuth);
  const allUsersById = useSelector(getAllUsersById);
  const enableGuestUserIndicator = useSelector(state => getRealm(state).enableGuestUserIndicator);

  const [unsubscribedMentions, setUnsubscribedMentions] = useState<$ReadOnlyArray<UserId>>([]);

  const _ = useContext(TranslationContext);

  /**
   * Tries to parse a user object from an @-mention.
   *
   * @param completion The autocomplete option chosend by the user.
      See JSDoc for AutoCompleteView for details.
   */
  const getUserFromMention = useCallback(
    (completion: string): UserOrBot | void => {
      const unformattedMessage = completion.split('**')[1];

      // We skip user groups, for which autocompletes are of the form
      // `*<user_group_name>*`, and therefore, message.split('**')[1]
      // is undefined.
      if (unformattedMessage === undefined) {
        return undefined;
      }

      const [userFullName, userIdRaw] = unformattedMessage.split('|');

      if (userIdRaw !== undefined) {
        const userId = makeUserId(Number.parseInt(userIdRaw, 10));
        return allUsersById.get(userId);
      }

      for (const user of allUsersById.values()) {
        if (user.full_name === userFullName) {
          return user;
        }
      }

      return undefined;
    },
    [allUsersById],
  );

  const showSubscriptionStatusLoadError = useCallback(
    (mentionedUser: UserOrBot) => {
      showToast(
        _('Couldn’t load information about {fullName}', {
          fullName: _(getFullNameText({ user: mentionedUser, enableGuestUserIndicator })),
        }),
      );
    },
    [enableGuestUserIndicator, _],
  );

  useImperativeHandle(
    ref,
    () => ({
      handleMentionSubscribedCheck: async (completion: string) => {
        if (isPmNarrow(narrow)) {
          return;
        }
        const mentionedUser = getUserFromMention(completion);
        if (mentionedUser === undefined || unsubscribedMentions.includes(mentionedUser.user_id)) {
          return;
        }

        let isSubscribed: boolean;
        try {
          isSubscribed = (
            await api.getSubscriptionToStream(auth, mentionedUser.user_id, stream.stream_id)
          ).is_subscribed;
        } catch {
          showSubscriptionStatusLoadError(mentionedUser);
          return;
        }

        if (!isSubscribed) {
          setUnsubscribedMentions(prevUnsubscribedMentions => [
            ...prevUnsubscribedMentions,
            mentionedUser.user_id,
          ]);
        }
      },

      clearMentionWarnings: () => {
        setUnsubscribedMentions([]);
      },
    }),
    [
      auth,
      getUserFromMention,
      narrow,
      showSubscriptionStatusLoadError,
      stream,
      unsubscribedMentions,
    ],
  );

  const handleMentionWarningDismiss = useCallback((user: UserOrBot) => {
    setUnsubscribedMentions(prevUnsubscribedMentions =>
      prevUnsubscribedMentions.filter(x => x !== user.user_id),
    );
  }, []);

  if (isPmNarrow(narrow)) {
    return null;
  }

  const mentionWarnings = [];
  for (const userId of unsubscribedMentions) {
    const user = allUsersById.get(userId);

    if (user === undefined) {
      continue;
    }

    mentionWarnings.push(
      <MentionedUserNotSubscribed
        stream={stream}
        user={user}
        onDismiss={handleMentionWarningDismiss}
        key={user.user_id}
      />,
    );
  }

  return mentionWarnings;
}

const MentionWarnings: AbstractComponent<Props, ImperativeHandle> =
  forwardRef(MentionWarningsInner);

export default MentionWarnings;
