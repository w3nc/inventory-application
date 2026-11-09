// A tiny cookie reader, so the app needs no extra package for it.
function cookieReader(req, res, next) {
  const header = req.headers.cookie || "";
  const cookies = {};

  header.split(";").forEach((pair) => {
    const index = pair.indexOf("=");
    if (index === -1) return;
    const key = pair.slice(0, index).trim();
    const value = pair.slice(index + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
  });

  req.cookies = cookies;
  next();
}

module.exports = cookieReader;
