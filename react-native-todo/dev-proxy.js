// Dev-only CORS proxy so the Expo *web* preview (localhost:8081) can call the
// existing Express API (localhost:5000) without modifying server/index.js.
// Native iOS/Android builds do not need this.
//   node dev-proxy.js   ->  listens on :5001, forwards to :5000
const http = require('http');

const TARGET_PORT = Number(process.env.API_PORT || 5000);
const PORT = Number(process.env.PROXY_PORT || 5001);

http
  .createServer((req, res) => {
    const origin = req.headers.origin || 'http://localhost:8081';
    const cors = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,DELETE,OPTIONS',
    };
    if (req.method === 'OPTIONS') {
      res.writeHead(204, cors);
      res.end();
      return;
    }
    const upstream = http.request(
      { host: '127.0.0.1', port: TARGET_PORT, path: req.url, method: req.method, headers: req.headers },
      (up) => {
        res.writeHead(up.statusCode || 502, { ...up.headers, ...cors });
        up.pipe(res);
      },
    );
    upstream.on('error', () => {
      res.writeHead(502, cors);
      res.end(JSON.stringify({ error: 'API not reachable on port ' + TARGET_PORT }));
    });
    req.pipe(upstream);
  })
  .listen(PORT, () => console.log(`CORS dev proxy on http://localhost:${PORT} -> :${TARGET_PORT}`));
