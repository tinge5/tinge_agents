const fs = require("fs");

const file = "dist/index.html";

let html = fs.readFileSync(file, "utf8");

html = html.replace(
  '</head>',
  '<link rel="apple-touch-icon" href="/favicons.ico"></head>'
);

fs.writeFileSync(file, html);

console.log("Apple Touch Icon added");