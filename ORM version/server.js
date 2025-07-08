const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const crypto = require('crypto');
const db = require('./models');
const { User, Todo, Sequelize } = db;

db.sequelize.sync(); // Sync models to DB

const sessions = {};

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cookies = Object.fromEntries((req.headers.cookie || '').split('; ').map(c => c.split('=')));
  const sessionId = cookies.sessionId;
  const session = sessions[sessionId];
  const userId = session?.id;
  const username = session?.username;

  // === Serve CSS ===
  if (req.method === 'GET' && req.url === '/style.css') {
    const cssPath = path.join(__dirname, 'public', 'style.css');
    return fs.readFile(cssPath, (err, data) => {
      if (err) return res.end('CSS load error');
      res.writeHead(200, { 'Content-Type': 'text/css' });
      return res.end(data);
    });
  }

  // === Signup ===
  if (req.method === 'GET' && url.pathname === '/signup') {
    return res.end(`
      <html><head><link rel="stylesheet" href="/style.css"></head><body>
      <h2>Sign Up</h2>
      <form method="POST" action="/signup">
        <input type="text" name="username" placeholder="Username" required />
        <input type="email" name="email" placeholder="Email" required />
        <input type="password" name="password" placeholder="Password" required />
        <input type="submit" value="Sign Up" />
      </form>
      <p>Already have an account? <a href="/signin">Sign In</a></p>
      </body></html>
    `);
  }

  if (req.method === 'POST' && url.pathname === '/signup') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { username, email, password } = qs.parse(body);
      User.create({ username, email, password })
        .then(() => {
          res.writeHead(302, { Location: '/signin' });
          res.end();
        });
    });
    return;
  }

  // === Signin ===
  if (req.method === 'GET' && url.pathname === '/signin') {
    return res.end(`
      <html><head><link rel="stylesheet" href="/style.css"></head><body>
      <h2>Sign In</h2>
      <form method="POST" action="/signin">
        <input type="text" name="identifier" placeholder="Email or Username" required />
        <input type="password" name="password" placeholder="Password" required />
        <input type="submit" value="Sign In" />
      </form>
      <p>Don't have an account? <a href="/signup">Sign Up</a></p>
      </body></html>
    `);
  }

  if (req.method === 'POST' && url.pathname === '/signin') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { identifier, password } = qs.parse(body);
      User.findOne({
        where: {
          [Sequelize.Op.and]: [
            { [Sequelize.Op.or]: [{ username: identifier }, { email: identifier }] },
            { password }
          ]
        }
      }).then(user => {
        if (!user) {
          res.writeHead(401);
          return res.end('Invalid credentials');
        }
        const sid = generateSessionId();
        sessions[sid] = { id: user.id, username: user.username };
        res.writeHead(302, {
          'Set-Cookie': `sessionId=${sid}`,
          'Location': '/todos'
        });
        res.end();
      });
    });
    return;
  }

  // === Todos (authenticated) ===
  if (req.method === 'GET' && url.pathname === '/todos') {
    if (!userId) {
      res.writeHead(302, { Location: '/signin' });
      return res.end();
    }
    Todo.findAll({ where: { user_id: userId } }).then(todos => {
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
        <h2>Welcome, ${username}! </h2>
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

  if (req.method === 'POST' && url.pathname === '/add') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { title } = qs.parse(body);
      Todo.create({ title, user_id: userId }).then(() => {
        res.writeHead(302, { Location: '/todos' });
        res.end();
      });
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/complete') {
    const id = url.searchParams.get('id');
    Todo.update({ completed: true }, {
      where: { id, user_id: userId }
    }).then(() => {
      res.writeHead(302, { Location: '/todos' });
      res.end();
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/delete') {
    const id = url.searchParams.get('id');
    Todo.destroy({ where: { id, user_id: userId } }).then(() => {
      res.writeHead(302, { Location: '/todos' });
      res.end();
    });
    return;
  }

  if (req.method === 'GET' && url.pathname === '/logout') {
    delete sessions[sessionId];
    res.writeHead(302, {
      'Set-Cookie': `sessionId=; Max-Age=0`,
      'Location': '/signin'
    });
    res.end();
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(3000, () => {
  console.log('✅ Sequelize-powered app running at http://localhost:3000');
});
