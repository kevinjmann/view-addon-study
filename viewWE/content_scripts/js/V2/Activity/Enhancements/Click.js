export default class Click {
  construct() {
    console.log('constructing click');
    this.allEnhancements = document.querySelectorAll('viewEnhancement');
    for (const enhancement in this.allEnhancements) {
      enhancement.classList.add('view-click');
      enhancement.onclick = () => {
        enhancement.classList.add('view-click-wrong');
      };
    }
  }

  enhance(node) {
    node.onclick = () => {
      node.classList.add('view-click-correct');
    };
  }

  clear(node) {
  }

  destroy() {
    for (const enhancement in this.allEnhancements) {
      enhancement.onclick = undefined;
      enhancement.classList.remove('view-click-wrong', 'view-click-correct', 'view-click');
    }
  }
}
