import express from 'express';
import multer from 'multer';

import dotenv from 'dotenv';

import mongoose from 'mongoose';

import { registrationValidation, loginValidation, postCreateValidation } from './validation.js';

import { UserController, postController } from './controllers/index.js';

import { handleValidationErrors, checkAuth } from './utils/index.js';

dotenv.config();


mongoose.connect(process.env.MONGO_URI, )
.then(() => console.log('DB CONNECTED'))
.catch((err) => console.log('DB CONNECTION ERROR', err));


const app = express();

const storage = multer.diskStorage({
    destination: (_, __, cb) => {
        cb(null, 'uploads');
    },
    filename: (_, file, cb) => {
        cb(null, file.originalname);
    },
    });

const upload = multer({ storage });


app.use(express.json());
app.use('/uploads', express.static('uploads'));
    
app.post('/auth/login', loginValidation, handleValidationErrors, UserController.login);
app.post('/auth/registration', registrationValidation, handleValidationErrors, UserController.register); 
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
    res.json({
        url: `/uploads/${req.file.originalname}`,
    });
});

app.get('/posts', postController.getAll);
app.get('/posts/:id', postController.getOne);
app.post('/posts/', checkAuth, postCreateValidation, handleValidationErrors, postController.create);
app.delete('/posts/:id', checkAuth,postController.remove);
app.patch('/posts/:id', checkAuth, postCreateValidation, handleValidationErrors, postController.update);


const PORT = process.env.PORT || 4444;
app.listen(PORT, (err) => {
    if (err) {
        return console.log(err);
    }

    console.log('SERVER UP');
});