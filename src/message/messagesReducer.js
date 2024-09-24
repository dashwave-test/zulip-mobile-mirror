/* @flow strict-local */
// $FlowFixMe[untyped-import]
import omit from 'lodash.omit';
import Immutable from 'immutable';

import type {
  MessagesState,
  Message,
  PerAccountApplicableAction,
  PerAccountState,
  UpdateMessageEvent,
} from '../types';
import {
  REGISTER_COMPLETE,
  MESSAGE_FETCH_COMPLETE,
  EVENT_NEW_MESSAGE,
  EVENT_SUBMESSAGE,
  EVENT_MESSAGE_DELETE,
  EVENT_REACTION_ADD,
  EVENT_REACTION_REMOVE,
  EVENT_UPDATE_MESSAGE,
  RESET_ACCOUNT_DATA,
} from '../actionConstants';
import { getNarrowsForMessage } from '../utils/narrow';
import * as logging from '../utils/logging';
import { getStreamsById } from '../selectors';
import type { MessageEdit } from '../api/modelTypes';
import type { ReadWrite } from '../generics';
import type { MessageMove } from '../api/misc';
import { getCaughtUpForNarrowInner } from '../caughtup/caughtUpSelectors';

const initialState: MessagesState = Immutable.Map([]);

const eventNewMessage = (state, action) => {
  const { message, caughtUp } = action;
  const { flags } = message;

  if (!flags) {
    throw new Error('EVENT_NEW_MESSAGE message missing flags');
  }

  // Don't add a message that's already been added. It's probably
  // very rare for a message to have already been added when we
  // get an EVENT_NEW_MESSAGE, and perhaps impossible. (TODO:
  // investigate?)
  if (state.get(action.message.id)) {
    return state;
  }

  const narrowsForMessage = getNarrowsForMessage(message, action.ownUserId, flags);
  const anyNarrowIsCaughtUp = narrowsForMessage.some(
    narrow => getCaughtUpForNarrowInner(caughtUp, narrow).newer,
  );

  // Don't bother adding the message to `state.messages` if it wasn't
  // added to `state.narrows`. For why the message might not have been
  // added to `state.narrows`, see the condition on `caughtUp` in
  // narrowsReducer's handling of EVENT_NEW_MESSAGE.
  if (!anyNarrowIsCaughtUp) {
    return state;
  }

  // If changing or adding case where we ignore a message here:
  // Careful! Every message in `state.narrows` must exist in
  // `state.messages`. If we choose not to include a message in
  // `state.messages`, then narrowsReducer MUST ALSO choose not to
  // include it in `state.narrows`.

  return state.set(action.message.id, omit(action.message, 'flags'));
};

const editHistory = <M: Message>(args: {|
  oldMessage: M,
  event: UpdateMessageEvent,
  move: MessageMove | null,
  shouldApplyContentChanges: boolean,
|}) => {
  const { oldMessage, event, move, shouldApplyContentChanges } = args;
  if (oldMessage.edit_history === null) {
    // Either:
    // - we dropped edit_history because the server was old and the value
    //   wouldn't have been in a nice shape, or
    // - the realm is set to not allow viewing edit history
    //
    // (See Message['edit_history'].) Keep maintaining nothing here; don't
    // write a partial value, such as a one-item array based on this edit,
    // which would be corrupt.
    //
    // TODO(server-5.0): Simplify away the FL condition; keep the
    //   allowEditHistory condition.
    return null;
  }

  if (
    event.rendering_only === true
    // TODO(server-5.0): Simplify away these two checks
    || event.edit_timestamp === undefined
    || event.user_id === undefined
  ) {
    // See doc:
    //   https://zulip.com/api/get-events#update_message
    // > […] the event does not reflect a user-generated edit and does not
    // > modify the message history.
    return oldMessage.edit_history;
  }

  const newEntry: ReadWrite<MessageEdit> = {
    timestamp: event.edit_timestamp,
    user_id: event.user_id,
  };

  if (
    shouldApplyContentChanges
    && event.message_id === oldMessage.id
    && event.orig_content != null
  ) {
    newEntry.prev_content = event.orig_content;
    newEntry.prev_rendered_content = event.orig_rendered_content;
    newEntry.prev_rendered_content_version = event.prev_rendered_content_version;
  }

  if (move) {
    if (move.orig_stream_id !== move.new_stream_id) {
      newEntry.prev_stream = move.orig_stream_id;
      newEntry.stream = move.new_stream_id;
    }
    if (move.orig_topic !== move.new_topic) {
      newEntry.prev_topic = move.orig_topic;
      newEntry.topic = move.new_topic;
    }
  }

  return [newEntry, ...(oldMessage.edit_history ?? [])];
};

