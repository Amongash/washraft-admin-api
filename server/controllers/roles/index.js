const { Role } = require('../../models');

exports.index = async (req, res, next) => {
  const fields = 'role description';
  Role.find({}, fields, (err, roles) => {
    if (err) return next(err);
    return res.json(roles);
  });
};

exports.add = async (req, res, next) => {
  try {
    const role = new Role({
      role: req.body.role_name,
      description: req.body.role_description,
    });
    const savedRole = await role.save();
    if (savedRole) {
      console.log(`Role has been saved`, savedRole);
      return res.json('Success: true');
    }
    return next(new Error('Failed to save role for unknown reasons'));
  } catch (err) {
    return next(err);
  }
};

exports.getByRole = async (req, res, next) => {
  // TODO add application logic to retrieve roles by using role_name as find parameter
};
