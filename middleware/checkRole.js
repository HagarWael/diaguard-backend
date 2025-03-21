const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "No access" });
    }
    next();
  };
};
module.exports = checkRole;
