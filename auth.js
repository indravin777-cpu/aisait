// Simple client-side auth using localStorage
// NOTE: THIS IS FOR DEMONSTRATION ONLY – NEVER STORE PLAIN PASSWORDS IN PRODUCTION

// URL сервера: автоматически определяется (localhost при разработке, реальный домен при публикации)
const API_URL = window.location.origin;
let cooldownTimer = null;

async function sendVerificationCode(email, buttonId) {
  const btn = document.getElementById(buttonId);
  btn.disabled = true;

  try {
    const response = await fetch(`${API_URL}/send-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    if (response.ok) {
      startCooldown(btn, 60); // 60 seconds cooldown
    } else {
      alert(data.error || 'Ошибка при отправке кода');
      btn.disabled = false;
    }
  } catch (error) {
    console.error(error);
    alert('Не удалось связаться с сервером. Убедитесь, что сервер запущен.');
    btn.disabled = false;
  }
}

function startCooldown(btn, seconds) {
  let timeLeft = seconds;
  btn.innerText = `Повторить через ${timeLeft}с`;
  
  cooldownTimer = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(cooldownTimer);
      btn.innerText = 'Отправить код на почту';
      btn.disabled = false;
    } else {
      btn.innerText = `Повторить через ${timeLeft}с`;
    }
  }, 1000);
}

async function verifyCode(email, code) {
  try {
    const response = await fetch(`${API_URL}/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code })
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || 'Неверный код');
      return false;
    }
    return true;
  } catch (error) {
    console.error(error);
    alert('Не удалось проверить код.');
    return false;
  }
}

// Register a new user
async function register(username, password, email, code) {
  username = username.trim();
  email = email.trim();
  
  if (!username || !password || !email || !code) {
    alert('Заполните все поля, включая код подтверждения');
    return;
  }

  // Check if user already exists
  if (localStorage.getItem('user_' + username)) {
    alert('Пользователь уже существует');
    return;
  }

  const isValid = await verifyCode(email, code);
  if (!isValid) return;

  // Store user data
  localStorage.setItem('user_' + username, JSON.stringify({ password, email }));
  // Mark as logged in
  localStorage.setItem('currentUser', username);
  
  window.location.href = 'index.html'; // Redirect to main page
}

// Login an existing user
function login(username, password) {
  username = username.trim();

  if (!username || !password) {
    alert('Введите логин и пароль');
    return;
  }

  const storedStr = localStorage.getItem('user_' + username);
  if (!storedStr) {
    alert('Неверные имя пользователя или пароль');
    return;
  }

  try {
    const stored = JSON.parse(storedStr);
    if (stored.password === password) {
      // Mark as logged in
      localStorage.setItem('currentUser', username);
      window.location.href = 'index.html'; // Redirect to main page
    } else {
      alert('Неверные данные для входа');
    }
  } catch(e) {
    alert('Ошибка данных пользователя');
  }
}

function showLogin() {
  document.getElementById('registerContainer').style.display = 'none';
  document.getElementById('loginContainer').style.display = 'block';
}

function showRegister() {
  document.getElementById('loginContainer').style.display = 'none';
  document.getElementById('registerContainer').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', () => {
  // --- Регистрация ---
  document.getElementById('sendRegCodeBtn').addEventListener('click', () => {
    const email = document.getElementById('regEmail').value.trim();
    if (!email || !email.endsWith('@gmail.com')) {
      alert('Пожалуйста, введите корректный адрес @gmail.com');
      return;
    }
    sendVerificationCode(email, 'sendRegCodeBtn');
    
    // Показываем поле для ввода кода и кнопку регистрации
    document.getElementById('regCodeWrapper').classList.remove('hidden');
    document.getElementById('regCodeWrapper').classList.add('visible');
    document.getElementById('registerBtn').classList.remove('hidden');
    document.getElementById('registerBtn').classList.add('visible');
  });

  document.getElementById('registerBtn').addEventListener('click', () => {
    const u = document.getElementById('regUsername').value;
    const p = document.getElementById('regPassword').value;
    const e = document.getElementById('regEmail').value;
    const c = document.getElementById('regCode').value.trim();
    register(u, p, e, c);
  });

  // --- Вход ---
  document.getElementById('loginBtn').addEventListener('click', () => {
    const u = document.getElementById('loginUsername').value;
    const p = document.getElementById('loginPassword').value;
    login(u, p);
  });

  // Переключение вкладок
  document.getElementById('toLogin').addEventListener('click', showLogin);
  document.getElementById('toRegister').addEventListener('click', showRegister);
});
