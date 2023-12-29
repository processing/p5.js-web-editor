import { developmentLogger } from './dev-logger.js';
import { productionLogger } from './prod-logger.js';

export let logger = null;

if (process.env.NODE_ENV !== "production") {
    logger = developmentLogger();
}
else {
    logger = productionLogger();
}
