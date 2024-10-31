import app from "./app.js";

const APP_PORT = process.env.APP_PORT || 3000;

app.listen(APP_PORT, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Server is running on http://localhost:${APP_PORT}`);
  }
});
