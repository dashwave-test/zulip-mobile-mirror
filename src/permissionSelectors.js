/* @flow strict-local */
import type { PerAccountState, UserId } from './types';
import { ensureUnreachable } from './types';
import { Role, CreateWebPublicStreamPolicy } from './api/permissionsTypes';
import { getRealm, getOwnUser, getUserForId } from './selectors';

const { Member, Moderator, Admin, Owner } = Role;

export function roleIsAtLeast(thisRole: Role, thresholdRole: Role): boolean {
  return (thisRole: number) <= (thresholdRole: number); // Roles with more privilege have lower numbers.
}

/**
 * Whether the user has passed the realm's waiting period to be a full member.
 *
 * See:
 *   https://zulip.com/api/roles-and-permissions#determining-if-a-user-is-a-full-member
 *
 * To determine if a user is a full member, callers must also check that the
 * user's role is at least Role.Member.
 *
 * Note: If used with useSelector, the value will be out-of-date, though
 * realistically only by seconds or minutes at most; see implementation.
 */
export function getHasUserPassedWaitingPeriod(state: PerAccountState, userId: UserId): boolean {
  const { waitingPeriodThreshold } = getRealm(state);
  const { date_joined } = getUserForId(state, userId);

  const intervalLengthInDays = (Date.now() - Date.parse(date_joined)) / 86400_000;

  // When used with useSelector, the result will be based on the time at
  // which the most recent Redux action was dispatched. This would break
  // if we made this a caching selector; don't do that.
  // TODO(?): To upper-bound how long ago that can be, we could dispatch
  //   actions at a regular short-ish interval. If those actions
  //   contained a current-date value, we could even store that value in
  //   Redux and consume it here, letting this be a caching selector if
  //   we wanted it to be.
  return intervalLengthInDays >= waitingPeriodThreshold;
}

/**
 * Whether the self-user is authorized to create or edit a stream to be
 *   public.
 *
 * Note: This isn't about web-public streams. For those, see
 * getCanCreateWebPublicStreams.
 */
// TODO(?): Could deduplicate with the other getCanCreate*Streams; see
//     https://github.com/zulip/zulip-mobile/pull/5394#discussion_r883215288
export function getCanCreatePublicStreams(state: PerAccountState): boolean {
  const { createPublicStreamPolicy } = getRealm(state);
  const ownUser = getOwnUser(state);
  const role = ownUser.role;

  switch (createPublicStreamPolicy) {
    case 4: // ModeratorOrAbove
      return roleIsAtLeast(role, Moderator);
    case 3: // FullMemberOrAbove
      return role === Member
        ? getHasUserPassedWaitingPeriod(state, ownUser.user_id)
        : roleIsAtLeast(role, Member);
    case 2: // AdminOrAbove
      return roleIsAtLeast(role, Admin);
    case 1: // MemberOrAbove
      return roleIsAtLeast(role, Member);
    default: {
      ensureUnreachable(createPublicStreamPolicy);

      // (Unreachable as long as the cases are exhaustive.)
      return false;
    }
  }
}

/**
 * Whether the self-user is authorized to create or edit a stream to be
 *   private.
 */
// TODO(?): Could deduplicate with the other getCanCreate*Streams; see
//     https://github.com/zulip/zulip-mobile/pull/5394#discussion_r883215288
export function getCanCreatePrivateStreams(state: PerAccountState): boolean {
  const { createPrivateStreamPolicy } = getRealm(state);
  const ownUser = getOwnUser(state);
  const role = ownUser.role;

  switch (createPrivateStreamPolicy) {
    case 4: // ModeratorOrAbove
      return roleIsAtLeast(role, Moderator);
    case 3: // FullMemberOrAbove
      return role === Member
        ? getHasUserPassedWaitingPeriod(state, ownUser.user_id)
        : roleIsAtLeast(role, Member);
    case 2: // AdminOrAbove
      return roleIsAtLeast(role, Admin);
    case 1: // MemberOrAbove
      return roleIsAtLeast(role, Member);
    default: {
      ensureUnreachable(createPrivateStreamPolicy);

      // (Unreachable as long as the cases are exhaustive.)
      return false;
    }
  }
}

/**
 * Whether the self-user can create or edit a stream to be web-public.
 *
 * True just if:
 * - the server has opted into the concept of web-public streams (see
 *   server_web_public_streams_enabled in
 *   https://zulip.com/api/register-queue), and
 * - spectator access is enabled (see realm_enable_spectator_access in
 *   https://zulip.com/api/register-queue), and
 * - the user's role is high enough, according to the realm's policy (see
 *   realm_users[].role and realm_create_web_public_stream_policy in
 *   https://zulip.com/api/register-queue)
 *
 * Like user_can_create_web_public_streams in the web-app's
 * static/js/settings_data.ts.
 */
// TODO(?): Could deduplicate with the other getCanCreate*Streams; see
//     https://github.com/zulip/zulip-mobile/pull/5394#discussion_r883215288
export function getCanCreateWebPublicStreams(state: PerAccountState): boolean {
  const { webPublicStreamsEnabled, enableSpectatorAccess, createWebPublicStreamPolicy } =
    getRealm(state);
  const role = getOwnUser(state).role;

  if (!webPublicStreamsEnabled || !enableSpectatorAccess) {
    return false;
  }

  switch (createWebPublicStreamPolicy) {
    case CreateWebPublicStreamPolicy.Nobody:
      return false;
    case CreateWebPublicStreamPolicy.OwnerOnly:
      return roleIsAtLeast(role, Owner);
    case CreateWebPublicStreamPolicy.AdminOrAbove:
      return roleIsAtLeast(role, Admin);
    case CreateWebPublicStreamPolicy.ModeratorOrAbove:
      return roleIsAtLeast(role, Moderator);
  }
}
