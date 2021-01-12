const axios = require("axios");
const axr = require("axios-retry");

//axios api config
axr(axios, {
  retries: 2,
  retryDelay: axr.exponentialDelay,
  shouldResetTimeout: true,
});

export default async function (type) {
  let addr;
  if (process.env.NODE_ENV === "debug") addr = "http://localhost:5000";
  else addr = "http://flask:80/";

  try {
    const res = await axios.post(
      addr,
      {
        type: type,
        _id: this._id,
      },
      { timeout: 1000 }
    );
    return res;
  } catch (err) {
    console.log(err.response);
  }
}
