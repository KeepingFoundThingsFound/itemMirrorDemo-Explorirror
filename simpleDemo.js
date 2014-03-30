  /**
   * If you ever get an error "require is undefined", it's because you have not included the
   * require.js dependency on your page. See the <script> tag in this document ending with
   * "require.js"
   */
  require(["ItemMirror"], function(ItemMirror){
    "use strict";

    var
      dropboxClientCredentials,
      //dropboxAuthDriver,
      dropboxClient,
      dropboxXooMLUtility,
      dropboxItemUtility,
      mirrorSyncUtility,
      groupingItemURI,
      itemMirrorOptions,
      createAssociationOptions;

    // Insert your Dropbox app key here:
    var DROPBOX_APP_KEY = '';
      
    /**
     * dropboxClientCredentials.sandbox should be true when you want to use
     * the full dropbox of the user (from the absolute root) and when you
     * have a key that has full acess permissions, and should be false when
     * you want to restrict the application to a sandboxed application folder.
     */
    dropboxClientCredentials = {
      key: "uz03nsz5udagdff",
      //sandbox phased out in 0.10
      //sandbox: false
    };
    //this code is no longer necessary
    //dropboxAuthDriver = new Dropbox.Drivers.Redirect({
    //  rememberUser: true
    //});
    dropboxClient = new Dropbox.Client(dropboxClientCredentials);
    //nope
    //dropboxClient.authDriver(dropboxAuthDriver);
    dropboxXooMLUtility = {
      driverURI: "DropboxXooMLUtility",
      dropboxClient: dropboxClient
    };
    dropboxItemUtility = {
      driverURI: "DropboxItemUtility",
      dropboxClient: dropboxClient
    };
    mirrorSyncUtility = {
      utilityURI: "MirrorSyncUtility"
    };
    groupingItemURI = "/";
    itemMirrorOptions = {
      1: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility
      },
      2: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility,
        readIfExists: false
      },
      3: {
        groupingItemURI: groupingItemURI,
        xooMLDriver: dropboxXooMLUtility,
        itemDriver: dropboxItemUtility,
        syncDriver: mirrorSyncUtility,
        readIfExists: true
      }
    };

    function run() {
      dropboxClient.authenticate(function (error, client) {
        if (error) {
          throw error;
        }
        constructNewItemMirror();
      });
    }

    /**
     * This function is an important best practice for dealing with concurrency
     * in shared spaces (which is the goal of XooML). Once an ItemMirror object
     * is constructed it should be kept up to date in a timeout loop like this.
     * The milliseconds can change depending on your application needs such as the
     * amount of I/O, the amount of user error tolerance, and the network connection
     * of your users.
     */
    function refreshLoop(itemMirror) {
      setTimeout(function () {
        itemMirror.refresh();
      }, 10000);
    }

    function constructNewItemMirror() {
      // Construct new ItemMirror in Case 3, could choose other cases
      new ItemMirror(itemMirrorOptions[3], function (error, itemMirror) {
        if (error) { throw error; }

        refreshLoop(itemMirror);
        alertSchemaVersion(itemMirror);
        itemMirror.listAssociations(function (error, GUIDs){
          for (var i=0;i<GUIDs.length;i++){
            //code to get displayText and print it out
            console.log("Reading GUID:" + GUIDs[i]);
            itemMirror.getAssociationDisplayText(GUIDs[i], function(error, displayText){
              itemMirror.isAssociatedItemGrouping(GUIDs[i], function(error, isGroupingItem){
                prntAssoc(error, isGroupingItem, displayText);
              })
            });
          }
          if (error) {
            console.log(error);
          }
        });
        //createAssociation(itemMirror, createAssociationOptions[1]); // Try swapping out other cases!
        //createItemMirrorFromGroupingItem(itemMirror);
      });
    }

    function createItemMirrorFromGroupingItem(itemMirror) {
      itemMirror.createAssociation(createAssociationOptions[7],
        function (error, GUID) {
        if (error) { throw error; }

        itemMirror.createItemMirrorForAssociatedGroupingItem(
          GUID, function (error, newItemMirror) {
          if (error) { throw error; }

          itemMirror.getItemDescribed(function (error, itemDescribed) {
            if (error) { throw error; }
            
            alert("newItemMirror from Association displayText" + itemDescribed);
          });
        });
      });
    }

    function getDisplayTextForAssociation(itemMirror, GUID) {
      itemMirror.getAssociationDisplayText(GUID, function (error, displayText) {
        if (error) {
          throw error;
        }

        // do something with displayText
      });
    }

    function alertSchemaVersion(itemMirror) {
      // Most "get" methods follow this pattern. Check documentation to be sure.
      itemMirror.getSchemaVersion(function (error, schemaVersion) {
        if (error) {
          throw error;
        }

        alert(schemaVersion);
        // do something with schemaVersion
      });
    }

    /**
     * Let's actually start coding now!
     *
     *
     **/
    
    function prntAssoc(error, isGroupingItem, displayText){
      if (error) {
          throw error;
      }
      //code for print to screen
      var $thisAssoc = $('<div>', {'text':displayText, 'class':"explorirror"});
      if (isGroupingItem) {
        $thisAssoc.prepend($('<img>', {'src':"Folder.png"}));
      }else{
        $thisAssoc.prepend($('<img>', {'src':"Document.png"}));
      }
      $('#nav').append($thisAssoc);
    }

    run();

  });