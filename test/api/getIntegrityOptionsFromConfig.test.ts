/* eslint-disable prefer-arrow-callback */
/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import { ConfigExplorer } from '../../src/common/configExplorer';
import { ConfigOptions } from '../../src/interfaces/configOptions';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';

describe(`Integrity: function 'getIntegrityOptionsFromConfig' tests`, function (): void {

  context('expects', function (): void {

    let sandbox: sinon.SinonSandbox;
    let getConfigStub: sinon.SinonStub<[(string | undefined)?], Promise<ConfigOptions>>;

    beforeEach(function (): void {
      sandbox = sinon.createSandbox();
      getConfigStub = sandbox.stub(ConfigExplorer.prototype, 'getConfig');
    });

    afterEach(function (): void {
      sandbox.restore();
    });

    it('to return an empty object, when failing to find a configuration',
      async function (): Promise<void> {
        getConfigStub.resolves({});
        const config = await Integrity.getIntegrityOptionsFromConfig();
        expect(config).to.eql({});
      });

    it('to return the integrity options',
      async function (): Promise<void> {
        const rc: ConfigOptions = {
          cryptoOptions: {
            dirAlgorithm: 'mr',
            encoding: 'hex',
            fileAlgorithm: 'rm',
          },
          exclude: ['dir', 'file'],
          source: '.',
          verbose: true,
          strict: true,
        };
        const expected: IntegrityOptions = {
          cryptoOptions: rc.cryptoOptions,
          exclude: rc.exclude,
          verbose: rc.verbose,
          strict: rc.strict,
        };
        getConfigStub.resolves(rc);
        const config = await Integrity.getIntegrityOptionsFromConfig();
        expect(config).to.eql(expected);
      });

  });

});
