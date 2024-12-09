/* @flow strict-local */
import { EventTypes, type EventType, type RealmUserUpdateEventRaw } from '../api/eventTypes';
import * as logging from '../utils/logging';
import type { PerAccountState, EventAction, MessageEdit } from '../types';
import {
  EVENT_ALERT_WORDS,
  EVENT_NEW_MESSAGE,
  EVENT_PRESENCE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_TYPING_START,
  EVENT_TYPING_STOP,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_UPDATE_MESSAGE,
  EVENT_UPDATE_MESSAGE_FLAGS,
  EVENT_USER_ADD,
  EVENT_USER_REMOVE,
  EVENT_MUTED_TOPICS,
  EVENT_MUTED_USERS,
  EVENT_USER_GROUP_ADD,
  EVENT_USER_GROUP_REMOVE,
  EVENT_USER_GROUP_UPDATE,
  EVENT_USER_GROUP_ADD_MEMBERS,
  EVENT_USER_GROUP_REMOVE_MEMBERS,
  EVENT_USER_STATUS_UPDATE,
  EVENT_REALM_EMOJI_UPDATE,
  EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  EVENT_UPDATE_DISPLAY_SETTINGS,
  EVENT_REALM_FILTERS,
  EVENT_SUBSCRIPTION,
  EVENT,
} from '../actionConstants';
import { getRealm } from '../selectors';
import { getOwnUserId, tryGetUserForId } from '../users/userSelectors';
import { AvatarURL } from '../utils/avatar';
import { getRealmUrl, getZulipFeatureLevel } from '../account/accountsSelectors';
import { messageMoved } from '../api/misc';
import { ensureUnreachable } from '../generics';

const opToActionUserGroup = {
  add: EVENT_USER_GROUP_ADD,
  remove: EVENT_USER_GROUP_REMOVE,
  update: EVENT_USER_GROUP_UPDATE,
  add_members: EVENT_USER_GROUP_ADD_MEMBERS,
  remove_members: EVENT_USER_GROUP_REMOVE_MEMBERS,
};

const opToActionReaction = {
  add: EVENT_REACTION_ADD,
  remove: EVENT_REACTION_REMOVE,
};

const opToActionTyping = {
  start: EVENT_TYPING_START,
  stop: EVENT_TYPING_STOP,
};

const actionTypeOfEventType = {
  subscription: EVENT_SUBSCRIPTION,
  presence: EVENT_PRESENCE,
  muted_topics: EVENT_MUTED_TOPICS,
  muted_users: EVENT_MUTED_USERS,
  realm_emoji: EVENT_REALM_EMOJI_UPDATE,
  realm_filters: EVENT_REALM_FILTERS,
  submessage: EVENT_SUBMESSAGE,
  update_global_notifications: EVENT_UPDATE_GLOBAL_NOTIFICATIONS_SETTINGS,
  update_display_settings: EVENT_UPDATE_DISPLAY_SETTINGS,
  user_status: EVENT_USER_STATUS_UPDATE,
};

