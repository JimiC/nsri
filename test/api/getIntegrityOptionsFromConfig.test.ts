// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import { Config } from 'cosmiconfig';
import sinon from 'sinon';
import { Integrity } from '../../src/app/integrity';
import { ConfigExplorer } from '../../src/common/configExplorer';

describe(`Integrity: function 'getIntegrityOptionsFromConfig' tests`, function (): void {

  context('expects', function (): void {

    let sandbox: sinon.SinonSandbox;
    let getConfigStub: sinon.SinonStub<[(string | undefined)?], Promise<Config>>;

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
