import MobileErrorBoundary from 'react-native-error-boundary';
import { ErrorBoundary as WebErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
const moment = require('moment');
const { createLogger, format, transports } = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

const { combine, timestamp, printf, label } = format;


let logger;

export const ErrorCatcher = ({ children, config }) => {
  const [state, dispatch] = useImmer({ ...defaultState });

  const {
    isMOBILE = true,
    FallbackComponent = null,
    onError = ()=>{},
    onReset = ()=>{},
    LOGGING: {
      LOG_LEVEL = 'info',
      INDEX,
      ELK_ENDPOINT,
      ELK_USERNAME,
      ELK_PASS,
      DD_ENV
    }
  } = config;

  const esTransportOpts = {
    level: LOG_LEVEL,
    index: INDEX,
    transformer: logData => {
      const transformed = {};
      transformed['@timestamp'] = new Date();
      transformed.message = logData.message;
      if (typeof transformed.message === 'object') {
          transformed.message = JSON.stringify(transformed.message);
      }
      transformed.level = logData.level;
      transformed.fields = logData.meta;
      if (typeof transformed.fields !== 'object') {
          transformed.fields = { 0: transformed.fields };
      }
      transformed.context = DD_ENV;
      return transformed;
    },
    clientOpts: {
      node: ELK_ENDPOINT,
      maxRetries: 5,
      requestTimeout: 60000,
      sniffOnStart: false,
      auth: {
          username: ELK_USERNAME,
          password: ELK_PASS,
      },
    },
  };

  const esTransport = new ElasticsearchTransport(esTransportOpts);

  const transports = [ esTransport ];

  if (isMOBILE === false) {
    const fsTransport = new DailyRotateFile({
      filename: `./logs/${INDEX}_${DD_ENV}_%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    });
  
    const consoleTransport = new transports.Console({
      format: combine(
        timestamp(), format.splat(), format.simple(), myFormat,
      )
    });

    transports.push(fsTransport);
    transports.push(consoleTransport);
  }

  logger = (callingModule = '') => createLogger({
    level: LOG_LEVEL,
    transports,
    exceptionHandlers: transports,
    exitOnError: false,
    timestamp: true,
    format: combine(
      timestamp(),
      format.splat(),
      format.simple(),
      printf((payload) => {
        const { level, message, timestamp: logTimestamp } = payload;
        return `[${moment(logTimestamp).format('YYYY-DD-MM, HH:mm:ss:SSSSS')}] - ${level}: ${message}`;
      }),
    ),
  });

  const errorHandler = (error, data) => {
    logger.error('Error: %o. %o', error, data);
    onError();
  }

  const resetHandler = () => {
    onReset();
  }
  
  return (
    isMOBILE === false ?
      <WebErrorBoundary FallbackComponent={FallbackComponent} onError={errorHandler} onReset={resetHandler}>
        {children}
      </WebErrorBoundary> :
      <MobileErrorBoundary FallbackComponent={FallbackComponent} onError={errorHandler} onReset={resetHandler}>
        {children}
      </MobileErrorBoundary>
  );
};

export const useLogger = () => {
  return [logger];
}

ErrorCatcher.propTypes = {
  children: PropTypes.node,
  config: PropTypes.shape({
    isMOBILE: PropTypes.bool.isRequired,
    FallbackComponent: PropTypes.node,
    onError: PropTypes.func,
    onReset: PropTypes.func,
    LOGGING: PropTypes.shape({
      INDEX: PropTypes.string.isRequired,
      LOG_LEVEL: PropTypes.string.isRequired,
      ELK_ENDPOINT: PropTypes.string.isRequired,
      ELK_USERNAME: PropTypes.string.isRequired,
      ELK_PASS: PropTypes.string.isRequired,
      DD_ENV: PropTypes.string.isRequired,
    })
  })
};
