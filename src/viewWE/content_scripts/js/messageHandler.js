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
      view.enhancement.callInitialInteractionState(request);
      break;
    case "call addServerMarkup":
      view.enhancement.callAddServerMarkup(request);
      break;
    case "call setTaskId":
      view.setTaskId(request.taskId);
      break;
    case "call abort":
      view.enhancement.callAbort(request);
      break;
    case "call abortEnhancement":
      view.enhancement.abortEnhancement(request);
      break;
    case "call restoreToOriginal":
      view.enhancement.callRestoreToOriginal(request);
      break;
    case "call signOut":
      view.enhancement.signOutUser(request);
      break;
    case "call signIn":
      view.enhancement.signInUser(request);
  }
}

chrome.runtime.onMessage.addListener(processMessage);
