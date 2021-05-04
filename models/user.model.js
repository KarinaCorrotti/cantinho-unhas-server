const mongoose = require('../mongoDb/bd');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    emailUser: { type: String, required: true},
    password: { type: String, required: true, select: false},
    typeUser: { type: Boolean, require: true},
    nameUser: { type: String, require: false},
    cpfUser: { type: Number, require: false},
    phoneUser: { type: Number, require: false},
    cepUser: { type: Number, require: false},
    endUser: { type: String, require: false},
    cidUser: { type: String, require: false},
    ufUser: { type: String, require: false},
    nEndUser: { type: Number, require: false},
    photoUser: { type: String, require: false},
    latUser: { type: Number, require: false},
    lonUser: { type: Number, require: false}
});

UserSchema.pre('save', async function(next){
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;