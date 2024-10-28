const axios = require("axios");

async function refreshToken() {
    const response = await axios.post('https://ngw.devices.sberbank.ru:9443/api/v2/oauth')
    .then((res) => {
        process.env.ACCESS_TOKEN = res.data.access_token
    })
    .catch((err) => {
        console.log(err)
    })
}

module.exports = {refreshToken}