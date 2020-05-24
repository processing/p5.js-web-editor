import { toApi as toApiProjectObject } from '../../domain-objects/Project';
import Project from '../../models/project';
import User from '../../models/user';
import createApplicationErrorClass from '../../utils/createApplicationErrorClass';

const UserNotFoundError = createApplicationErrorClass('UserNotFoundError');

function getProjectsForUserName(username, authenicatedUser) {
  return new Promise((resolve, reject) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        reject(err);
        return;
      }

      if (!user) {
        reject(new UserNotFoundError());
        return;
      }
      const isUserAuthorized = authenicatedUser && username === authenicatedUser.username;
      let query;
      if (!isUserAuthorized) {
        query = {
          user: user._id,
          isPrivate: false
        };
      } else {
        query = {
          user: user._id
        };
      }
      Project.find(query)
        .sort('-createdAt')
        .select('name files id createdAt updatedAt')
        .exec((innerErr, projects) => {
          if (innerErr) {
            reject(innerErr);
            return;
          }
          resolve(projects);
        });
    });
  });
}

export default function getProjectsForUser(req, res) {
  if (req.params.username) {
    return getProjectsForUserName(req.params.username, req.user)
      .then(projects => res.json(projects))
      .catch((err) => {
        if (err instanceof UserNotFoundError) {
          res.status(404).json({ message: 'User with that username does not exist.' });
        } else {
          res.status(500).json({ message: 'Error fetching projects' });
        }
      });
  }

  // could just move this to client side
  res.status(200).json([]);
  return Promise.resolve();
}

export function apiGetProjectsForUser(req, res) {
  if (req.params.username) {
    return getProjectsForUserName(req.params.username)
      .then((projects) => {
        const asApiObjects = projects.map(p => toApiProjectObject(p));
        res.json({ sketches: asApiObjects });
      })
      .catch((err) => {
        if (err instanceof UserNotFoundError) {
          res.status(404).json({ message: 'User with that username does not exist.' });
        } else {
          res.status(500).json({ message: 'Error fetching projects' });
        }
      });
  }

  res.status(422).json({ message: 'Username not provided' });
  return Promise.resolve();
}
