/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import sinon, { createSandbox } from 'sinon';
import { Integrity } from '../../src/app/integrity';
import { ConfigExplorer } from '../../src/common/configExplorer';
import { ConfigOptions } from '../../src/interfaces/configOptions';
import { IntegrityOptions } from '../../src/interfaces/integrityOptions';

describe(`Integrity: function 'getIntegrityOptionsFromConfig' tests`, (): void => {

  context('expects', (): void => {

    let sandbox: sinon.SinonSandbox;
    let getConfigStub: sinon.SinonStub<[(string | undefined)?], Promise<ConfigOptions>>;

    beforeEach((): void => {
      sandbox = createSandbox();
      getConfigStub = sandbox.stub(ConfigExplorer.prototype, 'getConfig');
    });

    afterEach((): void => {
      sandbox.restore();
    });

    const expected = (options: ConfigOptions): IntegrityOptions => (
      !Object.keys(options).length
        ? options
        : {
          cryptoOptions: options.cryptoOptions,
          exclude: options.exclude,
          verbose: options.verbose,
          strict: options.strict,
        }
    );

    let rc: ConfigOptions = {
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

    it('to return an empty object, when failing to find a configuration',
      async (): Promise<void> => {
        rc = {};
        getConfigStub.resolves(rc);
        const config = await Integrity.getIntegrityOptionsFromConfig();
        expect(config).to.eql(expected(rc));
      });

    context('to return the integrity options', (): void => {

      it('with all options',
        async (): Promise<void> => {
          getConfigStub.resolves(rc);
          const config = await Integrity.getIntegrityOptionsFromConfig();
          expect(config).to.eql(expected(rc));
        });

      it('without `cryptoOptions`',
        async (): Promise<void> => {
          rc.cryptoOptions = undefined;
          getConfigStub.resolves(rc);
          const config = await Integrity.getIntegrityOptionsFromConfig();
          expect(config).to.eql(expected(rc));
        });

      it('with `dirAlgorithm` `undefined`',
        async (): Promise<void> => {
          rc.cryptoOptions = {
            dirAlgorithm: undefined,
            encoding: 'hex',
            fileAlgorithm: 'rm',
          };
          getConfigStub.resolves(rc);
          const config = await Integrity.getIntegrityOptionsFromConfig();
          expect(config).to.eql(expected(rc));
        });

      it('with `encoding` `undefined`',
        async (): Promise<void> => {
          rc.cryptoOptions = {
            dirAlgorithm: 'mr',
            encoding: undefined,
            fileAlgorithm: 'rm',
          };
          getConfigStub.resolves(rc);
          const config = await Integrity.getIntegrityOptionsFromConfig();
          expect(config).to.eql(expected(rc));
        });

      it('with `fileAlgorithm` `undefined`',
        async (): Promise<void> => {
          rc.cryptoOptions = {
            dirAlgorithm: 'mr',
            encoding: 'hex',
            fileAlgorithm: undefined,
          };
          getConfigStub.resolves(rc);
          const config = await Integrity.getIntegrityOptionsFromConfig();
          expect(config).to.eql(expected(rc));
        });

    });

  });

});
