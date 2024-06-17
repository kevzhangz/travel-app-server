import express from 'express'
import adminCtrl from '../controllers/admin.controller.js'
import authCtrl from '../controllers/auth.controller.js'
const router =  express.Router();

router.route('/api/admin')
      .post(adminCtrl.create)

router.route('/api/admin/:userid')
      .get(authCtrl.checkSignin, adminCtrl.read)

router.param('userid', adminCtrl.userById)

export default router;