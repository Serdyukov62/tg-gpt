const axios = require("axios");
const https = require("https");


const agent = new https.Agent({
    rejectUnauthorized: false,
  });

async function refreshToken() {
    const response = await axios.post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth',{httpsAgent: agent}, {
    })
    .then((res) => {
        process.env.ACCESS_TOKEN = res.data.access_token
    })
    .catch((err) => {
        console.log(err)
    })
}

module.exports = {refreshToken}