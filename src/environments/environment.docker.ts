import { JL } from 'jsnlog';

export const environment = {
  production: true,
  apiUrl: 'https://ftc.finconsgroup.com',
  loggerApiUrl: '/tcf/api/jsnlog.logger',
  logLevel: JL.getDebugLevel()
};

