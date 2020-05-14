'use strict';

// let maxTime = 1 * 60 * 1000
let maxTime = 10 * 1000

let timeoutID = -1;

/* generic error handler */
function onError(error) {
  console.log(error);
}

// TODO WHEN YOU JUST CLOSE THE TAB, THESE EVENTS DON'T FIRE!!!!!!
// FIX THAT NEXT ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

let startedTime = Date.now();

let maxTimeExpired = () => {
  storeTimeSpent();

  // TODO Callback that time has expired
  // Show dialog warning of redirect in 30 seconds
  alert(`Hey there - you have gone passed your budgeted amount for time on "the twitters"`);

  if (window.confirm(`Hey there - you have gone passed your budgeted amount for time on "the twitters".

  Click OK to go to Pocket now, otherwise we'll give ya 10 seconds.`)) {
    location.assign('https://app.getpocket.com/');
  }
  else {
    setTimeout(() => {
      location.assign('https://app.getpocket.com/');
    }, 10000);
  }
}

let timeRetreived = (timeSpent) => {
  console.log(`time_spent retreived=${timeSpent}`);

  if (timeSpent == undefined || timeSpent == null) timeSpent = 0;

  console.log(`timeSpent=${timeSpent}`);
  if (timeSpent >= maxTime) {
    // console.log('Should be redirecting now, but you have it commented out');
    location.assign('https://app.getpocket.com/');
  }
  else {
    timeoutID = setTimeout(maxTimeExpired, maxTime - timeSpent);
  }
}

let visibilityChangeEvent = (e) => {
  // console.log(`event fired ${e} ${startedTime}`);

  //https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  if (document.visibilityState === 'visible') {
    console.log(`Visible!`);
    startedTime = Date.now();
    // TODO Start the timer of "now" + time left for the day (or time left in the day)
    // TODO How will we handle changing crossing over midnight
    // TODO How will we handle chaning timezones?

    let gettingItem = browser.storage.local.get({
      on_date: today(),
      time_spent: 0
    });

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
  // console.log(`NOT Visible! ${startedTime} ${startedTime != null}`);
  if (startedTime != null) {
    let gettingItem = browser.storage.local.get({
      on_date: today(),
      time_spent: 0
    });

    let timeSpent = 0;

    gettingItem.then((result) => {
      if (result.time_spent != undefined && result.time_spent != null) {
        timeSpent = result.time_spent;
      }

      console.log(`store off=${timeSpent + (Date.now() - startedTime)}`);

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

visibilityChangeEvent(null);
