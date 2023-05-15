module.exports = (role) => {
  return (req, res, next) => {
    console.log("Checking role:", role, "User role:", req.user.role);
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: `Access denied for role: ${role}` });
    }
  };
};
