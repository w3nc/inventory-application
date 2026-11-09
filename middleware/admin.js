// Creating, editing and deleting is locked behind one shared admin password.
// The unlocked state lives in a signed-in session cookie for one browser.
const COOKIE_NAME = "cellar_admin";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "cellar";
}

function isUnlocked(req) {
  if (req.isAdmin) return true;
  return req.cookies && req.cookies[COOKIE_NAME] === adminPassword();
}

// Every page gets a flag, so the views know whether to show the buttons.
function exposeAdmin(req, res, next) {
  res.locals.isAdmin = isUnlocked(req);
  next();
}

// Blocks the action and sends the person to the unlock page instead.
function requireAdmin(req, res, next) {
  if (isUnlocked(req)) return next();

  const goBack = req.method === "GET" ? req.originalUrl : req.get("referer") || "/";
  return res.redirect(`/unlock?next=${encodeURIComponent(goBack)}`);
}

function unlock(req, res) {
  const typed = (req.body.password || "").trim();
  const nextPath = safeNext(req.body.next);

  if (typed === adminPassword()) {
    res.cookie(COOKIE_NAME, adminPassword(), {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000 // one hour of editing, then it asks again
    });
    return res.redirect(nextPath);
  }

  res.status(401).render("unlock", {
    title: "Unlock the ledger",
    next: nextPath,
    error: "That password is not right. Try again."
  });
}

function lock(req, res) {
  res.clearCookie(COOKIE_NAME);
  res.redirect("/");
}

// Only allow paths inside this site, never a full outside address.
function safeNext(value) {
  if (!value || typeof value !== "string") return "/";
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

module.exports = { exposeAdmin, requireAdmin, unlock, lock, isUnlocked };
