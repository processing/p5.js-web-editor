import { Router } from 'express';
import * as ClassroomController from '../controllers/classroom.controller';

const router = new Router();

router.route('/classrooms').post(ClassroomController.createClassroom);

router.route('/classrooms/:classroom_id').put(ClassroomController.updateClassroom);

router.route('/classrooms/:classroom_id').get(ClassroomController.getClassroom);

router.route('/classrooms/:classroom_id').delete(ClassroomController.deleteClassroom);

router.route('/classroom/:classroom_id/:assignment_id/projects').get(ClassroomController.getAssignmentProjects);

router.route('/classrooms').get(ClassroomController.getClassrooms);

router.route('/:username/classrooms/:classroom_id').get(ClassroomController.getClassroom);

router.route('/:username/classrooms').get(ClassroomController.getClassrooms);

router.route('/:username/classrooms-owned').get(ClassroomController.getClassroomsOwnedByUser);

router.route('/:username/classrooms-member-of').get(ClassroomController.getClassroomsUserIsMemberOf);

router.route('/:username/:classroom_id/zip').get(ClassroomController.downloadClassroomAsZip);

export default router;
