import User from '../models/user'
import passport from 'passport'
import path from 'path'


export function newSession(req, res, next) {
	//eventually, it would be cool to have some isomorphic rendering
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
}

export function destroySession(req, res) {

}

export function createSession(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		if (err) { return next(err); }
		if (!user) {
			return res.status(401).send({ error: 'Invalid username or password' });
		}

		req.logIn(user, (err) => {
			if (err) { return next(err); }
			res.json({
				email: req.user.email,
				username: req.user.username
			});
		});
	})(req, res, next);
}