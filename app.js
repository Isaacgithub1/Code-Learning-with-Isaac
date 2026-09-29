// ==================== STATE ====================
let currentUser = null;

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  let users = JSON.parse(localStorage.getItem('cli_users') || '[]');
  
  if (!users.find(u => u.email === 'admin@isaac.com')) {
    users.push({
      name: 'Isaac Admin',
      email: 'admin@isaac.com',
      password: 'admin123',
      role: 'admin'
    });
  }
  if (!users.find(u => u.email === 'student@isaac.com')) {
    users.push({
      name: 'Demo Student',
      email: 'student@isaac.com',
      password: '123456',
      role: 'user'
    });
  }
  localStorage.setItem('cli_users', JSON.stringify(users));

  const saved = localStorage.getItem('cli_current_user');
  if (saved) {
    currentUser = JSON.parse(saved);
    updateNavbar();
  }

  showSection('home');
});

// ==================== THEME ====================
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('light');
  toggle.textContent = document.body.classList.contains('light') ? '☀️' : '🌙';
});

// ==================== NAVIGATION ====================
function showSection(id) {
  if (id === 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Access denied. Admins only.');
      showSection('login');
      return;
    }
    renderAdmin();
  }

  if (id === 'dashboard') {
    if (!currentUser) {
      alert('Please login first.');
      showSection('login');
      return;
    }
    document.getElementById('user-name').textContent = currentUser.name;
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== AUTH ====================
function toggleAuth() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const title = document.getElementById('auth-title');
  const subtitle = document.getElementById('auth-subtitle');
  const toggleText = document.getElementById('auth-toggle-text');

  if (loginForm.style.display === 'none') {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    title.textContent = 'Welcome Back';
    subtitle.textContent = 'Login to continue your learning journey';
    toggleText.innerHTML = `Don't have an account? <a href="#" onclick="toggleAuth()">Register</a>`;
  } else {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    title.textContent = 'Create Account';
    subtitle.textContent = 'Join Code Learning with Isaac today';
    toggleText.innerHTML = `Already have an account? <a href="#" onclick="toggleAuth()">Login</a>`;
  }
}

function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const password = document.getElementById('reg-password').value;

  let users = JSON.parse(localStorage.getItem('cli_users') || '[]');

  if (users.find(u => u.email === email)) {
    alert('Email already registered!');
    return;
  }

  users.push({ name, email, password, role: 'user' });
  localStorage.setItem('cli_users', JSON.stringify(users));

  alert('Account created successfully! Please login.');
  toggleAuth();
  document.getElementById('login-email').value = email;
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('cli_users') || '[]');
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    alert('Invalid email or password');
    return;
  }

  currentUser = user;
  localStorage.setItem('cli_current_user', JSON.stringify(user));
  updateNavbar();
  
  if (user.role === 'admin') {
    showSection('admin');
  } else {
    showSection('dashboard');
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('cli_current_user');
  updateNavbar();
  showSection('home');
}

function updateNavbar() {
  const loginLink = document.getElementById('login-link');
  const logoutLink = document.getElementById('logout-link');
  const dashboardLink = document.getElementById('dashboard-link');
  const adminLink = document.getElementById('admin-link');

  if (currentUser) {
    loginLink.style.display = 'none';
    logoutLink.style.display = 'inline-block';
    dashboardLink.style.display = 'inline-block';
    adminLink.style.display = currentUser.role === 'admin' ? 'inline-block' : 'none';
  } else {
    loginLink.style.display = 'inline-block';
    logoutLink.style.display = 'none';
    dashboardLink.style.display = 'none';
    adminLink.style.display = 'none';
  }
}

