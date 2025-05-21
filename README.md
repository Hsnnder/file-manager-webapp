# file-manager-webapp

# Dosya Yöneticisi Web Uygulaması / File Manager Web Application

## Türkçe

### Gereksinimler / Requirements

- Node.js (v14.0.0 veya üzeri / or higher)
- MongoDB (v4.0.0 veya üzeri / or higher)
- npm (Node.js ile birlikte gelir / comes with Node.js)

### Kurulum Adımları / Installation Steps

1. Repoyu klonlayın / Clone the repository:
```bash
git clone https://github.com/your-username/file-manager-webapp.git
cd file-manager-webapp
```

2. Bağımlılıkları yükleyin / Install dependencies:
```bash
# Backend bağımlılıkları / Backend dependencies
cd backend
npm install

# Frontend bağımlılıkları / Frontend dependencies
cd ../frontend
npm install
```

3. Ortam değişkenlerini ayarlayın / Configure environment variables:
   - Backend klasöründe `.env` dosyası oluşturun / Create a `.env` file in the backend folder:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/file-manager
JWT_SECRET=your-secret-key-here
```

4. MongoDB'yi başlatın / Start MongoDB:
```bash
# macOS için / for macOS
brew services start mongodb-community

# Linux için / for Linux
sudo systemctl start mongod

# Windows için / for Windows
# MongoDB servisini başlatın / Start MongoDB service
```

### Uygulamayı Çalıştırma / Running the Application

1. Backend'i başlatın / Start the backend:
```bash
cd backend
npm start
```

2. Frontend'i başlatın / Start the frontend:
```bash
cd frontend
npm start
```

3. Tarayıcınızda uygulamayı açın / Open the application in your browser:
```
http://localhost:3000/login
```

### Özellikler / Features

- Kullanıcı kaydı ve girişi / User registration and login
- Dosya yükleme ve indirme / File upload and download
- Dosya listeleme ve silme / File listing and deletion
- Şifre sıfırlama / Password reset
- JWT tabanlı kimlik doğrulama / JWT-based authentication

### Desteklenen Dosya Türleri / Supported File Types

- PDF (.pdf)
- PNG (.png)
- JPEG (.jpg, .jpeg)

### Güvenlik Özellikleri / Security Features

- Şifreler güvenli bir şekilde hashlenir / Passwords are securely hashed
- JWT tabanlı kimlik doğrulama / JWT-based authentication
- Dosya erişim kontrolü / File access control
- Şifre sıfırlama için güvenli doğrulama / Secure verification for password reset

## English

### Requirements

- Node.js (v14.0.0 or higher)
- MongoDB (v4.0.0 or higher)
- npm (comes with Node.js)

### Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/your-username/file-manager-webapp.git
cd file-manager-webapp
```

2. Install dependencies:
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables:
   - Create a `.env` file in the backend folder:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/file-manager
JWT_SECRET=your-secret-key-here
```

4. Start MongoDB:
```bash
# For macOS
brew services start mongodb-community

# For Linux
sudo systemctl start mongod

# For Windows
# Start MongoDB service
```

### Running the Application

1. Start the backend:
```bash
cd backend
npm start
```

2. Start the frontend:
```bash
cd frontend
npm start
```

3. Open the application in your browser:
```
http://localhost:3000
```

### Features

- User registration and login
- File upload and download
- File listing and deletion
- Password reset functionality
- JWT-based authentication

### Supported File Types

- PDF (.pdf)
- PNG (.png)
- JPEG (.jpg, .jpeg)

### Security Features

- Secure password hashing
- JWT-based authentication
- File access control
- Secure verification for password reset

### Troubleshooting

If you encounter any issues:

1. MongoDB bağlantı hatası / MongoDB connection error:
   - MongoDB servisinin çalıştığından emin olun / Ensure MongoDB service is running
   - Bağlantı URL'sini kontrol edin / Check the connection URL

2. Port çakışması / Port conflict:
   - `.env` dosyasında farklı bir port belirtin / Specify a different port in `.env` file
   - Kullanılan portu kontrol edin / Check if the port is in use

3. Bağımlılık hataları / Dependency errors:
   - `node_modules` klasörünü silip tekrar `npm install` yapın / Delete `node_modules` and run `npm install` again
   - Node.js sürümünüzü kontrol edin / Check your Node.js version

### Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### License

This project is licensed under the MIT License - see the LICENSE file for details. 
