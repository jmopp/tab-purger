function getTabs() {
  var tabPromise = browser.tabs.query({currentWindow:true});
  var ul = document.createElement("ul");
  var div = document.getElementById("tab-list");
  tabPromise.then(function(tabs) {
    var openTabs = groupTabs(tabs);
    openTabs.forEach(function(tab, i) {
      var li = document.createElement("li");
      li.setAttribute("class", "tab-group");
      var span = document.createElement("span");
      span.textContent = tab.host + " ("+tab.count+") ";
      li.appendChild(span);

      var buttonTray = document.createElement("span");
      buttonTray.setAttribute("class", "close-button");

      var button = document.createElement("img");
      button.setAttribute("src", "images/close.png");
      button.setAttribute("alt", "close");
      var loadingIcon = document.createElement("img");
      loadingIcon.setAttribute("class", "loading");
      loadingIcon.setAttribute("src", "images/loading.png");
      loadingIcon.setAttribute("alt", "Loading...");
      loadingIcon.setAttribute("style", "display:none");
      button.addEventListener("click", function(evt) {
        button.setAttribute("style", "display:none");
        loadingIcon.removeAttribute("style");
        closeTabs(tab.host).then(function() {
          li.setAttribute("style", "display:none");
        });
        evt.stopPropagation();
      });
      buttonTray.appendChild(button);
      buttonTray.appendChild(loadingIcon);
      li.appendChild(buttonTray);

      if(tab.count == 1) {
        li.setAttribute("class", "tab-group single-item");
        if(tab.tabs[0].title) {
          span.textContent = tab.tabs[0].title;
        } else {
          span.textContent = tab.tabs[0].url;
        }
        var subUl = null;
      } else {
        var subUl = document.createElement("ul");
        subUl.setAttribute("class", "sub-list-hidden");
        tab.tabs.forEach(function(t) {
          var subLi = document.createElement("li");
          if(t.title) {
            subLi.textContent = t.title;
          } else {
            subLi.textContent = t.url;
          }
          var subTray = document.createElement("span");
          subTray.setAttribute("class", "sub-close-button");
          var subButton = document.createElement("img");
          subButton.setAttribute("src", "images/close.png");
          subButton.setAttribute("alt", "close");
          subButton.addEventListener("click", function(e) {
            closeTab(t.id).then(function() {
              subLi.setAttribute("style", "display:none");
              tab.count--;
              span.textContent = tab.host + " ("+tab.count+") ";
              if(tab.count==0) {
                li.setAttribute("style", "display:none");
              }
            });
            e.stopPropagation();
          });
          subTray.appendChild(subButton);
          subLi.addEventListener("click", function(e) {
            browser.tabs.update(t.id, {active:true});
            e.stopPropagation();
          });
          subLi.addEventListener("mouseup", function(e) {
            if(e.button == 1) { //middle click
              closeTab(t.id).then(function() {
                subLi.setAttribute("style", "display:none");
                tab.count--;
                span.textContent = tab.host + " ("+tab.count+") ";
                if(tab.count==0) {
                  li.setAttribute("style", "display:none");
                }
              });
            e.stopPropagation();
            }
          });
          // This is because we can't have parent selectors
          subUl.addEventListener("mouseover", function(e) {
            li.setAttribute("style", "background-color:white;color:black");
          });
          subUl.addEventListener("mouseout", function(e) {
            li.removeAttribute("style");
          });
          subLi.appendChild(subTray);
          subUl.appendChild(subLi);
        });
        li.appendChild(subUl);
      }

      li.addEventListener("mouseup", function(e) {
        if(e.button == 1) {
          if(subUl) {
            closeTabs(tab.host).then(function() {
              li.setAttribute("style", "display:none");
            });
          } else {
            closeTab(tab.tabs[0].id).then(function() {
              li.setAttribute("style", "display:none");
            });
          }
          e.stopPropagation();
        }
      });
      li.addEventListener("click", function(evt) {
        if(li.className=="tab-group") {
          li.setAttribute("class", "tab-group expanded");
        } else if(li.className=="tab-group expanded") {
          li.setAttribute("class", "tab-group");
        }
        if(subUl) {
          if(subUl.className=="sub-list") {
            subUl.setAttribute("class", "sub-list-hidden");
          } else {
            subUl.setAttribute("class", "sub-list");
          }
        } else {
          browser.tabs.update(tab.tabs[0].id, {active:true});
        }
      });

      ul.appendChild(li);
    });
    div.appendChild(ul);
  });
}
function closeTab(tabId) {
  return browser.tabs.remove(tabId);
}
function groupTabs(tabs) {
  var openTabs = {};
  tabs.forEach(function(tab) {
    var url = new URL(tab.url);
    var host = url.hostname;
    if(openTabs.hasOwnProperty(host)) {
      openTabs[host].push(tab);
    } else {
      openTabs[host] = [tab]
    }
  });
  var tabGroups = Object.keys(openTabs).map(function(key) {
    return {
      host: key,
      count: openTabs[key].length,
      tabs: openTabs[key]
    };
  });
  tabGroups.sort(tabGroupComparator);
  return tabGroups;
}

function tabGroupComparator(a, b) {
  if(a.count < b.count) {
    return 1;
  } else if(a.count > b.count) {
    return -1;
  } else {
    return 0;
  }
}

function closeTabs(host) {
  var query = "*://"+host+"/*";
  return browser.tabs.query({url:query}).then(function(tabs) {
    browser.tabs.remove(tabs.map(function(tab){return tab.id}));
  });
}

getTabs();
