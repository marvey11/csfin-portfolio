import { App } from "./app";
import { Config } from "./config";

new Config().load().then((config) => {
  new App(config).run();
});
