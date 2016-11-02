import { Router } from 'express';
const router = new Router();
import path from 'path';

// this is intended to be a temporary file
// until i figure out isomorphic rendering

router.route('/').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/signup').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/projects/:project_id').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

// router.route('/full/:project_id').get((req, res) => {
//   res.sendFile(path.resolve(`${__dirname}/../../index.html`));
// });

router.route('/login').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/reset-password').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/reset-password/:reset_password_token').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/sketches').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/about').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

router.route('/:username/sketches').get((req, res) => {
  res.sendFile(path.resolve(`${__dirname}/../../index.html`));
});

export default router;
