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

export function duplicateUserCheck(req, res) {
  const checkType = req.query.check_type;
  const value = req.query[checkType];
  const query = {};
  query[checkType] = value;
  User.findOne(query, (err, user) => {
    if (user) {
      return res.json({
        exists: true,
        message: `This ${checkType} is already taken.`,
        type: checkType
      });
    }
    return res.json({
      exists: false,
      type: checkType
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

export function resetPasswordInitiate(req, res) {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({message: 'If the email is registered with the editor, an email has been sent.'});
    }
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  });
}
