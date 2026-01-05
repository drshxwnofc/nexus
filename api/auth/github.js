export default function handler(req, res) {
  const url =
    "https://github.com/login/oauth/authorize" +
    "?client_id=" + process.env.GITHUB_ID +
    "&scope=read:user";

  res.redirect(url);
}
