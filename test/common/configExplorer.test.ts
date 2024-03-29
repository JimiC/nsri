/* eslint-disable no-unused-expressions */
import { expect } from 'chai';
import { join, resolve } from 'path';
import sinon, { createSandbox } from 'sinon';
import { ConfigExplorer } from '../../src/common/configExplorer';
import { ConfigOptions } from '../../src/interfaces/configOptions';

describe('ConfigExplorer: tests', (): void => {

  context('expects', (): void => {

    let sandbox: sinon.SinonSandbox;
    let configExplorer: ConfigExplorer;
    let getConfigStub: sinon.SinonStub<[(string | undefined)?], Promise<ConfigOptions>>;
    let baseConfigDirPath: string;

    beforeEach((): void => {
      sandbox = createSandbox();
      configExplorer = new ConfigExplorer();
      baseConfigDirPath = resolve(__dirname, '../../../test/cosmiconfig/');
    });

    afterEach((): void => {
      sandbox.restore();
    });

    context('when calling', (): void => {

      context(`function 'assignArgs'`, (): void => {
        beforeEach((): void => {
          getConfigStub = sandbox.stub(ConfigExplorer.prototype, 'getConfig');
          sandbox.stub(process, 'argv').value([]);
        });

        it('to simply return when no configuration section is found',
          async (): Promise<void> => {
            getConfigStub.resolves({});
            await configExplorer.assignArgs();
            expect(process.argv).to.eql([]);
          });

        context('to assign to the process arguments', (): void => {

          it(`the 'manifest' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ manifest: true });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-m').and.to.contain('true');
            });

          it(`the 'source' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ source: '/some/path/' });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-s').and.to.contain('/some/path/');
            });

          it(`the 'verbose' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ verbose: true });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-v').and.to.contain('true');
            });

          it(`the 'strict' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ strict: true });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-st').and.to.contain('true');
            });

          it(`the 'diralgorithm' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ cryptoOptions: { dirAlgorithm: 'sha512' } });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-da').and.to.contain('sha512');
            });

          it(`the 'filealgorithm' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ cryptoOptions: { fileAlgorithm: 'sha1' } });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-fa').and.to.contain('sha1');
            });

          it(`the 'encoding' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ cryptoOptions: { encoding: 'base64' } });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-e').and.to.contain('base64');
            });

          it(`the 'exclude' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ exclude: ['dir', 'file'] });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-x').and.to.contain('dir').and.to.contain('file');
            });

          it(`the 'integrity' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ integrity: '/path/to/integrity/' });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-i').and.to.contain('/path/to/integrity/');
            });

          it(`the 'output' value`,
            async (): Promise<void> => {
              getConfigStub.resolves({ output: '/' });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-o').and.to.contain('/');
            });

        });

      });

      context(`function 'getConfig'`, (): void => {

        it(`to throw an Error when 'explorer' is not initialized`,
          async (): Promise<void> => {
            // @ts-ignore
            sandbox.stub(configExplorer, 'explorer').value(undefined);
            try {
              await configExplorer.getConfig();
            } catch (error) {
              expect(error).to.be.an.instanceOf(Error).and.match(/CosmiConfig not initialized/);
            }
          });

        it(`to return an empty object when 'explorer' returns 'null'`,
          async (): Promise<void> => {
            // @ts-ignore
            sandbox.stub(configExplorer.explorer, 'search').resolves(null);
            const config = await configExplorer.getConfig();
            expect(config).to.be.an('object').that.is.empty;
          });

        context('to retrieve the configuration values from', (): void => {

          it(`a 'package.json' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'packagejson');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it(`an 'rc' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'rc');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it(`a '.config.js' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'configjs');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it(`a 'json' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'json');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it(`a 'js' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'js');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it(`a 'yaml' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'yaml');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it(`a 'yml' file`,
            async (): Promise<void> => {
              const dirPath = join(baseConfigDirPath, 'yml');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

        });

      });

    });

  });

});
