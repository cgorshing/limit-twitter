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
  //location.assign('https://app.getpocket.com/');
  canWeShowDialog();
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

let canWeShowDialog = () => {
  if (document.querySelector('#openModal') !== null) return;

  let openModal = document.createElement("div");
  openModal.setAttribute("id", "openModal");
  openModal.className = "modalDialog";

  let emptyDiv = document.createElement("div");
  openModal.appendChild(emptyDiv);

  let header = document.createElement("h2");
  header.textContent = browser.i18n.getMessage("overlayTitle");
  let paragraph1 = document.createElement("p");
  paragraph1.textContent = browser.i18n.getMessage("overlayParagraph1");
  let paragraph2 = document.createElement("p");
  paragraph2.textContent = browser.i18n.getMessage("overlayParagraph2");

  // var a = document.createElement('a');
  // var url = document.createTextNode(browser.i18n.getMessage("actionTitle"));
  // a.href = browser.i18n.getMessage("actionUrl");
  // a.target = '_blank';
  // a.appendChild(url);
  // paragraph2.appendChild(a);


  emptyDiv.appendChild(header);
  emptyDiv.appendChild(paragraph1);
  emptyDiv.appendChild(paragraph2);

  document.body.appendChild(openModal);
}