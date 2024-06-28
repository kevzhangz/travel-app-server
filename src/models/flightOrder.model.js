import mongoose from 'mongoose'

const FlightOrderSchema = new mongoose.Schema({
  id: String,
  flight_details: {
    adults: Number,
    childs: Number,
    leaving_date: Date,
    returning_date: Date,
    from: {
      city: String,
      name: String,
      iata: String
    },
    to: {
      city: String,
      name: String,
      iata: String
    },
  },
  contact_details: {
    first_name: {
        type: String,
        required: "Name is required"
    },
    last_name: {
        type: String
    },
    mobile_number: {
        type: String,
        required: "Mobile Number is required"
    },
  },
  traveler_details: [
    {
        type: { 
            type: String, 
            required: true 
        },
        first_name: { 
            type: String, 
            required: true 
        },
        last_name: { 
            type: String, 
            required: true 
        },
        birth_date: { 
            type: Date, 
            required: true 
        },
        nationality: { 
            type: String, 
            required: true 
        },
    }
  ],
  price: {
    type: mongoose.Types.Decimal128,
  },
  status: String,
  transaction_token: String,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  created_at: {
    type: Date
  }
})

export default mongoose.model('Flight_Order', FlightOrderSchema);