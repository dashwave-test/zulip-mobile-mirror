/* @flow strict-local */
import queueMarkAsRead, { resetAll } from '../queueMarkAsRead';
import * as updateMessageFlags from '../messages/updateMessageFlags';
import * as eg from '../../__tests__/lib/exampleData';

// $FlowFixMe[cannot-write] Make flow understand about mocking
updateMessageFlags.default = jest.fn(
  (auth, ids, op, flag) =>
    new Promise((resolve, reject) => {
      resolve({ messages: ids, msg: '', result: 'success' });
    }),
);

describe('queueMarkAsRead', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    resetAll();
  });

  test('should not call updateMessageFlags on consecutive calls of queueMarkAsRead,  setTimout on further calls', () => {
    queueMarkAsRead(eg.selfAuth, [1, 2, 3]);
    queueMarkAsRead(eg.selfAuth, [4, 5, 6]);
    queueMarkAsRead(eg.selfAuth, [7, 8, 9]);
    queueMarkAsRead(eg.selfAuth, [10, 11, 12]);

    expect(jest.getTimerCount()).toBe(1);
    expect(updateMessageFlags.default).toHaveBeenCalledTimes(1);
  });

  test('should call updateMessageFlags, if calls to queueMarkAsRead are 2s apart', () => {
    queueMarkAsRead(eg.selfAuth, [13, 14, 15]);
    jest.advanceTimersByTime(2100);
    queueMarkAsRead(eg.selfAuth, [16, 17, 18]);

    expect(updateMessageFlags.default).toHaveBeenCalledTimes(2);
  });

  test('should set timeout for time remaining for next API call to clear queue', () => {
    queueMarkAsRead(eg.selfAuth, [1, 2, 3]);

    jest.advanceTimersByTime(1900);
    queueMarkAsRead(eg.selfAuth, [4, 5, 6]);

    jest.runOnlyPendingTimers();
    expect(updateMessageFlags.default).toHaveBeenCalledTimes(2);
  });

  test('empty array should not cause anything to happen', () => {
    queueMarkAsRead(eg.selfAuth, []);

    jest.advanceTimersByTime(2500);

    jest.runOnlyPendingTimers();
    expect(updateMessageFlags.default).toHaveBeenCalledTimes(0);
  });
});
