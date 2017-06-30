import archiver from 'archiver';
import request from 'request';
import moment from 'moment';
import Project from '../models/project';
import User from '../models/user';

export function createCollection(req, res) {
  if (!req.user) {
    res.status(403).send({ success: false, message: 'Session does not match owner of collection.' });
    return;
  }

  let collectionValues = {
    user: req.user._id
  };

  collectionValues = Object.assign(collectionValues, req.body);

  Collection.create(collectionValues, (err, newProject) => {
    if (err) {
      res.json({ success: false });
      return;
    }
    Collection.populate(newProject,
      { path: 'user', select: 'username' },
      (innerErr, newCollectionWithUser) => {
        if (innerErr) {
          res.json({ success: false });
          return;
        }
        res.json(newCollectionWithUser);
      });
  });
}

export function updateCollection(req, res) {
	res.send('Workin on this...');
}

export function getCollection(req, res) {
	res.send('Workin on this...');
}

export function deleteCollection(req, res) {
	res.send('Workin on this...');
}

export function getCollectionsOwnedByUser(req, res) {
	res.send('Workin on this...');
}

export function getCollectionsUserIsMemberOf(req, res) {
	res.send('Workin on this...');
}

export function downloadCollectionAsZip(req, res) {
	res.send('Workin on this...');
}