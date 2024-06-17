import destinationCtrl from '../controllers/destination.controller.js'
import express from 'express'

const router = express.Router()

router.route('/api/destination/search')
      .post(destinationCtrl.searchAirport)

export default router;