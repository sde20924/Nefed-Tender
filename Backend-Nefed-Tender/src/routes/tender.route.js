import express from 'express';
import auth from '../middlewares/auth.js';
import {ViewTender,CreateTender} from '../controllers/tender.controller.js';

const router = express.Router();

router.post('/create-tender',auth('createTender'), CreateTender);
router.get('/view-tender',auth('viewTender'), ViewTender);
export default router;