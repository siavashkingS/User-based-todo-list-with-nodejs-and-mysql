const qs = require('querystring');
const connection = require('../connection');

function handleSignup(req, res, url) {
  if (req.method === 'GET') {
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

  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const { username, email, password } = qs.parse(body);
      const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
      connection.query(sql, [username, email, password], (err) => {
        if (err) {
          res.writeHead(500);
          return res.end('Signup failed');
        }
        res.writeHead(302, { Location: '/signin' });
        res.end();
      });
    });
  }
}

module.exports = handleSignup;