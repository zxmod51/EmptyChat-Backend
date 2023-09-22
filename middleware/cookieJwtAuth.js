const jwt = require("jsonwebtoken");

// Token aus Cookies extrahieren und verifizieren
const verifyJwtToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const user = jwt.verify(token, "my_secret_key");
    req.user = user;
  } catch (err) {
    res.clearCookie("token")
    return res.status(401).send("Invalid Token");
  }
  return next();
};

module.exports = verifyJwtToken;