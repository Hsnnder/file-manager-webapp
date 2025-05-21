require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');
const { protect } = require('./middleware/auth');
const User = require('./models/User');
const File = require('./models/File');

// Multer ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

// Dosya yükleme filtreleri
const fileFilter = (req, file, cb) => {
    const allowedTypes = process.env.ALLOWED_FILE_TYPES.split(',');
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Desteklenmeyen dosya türü!'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) // 5MB
    },
    fileFilter: fileFilter
});

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB bağlantısı başarılı'))
.catch(err => {
    console.error('MongoDB bağlantı hatası:', err);
    process.exit(1); // Bağlantı hatası durumunda uygulamayı sonlandır
});

// Middleware'ler
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Login endpointi
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Kullanıcıyı email ile bul ve şifreyi de getir
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // Şifreyi kontrol et
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz email veya şifre'
            });
        }

        // Token oluştur
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            message: 'Giriş başarılı!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Sunucu hatası'
        });
    }
});

// Kayıt endpointi
app.post('/api/register', async (req, res) => {
    console.log('Register request received:', req.body); // Gelen veriyi logla
    const { name, email, password } = req.body;
    
    // Gelen verileri kontrol et
    if (!name || !email || !password) {
        console.log('Missing required fields:', { name, email, password: password ? '***' : undefined });
        return res.status(400).json({
            success: false,
            message: 'Tüm alanları doldurunuz'
        });
    }

    try {
        // Email kontrolü
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('Email already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'Bu email adresi zaten kullanımda'
            });
        }

        // Yeni kullanıcı oluştur
        const user = new User({ name, email, password });
        console.log('Creating new user:', { name, email, password: '***' });
        
        await user.save();
        console.log('User saved successfully:', user._id);

        // Token oluştur
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            message: 'Kayıt başarılı!',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Register error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        
        // Mongoose validation hatası kontrolü
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Kayıt işlemi başarısız: ' + error.message
        });
    }
});

// Şifre sıfırlama endpointi
app.post('/api/reset-password', async (req, res) => {
    const { email, resetWord, newPassword } = req.body;

    try {
        // Gerekli alanları kontrol et
        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email ve yeni şifre alanları zorunludur'
            });
        }

        // Yeni şifre uzunluğunu kontrol et
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Yeni şifre en az 6 karakter olmalıdır'
            });
        }

        // Kullanıcıyı bul
        const user = await User.findOne({ email }).select('+password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
            });
        }

        // Eğer kullanıcının resetWord'ü varsa kontrol et
        if (user.resetWord) {
            if (!resetWord) {
                return res.status(400).json({
                    success: false,
                    message: 'Bu hesap için şifre sıfırlama kelimesi gereklidir'
                });
            }
            
            if (user.resetWord !== resetWord) {
                return res.status(401).json({
                    success: false,
                    message: 'Şifre sıfırlama kelimesi hatalı'
                });
            }
        }

        // Yeni şifreyi kaydet
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Şifreniz başarıyla sıfırlandı'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Şifre sıfırlama işlemi başarısız: ' + error.message
        });
    }
});

// Korumalı route örneği
app.get('/api/protected', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Korumalı route başarılı',
        user: req.user
    });
});

// Dosya yükleme endpointi
app.post('/api/upload', protect, upload.single('file'), async (req, res) => {
    try {
        console.log('Upload request received:', {
            file: req.file,
            user: req.user._id
        });

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Lütfen bir dosya seçin'
            });
        }

        // Dosya bilgilerini kaydet
        const newFile = new File({
            filename: req.file.filename,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            userId: req.user._id
        });

        console.log('Saving file to database:', newFile);
        await newFile.save();
        console.log('File saved successfully');

        res.json({
            success: true,
            message: 'Dosya başarıyla yüklendi',
            file: newFile
        });
    } catch (error) {
        console.error('Upload error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });

        // Yüklenen dosyayı sil
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Dosya silme hatası:', err);
            });
        }

        // Mongoose validation hatası kontrolü
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: messages.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            message: 'Dosya yükleme hatası: ' + error.message
        });
    }
});

// Dosya silme endpointi
app.delete('/api/files/:filename', protect, async (req, res) => {
    try {
        const filename = req.params.filename;
        const file = await File.findOne({ filename, userId: req.user._id });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: 'Dosya bulunamadı'
            });
        }

        const filePath = path.join(__dirname, 'uploads', filename);
        
        // Dosyayı sistemden sil
        fs.unlink(filePath, async (err) => {
            if (err) {
                console.error('Dosya silme hatası:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Dosya silme hatası'
                });
            }

            // Veritabanından sil
            await File.deleteOne({ _id: file._id });
            
            res.json({
                success: true,
                message: 'Dosya başarıyla silindi'
            });
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            success: false,
            message: 'Dosya silme hatası'
        });
    }
});

// Dosya listeleme endpointi
app.get('/api/files', protect, async (req, res) => {
    try {
        const files = await File.find({ userId: req.user._id });
        res.json({
            success: true,
            files: files
        });
    } catch (error) {
        console.error('List files error:', error);
        res.status(500).json({
            success: false,
            message: 'Dosya listeleme hatası'
        });
    }
});

// Frontend route'ları
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend', 'register.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Sunucu hatası'
    });
});

app.listen(PORT, () => {
    console.log(`Server ${PORT} portunda çalışıyor`);
});