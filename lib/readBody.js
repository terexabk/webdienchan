function readBody(req) {
  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on('data', function (chunk) {
      chunks.push(chunk);
    });
    req.on('end', function () {
      resolve(Buffer.concat(chunks));
    });
    req.on('error', reject);
  });
}

async function getJsonBody(req) {
  const raw = req.body || await readBody(req);
  if (Buffer.isBuffer(raw)) {
    const str = raw.toString('utf8');
    if (!str) return {};
    try {
      return JSON.parse(str);
    } catch (e) {
      return {};
    }
  }
  return typeof raw === 'object' && raw !== null ? raw : {};
}

module.exports = { readBody, getJsonBody };
