const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: [true, 'Dosya adı zorunludur'],
        unique: true
    },
    originalName: {
        type: String,
        required: [true, 'Orijinal dosya adı zorunludur']
    },
    mimeType: {
        type: String,
        required: [true, 'Dosya türü zorunludur']
    },
    size: {
        type: Number,
        required: [true, 'Dosya boyutu zorunludur']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Kullanıcı ID zorunludur']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// İndeksler
fileSchema.index({ userId: 1, filename: 1 }, { unique: true });
fileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);

async function fetchUserFiles() {
    try {
        const response = await fetch('/api/files', {
            method: 'GET',
            headers: {
                'Authorization': localStorage.getItem('token') // Kullanıcının token'ını gönder
            }
        });

        const result = await response.json();
        if (result.success) {
            const fileList = document.getElementById('fileList');
            fileList.innerHTML = ''; // Listeyi temizle

            result.files.forEach(file => {
                const li = document.createElement('li');
                li.textContent = file.filename;
                fileList.appendChild(li);
            });
        } else {
            console.log('Dosyalar listelenemedi: ' + result.message);
        }
    } catch (error) {
        console.error('Hata:', error);
        console.log('Dosyalar listelenirken bir hata oluştu.');
    }
}

// Sayfa yüklendiğinde dosyaları getir
fetchUserFiles();