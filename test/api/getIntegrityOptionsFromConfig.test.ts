// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import { ConfigExplorer } from '../../src/common/configExplorer';

describe('Integrity: function \'getIntegrityOptionsFromConfig\' tests', function () {

  context('expects', function () {

    let sandbox: sinon.SinonSandbox;
    let getConfigStub: sinon.SinonStub;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      getConfigStub = sandbox.stub(ConfigExplorer.prototype, 'getConfig');
    });

    afterEach(function () {
      sandbox.restore();
    });

    it('to return an empty object, when failing to find a configuration',
      async function () {
        getConfigStub.resolves(null);
        const config = await Integrity.getIntegrityOptionsFromConfig();
        expect(config).to.eql({});
      });

    it('to return the integrity options',
      async function () {
        const rc = {
          cryptoOptions: {
            dirAlgorithm: 'mr',
            encoding: 'utf',
            fileAlgorithm: 'rm',
          },
          exclude: ['dir', 'file'],
          source: '.',
          verbose: true,
        };
        const expected = {
          cryptoOptions: rc.cryptoOptions,
          exclude: rc.exclude,
          verbose: rc.verbose,
        };
        getConfigStub.resolves(rc);
        const config = await Integrity.getIntegrityOptionsFromConfig();
        expect(config).to.eql(expected);
      });

  });

});
