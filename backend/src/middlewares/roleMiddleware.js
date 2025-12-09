// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

// Middleware to check if user is volunteer
const volunteer = (req, res, next) => {
  if (req.user && (req.user.role === 'volunteer' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Volunteer or Admin only.' });
  }
};

// Middleware to check if user is visitor
const visitor = (req, res, next) => {
  if (req.user && (req.user.role === 'visitor' || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Visitor access only.' });
  }
};

// Middleware to check if user is admin or volunteer
const adminOrVolunteer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'volunteer')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin or Volunteer only.' });
  }
};

module.exports = {
  admin,
  volunteer,
  visitor,
  adminOrVolunteer,
};