export default (state: PerAccountState, event: $FlowFixMe): EventAction | null => {
  const zulipFeatureLevel = getZulipFeatureLevel(state);
  const allowEditHistory = getRealm(state).allowEditHistory;

  const type = (event.type: EventType);
  switch (type) {
    case 'alert_words':
      return {
        type: EVENT_ALERT_WORDS,
        alert_words: event.alert_words,
      };

    case 'message':
      return {
        type: EVENT_NEW_MESSAGE,
        id: event.id,
        message: {
          ...event.message,
          flags: event.message.flags ?? event.flags ?? [],
          avatar_url: AvatarURL.fromUserOrBotData({
            rawAvatarUrl: event.message.avatar_url,
            email: event.message.sender_email,
            userId: event.message.sender_id,
            realm: getRealmUrl(state),
          }),
          edit_history:
            allowEditHistory && zulipFeatureLevel >= 118
              ? (event.message.edit_history: $ReadOnlyArray<MessageEdit> | void)
              : null,
        },
        local_message_id: event.local_message_id,
        caughtUp: state.caughtUp,
        ownUserId: getOwnUserId(state),
      };

    case 'delete_message':
      return {
        type: EVENT_MESSAGE_DELETE,
        messageIds: event.message_ids ?? [event.message_id],
      };

    case 'realm':
      return {
        type: EVENT,
        event:
          event.op === 'update'
            ? {
                id: event.id,
                type: EventTypes.realm,
                op: 'update_dict',
                property: 'default',
                data: {
                  [event.property]: event.value,
                },
              }
            : event,
      };

    case 'restart':
    case 'custom_profile_fields':
    case 'stream':
    case 'user_settings':
    case 'user_topic':
      return {
        type: EVENT,
        event,
      };

    case 'update_message':
      return {
        type: EVENT_UPDATE_MESSAGE,
        event: { ...event, message_ids: event.message_ids.sort((a, b) => a - b) },
        move: messageMoved(event),
      };

    case 'subscription':
    case 'presence':
    case 'muted_topics':
    case 'muted_users':
    case 'realm_emoji':
    case 'submessage':
    case 'update_global_notifications':
    case 'update_display_settings':
    case 'user_status':
      return {
        ...event,
        type: actionTypeOfEventType[event.type],
      };

    case 'realm_filters': {
      return {
        ...event,
        type: EVENT_REALM_FILTERS,
        realm_filters: event.realm_filters,
      };
    }

    case 'realm_linkifiers': {
      return {
        ...event,
        type: EVENT_REALM_FILTERS,
        realm_filters: event.realm_linkifiers.map(({ pattern, url_format, id }) => [
          pattern,
          url_format,
          id,
        ]),
      };
    }

    case 'realm_user': {
      const realm = getRealmUrl(state);

      switch (event.op) {
        case 'add': {
          const { avatar_url: rawAvatarUrl, user_id: userId, email } = event.person;
          return {
            type: EVENT_USER_ADD,
            id: event.id,
            person: {
              ...event.person,
              avatar_url: AvatarURL.fromUserOrBotData({
                rawAvatarUrl,
                userId,
                email,
                realm,
              }),
            },
          };
        }

        case 'update': {
          const rawEvent: RealmUserUpdateEventRaw = event;

          const { user_id: userId } = rawEvent.person;
          const existingUser = tryGetUserForId(state, userId);
          if (!existingUser) {
            logging.warn(
              "realm_user event with op update received for a user we don't know about",
              { userId },
            );
            return null;
          }

          const { person } = rawEvent;
          if (person.is_active === false) {
            return {
              type: EVENT_USER_GROUP_REMOVE_MEMBERS,
              id: event.id,
              group_id: null,
              user_ids: [userId],
            };
          }

          if (person.avatar_url !== undefined) {
            return {
              type: EVENT,
              event: {
                ...rawEvent,
                person: {
                  user_id: person.user_id,
                  avatar_url: AvatarURL.fromUserOrBotData({
                    rawAvatarUrl: person.avatar_url,
                    userId,
                    email: existingUser.email,
                    realm,
                  }),
                },
              },
            };
          } else {
            return {
              type: EVENT,
              event: { ...rawEvent, person },
            };
          }
        }

        case 'remove':
          return {
            type: EVENT_USER_REMOVE,
          };

        default:
          return null;
      }
    }

    case 'realm_bot':
      return null;

    case 'reaction':
      return {
        ...event,
        user_id: event.user.user_id,
        type: opToActionReaction[event.op],
      };

    case 'heartbeat':
      return null;

    case 'update_message_flags':
      return {
        ...event,
        type: EVENT_UPDATE_MESSAGE_FLAGS,
        op: event.op ?? event.operation,
        message_details: event.message_details
          ? new Map(Object.entries(event.message_details).map(([k, v]) => [parseInt(k, 10), v]))
          : undefined,
        allMessages: state.messages,
      };

    case 'typing':
      return {
        ...event,
        ownUserId: getOwnUserId(state),
        type: opToActionTyping[event.op],
        time: new Date().getTime(),
      };

    case 'user_group':
      return {
        ...event,
        type: opToActionUserGroup[event.op],
      };

    case 'pointer':
      return null;

    case 'hotspots':
      return null;

    case 'attachment':
      return null;

    case 'has_zoom_token':
      return null;

    case 'drafts':
      return null;

    case 'default_streams':
    case 'default_stream_groups':
    case 'invites_changed':
    case 'realm_domains':
      return null;

    case 'realm_export':
    case 'realm_playgrounds':
    case 'realm_user_settings_defaults':
      return null;

    default:
      ensureUnreachable(type);
      logging.error(`Unhandled Zulip API event type: ${event.type}`);
      return null;
  }
};