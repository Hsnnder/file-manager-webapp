require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//const authRoutes = require('./auth');
const bodyParser = require('body-parser');
const path = require('path');
const events = require('events');
const jwt =require('jsonwebtoken');
const fs = require('fs');
const multer = require('multer');

//multer ayarları
const storage = multer.diskStorage({
    destination : (req,file,cb)=>{
        cb(null, path.join(__dirname,'uploads'));//uploads klasörüne kaydet
    },
    filename: (req, file, cb) => {//bu kısım olmazsa dosya türü bozuluyor
        const uniqueSuffix = Date.now(); // benzersiz bir isim oluştur
        cb(null, uniqueSuffix + '-' + file.originalname); // Benzersiz dosya adı
    }
});

events.EventEmitter.defaultMaxListeners = 20; // Varsayılan limiti 20'ye çıkar

const app = express();
const PORT =process.env.PORT || 3000;

dotenv.config();

// MongoDB bağlan
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB bağlantısı başarılı'))
  .catch(err => console.error('MongoDB bağlantı hatası:', err));

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//statik dosyaları sunma 
app.use(express.static(path.join(__dirname,'../frontend')));

//api endpointleri
app.get('/api',(req,res)=>{
    res.send('api çalışıyor!');
})
//login endpointi
app.post('/api/login',async (req,res)=>{
    const {email,password}=req.body;
    try{
        //kullanıcıyı veritabanında bulma
        const user =await User.findOne({email});

    
    //kullanıcı bulup doğrulama
    if (user&&user.password === password) {

        const token = jwt.sign(
            {email: user.email, name: user.name},//payload kullanıcı bilgileri
            'secretkey',//gizli anahtar
            {expiresIn:'1h'}//token süresi
        )
        res.json({ success: true, message: 'Giriş başarılı!', token, name: user.name });
     } else
        {
            res.status(401).json({success:false,message:'Giriş başarısız!'});
        }
    }
    catch (error) {
        console.error('Giriş hatası:', error);
        res.status(500).json({ success: false, message: 'Giriş hatası!' });
    }
    
})
const User =require('./models/User');
//Kayıt endpointi
app.post('/api/register',async (req,res)=>{
    const {name, email, password}=req.body;
    try{
        //kullanıcıyı veritabanına ekle
        const newUser= new User({name,email,password});
        await newUser.save();
    
        res.json({success:true,message:'Kayıt başarılı!'});
    }
    catch(error){
        console.error('Kayıt hatası:',error);
        res.status(500).json({success:false,message:'Kayıt hatası!'});
    }
})


app.get('/',(req,res)=>{
    res.send('File manager Web App çalışıyor');
});



app.listen(PORT,()=>{
    console.log(`Server bu portta çalışıyor ${PORT}`);
})



app.get('/api/protected',(req,res)=>{
    const token = req.headers['authorization'];
    if(!token){
        return res.status(401).json({success:false,message:'Token bulunamadı!'});
    }
    try {
        const decoded = jwt.verify(token,'secretkey');//token doğrulama
        res.json({success:true,message:'Token doğrulandı!',user:decoded});
    }
    catch (error) {
        res.status(401).json({success:false,message:'Token doğrulanamadı!'});
    }
})

const upload =multer({storage});

//dosya yükleme end pointi
app.post('/api/upload',upload.single('file'),async (req,res)=>{
        try {
            const file = req.file;
            const token =req.headers['authorization'];
            if (!file) {
                return res.status(400).json({ success: false, message: 'Dosya yüklenemedi!' });
            }
            if (!token) {
                return res.status(401).json({ success: false, message: 'Token bulunamadı!' });
            }

            const decoded=jwt.verify(token,'secretkey');//kullanıcı id sine göre token doğrulama
            const userId = decoded.id; //

            //dosya veritabanı kayıdı
            const newFile =new File({
                filename:file.filename,//dosya adı
                userId: userId, // Kullanıcı ID'si
            })
            await newFile.save();

            res.json({ success: true, message: 'Dosya yüklendi!', filePath: file.path });
        }
        catch (error) {
            console.error('Dosya yükleme hatası:', error);
            res.status(500).json({ success: false, message: 'Dosya yükleme hatası!' });
        }
});
//Dosya silme endpointi

app.delete('/api/delete', (req, res) => {
    const {filename}=req.body;

    if(!filename){
       alert('Dosya adı bulunamadı!');
        return res.status(400).json({success:false,message:'Dosya adı bulunamadı!'});
    }
    const filePath =path.join(__dirname,'uploads',filename);
    //dosyayı sil işlemi
    fs.unlink(filepath, (err) => {
        if (err) {
            console.error('Dosya silme hatası:', err);
            return res.status(500).json({ success: false, message: 'Dosya silme hatası!' });
        }
        res.json({ success: true, message: 'Dosya silindi!' });
    });
})

//Dosya listeleme endpointi
app.get('/api/files', async (req,res)=>{
    const token = req.headers['authorization'];

    if(!token) {
        return res.status(401).json({ success: false, message: 'Token bulunamadı!' });
    }
    try{
        const decoded=jwt.vertify(token,'secretkey');//kullanıcı id sine göre token doğrulama
        const userId = decoded.id; // Kullanıcı ID'si

        //kullanıcı dosyalarını listele
        const files=await File.find({userId: userId});//kullanıcı id sine göre dosyaları bul

        res.json({success:true,files:files});//dosyaları gönder
    }
    catch (error) {
        console.error('Dosya listeleme hatası:', error);
        res.status(500).json({ success: false, message: 'Dosya listeleme hatası!' });
    }


})

app.get('/login',(req ,res)=>{
    res.sendFile(path.join(__dirname,'../frontend','login.html'));

});

app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname,'../frontend','register.html'));

});