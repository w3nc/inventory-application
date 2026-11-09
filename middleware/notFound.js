// 404 handler: shown when no route matched.
function notFound(req, res) {
  res.status(404).render("error", {
    title: "Not found",
    status: 404,
    message: "That shelf does not exist in this cellar.",
    isAdmin: res.locals.isAdmin
  });
}

module.exports = notFound;
