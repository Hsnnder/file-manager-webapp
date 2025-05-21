const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'İsim alanı zorunludur'],
    trim: true,
    minlength: [2, 'İsim en az 2 karakter olmalıdır']
  },
  email: { 
    type: String, 
    required: [true, 'Email alanı zorunludur'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Geçerli bir email adresi giriniz']
  },
  password: { 
    type: String, 
    required: [true, 'Şifre alanı zorunludur'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır'],
    select: false // Şifre varsayılan olarak sorgulamalarda gelmeyecek
  },
  resetWord: {
    type: String,
    trim: true,
    minlength: [3, 'Şifre sıfırlama kelimesi en az 3 karakter olmalıdır'],
    default: null // Varsayılan değer null olarak ayarlandı
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Şifre hashleme middleware'i
userSchema.pre('save', async function(next) {
  // Eğer şifre değişmediyse hashleme
  if (!this.isModified('password')) return next();
  
  try {
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Şifre karşılaştırma metodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('User', userSchema);