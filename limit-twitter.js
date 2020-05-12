
let maxTime = 1 * 60 * 1000
let timeoutID = -1;

let timeSpent = 0;

/* generic error handler */
function onError(error) {
  console.log(error);
}

let startedTime = Date.now();
console.log(`startedTime=${startedTime}`);
//browser.tabs API can only be used/available in background script and Browser action popup scripts

// TODO Need a timer that fires while it is *only* visible to
// possibly redirect because the time has exceeded.
// Possibly pop-up asking user what they want to do

let visibilityChangeEvent = (e) => {
  console.log(`event fired ${e} ${startedTime}`);

  //https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
  if (document.visibilityState === 'visible') {
    console.log(`Visible!`);
    startedTime = Date.now();
    // TODO Start the timer of "now" + time left for the day (or time left in the day)
    // TODO How will we handle changing crossing over midnight
    // TODO How will we handle chaning timezones?

    if (timeSpent >= maxTime) {
      location.assign('https://app.getpocket.com/');
    }
    else {
      timeoutID = setTimeout(() => {
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
      }, maxTime - timeSpent);
    }
  }
  else {
    console.log(`NOT Visible! ${startedTime} ${startedTime != null}`);
    if (startedTime != null) {
      console.log(`ASDFASDFASDFASDFASF ${Date.now() - startedTime}`);
      console.log(`time spent so far ${Date.now() - startedTime}`);
      // TODO Added to the list
      // TODO Stop the timer
      if (timeoutID != -1) clearTimeout(timeoutID);
    }
  }
}
document.addEventListener("visibilitychange", visibilityChangeEvent, true);

function today() {
  let now = new Date(Date.now());
  return "" + now.getFullYear() + (now.getMonth() + 1) + now.getDate();
}

function initialize() {
  var gettingAllStorageItems = browser.storage.local.get(null);
  gettingAllStorageItems.then((results) => {
    var noteKeys = Object.keys(results);
    for (let noteKey of noteKeys) {
      var curValue = results[noteKey];
      displayNote(noteKey,curValue);
      alert(`noteKey=${noteKey} and curValue=${curValue}`);
    }
  }, onError);
}
function removeEntry() {
  var removingNote = browser.storage.local.remove(delNote);
    removingNote.then(() => {
      displayNote(newTitle, newBody);
    }, onError);
}

initialize();

// browser.storage.local.clear();
visibilityChangeEvent(null);
console.log(`Loaded and we are here - just a sec1`);
