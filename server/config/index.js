const path = require("path");

// All configurations will extend these options
// ============================================
var all = {
  name: "App API",
  env: process.env.NODE_ENV,
  root: path.normalize(__dirname + ".."), // Root path of server
  port: process.env.PORT || 4001, // Server port
  jwtTokenSecret: "uoIXhwXY2YWGv736iNmht7mstgLPx3ydRWcoptz2z686oN2A1nBWF5gUxhgBEjn3bRzem3W44uhKSPPQVkvj6p153K7JhwGB9rfK5vRgesJlQrgHeH3ExixlmuhpjRLP80X5d",
  // serverRootPath: "/api",
  logLevel: process.env.LOG_LEVEL || "debug"
};

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = Object.assign(
  all,
  require("./environment/" + process.env.NODE_ENV + ".js") || {}
);
