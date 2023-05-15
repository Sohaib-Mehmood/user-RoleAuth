const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Get the token from the header
  const authHeader = req.header("Authorization");

  // Check if there's no token
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  // Check if the token starts with Bearer
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  // Extract the token from the header
  const token = authHeader.slice(7);

  console.log("Received token:", token);

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);
    req.user = decoded;
    //added this line for debugging purposes
    console.log("Decoded user:", req.user);
    next();
  } catch (error) {
    console.error("Error in auth middleware:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
};
