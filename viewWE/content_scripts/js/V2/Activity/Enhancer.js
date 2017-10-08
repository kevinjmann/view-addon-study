export default class Enhancer {
  constructor(enhancementName) {
    console.log('creating enhancement for', enhancementName);
  }

  enhance(selections) {
    console.log('Enhancing with', selections);
  }

  update(selections) {
    console.log('updating enhancements with', selections);
  }
}
