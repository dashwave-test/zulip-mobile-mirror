/* @flow strict-local */

import type { ApiResponse, Auth } from '../transportTypes';
import { apiPost } from '../apiFetch';

/** See https://zulip.com/api/send-message */
export default async (
  auth: Auth,
  params: {|  
    type: 'private' | 'stream' | 'direct',
    to: string,
    // TODO(server-2.0): Say "topic", not "subject"
    subject?: string,
    content: string,
    localId?: number,
    eventQueueId?: string,
    zulipFeatureLevel: number,
  |},
): Promise<ApiResponse> => {
  const messageType = params.zulipFeatureLevel < 174 && params.type === 'direct' ? 'private' : params.type;
  return apiPost(auth, 'messages', {
    type: messageType,
    to: params.to,
    subject: params.subject,
    content: params.content,
    local_id: params.localId,
    queue_id: params.eventQueueId,
  });
}
