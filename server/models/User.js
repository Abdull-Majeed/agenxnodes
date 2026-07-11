const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({ 
    username: { type: String, unique: true }, 
    email: { type: String, unique: true, sparse: true },
    password: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date
});
const User = mongoose.model('User', UserSchema);
module.exports = User;
