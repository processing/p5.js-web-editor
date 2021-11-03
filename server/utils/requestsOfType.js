/*
  express middleware that sends a 406 Unacceptable
  response if an incoming request's Content-Type
  header does not match `type`
*/
const requestsOfType = (type) => (req, res, next) => {
  const hasContentType =
    req.get('content-type') !== undefined && req.get('content-type') !== null;
  const isCorrectType = req.is(type) === null || req.is(type) === type;

  if (hasContentType && !isCorrectType) {
    if (process.env.NODE_ENV === 'development') {
      console.error(
        `Requests with a body must be of Content-Type "${type}". Sending HTTP 406`
      );
    }
    return next({
      code: 406,
      message: `Requests with a body must be of Content-Type "${type}"`
    }); // 406 UNACCEPTABLE
  }

  return next();
};

export default requestsOfType;
export const requestsOfTypeJSON = () => requestsOfType('application/json');
