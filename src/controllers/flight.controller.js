import Amadeus from 'amadeus'
import FlightOrder from '../models/flightOrder.model.js';
import dbErrorHandler from '../helpers/dbErrorHandler.js';
import generator from '../helpers/generator.js';
import midtransClient from 'midtrans-client';


// setup process.env
import dotenv from 'dotenv'
dotenv.config();

const orderProjections = {
    '_id': false,
    '__v': false
}

const initAmadeus = () => {
    let client = new Amadeus({
        clientId: process.env.API_KEY,
        clientSecret: process.env.API_SECRET
    });

    return client;
}

const searchFlight = async (req, res, next) => {

    req.body.leaving_date = new Date(req.body.leaving_date).toISOString().split('T')[0];

    let amadeus = initAmadeus();

    let params = {
        originLocationCode: req.body.from.iata,
        destinationLocationCode: req.body.to.iata,
        departureDate: req.body.leaving_date,
        adults: req.body.adults,
        currencyCode: 'IDR',
        max: 30,
        nonStop: true
    }

    if(req.body.round_trip){
        req.body.returning_date = new Date(req.body.returning_date).toISOString().split('T')[0];
        params['returnDate'] = req.body.returning_date;
    }

    if(req.body.childs){
        params['children'] = req.body.childs;
    }

    amadeus.shopping.flightOffersSearch.get(params).then(async function (response) {
        let result = JSON.parse(response.body)

        let resAirline = await amadeus.referenceData.airlines.get({
            airlineCodes: getUniqueCarrierCodes(result.data).join(',')
        })

        let airlines = JSON.parse(resAirline.body)

        result = {
            data: {
                offers: result.data,
                airlines: airlines.data
            }
        }

        return res.status(200).json(result);

    }).catch(function (response) {
        console.log(response)
        return res.status(500).json({
            error: response['description'][0]['detail']
        })
    });
}

// Function to extract unique carrier codes
const getUniqueCarrierCodes = (flightOffers) => {
    const carrierCodes = new Set();
    
    flightOffers.forEach(offer => {
      offer.itineraries.forEach(itinerary => {
        itinerary.segments.forEach(segment => {
          carrierCodes.add(segment.operating.carrierCode);
        });
      });
    });
    
    return Array.from(carrierCodes);
}

const placeFlightOrder = async (req, res) => {
    try {
        let date = new Date()
        date = date.setHours(date.getHours() + 7)

        let dateStr = new Date(date).toISOString()
        let newFlightOrder = {
            id: `order-${generator.generateId(8)}`,
            status: 'pending',
            created_at: dateStr,
            user: req.auth,
            ...req.body
        }

        let snap = new midtransClient.Snap({
            isProduction : false,
            serverKey : process.env.MIDTRANS_SERVER_KEY,
            clientKey : process.env.MIDTRANS_CLIENT_KEY
        });

        let parameter = {
            "transaction_details": {
              "order_id": newFlightOrder['id'],
              "gross_amount": req.body.price
            },
            "item_details": [{
              "name": `${req.body.flight_details.from.city} ➔ ${req.body.flight_details.to.city}`,
              "quantity": 1,
              "price": req.body.price,
              "category": "Flight Ticket",
              "merchant_name": "TravelSkyline"
            }],
            "customer_details": {
              "first_name": req.body.contact_details.first_name,
              "last_name": req.body.contact_details.last_name,
              "phone": req.body.contact_details.mobile_number,
            },
            "flight_details": req.body.flight_details,
            "expiry": {
              "unit": "hours",
              "duration": 24,
            },
        }

        let transaction = await snap.createTransaction(parameter);

        newFlightOrder['transaction_token'] = transaction.token;

        // add sell data
        const flightOrder = new FlightOrder(newFlightOrder)
        await flightOrder.save()

        return res.status(200).json({
            messages: 'Flight Order successfully placed',
            orderId: newFlightOrder['id'],
            transactionToken: transaction.token,
        })

    } catch (err){
        return res.status(500).json({
            error: dbErrorHandler.getErrorMessage(err)
        })
    }
}

const orderStatus = async (req, res) => {
    try {

        return res.status(200).json({
            token: token,
            messages: 'Flight Order successfully placed',
        })

    } catch (err){
        return res.status(500).json({
            error: dbErrorHandler.getErrorMessage(err)
        })
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        await FlightOrder.updateOne({
            id: req.body.orderId
        }, {
            $set: {
                status: 'done'
            }
        });

        return res.status(200).json({
            messages: 'Success'
        });
    } catch (err){
        return res.status(500).json({
            error: dbErrorHandler.getErrorMessage(err)
        })
    }
}

const listOrder = async (req, res) => {
    try {
      const result = await FlightOrder.find({}, orderProjections)
                              .populate('user', '_id name')
  
      return res.status(200).json({result})
    } catch (err) {
      return res.status(500).json({
        error: dbErrorHandler.getErrorMessage(err)
      })
    }
}


export default {
    searchFlight,
    placeFlightOrder,
    orderStatus,
    updateOrderStatus,
    listOrder
}