/**
 * Processes all messages received from background.js.
 * Sends requests to backround.js or handles requests here.
 */
function processMessage(request) {
  switch (request.msg) {
    case "toggle toolbar":
      view.interaction.toggleToolbar(request);
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
    case "call startToEnhance":
      view.startToEnhance();
      break;
    case "call initialInteractionState":
      view.interaction.callInitialInteractionState(request);
      break;
    case "call addServerMarkup":
      view.interaction.callAddServerMarkup(request);
      break;
    case "call setTaskId":
      view.setTaskId(request.taskId);
      break;
    case "call showPerformance":
      view.feedbacker.showPerformance(request.performanceData);
      break;
    case "call showAllTasks":
      view.statisticsMenu.showAllTasks(request.tasksData);
      break;
    case "call showTask":
      view.statisticsMenu.showTask(request.performancesData);
      break;
    case "call abort":
      view.interaction.callAbort(request);
      break;
    case "call abortEnhancement":
      view.interaction.abortEnhancement(request);
      break;
    case "call restoreToOriginal":
      view.interaction.callRestoreToOriginal(request);
      break;
    case "call signOut":
      view.signOutUser(request);
      break;
    case "call signIn":
      view.signInUser(request);
  }
}

chrome.runtime.onMessage.addListener(processMessage);
