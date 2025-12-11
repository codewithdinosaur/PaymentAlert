import morgan from 'morgan';
import { logger, loggerStream } from '../config/logger';

// Request logging middleware
export const requestLogger = morgan('combined', { stream: loggerStream });

// Custom morgan format for detailed logging
const detailedFormat =
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

export const detailedLogger = morgan(detailedFormat, {
  stream: {
    write: (message: string) => {
      logger.info(message.trim(), { component: 'http-request' });
    },
  },
});
