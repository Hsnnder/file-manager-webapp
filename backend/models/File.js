const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Kullanıcı ile ilişkilendirme
    uploadedAt: { type: Date, default: Date.now }
});

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
            alert('Dosyalar listelenemedi: ' + result.message);
        }
    } catch (error) {
        console.error('Hata:', error);
        alert('Dosyalar listelenirken bir hata oluştu.');
    }
}

// Sayfa yüklendiğinde dosyaları getir
fetchUserFiles();