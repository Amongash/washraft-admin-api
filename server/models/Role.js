const mongoose = require('mongoose');

const RoleSchema = mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

const Role = mongoose.model('Role', RoleSchema, 'roles');
module.exports = Role;
