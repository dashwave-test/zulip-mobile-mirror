/* @flow strict-local */
import type { ApiResponseSuccess, Auth } from './transportTypes';
import type { PresenceSnapshot } from './apiTypes';
import { apiPost } from './apiFetch';

type ApiResponseWithPresence = {|
  ...$Exact<ApiResponseSuccess>,
  server_timestamp: number,
  presences: PresenceSnapshot,
|};

/** See https://zulip.readthedocs.io/en/latest/subsystems/presence.html . */
export default (
  auth: Auth,
  isActive: boolean = true,
  newUserInput: boolean = false,
): Promise<ApiResponseWithPresence> =>
  apiPost(auth, 'users/me/presence', {
    status: isActive ? 'active' : 'idle',
    new_user_input: newUserInput,
  });
