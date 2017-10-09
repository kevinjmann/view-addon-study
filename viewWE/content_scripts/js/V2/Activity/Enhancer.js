export default class Enhancer {
  constructor(activity, selections) {
    this.activity = activity;
    this.selections = selections;
  }

  start() {
    console.log(`Enhancing ${this.activity} with`, this.selections);
  }

  update(activity, selections) {
    this.activity = activity;
    this.selections = selections;
    this.start();
  }
}
