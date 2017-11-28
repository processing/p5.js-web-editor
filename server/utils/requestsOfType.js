/*
  express middleware that sends a 406 Unacceptable
  response if an incoming request's Content-Type
  header does not match `type`
*/
const requestsOfType = type => (req, res, next) => {
  console.log(req);
  console.log(req.get('content-type'));
  if (req.get('content-type') != null && !req.is(type)) {
    console.log('in requests of type error');
    return next({ statusCode: 406 }); // 406 UNACCEPTABLE
  }

  return next();
};

export default requestsOfType;
export const requestsOfTypeJSON = () => requestsOfType('application/json');
