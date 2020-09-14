require('dotenv').config();

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingClient = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

async function geocoder(location) {
    try {
      let response = await geocodingClient
        .forwardGeocode({
          query: location,
          autocomplete: true
        })
        .send() 
        console.log(response.body.features[0].geometry.coordinates);
    } catch (error) {
        console.log(error.message)
    }
}

geocoder('Lagos, NG')

