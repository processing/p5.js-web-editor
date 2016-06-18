import {Router} from 'express'
const router = new Router();
import path from 'path'

// this is intended to be a temporary file 
// until i figure out isomorphic rendering

router.route('/').get(function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
});

router.route('/signup').get(function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
});

router.route('/projects/:project_id').get(function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
});

router.route('/login').get(function(req, res) {
	res.sendFile(path.resolve(__dirname + '/../../index.html'));
});

export default router;