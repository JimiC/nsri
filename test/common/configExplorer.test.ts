// tslint:disable only-arrow-functions
// tslint:disable no-unused-expression
import { expect } from 'chai';
import path from 'path';
import sinon from 'sinon';
import { ConfigExplorer } from '../../src/common/configExplorer';

describe('ConfigExplorer: tests', function () {

  context('expects', function () {

    let sandbox: sinon.SinonSandbox;
    let configExplorer: ConfigExplorer;
    let getConfigStub: sinon.SinonStub;
    let baseConfigDirPath: string;

    beforeEach(function () {
      sandbox = sinon.createSandbox();
      configExplorer = new ConfigExplorer();
      baseConfigDirPath = path.resolve(__dirname, '../../../test/cosmiconfig/');
    });

    afterEach(function () {
      sandbox.restore();
    });

    context('when calling', function () {

      context('function \'assignArgs\'', function () {
        beforeEach(function () {
          getConfigStub = sandbox.stub(ConfigExplorer.prototype, 'getConfig');
          sandbox.stub(process, 'argv').value([]);
        });

        it('to simply return when no configuration section is found',
          async function () {
            getConfigStub.resolves(undefined);
            await configExplorer.assignArgs();
            expect(process.argv).to.eql([]);
          });

        context('to assign to the process arguments', function () {

          it('the \'manifest\' value',
            async function () {
              getConfigStub.resolves({ manifest: true });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-m').and.to.contain(true);
            });

          it('the \'source\' value',
            async function () {
              getConfigStub.resolves({ source: '/some/path/' });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-s').and.to.contain('/some/path/');
            });

          it('the \'verbose\' value',
            async function () {
              getConfigStub.resolves({ verbose: true });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-v').and.to.contain(true);
            });

          it('the \'diralgorithm\' value',
            async function () {
              getConfigStub.resolves({ cryptoOptions: { dirAlgorithm: 'sha512' } });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-da').and.to.contain('sha512');
            });

          it('the \'filealgorithm\' value',
            async function () {
              getConfigStub.resolves({ cryptoOptions: { fileAlgorithm: 'sha1' } });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-fa').and.to.contain('sha1');
            });

          it('the \'encoding\' value',
            async function () {
              getConfigStub.resolves({ cryptoOptions: { encoding: 'base64' } });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-e').and.to.contain('base64');
            });

          it('the \'exclude\' value',
            async function () {
              getConfigStub.resolves({ exclude: ['dir', 'file'] });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-x').and.to.contain('dir').and.to.contain('file');
            });

          it('the \'integrity\' value',
            async function () {
              getConfigStub.resolves({ integrity: '/path/to/integrity/' });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-i').and.to.contain('/path/to/integrity/');
            });

          it('the \'output\' value',
            async function () {
              getConfigStub.resolves({ output: '/' });
              await configExplorer.assignArgs();
              expect(process.argv).to.contain('-o').and.to.contain('/');
            });

        });

      });

      context('function \'getConfig\'', function () {

        it('to throw an Error when \'explorer\' is not initialized',
          async function () {
            // @ts-ignore
            sandbox.stub(configExplorer, '_explorer').value(undefined);
            try {
              await configExplorer.getConfig();
            } catch (error) {
              expect(error).to.be.an.instanceOf(Error).and.match(/CosmiConfig not initialized/);
            }
          });

        context('to retrieve the configuration values from', function () {

          it('a \'package.json\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'packagejson');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it('an \'rc\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'rc');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it('a \'.config.js\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'configjs');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it('a \'json\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'json');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it('a \'js\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'js');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it('a \'yaml\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'yaml');
              const config = await configExplorer.getConfig(dirPath);
              expect(config).to.haveOwnProperty('source');
              expect(config).to.haveOwnProperty('verbose');
              expect(config).to.haveOwnProperty('exclude');
            });

          it('a \'yml\' file',
            async function () {
              const dirPath = path.join(baseConfigDirPath, 'yml');
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
