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
            username: req.user.username,
            preferences: req.user.preferences,
            id: req.user._id
          });
        });
      });
    });
}

export function updatePreferences(req, res) {
  User.findById(req.user.id, (err, user) => {
    if (err) {
      return res.status(500).json({error: err});
    }
    if (!user){
      return res.status(404).json({error: 'Document not found'});
    }

    const preferences = Object.assign({}, user.preferences, req.body.preferences);
    user.preferences = preferences;

    user.save((err) => {
      if (err) {
        return res.status(500).json({error: err});
      }

      return res.json(user.preferences);
    });
  })
}
