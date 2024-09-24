// @flow strict-local

import { randString } from '../misc';
import { ZulipVersion } from '../zulipVersion';
import * as eg from '../../__tests__/lib/exampleData';

describe('ZulipVersion.prototype.isAtLeast(otherZulipVersion)', () => {
  // if i > j, versions[i][k] > versions[j][l] for all k, l
  // if i = j, versions[i][k] = versions[j][l] for all k, l
  // if i < j, versions[i][k] < versions[j][l] for all k, l
  // (where i, j, k, l are valid indexes)
  const versions: $ReadOnlyArray<$ReadOnlyArray<ZulipVersion>> = [
    ['0.0.0', '', '-dev', '-devasdfjkl;', '-123-g01ab', 'asdfjkl;-dev'],
    ['0.0.1-dev'],
    ['0.0.1-rc1'],
    ['0.0.1-rc1-112-g35959d43c4'],
    ['0.0.1-rc2'],
    ['0.0.1-rc3'],
    ['0.0.1'],
    ['0.0.2'],
    ['0.1.0'],
    ['1.0.0'],
    ['2.1.0-rc1'],
    ['2.1.0-rc1-112-g35959d43c4', '2.1.0-rc1-112-g35959d43c4'],
    ['2.1.0-rc1-113-g3412341234'],
    ['2.1.0'],
    ['2.1.0-113-gabcdabcdab'],
    ['2.1.0-114-gabcdabcdab'],
    ['2.1.1-50-gd452ad31e0'],
    ['2.2-dev', '2.2.0-dev'],
    [
      // nonsense means ignore the rest
      '2.2asdf',
      '2.2.0',
      '2.2.0.0',
      '2.2.0.1',
      '2.2.0asdfjkl;asdfjkl;as',
      '2.2.0asdfjkl;-dev',
      '2.2.0asdfjkl;-rc1',
    ],
  ].map(equalRawVersions => equalRawVersions.map(r => new ZulipVersion(r)));

  for (let i = 0; i < versions.length; i++) {
    for (let j = 0; j < versions.length; j++) {
      for (let k = 0; k < versions[i].length; k++) {
        for (let l = 0; l < versions[j].length; l++) {
          const expected = i >= j;
          const actual = versions[i][k].isAtLeast(versions[j][l]);
          const name =
            i >= j
              ? `${versions[i][k].raw()} is at least ${versions[j][l].raw()}`
              : `${versions[j][l].raw()} is at least ${versions[i][k].raw()}`;

          test(name, () => {
            // Compare versions[i][k] to versions[j][l] for all valid i, j, k, l
            expect(actual).toBe(expected);
          });
        }
      }
    }
  }
});

describe('ZulipVersion.prototype.raw()', () => {
  const raw = randString();
  test('Returns the same string the instance was constructed with', () => {
    expect(new ZulipVersion(raw).raw()).toBe(raw);
  });
});

describe('ZulipVersion.prototype.toJSON()', () => {
  const rawUnstructured = randString();
  const rawStructured = eg.recentZulipVersion.raw();
  test('Returns the same string the instance was constructed with', () => {
    expect(new ZulipVersion(rawUnstructured).toJSON()).toBe(rawUnstructured);
    expect(new ZulipVersion(rawStructured).toJSON()).toBe(rawStructured);
  });
});

describe('ZulipVersion.prototype.elements()', () => {
  const raw1 = '0.1.0';
  test(`new ZulipVersion(${raw1}).elements()`, () => {
    expect(new ZulipVersion(raw1).elements()).toStrictEqual({
      major: 0,
      minor: 1,
      patch: 0,
      flag: undefined,
      numCommits: undefined,
      commitId: undefined,
    });
  });

  const raw2 = '2.1.0-rc1-112-g35959d43c4';

  test(`new ZulipVersion(${raw2}).elements()`, () => {
    expect(new ZulipVersion(raw2).elements()).toStrictEqual({
      major: 2,
      minor: 1,
      patch: 0,
      flag: ['rc', 1],
      numCommits: 112,
      commitId: '35959d43c4',
    });
  });
});

describe('ZulipVersion.prototype.classify()', () => {
  for (const [coarse, fine, raw] of [
    ['1.9.x', '1.9.1', '1.9.1-23-gabcabcabc'],
    ['2.1.x', '2.1.3', '2.1.3'],
    ['3.x', '3.1', '3.1'],
    ['4.x', '4.0', '4.0'],
  ]) {
    test(raw, () => {
      expect(new ZulipVersion(raw).classify()).toStrictEqual({ raw, coarse, fine });
    });
  }
});
