const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const handleSignup = require('./auth/signup');
const handleSignin = require('./auth/signin');
const connection = require('./connection');

// In-memory sessions
const sessions = {};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cookies = Object.fromEntries((req.headers.cookie || '').split('; ').map(c => c.split('=')));
  const sessionId = cookies.sessionId;
  const session = sessions[sessionId];
  const userId = session?.id;
  const username = session?.username;

  // Serve CSS
  if (req.method === 'GET' && req.url === '/style.css') {
    const cssPath = path.join(__dirname, 'public', 'style.css');
    return fs.readFile(cssPath, (err, data) => {
      if (err) return res.end('CSS load error');
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(data);
    });
  }

  // Routes
  if (url.pathname === '/signup') return handleSignup(req, res, url);
  if (url.pathname === '/signin') return handleSignin(req, res, url, sessions);
  if (url.pathname === '/todos') {
    if (!userId) {
      res.writeHead(302, { Location: '/signin' });
      return res.end();
    }

    connection.query('SELECT * FROM todos WHERE user_id = ?', [userId], (err, todos) => {
        if (err) return res.end('Error loading todos');
        const list = todos.map(todo => `
          <li>
            <span class="${todo.completed ? 'completed' : ''}">${todo.title}</span>
            <div class="actions">
            <a href="/complete?id=${todo.id}" class="btn complete">Complete</a>
            <a href="/delete?id=${todo.id}" class="btn delete">Delete</a>
            </div>
          </li>
        `).join('');
        res.end(`
          <html><head><link rel="stylesheet" href="/style.css"></head><body>
          <h2>Welcome, ${username}!</h2>
          <h3>Your Todo List</h3>
          <form method="POST" action="/add">
            <input type="text" name="title" placeholder="New task..." required />
            <input type="submit" value="Add" />
          </form>
          <ul>${list}</ul>
          <a href="/logout" class="btn logout">Logout</a>
          </body></html>
        `);
      });
      return;
  }
// === Add Todo ===
if (req.method === 'POST' && url.pathname === '/add') {
    if (!userId) return res.end('Login required');
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { title } = qs.parse(body);
      const sql = 'INSERT INTO todos (user_id, title) VALUES (?, ?)';
      connection.query(sql, [userId, title], () => {
        res.writeHead(302, { Location: '/todos' });
        res.end();
      });
    });
    return;
  }

  // === Complete Todo ===
  if (req.method === 'GET' && url.pathname === '/complete') {
    const id = url.searchParams.get('id');
    connection.query('UPDATE todos SET completed = 1 WHERE id = ? AND user_id = ?', [id, userId], () => {
      res.writeHead(302, { Location: '/todos' });
      res.end();
    });
    return;
  }

  // === Delete Todo ===
  if (req.method === 'GET' && url.pathname === '/delete') {
    const id = url.searchParams.get('id');
    connection.query('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, userId], () => {
      res.writeHead(302, { Location: '/todos' });
      res.end();
    });
    return;
  }

  // === Logout ===
  if (req.method === 'GET' && url.pathname === '/logout') {
    delete sessions[sessionId];
    res.writeHead(302, {
      'Set-Cookie': `sessionId=; Max-Age=0`,
      'Location': '/signin'
    });
    res.end();
    return;
  }

  // === 404 fallback ===
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});