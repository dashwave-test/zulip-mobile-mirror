/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPatch } from '../apiFetch';

/** Change the privacy of a stream
 * https://zulip.com/api/update-stream */
export default async (
  auth: Auth,
  streamId: number,
  isPrivate: boolean
): Promise<ApiResponse> =>
  apiPatch(auth, `streams/${streamId}`, {
    is_private: isPrivate,
  });
