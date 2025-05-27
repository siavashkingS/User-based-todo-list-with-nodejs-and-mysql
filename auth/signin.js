const qs = require('querystring');
const connection = require('../connection');
const crypto = require('crypto');

function generateSessionId() {
  return crypto.randomBytes(16).toString('hex');
}

function handleSignin(req, res, url, sessions) {
  if (req.method === 'GET') {
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

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { identifier, password } = qs.parse(body);
      const sql = 'SELECT * FROM users WHERE (username = ? OR email = ?) AND password = ? LIMIT 1';
      connection.query(sql, [identifier, identifier, password], (err, results) => {
        if (err || results.length !== 1) {
          res.writeHead(401);
          return res.end('Invalid credentials');
        }
        const user = results[0];
        const sid = generateSessionId();
        sessions[sid] = { id: user.id, username: user.username };
        res.writeHead(302, {
          'Set-Cookie': `sessionId=${sid}`,
          'Location': '/todos'
        });
        res.end();
      });
    });
  }
}

module.exports = handleSignin;