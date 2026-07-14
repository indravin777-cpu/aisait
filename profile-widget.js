document.addEventListener('DOMContentLoaded', () => {
  const currentUser = localStorage.getItem('currentUser');
  const loginRedirectBtn = document.getElementById('loginRedirectBtn');
  const islandBtn = document.getElementById('islandBtn');
  const islandNickname = document.getElementById('islandNickname');
  const islandAvatar = document.getElementById('islandAvatar');
  
  // Элементы сайдбара
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const closeSidebarBtn = document.getElementById('closeSidebarBtn');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // 1. ПРИМЕНЕНИЕ НАСТРОЕК (ТЕМА И ЦВЕТ) ПРИ ЗАГРУЗКЕ
  applySavedSettings();

  // Если не авторизован - показываем кнопку входа
  if (!currentUser) {
    if(loginRedirectBtn) loginRedirectBtn.style.display = 'inline-block';
    if(islandBtn) islandBtn.style.display = 'none';
    return; // Останавливаем логику профиля
  }

  // Если авторизован
  if(loginRedirectBtn) loginRedirectBtn.style.display = 'none';
  if(islandBtn) {
    islandBtn.style.display = 'flex';
    updateProfileDisplay(currentUser);
  }

  // 2. ОТКРЫТИЕ И ЗАКРЫТИЕ САЙДБАРА
  function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
  }
  
  function closeSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
  }

  islandBtn.addEventListener('click', openSidebar);
  closeSidebarBtn.addEventListener('click', closeSidebar);
  sidebarOverlay.addEventListener('click', closeSidebar);

  // 3. ПЕРЕКЛЮЧЕНИЕ ЭКРАНОВ САЙДБАРА
  const navBtns = document.querySelectorAll('.nav-btn');
  const sidebarViews = document.querySelectorAll('.sidebar-view');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Скрываем все экраны
      sidebarViews.forEach(view => view.classList.remove('active'));
      
      // Показываем целевой экран
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // 4. СМЕНА АВАТАРА (со сжатием)
  const avatarUpload = document.getElementById('avatarUpload');
  avatarUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) { height *= maxSize / width; width = maxSize; }
        } else {
          if (height > maxSize) { width *= maxSize / height; height = maxSize; }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        let userData = JSON.parse(localStorage.getItem('user_' + currentUser) || '{}');
        userData.avatar = dataUrl;
        localStorage.setItem('user_' + currentUser, JSON.stringify(userData));
        
        updateProfileDisplay(currentUser);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  });

  // 5. СМЕНА НИКНЕЙМА (раз в 3 дня)
  const saveNicknameBtn = document.getElementById('saveNicknameBtn');
  const newNicknameInput = document.getElementById('newNicknameInput');
  const nicknameMsg = document.getElementById('nicknameMsg');

  saveNicknameBtn.addEventListener('click', () => {
    const newName = newNicknameInput.value.trim();
    if (!newName) return;

    let userData = JSON.parse(localStorage.getItem('user_' + currentUser) || '{}');
    const now = Date.now();
    const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
    
    if (userData.lastNicknameChange && (now - userData.lastNicknameChange) < THREE_DAYS) {
      const remainingMs = THREE_DAYS - (now - userData.lastNicknameChange);
      const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      nicknameMsg.innerText = `Ник можно менять раз в 3 дня. Осталось дней: ${remainingDays}`;
      return;
    }

    userData.lastNicknameChange = now;
    localStorage.setItem('user_' + newName, JSON.stringify(userData));
    localStorage.removeItem('user_' + currentUser);
    localStorage.setItem('currentUser', newName); 
    
    window.location.reload();
  });

  // 6. ВЫБОР ЦВЕТА
  const colorCircles = document.querySelectorAll('.color-circle');
  colorCircles.forEach(circle => {
    circle.addEventListener('click', () => {
      const accent = circle.getAttribute('data-color');
      const hover = circle.getAttribute('data-hover');
      
      localStorage.setItem('theme_accent', accent);
      localStorage.setItem('theme_hover', hover);
      
      applySavedSettings();
      
      colorCircles.forEach(c => c.classList.remove('active'));
      circle.classList.add('active');
    });
  });

  // 7. ПЕРЕКЛЮЧЕНИЕ ТЕМЫ
  const toggleThemeBtn = document.getElementById('toggleThemeBtn');
  toggleThemeBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('theme_isLight', isLight ? 'true' : 'false');
  });

  // 8. ВЫХОД
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    window.location.reload();
  });

  // -- Вспомогательная функция --
  function updateProfileDisplay(username) {
    islandNickname.innerText = username;
    
    let userData = JSON.parse(localStorage.getItem('user_' + username) || '{}');
    if (userData.avatar) {
      islandAvatar.innerHTML = `<img src="${userData.avatar}" alt="avatar">`;
    } else {
      islandAvatar.innerHTML = username.charAt(0).toUpperCase();
    }
  }
});

// ГЛОБАЛЬНАЯ ФУНКЦИЯ ПРИМЕНЕНИЯ ТЕМЫ
function applySavedSettings() {
  const accent = localStorage.getItem('theme_accent');
  const hover = localStorage.getItem('theme_hover');
  const isLight = localStorage.getItem('theme_isLight');
  
  if (accent && hover) {
    document.documentElement.style.setProperty('--accent', accent);
    document.documentElement.style.setProperty('--accent-hover', hover);
  }
  
  if (isLight === 'true') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
}

applySavedSettings();
