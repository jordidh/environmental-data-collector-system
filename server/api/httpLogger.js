const morgan = require('morgan');
const logger = require('./logger');

// Custom Morgan format: Standard Apache combined log output + response time integrated with winston
//const httpLogger = morgan(
//  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms',
//  { stream: logger.stream }
//);

const json = require('morgan-json');

const format = json({
  remoteAddr: ':remote-addr',
  remoteUser: ':remote-user',
  date: '[:date[clf]]',
  method: ':method',
  url: ':url',
  status: ':status',
  contentLength: ':res[content-length]',
  referrer: ':referrer',
  userAgent: ':user-agent',
  responseTime: ':response-time'
});

const httpLogger = morgan(format, {
  stream: {
    write: (message) => {
      const {
        remoteAddr,
        remoteUser,
        date,
        method,
        url,
        status,
        contentLength,
        referrer,
        userAgent,
        responseTime
      } = JSON.parse(message)

      logger.info('HTTP Access Log', {
        //timestamp: new Date().toString(),
        remoteAddr,
        remoteUser,
        date,
        method,
        url,
        status: Number(status),
        contentLength,
        referrer,
        userAgent,
        responseTime: Number(responseTime)
      });
    }
  }
});


module.exports = httpLogger;