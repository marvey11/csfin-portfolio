import { App } from "./app/index.js";
import { Config } from "./config/index.js";

new Config().load().then((config) => {
  new App(config).run();
});
