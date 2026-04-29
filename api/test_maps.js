const { Client } = require('@googlemaps/google-maps-services-js');
const dotenv = require('dotenv');
dotenv.config();

const client = new Client({});

async function test() {
  console.log("Testing with key:", process.env.GOOGLE_MAPS_API_KEY.substring(0, 10) + "...");
  try {
    const response = await client.distancematrix({
      params: {
        origins: ['Accra, Ghana'],
        destinations: ['Kumasi, Ghana'],
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });
    console.log("Response:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
  }
}

test();
