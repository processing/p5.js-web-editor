import archiver from 'archiver';
import request from 'request';
import moment from 'moment';
import Classroom from '../models/classroom';
import Project from '../models/project';
import User from '../models/user';

export function classroomExists(classroom_id, callback) {
  Classroom.findById(classroom_id, (findClassroomErr, classroom) => {
    classroom ? callback(true) : callback(false);
  });
}

export function assignmentExists(classroom_id, assignment_id, callback) {
  Classroom.findById(classroom_id, (findClassroomErr, classroom) => {
    if (classroom) {
      let foundAssignment = false;
      classroom.assignments.forEach((assignment) => {
        if (assignment.id === assignment_id) {
          foundAssignment = true;
        }
      });
      callback(foundAssignment);
    } else {
      callback(false);
    }
  });
}

export function createClassroom(req, res) {
  if (!req.user) {
    res.status(403).send({ success: false, message: 'Session does not match owner of project.' });
    return;
  }

  const classroom = new Classroom({
    owners: [{ name: req.user.username, id: req.user._id }],
    members: [],
    isPrivate: true,
  });
  classroom.save((saveErr) => {
    if (saveErr) {
      console.log(saveErr);
      res.json({ success: false });
      return;
    }
    res.json(classroom);
  });
}

export function updateClassroom(req, res) {
  Classroom.findById(req.params.classroom_id, (findClassroomErr, classroom) => {
    // !!!!!!!! Need to check ownership of classroom here. !!!!!!!!
    /* if (!req.user || !classroom.user.equals(req.user._id)) {
      res.status(403).send({ success: false, message: 'Session does not match owner of project.' });
      return;
    }*/
    // if (req.body.updatedAt && moment(req.body.updatedAt) < moment(project.updatedAt)) {
    //   res.status(409).send({ success: false, message: 'Attempted to save stale version of project.' });
    //   return;
    // }
    Classroom.findByIdAndUpdate(req.params.classroom_id,
      {
        $set: req.body
      },
      {
        new: true
      })
      .populate('user', 'username')
      .exec((updateClassroomErr, updatedClassroom) => {
        if (updateClassroomErr) {
          console.log(updateClassroomErr);
          res.json({ success: false });
          return;
        }
        res.json(updatedClassroom);
      });
  });
}

export function getClassroom(req, res) {
  Classroom.findById(req.params.classroom_id)
    .populate('user', 'username')
    .exec((err, classroom) => {
      if (err) {
        console.log('no classroom found...');
        return res.status(404).send({ message: 'Classroom with that id does not exist' });
      }
      return res.json(classroom);
    });
}

export function deleteClassroom(req, res) {
	// Project.findById(req.params.project_id, (findProjectErr, project) => {
  Classroom.findById(req.params.classroom_id, (err, classroom) => {
    if (!req.user/* || !classroom.user.equals(req.user._id) */) {
      res.status(403).json({ success: false, message: 'Session does not match owner of project.' });
      return;
    }
    // deleteFilesFromS3(project.files);
    Classroom.remove({ _id: req.params.classroom_id }, (removeProjectError) => {
      if (err) {
        res.status(404).send({ message: 'Classroom with that id does not exist' });
        return;
      }
      res.json({ success: true });
    });
  });
}

export function getClassrooms(req, res) {
  console.log(req.user);
  if (req.user) {
    Classroom.find(
      { $or: [
        { owners: { $elemMatch: { name: req.user.username } } },
        { members: { $elemMatch: { name: req.user.username } } }
      ] }
    )
      .sort('-createdAt')
      .select('name owners members id createdAt updatedAt')
      .exec((err, classrooms) => {
        if (err) {
          console.log(err);
          res.json(err);
        } else {
          console.log(classrooms);
          classrooms.forEach((classroom) => {
            console.log(classroom.owners);
          });
          res.json(classrooms);
        }
      });
  } else {
    // could just move this to client side
    console.log('no user!!!');
    res.json([]);
  }
}

export function getClassroomsOwnedByUser(req, res) {
  res.send('Workin on this...');
}

export function getClassroomsUserIsMemberOf(req, res) {
  res.send('Workin on this...');
}

export function downloadClassroomAsZip(req, res) {
  res.send('Workin on this...');
}

export function getAssignmentProjects(req, res) {
  Classroom.findById(req.params.classroom_id)
    .populate('user', 'username')
    .exec((err, classroom) => {
      if (err || !classroom) {
        console.log('no classroom found...');
        return res.status(404).send({ message: 'Classroom with that id does not exist' });
      }
      let foundAssignment;
      classroom.assignments.forEach((assignment) => {
        if (assignment.id === req.params.assignment_id) {
          foundAssignment = assignment;
        }
      });
      if (foundAssignment) {
        const projectids = [];
        foundAssignment.submissions.forEach((submission) => {
          projectids.push(submission);
        });
        Project.find({
          _id: {
            $in: projectids
          }
        }).exec((err, projects) => {
          res.json(projects);
        });
      } else {
        return res.status(404).send({ message: 'Assignment with that id in that classroom does not exist' });
      }
      // return res.json(classroom);
    });
}
