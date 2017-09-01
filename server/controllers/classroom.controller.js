import Classroom from '../models/classroom';
import Project from '../models/project';

export function classroomExists(classroomId, callback) {
  Classroom.findById(classroomId, (findClassroomErr, classroom) => {
    if (classroom) {
      return callback(true);
    }
    return callback(false);
  });
}

export function assignmentExists(classroomId, assignmentId, callback) {
  Classroom.findById(classroomId, (findClassroomErr, classroom) => {
    if (classroom) {
      let foundAssignment = false;
      classroom.assignments.forEach((assignment) => {
        if (assignment.id === assignmentId) {
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
    instructors: [{ username: req.user.username, user_id: req.user.id }],
    students: [],
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
  Classroom.findById(req.params.classroom_id, (err, classroom) => {
    if (!req.user/* || !classroom.user.equals(req.user.id) */) {
      res.status(403).json({ success: false, message: 'Session does not match owner of project.' });
      return;
    }
    // deleteFilesFromS3(project.files);
    Classroom.remove({ id: req.params.classroom_id }, (removeProjectError) => {
      if (err) {
        res.status(404).send({ message: 'Classroom with that id does not exist' });
        return;
      }
      res.json({ success: true });
    });
  });
}

export function getClassrooms(req, res) {
  console.log(req);
  if (req.user) {
    Classroom.find(
      { $or: [
        { instructors: { $elemMatch: { username: req.user.username } } },
        { students: { $elemMatch: { username: req.user.username } } }
      ] }
    )
      .sort('-createdAt')
      .select('name instructors students id createdAt updatedAt')
      .exec((err, classrooms) => {
        if (err) {
          console.log(err);
          res.json(err);
        } else {
          res.json(classrooms);
        }
      });
  } else {
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

export function getAssignmentProjects(req, res) { // eslint-disable-line
  Classroom.findById(req.params.classroom_id)
    .populate('user', 'username')
    .exec((err, classroom) => { // eslint-disable-line
      if (err || !classroom) {
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
          id: {
            $in: projectids
          }
        }).exec((findErr, projects) => {
          res.json(projects);
        });
      } else {
        return res.status(404).send({ message: 'Assignment with that id in that classroom does not exist' });
      }
      // return res.json(classroom);
    });
}
