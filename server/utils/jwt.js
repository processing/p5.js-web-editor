import jwt from 'jwt-simple'

exports.generateToken = function(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ 
  	_id: user._id,
  	email: user.email,
  	name: user.name,
  	username: user.username, 
  	iat: timestamp }, process.env.JWT_SECRET);
}

