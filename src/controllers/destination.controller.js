import Amadeus from 'amadeus'


// setup process.env
import dotenv from 'dotenv'
dotenv.config();

const initAmadeus = () => {
    let client = new Amadeus({
        clientId: process.env.API_KEY,
        clientSecret: process.env.API_SECRET
    });

    return client;
}

const searchAirport = async (req, res, next) => {
    var name = req.query.name;
    let response = await fetch(`https://api.api-ninjas.com/v1/airports?name=${name}`, {
        method: 'GET',
        headers: {
            'X-Api-Key': process.env.API_NINJA_KEY
        },
    });

    var result = await response.json()

    return res.status(200).json(result)
}

export default {
    searchAirport
}