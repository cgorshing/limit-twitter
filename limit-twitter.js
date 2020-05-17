'use strict';

let maxTime = 30 * 60 * 1000

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

  // TODO Callback that time has expired
  // Show dialog warning of redirect in 30 seconds
  alert(`Hey there - you have gone passed your budgeted amount for time on "the twitters"`);

  if (window.confirm(`Hey there - you have gone passed your budgeted amount for time on "the twitters".

  Click OK to go to Pocket now, otherwise we'll give ya 10 seconds.`)) {
    redirectToApp();
  }
  else {
    setTimeout(() => {
      redirectToApp();
    }, 10000);
  }
}

let timeRetreived = (timeSpent) => {
  if (timeSpent == undefined || timeSpent == null) timeSpent = 0;

  console.log(`timeSpent=${timeSpent}`);
  if (timeSpent >= maxTime) {
    redirectToApp();
  }
  else {
    timeoutID = setTimeout(maxTimeExpired, maxTime - timeSpent);
  }
}

let visibilityChangeEvent = (e = null) => {
  //https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  if (document.visibilityState === 'visible') {
    startedTime = Date.now();
    let gettingItem = browser.storage.local.get(storage_get_arg);

    gettingItem.then((result) => {
      timeRetreived(result.time_spent);
    });
  }
  else {
    storeTimeSpent();
  }
}
document.addEventListener("visibilitychange", visibilityChangeEvent, true);

let storeTimeSpent = () => {
  if (startedTime != null) {
    let gettingItem = browser.storage.local.get(storage_get_arg);

    let timeSpent = 0;

    gettingItem.then((result) => {
      if (result.time_spent != undefined && result.time_spent != null) {
        timeSpent = result.time_spent;
      }

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

window.addEventListener('beforeunload', function (e) {
  storeTimeSpent();
});

visibilityChangeEvent();
