import express from 'express';
import verifyUser from '../middlewares/verifyUser.js';
import getUserInfoController from '../controllers/users/userInfoController.js';
import editUserInfoController from '../controllers/users/editUserInfoController.js';
import isAdmin from '../middlewares/isAdmin.js';
import getAllManagers from '../controllers/misc/getAllManager.js';
import getManagerDetails from '../controllers/misc/getManagerDetails.js';
import listOfRequiredDocs from '../controllers/admin/listOfRequiredDocs/index.js';
import uploadDocController from '../controllers/users/uploadDocController.js';
import validateAndUploadMiddleware from '../middlewares/validateAndUploadMiddleware.js';
import addExistingManagerAsManager from '../controllers/manager/addExistingManagerAsManager.js';

const router = express.Router();

router.get('/get-user-info', verifyUser || isAdmin, getUserInfoController);
router.post('/edit-user-info', verifyUser || isAdmin, editUserInfoController);

router.post('/upload-user-doc-new', verifyUser || isAdmin, validateAndUploadMiddleware, uploadDocController);

router.get('/get-all-managers', verifyUser, getAllManagers);
router.get('/get-manager/:manager_id', verifyUser, getManagerDetails);
router.post('/add-as-manager', verifyUser, addExistingManagerAsManager);
router.get('/get-list-of-required-docs', verifyUser || isAdmin, listOfRequiredDocs);

export default router;
