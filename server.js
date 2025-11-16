import app from "./app.js";
import http from "http";

const server = http.createServer(app);

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