export default (
  state: MessagesState = initialState, // eslint-disable-line default-param-last
  action: PerAccountApplicableAction,
  globalState: PerAccountState,
): MessagesState => {
  switch (action.type) {
    case RESET_ACCOUNT_DATA:
      return initialState;

    // Reset to clear stale data. We don't initialize the
    // messages/narrows/flags model using initial data; instead, we fetch
    // chunks of data as needed with api.getMessages. See
    //   https://zulip.readthedocs.io/en/latest/subsystems/events-system.html#messages
    case REGISTER_COMPLETE:
      return initialState;

    case MESSAGE_FETCH_COMPLETE:
      return state.merge(
        Immutable.Map(
          action.messages.map(message => [
            message.id,
            omit(message, ['flags', 'match_content', 'match_subject']),
          ]),
        ),
      );

    case EVENT_REACTION_ADD:
      return state.update(
        action.message_id,
        <M: Message>(oldMessage: M): M =>
          oldMessage && {
            ...(oldMessage: M),
            reactions: oldMessage.reactions.concat({
              emoji_name: action.emoji_name,
              user_id: action.user_id,
              reaction_type: action.reaction_type,
              emoji_code: action.emoji_code,
            }),
          },
      );

    case EVENT_REACTION_REMOVE:
      return state.update(
        action.message_id,
        <M: Message>(oldMessage: M): M =>
          oldMessage && {
            ...(oldMessage: M),
            reactions: oldMessage.reactions.filter(
              x => !(x.emoji_name === action.emoji_name && x.user_id === action.user_id),
            ),
          },
      );

    case EVENT_NEW_MESSAGE:
      return eventNewMessage(state, action);

    case EVENT_SUBMESSAGE:
      return state.update(
        action.message_id,
        <M: Message>(message: M): M =>
          message && {
            ...(message: M),
            submessages: [
              ...(message.submessages ?? []),
              {
                id: action.submessage_id,
                message_id: action.message_id,
                sender_id: action.sender_id,
                msg_type: action.msg_type,
                content: action.content,
              },
            ],
          },
      );

    case EVENT_MESSAGE_DELETE:
      return state.deleteAll(action.messageIds);

    case EVENT_UPDATE_MESSAGE: {
      const { event, move } = action;
      let result = state;

      result = result.update(event.message_id, <M: Message>(oldMessage: M): M => {
        if (!oldMessage) {
          return oldMessage;
        }

        return {
          ...(oldMessage: M),
          content: event.rendered_content ?? oldMessage.content,

          // Don't update last_edit_timestamp if it's a rendering-only
          // event. How do we know if it is? From newer servers,
          // rendering_only will be true; from older servers, edit_timestamp
          // will be missing.
          // TODO(server-5.0): Simplify away edit_timestamp-missing condition
          last_edit_timestamp:
            event.rendering_only === true || event.edit_timestamp == null
              ? oldMessage.last_edit_timestamp
              : event.edit_timestamp,

          edit_history: editHistory<M>({
            oldMessage,
            event,
            move,
            shouldApplyContentChanges: true,
          }),
        };
      });

      if (move) {
        const update: { subject: string, stream_id?: number, display_recipient?: string } = {
          subject: move.new_topic,
          // TODO(#3408): Update topic_links.  This is OK for now
          //   because we don't have any UI to expose it.
          // TODO(#3408): Update last_edit_timestamp, probably.  But want to
          //   say "moved" in the UI in this case, not "edited".
        };
        if (move.new_stream_id !== move.orig_stream_id) {
          update.stream_id = move.new_stream_id;
          const newStream = getStreamsById(globalState).get(move.new_stream_id);
          // It's normal for newStream to potentially be missing here: it
          // happens when the move was to a stream our user can't see.
          // TODO(i18n): Not sure this "unknown" ever reaches the UI, but
          //   it'd be nice to somehow translate it in case it can.
          update.display_recipient = newStream?.name ?? 'unknown';
        }

        // eslint-disable-next-line no-shadow
        result = result.withMutations(state => {
          for (const id of event.message_ids) {
            state.update(id, <M: Message>(oldMessage: M | void): M | void => {
              if (!oldMessage) {
                return oldMessage;
              }

              if (oldMessage.type !== 'stream') {
                logging.warn('messagesReducer: got update_message with stream/topic move on PM');
                return oldMessage;
              }

              return {
                ...oldMessage,
                ...update,

                // We already processed the message with ID
                // `event.message_id`, above; skip it here.
                edit_history:
                  id === event.message_id
                    ? oldMessage.edit_history
                    : editHistory<M>({
                        oldMessage,
                        event,
                        move,

                        // See doc:
                        //   https://zulip.com/api/get-events#update_message
                        // > Content changes should be applied only to the single message
                        // > indicated by `message_id`.
                        shouldApplyContentChanges: false,
                      }),
              };
            });
          }
        });
      }

      return result;
    }

    default:
      return state;
  }
};
