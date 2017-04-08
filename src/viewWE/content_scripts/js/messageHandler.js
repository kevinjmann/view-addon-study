/**
 * Processes all messages received from background.js.
 * Sends requests to backround.js or handles requests here.
 */
function processMessage(request) {
  switch (request.msg) {
    case "toggle toolbar":
      view.toolbarIframe.toggle();
      break;
    case "toggle VIEW Menu":
      view.VIEWmenu.toggle();
      break;
    case "hide VIEW Menu":
      view.VIEWmenu.hide();
      break;
    case "call startToEnhance":
      view.startToEnhance();
      break;
    case "call initialInteractionState":
      view.enhancer.initialInteractionState();
      break;
    case "call addEnhancementMarkup":
      view.enhancer.addEnhancementMarkup(request.data);
      break;
    case "call setTaskId":
      view.setTaskId(request.taskId);
      break;
    case "call abort":
      view.enhancer.abort();
      break;
    case "call restoreToOriginal":
      view.enhancer.callRestoreToOriginal(request);
      break;
    case "call signOut":
      view.enhancer.signOutUser(request);
      break;
    case "call signIn":
      view.enhancer.signInUser(request);
  }
}

chrome.runtime.onMessage.addListener(processMessage);
