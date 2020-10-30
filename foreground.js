console.log('from foregroud');
console.log(location);
let x = document.getElementsByClassName("video-player");
console.log(x);
console.log("wtsdfasd");
(function() {
    var _tmuteVars = { "timerCheck": 1000, // Checking rate of ad in progress (in ms ; EDITABLE)
                      "playerMuted": false, // Player muted or not
                      "adsDisplayed": 0, // Number of ads displayed
                      "disableDisplay": true, // Disable the player display during an ad (true = yes, false = no (default) ; EDITABLE)
                      "alreadyMuted": false, // Used to check if the player is muted at the start of an ad
                      "adElapsedTime": undefined, // Used to check if Twitch forgot to remove the ad notice
                      "adUnlockAt": 150, // Unlock the player if this amount of seconds elapsed during an ad (EDITABLE)
                      "adMinTime": 15, // Minimum amount of seconds the player will be muted/hidden since an ad started (EDITABLE ; Recommended to really avoid any ad: 30 to 45)
                      "squadPage": false, // Either the current page is a squad page or not
                      "playerIdAds": 0, // Player ID where ads may be displayed (default 0, varying on squads page)
                      "displayingOptions": false, // Either ads options are currently displayed or not
                      "highwindPlayer": undefined // If you've the Highwind Player or not (automatically checked)
                     };
    
    // Selectors for the old player and the highwind one
    var _tmuteSelectors = { "old": { "player": "player-video", // Player class
                                     "playerVideo": ".player-video", // Player video selector
                                     "muteButton": ".player-button--volume", // (un)mute button selector
                                     "adNotice": "player-ad-notice" // Ad notice class
                                                                    },
                            "hw":  { "player": "video-player", // Player class
                                     "playerVideo": ".highwind-video-player__container video", // Player video selector
                                     "muteButton": "button[data-a-target='player-mute-unmute-button']", // (un)mute button selector
                                     "adNotice": "tw-absolute tw-c-background-overlay tw-c-text-overlay tw-inline-block tw-left-0 tw-pd-1 tw-top-0" // Ad notice class
                                            }
                                                };
      // Current selector (either old or highwind player, automatically set below)
    var currentSelector = undefined;
      
    // Check if there's an ad
    function checkAd()
    { 
        console.log("wtf1")
      // Check if you're watching a stream, useless to continue if not
      if (_tmuteVars.highwindPlayer === undefined) {
        var isOldPlayer = document.getElementsByClassName(_tmuteSelectors.old.player).length;
        var isHwPlayer = document.getElementsByClassName(_tmuteSelectors.hw.player).length;
        var isViewing = Boolean(isOldPlayer + isHwPlayer);
        console.log(`Am Viewing ${isViewing}`);
        if (isViewing === false) return;
        
        // We set the type of player currently used (old or highwind one)
        _tmuteVars.highwindPlayer = Boolean(isHwPlayer);
        currentSelector = (_tmuteVars.highwindPlayer === true) ? _tmuteSelectors.hw : _tmuteSelectors.old;
        console.log("You're currently using the " + ((_tmuteVars.highwindPlayer === true) ? "Highwind" : "old") + " player.");
      } else {
        var isViewing = Boolean(document.getElementsByClassName(currentSelector.player).length);
        if (isViewing === false) return;
      }
      
      // Initialize the ads options if necessary.
      var optionsInitialized = (document.getElementById("_tmads_options") === null) ? false : true;
      if (optionsInitialized === false) adsOptions("init");
      
      var advert = document.getElementsByClassName(currentSelector.adNotice);
      
      if (_tmuteVars.adElapsedTime !== undefined)
      {
        _tmuteVars.adElapsedTime++;
        if (_tmuteVars.adElapsedTime >= _tmuteVars.adUnlockAt && advert[0] !== undefined) 
        {
          advert[0].parentNode.removeChild(advert[0]);
          console.log("Unlocking Twitch player as Twitch forgot to remove the ad notice after the ad(s).");
        }
      }
      
      if ((advert.length >= 1 && _tmuteVars.playerMuted === false) || (_tmuteVars.playerMuted === true && advert.length === 0)) 
      {
        // Update at the start of an ad if the player is already muted or not
        if (advert.length >= 1) {
          var muteButton = document.querySelectorAll(currentSelector.muteButton)[_tmuteVars.playerIdAds];
          if (_tmuteVars.highwindPlayer === true) {
              _tmuteVars.alreadyMuted = Boolean(muteButton.getAttribute("aria-label") === "Unmute (m)");
          } else {
              _tmuteVars.alreadyMuted = Boolean(muteButton.childNodes[0].className === "unmute-button");
          }
        }
        
        // Keep the player muted/hidden for the minimum ad time set (Twitch started to remove the ad notice before the end of some ads)
        if (advert.length === 0 && _tmuteVars.adElapsedTime !== undefined && _tmuteVars.adElapsedTime < _tmuteVars.adMinTime) return;
  
        mutePlayer();
      }
    }
  
    // (un)Mute Player
    function mutePlayer()
    {
        console.log("wtf2")
      if (document.querySelectorAll(currentSelector.muteButton).length >= 1)
      {
        if (_tmuteVars.alreadyMuted === false) document.querySelectorAll(currentSelector.muteButton)[_tmuteVars.playerIdAds].click(); // If the player is already muted before an ad, we avoid to unmute it.
        _tmuteVars.playerMuted = !(_tmuteVars.playerMuted);
  
        if (_tmuteVars.playerMuted === true)
        {
          _tmuteVars.adsDisplayed++;
          _tmuteVars.adElapsedTime = 1;
          console.log("Ad #" + _tmuteVars.adsDisplayed + " detected. Player " + (_tmuteVars.alreadyMuted === true ? "already " : "") + "muted.");
          if (_tmuteVars.disableDisplay === true) document.querySelectorAll(currentSelector.playerVideo)[_tmuteVars.playerIdAds].style.visibility = "hidden";
        } else {
          console.log("Ad #" + _tmuteVars.adsDisplayed + " finished (lasted " + _tmuteVars.adElapsedTime + "s)." + (_tmuteVars.alreadyMuted === true ? "" : " Player unmuted."));
          _tmuteVars.adElapsedTime = undefined;
          if (_tmuteVars.disableDisplay === true) document.querySelectorAll(currentSelector.playerVideo)[_tmuteVars.playerIdAds].style.visibility = "visible";
        }
      } else {
        console.log("No volume button found (class changed ?).");
      }
    }
    
    // Manage ads options
    function adsOptions(changeType = "show")
    {
        console.log("wtf3")
      switch(changeType) {
        // Manage player display during an ad (either hiding the ads or still showing them)
          case "display":
          _tmuteVars.disableDisplay = !(_tmuteVars.disableDisplay);
          // Update the player display if an ad is supposedly in progress
          if (_tmuteVars.playerMuted === true) document.querySelectorAll(currentSelector.playerVideo)[_tmuteVars.playerIdAds].style.visibility = (_tmuteVars.disableDisplay === true) ? "hidden" : "visible";
          document.getElementById("_tmads_display").innerText = (_tmuteVars.disableDisplay === true ? "Show" : "Hide") + " player during ads";
          break;
        // Force a player unlock if Twitch didn't remove the ad notice properly instead of waiting the auto unlock
          case "unlock":
          var advert = document.getElementsByClassName(currentSelector.adNotice);
          if (_tmuteVars.adElapsedTime === undefined && advert[0] === undefined)
          {
            alert("There's no ad notice displayed. No unlock to do.");
          } else {
            // We set the elapsed time to the unlock timer to trigger it during the next check.
            _tmuteVars.adElapsedTime = _tmuteVars.adUnlockAt;
            console.log("Unlock requested.");
          }
          break;
        // Display the ads options button
        case "init":
          if (document.getElementsByClassName("channel-info-bar__viewers-wrapper")[0] === undefined && document.getElementsByClassName("squad-stream-top-bar__container")[0] === undefined) break;
          
          // Append ads options and events related
          var optionsTemplate = document.createElement("div");
          optionsTemplate.id = "_tmads_options-wrapper";
          optionsTemplate.className = "tw-inline-flex";
          optionsTemplate.innerHTML = `
          <span id="_tmads_options" style="display: none;">
            <button type="button" id="_tmads_unlock" style="padding: 0 2px 0 2px; margin-left: 2px; height: 16px; width: unset;" class="tw-interactive tw-button-icon tw-button-icon--hollow">Unlock player</button>
            <button type="button" id="_tmads_display" style="padding: 0 2px 0 2px; margin-left: 2px; height: 16px; width: unset;" class="tw-interactive tw-button-icon tw-button-icon--hollow">` + (_tmuteVars.disableDisplay === true ? "Show" : "Hide") + ` player during ads</button>
          </span>
          <button type="button" id="_tmads_showoptions" style="padding: 0 2px 0 2px; margin-left: 2px; height: 16px; width: unset;" class="tw-interactive tw-button-icon tw-button-icon--hollow">Ads Options</button>`;
          
          // Normal player page
          if (document.getElementsByClassName("channel-info-bar__viewers-wrapper")[0] !== undefined)
          {
            _tmuteVars.squadPage = false;
            _tmuteVars.playerIdAds = 0;
            document.getElementsByClassName("channel-info-bar__viewers-wrapper")[0].parentNode.appendChild(optionsTemplate);
          // Squad page
          } else if (document.getElementsByClassName("squad-stream-top-bar__container")[0] !== undefined)
          {
            _tmuteVars.squadPage = true;
            _tmuteVars.playerIdAds = 0;
            // Since the primary player is never at the same place, we've to find it.
            for (var i = 0; i < parseInt(document.querySelectorAll(currentSelector.playerVideo).length); i++)
            {
              if (document.getElementsByClassName("multi-stream-player-layout__player-container")[0].childNodes[i].classList.contains("multi-stream-player-layout__player-primary"))
              {
                _tmuteVars.playerIdAds = i;
                break;
              }
            }
            document.getElementsByClassName("squad-stream-top-bar__container")[0].appendChild(optionsTemplate);
          }
          
          document.getElementById("_tmads_showoptions").addEventListener("click", adsOptions, false);
          document.getElementById("_tmads_display").addEventListener("click", function() { adsOptions("display"); }, false);
          document.getElementById("_tmads_unlock").addEventListener("click", function() { adsOptions("unlock"); }, false);
          console.log("Ads options initialized.");
          
          break;
        // Display/Hide the ads options
          case "show":
          default:
          _tmuteVars.displayingOptions = !(_tmuteVars.displayingOptions);
          document.getElementById("_tmads_options").style.display = (_tmuteVars.displayingOptions === false) ? "none" : "inline-flex";
          } 
    }
    
    // Start the background check
    _tmuteVars.autoCheck = setInterval(checkAd, _tmuteVars.timerCheck);
    
  })();
