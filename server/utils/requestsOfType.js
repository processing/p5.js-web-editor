/*
  express middleware that sends a 406 Unacceptable
  response if an incoming request's Content-Type
  header does not match `type`
*/
const requestsOfType = type => (req, res, next) => {
  if (req.get('content-type') != null && !req.is(type)) {
    return next({ statusCode: 406 }); // 406 UNACCEPTABLE
  }

  return next();
};

export default requestsOfType;
export const requestsOfTypeJSON = () => requestsOfType('application/json');
