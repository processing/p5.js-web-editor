import User from '../models/user'
import passport from 'passport'
import path from 'path'
import { generateToken } from '../utils/jwt'

export function newUser(req, res) {
	//eventually, it would be cool to have some isomorphic rendering
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
}

export function createUser(req, res, next) {
	const user = new User({
		username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({email: req.body.email}, (err, existingUser) => {
		if (existingUser) {
			return res.status(422).send({ error: 'Email is in use' });
		}
		user.save((err) => {
			if (err) { return next(err); }
			req.logIn(user, (err) => {
				if (err) {
					return next(err);
				}
				res.json({ token: generateToken(user) });
			});
		});
  });

}