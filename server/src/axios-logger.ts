import axios from 'axios';
import { errorLogger, requestLogger, responseLogger } from 'axios-logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const myErrorLogger = (err: any) => errorLogger(err, { logger: console.error });
const dateFormat = '[yyyy-mm-dd HH:MM:ss]';

export const init = () => {
  axios.interceptors.request.use(
    res => requestLogger(res, { data: false, dateFormat, logger: console.info }),
    myErrorLogger
  );

  axios.interceptors.response.use(
    res =>
      responseLogger(res, {
        data: false,
        dateFormat,
        logger: console.info
      }),
    myErrorLogger
  );
};
