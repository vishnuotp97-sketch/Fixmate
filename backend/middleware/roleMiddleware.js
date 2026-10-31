export const roleMiddleware = (...roles) => (req, res, next) =>
  !req.user ? res.status(401).json({ message: "Authentication required" })
  : !roles.includes(req.user.role) ? res.status(403).json({ message: "Access denied" })
  : next();
