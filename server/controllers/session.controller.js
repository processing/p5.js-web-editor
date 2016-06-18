import User from '../models/user'
import passport from 'passport'
import path from 'path'


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

export function getSession(req, res, next) {
	if (req.user) {
		return res.json({
			email: req.user.email,
			username: req.user.username
		});
	}
	res.status(404).send({message: 'Session does not exist'});
}