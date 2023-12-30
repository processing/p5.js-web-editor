import { developmentLogger } from './dev-logger';
import { productionLogger } from './prod-logger';

// eslint-disable-next-line import/no-mutable-exports
let logger = null;

if (process.env.NODE_ENV !== 'production') {
  logger = developmentLogger();
} else {
  logger = productionLogger();
}

export default logger;
