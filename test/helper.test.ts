/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { hexRegexPattern } from '../src/common/utils';
import { checker } from './helper';

describe(`Helper: function 'checker' tests`, (): void => {

  it('to fail when hash is not of SRI',
    (): void => {
      const sut = checker('1f9f2660d8db3094e488dbef35f8f660a977724d', hexRegexPattern, '');
      expect(sut).to.be.false;
    });

});
