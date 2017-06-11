/**
 * Processes all messages received from background.js.
 * Sends requests to backround.js or handles requests here.
 */
function processMessage(request) {
  switch (request.action) {
    case "toggleToolbar":
      view.toolbarIframe.toggle();
      break;
    case "toggleVIEWMenu":
      view.VIEWmenu.toggle();
      break;
    case "hideVIEWMenu":
      view.VIEWmenu.hide();
      break;
    case "toggleStatisticsMenu":
      view.statisticsMenu.toggle();
      break;
    case "hideStatisticsMenu":
      view.statisticsMenu.hide();
      break;
    case "removeFeedbackDialog":
      view.lib.removeDialog($("#view-feedback-dialog"));
      break;
    case "callStartToEnhance":
      view.startToEnhance();
      break;
    case "initialInteractionState":
      view.enhancer.initialInteractionState();
      break;
    case "addEnhancementMarkup":
      view.enhancer.addEnhancementMarkup(request.data);
      break;
    case "setTaskId":
      view.setTaskId(request.taskId);
      break;
    case "showFeedback":
      view.feedbacker.showFeedback(request.submissionResponseData);
      break;
    case "showAllTasks":
      view.statisticsMenu.showAllTasks(request.tasksData);
      break;
    case "showTask":
      view.statisticsMenu.showTask(request.performancesData);
      break;
    case "callAbort":
      view.enhancer.abort();
      break;
    case "callRestoreToOriginal":
      view.enhancer.restoreToOriginal();
      break;
    case "signOut":
      view.signOut();
      break;
    case "signIn":
      view.signIn(request);
  }
}

chrome.runtime.onMessage.addListener(processMessage);
