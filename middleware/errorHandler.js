// Catches anything that breaks, so the person sees a page and not a wall of text.
// Express knows this is an error handler because it takes four arguments.
function errorHandler(err, req, res, next) {
  console.error(err);

  const status = err.status || 500;
  res.status(status).render("error", {
    title: "Something went wrong",
    status,
    message:
      status === 500
        ? "Something inside the cellar broke. Try again in a moment."
        : err.message,
    isAdmin: res.locals.isAdmin
  });
}

module.exports = errorHandler;
