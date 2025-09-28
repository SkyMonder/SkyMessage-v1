let currentUser = null;
let currentChatUserId = null;

// Регистрация
async function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if(data.error) return showAuthMsg(data.error);
  loginUser(data);
}

// Логин
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if(data.error) return showAuthMsg(data.error);
  loginUser(data);
}

function loginUser(user) {
  currentUser = user;
  document.getElementById("auth").style.display = 'none';
  document.getElementById("chat-ui").style.display = 'block';
}

// Сообщение об ошибке
function showAuthMsg(msg) {
  document.getElementById("auth-msg").innerText = msg;
}

// Выход
function logout() {
  currentUser = null;
  currentChatUserId = null;
  document.getElementById("auth").style.display = 'block';
  document.getElementById("chat-ui").style.display = 'none';
}

// Поиск пользователей
async function searchUser() {
  const query = document.getElementById("search-input").value;
  const res = await fetch(`/api/users?search=${encodeURIComponent(query)}`);
  const users = await res.json();
  
  const resultsDiv = document.getElementById("search-results");
  resultsDiv.innerHTML = '';
  users.forEach(u => {
    const btn = document.createElement('button');
    btn.textContent = u.username;
    btn.onclick = () => openChat(u.id, u.username);
    resultsDiv.appendChild(btn);
  });
}

// Открытие чата
async function openChat(id, username) {
  currentChatUserId = id;
  document.getElementById("chat-with").textContent = username;
  await loadMessages();
}

// Отправка сообщения
async function sendMessage() {
  const msg = document.getElementById("msg-input").value;
  if(!msg || !currentChatUserId) return;
  await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: currentUser.id, to: currentChatUserId, text: msg })
  });
  document.getElementById("msg-input").value = '';
  await loadMessages();
}

// Загрузка сообщений
async function loadMessages() {
  if(!currentChatUserId) return;
  const res = await fetch(`/api/messages?user1=${currentUser.id}&user2=${currentChatUserId}`);
  const messages = await res.json();
  const chatDiv = document.getElementById("chat");
  chatDiv.innerHTML = '';
  messages.forEach(m => {
    const sender = m.from_user === currentUser.id ? 'Вы' : 'Собеседник';
    chatDiv.innerHTML += `<div><b>${sender}:</b> ${m.text}</div>`;
  });
}
