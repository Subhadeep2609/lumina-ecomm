import User from '../models/User.js';

// @desc    Get all users (Admin only)
// @route   GET /api/v1/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/v1/users/:id/role
// @access  Private/Admin
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'seller', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role specified.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.role = role;
    await user.save();

    return res.status(200).json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    await user.deleteOne();
    return res.status(200).json({ success: true, message: 'User account removed successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
