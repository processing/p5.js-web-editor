import User from '../models/user'
import passport from 'passport'
import path from 'path'

export function newUser(req, res) {
	//eventually, it would be cool to have some isomorphic rendering
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
}

export function createUser(req, res, next) {
	const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({email: req.body.email}, (err, existingUser) => {
		if (existingUser) {
			//error, already registered
			//should probably redirect client side though?
			return res.redirect('/signup');
		}
		user.save((err) => {
			if (err) { return next(err); }
			req.logIn(user, (err) => {
				if (err) {
					return next(err);
				}
				res.redirect('/');
			});
		});
  });

}