const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//const authRoutes = require('./auth');
const bodyParser = require('body-parser');
const path = require('path');
const events = require('events');

events.EventEmitter.defaultMaxListeners = 20; // Varsayılan limiti 20'ye çıkar

const app = express();
const PORT =process.env.PORT || 3000;

dotenv.config();
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
app.post('/api/login',(req,res)=>{
    const {email,password}=req.body;
    //kullanıcı doğrulama
    if (email=='husnuonde7@gmail.com'&& password=='686868'){
        res.json({success:true,message:'Giriş başarılı!'});
     } else
        {
            res.status(401).json({success:false,message:'Giriş başarısız!'});
        }
    
})
app.post('/api/register',(req,res)=>{
    const {name,email,password}=req.body;
    if(name&&email&&password){
        res.json({success:true,message:'Kayıt başarılı! '})
    }
    else{
        res.status(400).json({success:false,message:'Kayıt başarısız! Eksik alanlar var!'});
    }
})
app.get('/',(req,res)=>{
    res.send('File manager Web App çalışıyor');
});

app.listen(PORT,()=>{
    console.log(`Server bu portta çalışıyor ${PORT}`);
})