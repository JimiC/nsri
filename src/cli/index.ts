import { HexBase64Latin1Encoding } from 'crypto';
import { Integrity } from '../app/integrity';
import { ConfigExplorer } from '../common/configExplorer';
import { Logger } from '../common/logger';
import { normalizeEntries, unique } from '../common/utils';
import { YargsParser } from '../common/yargsParser';
import { IntegrityObject } from '../interfaces/integrityObject';
import { IntegrityOptions } from '../interfaces/integrityOptions';
import { IParsedArgs } from '../interfaces/parsedArgs';
import { ISpinner } from '../interfaces/spinner';

/** @internal */
export = (async (): Promise<void> => {
  const id = 'nsri';
  const logger = new Logger();
  logger.eventEmitter.on('SIGINT', () => logger.handleForcedExit(!!logger));
  let spinner: ISpinner = { timer: setImmediate(() => void 0), line: 1 };
  let command;
  let message = '';
  try {
    await new ConfigExplorer().assignArgs();
    const pargs: IParsedArgs = new YargsParser().parse();
    let exclusions = await Integrity.getExclusionsFromIgnoreFile();
    exclusions = unique([...exclusions, ...normalizeEntries(pargs.exclude)]);
    const options: IntegrityOptions = {
      cryptoOptions: {
        dirAlgorithm: pargs.dirAlgorithm,
        encoding: pargs.encoding as HexBase64Latin1Encoding,
        fileAlgorithm: pargs.fileAlgorithm,
      },
      exclude: exclusions,
      strict: pargs.strict,
      verbose: pargs.verbose,
    };
    command = pargs.command;
    if (command === 'create') {
      spinner = logger.spinnerLogStart('Creating integrity hash', id);
      const intObj: IntegrityObject = await Integrity.create(pargs.inPath, options);
      if (!pargs.manifest) {
        await Integrity.persist(intObj, pargs.outPath, pargs.pretty);
        message = 'Integrity hash file created';
      } else {
        await Integrity.updateManifestIntegrity(intObj);
        message = 'Integrity hash created -> Manifest updated';
      }
    }
    if (command === 'check') {
      spinner = logger.spinnerLogStart(`Checking integrity of: '${pargs.inPath}'`, id);
      const integrity: string = pargs.manifest ? await Integrity.getManifestIntegrity() : pargs.integrity;
      const passed: boolean = await Integrity.check(pargs.inPath, integrity, options);
      message = `Integrity ${passed ? 'validated' : 'check failed'}`;
    }
    logger.spinnerLogStop(spinner, message, id);
  } catch (error) {
    logger.spinnerLogStop(spinner, `Failed to ${command} integrity hash`, id);
    logger.updateLog(`Error: ${error.message || error}`);
  } finally {
    process.exit();
  }
});
