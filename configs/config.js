exports.PORT = process.env.PORT || 8000; //Set our port number



//Our db url
exports.DB_URL =
    process.env.NODE_ENV === "production"
      ? process.env.DB_URL : ""
