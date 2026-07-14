const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(cors());
app.use(express.json());

// Проверочный эндпоинт для Railway
app.get('/ping', (req, res) => {
  res.send('pong! Server is alive!');
});

app.use(express.static(path.join(__dirname))); // Serve auth.html and auth.js

// Временное хранилище кодов: { email: { code, expiresAt } }
const verificationCodes = {};

app.post('/send-code', (req, res) => {
  const { email } = req.body;
  
  if (!email || !email.endsWith('@gmail.com')) {
    return res.status(400).json({ error: 'Пожалуйста, используйте адрес @gmail.com' });
  }

  // Генерируем 6-значный код
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Сохраняем код, он действителен 5 минут
  verificationCodes[email] = {
    code: code,
    expiresAt: Date.now() + 5 * 60 * 1000 
  };

  // Создаем транспорт для отправки через Gmail
  const nodemailer = require('nodemailer');
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'zbswbw1@gmail.com',
      pass: process.env.EMAIL_PASS || 'xeykwpmubvdxyroj'
    }
  });

  const mailOptions = {
    from: 'zbswbw1@gmail.com',
    to: email,
    subject: 'Код подтверждения для регистрации',
    text: `Ваш код подтверждения: ${code}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Ошибка при отправке письма. Возможно, неверный пароль или требуется Пароль Приложения Google.' });
    }
    console.log('Письмо отправлено: ' + info.response);
    res.json({ success: true, message: 'Код отправлен на вашу почту!' });
  });
});

app.post('/verify-code', (req, res) => {
  const { email, code } = req.body;

  const record = verificationCodes[email];
  
  if (!record) {
    return res.status(400).json({ error: 'Код не был отправлен или истек срок его действия' });
  }
  
  if (Date.now() > record.expiresAt) {
    delete verificationCodes[email];
    return res.status(400).json({ error: 'Срок действия кода истек. Запросите новый' });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: 'Неверный код' });
  }

  // Если все верно, удаляем код из памяти, чтобы его нельзя было использовать дважды
  delete verificationCodes[email];
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