// ==================== ADMIN ====================
function renderAdmin() {
  const users = JSON.parse(localStorage.getItem('cli_users') || '[]');
  document.getElementById('total-users').textContent = users.length;

  let html = `
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
        </tr>
      </thead>
      <tbody>
  `;

  users.forEach(u => {
    html += `
      <tr>
        <td>${u.name}</td>
        <td>${u.email}</td>
        <td>${u.role}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  document.getElementById('users-table').innerHTML = html;
}

function clearAllUsers() {
  if (confirm('Are you sure you want to delete all users? This cannot be undone.')) {
    const admin = {
      name: 'Isaac Admin',
      email: 'admin@isaac.com',
      password: 'admin123',
      role: 'admin'
    };
    localStorage.setItem('cli_users', JSON.stringify([admin]));
    renderAdmin();
    alert('All users cleared (admin kept).');
  }
}

// ==================== CODEMIRROR ====================
const editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
  lineNumbers: true,
  theme: 'dracula',
  mode: 'python',
  indentUnit: 4,
});

document.getElementById('lang-select').addEventListener('change', function () {
  const modeMap = {
    python: 'python',
    sql: 'sql',
    c: 'text/x-csrc',
    cpp: 'text/x-c++src'
  };
  editor.setOption('mode', modeMap[this.value]);
});

function runCode() {
  const lang = document.getElementById('lang-select').value;
  const code = editor.getValue();
  const output = document.getElementById('output');

  output.textContent = `// Running ${lang}...\n\n`;

  if (lang === 'python' && code.includes('print')) {
    const match = code.match(/print\((['"`])(.*?)\1\)/);
    output.textContent += match ? match[2] : "Hello from Python (simulated)";
  } else if (lang === 'sql') {
    output.textContent += "Query executed successfully (simulated)\n\nid | name\n1  | Alice\n2  | Bob";
  } else {
    output.textContent += "Code execution requires a backend service.\nYou can later connect Judge0 or Piston API.";
  }
}

function clearEditor() {
  editor.setValue('');
  document.getElementById('output').textContent = 'Output will appear here...';
}

// ==================== LESSONS ====================
const lessons = {
  python: {
    1: `
      <h2>1. Introduction & Variables</h2>
      <p>Python is a high-level, interpreted language famous for its simple and readable syntax.</p>
      <h3>Hello World</h3>
      <pre><code class="language-python">print("Hello, World!")</code></pre>
      <h3>Variables</h3>
      <pre><code class="language-python">name = "Alice"
age = 25
height = 1.75
is_student = True

print(name, age)</code></pre>
    `,
    2: `
      <h2>2. Data Types & Operators</h2>
      <p>Common types: int, float, str, bool, list, dict, tuple, set</p>
      <pre><code class="language-python">x = 10
y = 3
print(x + y)    # 13
print(x / y)    # 3.333
print(x // y)   # 3
print(x % y)    # 1
print(x ** y)   # 1000</code></pre>
    `,
    3: `<h2>3. If-Else & Loops</h2><p>Lesson content coming soon...</p>`,
    4: `<h2>4. Functions</h2><p>Lesson content coming soon...</p>`,
    5: `<h2>5. Lists & Dictionaries</h2><p>Lesson content coming soon...</p>`
  },
  sql: {
    1: `
      <h2>1. Introduction to SQL</h2>
      <p>SQL is used to communicate with relational databases.</p>
      <pre><code class="language-sql">SELECT * FROM users;</code></pre>
    `,
    2: `
      <h2>2. SELECT & WHERE</h2>
      <pre><code class="language-sql">SELECT name, age 
FROM students 
WHERE age > 18
ORDER BY name;</code></pre>
    `,
    3: `<h2>3. JOINs</h2><p>Lesson content coming soon...</p>`,
    4: `<h2>4. Aggregate Functions</h2><p>Lesson content coming soon...</p>`,
    5: `<h2>5. CREATE & INSERT</h2><p>Lesson content coming soon...</p>`
  },
  c: {
    1: `
      <h2>1. Basics & Hello World</h2>
      <pre><code class="language-c">#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}</code></pre>
    `,
    2: `<h2>2. Variables & Data Types</h2><p>Lesson content coming soon...</p>`,
    3: `<h2>3. Control Flow</h2><p>Lesson content coming soon...</p>`,
    4: `<h2>4. Functions & Arrays</h2><p>Lesson content coming soon...</p>`,
    5: `<h2>5. Pointers Intro</h2><p>Lesson content coming soon...</p>`
  },
  cpp: {
    1: `
      <h2>1. C++ Basics</h2>
      <pre><code class="language-cpp">#include <iostream>
using namespace std;

int main() {
    cout << "Hello, C++!" << endl;
    return 0;
}</code></pre>
    `,
    2: `<h2>2. Classes & Objects</h2><p>Lesson content coming soon...</p>`,
    3: `<h2>3. Inheritance</h2><p>Lesson content coming soon...</p>`,
    4: `<h2>4. STL Vectors & Maps</h2><p>Lesson content coming soon...</p>`,
    5: `<h2>5. File Handling</h2><p>Lesson content coming soon...</p>`
  }
};

function loadLesson(lang, num) {
  const content = document.getElementById(`${lang}-content`);
  content.innerHTML = lessons[lang][num] || `<p>Lesson ${num} coming soon...</p>`;
  content.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}
