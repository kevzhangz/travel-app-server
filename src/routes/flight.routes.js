import flightCtrl from '../controllers/flight.controller.js'
import authCtrl from '../controllers/auth.controller.js'
import express from 'express'

const router = express.Router()

router.route('/api/flight/search')
      .post(flightCtrl.searchFlight)

router.route('/api/flight/order')
      .get(authCtrl.checkSignin, flightCtrl.listOrder)
      .post(authCtrl.checkSignin, flightCtrl.placeFlightOrder)

router.route('/api/flight/orderStatus')
      .get(authCtrl.checkSignin, flightCtrl.orderStatus)
      .put(authCtrl.checkSignin, flightCtrl.updateOrderStatus)

export default router;