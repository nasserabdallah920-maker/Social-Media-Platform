const app = require("./app");
const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
  console.log(`the server is running at port ${port}`);
});
