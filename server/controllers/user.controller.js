import User from '../models/user';

export function createUser(req, res, next) {
  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email },
    (err, existingUser) => { // eslint-disable-line consistent-return
      if (err) { res.status(404).send({ error: err }); }

      if (existingUser) {
        return res.status(422).send({ error: 'Email is in use' });
      }
      user.save((saveErr) => { // eslint-disable-line consistent-return
        if (saveErr) { return next(saveErr); }
        req.logIn(user, (loginErr) => { // eslint-disable-line consistent-return
          if (loginErr) {
            return next(loginErr);
          }
          res.json({
            email: req.user.email,
            username: req.user.username
          });
        });
      });
    });
}
