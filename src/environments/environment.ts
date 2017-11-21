// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

import { JL } from 'jsnlog';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',
  loggerApiUrl: '/tcf/api/jsnlog.logger',
  logLevel: JL.getDebugLevel()
};