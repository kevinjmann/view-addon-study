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
    case "toggle statistics menu":
      view.statisticsMenu.toggle();
      break;
    case "hide statistics menu":
      view.statisticsMenu.hide();
      break;
    case "remove feedback dialog":
      view.lib.removeDialog($("#view-feedback-dialog"));
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
    case "call showFeedback":
      view.feedbacker.showFeedback(request.submissionResponseData);
      break;
    case "call showAllTasks":
      view.statisticsMenu.showAllTasks(request.tasksData);
      break;
    case "call showTask":
      view.statisticsMenu.showTask(request.performancesData);
      break;
    case "call abort":
      view.enhancer.abort();
      break;
    case "call restoreToOriginal":
      view.enhancer.restoreToOriginal();
      break;
    case "call signOut":
      view.signOutUser();
      break;
    case "call signIn":
      view.signInUser(request);
  }
}

chrome.runtime.onMessage.addListener(processMessage);
