'use strict';

let maxTime = 30 * 60 * 1000
if(typeof chrome!=="undefined"){browser=chrome;}


let timeoutID = -1;

let storage_get_arg = () => {
  return {
    on_date: today(),
    time_spent: 0
  }
}

let redirectToApp = () => {
  location.assign('https://app.getpocket.com/');
}

/* generic error handler */
function onError(error) {
  console.log(error);
}

let startedTime = Date.now();

let maxTimeExpired = () => {
  storeTimeSpent();

  redirectToApp();
}

let timeRetreived = (timeSpent) => {
  if (timeSpent >= maxTime) {
    redirectToApp();
  }
  else {
    timeoutID = setTimeout(maxTimeExpired, maxTime - timeSpent);
  }
}

let resolveFromStorage = (result) => {
  if (result !== undefined && result !== null && result.on_date === today()) {
    return result.time_spent;
  }

  return 0;
}

let visibilityChangeEvent = (e = null) => {
  //https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  if (document.visibilityState === 'visible') {
    startedTime = Date.now();

    browser.storage.local.get(storage_get_arg(), (result) => {
      console.log("We pulled out1 %O", result);
      timeRetreived(resolveFromStorage(result));
    });
  }
  else {
    storeTimeSpent();
  }
}

let storeTimeSpent = () => {
  if (startedTime != null) {
    let timeSpent = 0;

    // Other tabs might have written to storage this new tab doesn't know about
    // So ... call "get"
    browser.storage.local.get(storage_get_arg(), (result) => {
      timeSpent = resolveFromStorage(result);


      browser.storage.local.set({
        on_date: today(),
        time_spent: timeSpent + (Date.now() - startedTime)
      });

      if (timeoutID != -1) clearTimeout(timeoutID);
    });
  }
}

function today() {
  let now = new Date(Date.now());
  let year = now.getFullYear();
  let month = ("" + (now.getMonth() + 1)).padStart(2, '0');
  let date = now.getDate();

  return `${year}-${month}-${date}`;
}

document.addEventListener("visibilitychange", visibilityChangeEvent, true);

window.addEventListener('beforeunload', function (e) {
  storeTimeSpent();
});

visibilityChangeEvent();
