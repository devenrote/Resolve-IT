const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'name, email, password, role are required' });
  }

  if (!['employee', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'role must be employee or admin' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'password must be at least 6 characters' });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  next();
};

const validateComplaintCreate = (req, res, next) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category || !priority) {
    return res.status(400).json({ message: 'title, description, category and priority are required' });
  }

  if (!['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
    return res.status(400).json({ message: 'priority must be Low, Medium, High or Critical' });
  }

  next();
};

const validateComplaintStatusUpdate = (req, res, next) => {
  const { status } = req.body;

  const allowed = ['Pending', 'In Progress', 'Resolved', 'Closed'];

  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ message: `status must be one of ${allowed.join(', ')}` });
  }

  next();
};

const validateComplaintUpdate = (req, res, next) => {
  const { title, description, category, priority } = req.body;

  if (!title || !description || !category || !priority) {
    return res.status(400).json({ message: 'title, description, category and priority are required' });
  }

  if (!['Low', 'Medium', 'High', 'Critical'].includes(priority)) {
    return res.status(400).json({ message: 'priority must be Low, Medium, High or Critical' });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateComplaintCreate,
  validateComplaintUpdate,
  validateComplaintStatusUpdate,
};
