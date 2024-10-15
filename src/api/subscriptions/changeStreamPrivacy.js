/* @flow strict-local */
import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** Change the privacy setting of a stream. */
export default async (
  auth: Auth,
  streamId: number,
  isPrivate: boolean
): Promise<ApiResponse> =>
  apiPost(auth, 'streams/change_privacy', {
    stream_id: streamId,
    is_private: isPrivate,
  });
