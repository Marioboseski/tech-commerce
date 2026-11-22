import { app } from "./app.js";

// Only starts the server. The app itself is built in app.ts, so tests can
// use it without opening a port.
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
