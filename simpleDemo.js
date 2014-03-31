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
      //sandbox phased out in 0.10 and OAuth 2.0
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
        //SchemaVersion 0.54
        //alertSchemaVersion(itemMirror);
        //refreshLoop(itemMirror);
        listAssociations(itemMirror);
      });
    }

    function listAssociations(itemMirror){
          console.log(itemMirror);
          $('#nav').empty();
         itemMirror.listAssociations(function (error, GUIDs){
          var length;
          var cap = 25;
          itemMirror.getParent(function(error, parent){
            if (parent) {
              upOneLevel(parent);
            }
          });
          if (GUIDs.length >= cap) {
            length = cap
          }else {
            length = GUIDs.length
          }
          var displayText;
          var isGroupingItem;
          for (var i=0;i<length;i++){
          //for (var i=0;i<10;i++){
            //code to get displayText and print it out
            //console.log("Reading GUID:" + GUIDs[i]);
            //get Displaytext for Association
            itemMirror.getAssociationDisplayText(GUIDs[i], function(error, text){
              displayText = text;
              //Check if this Association is a Grouping Item (a folder in the case of dropbox)
            });
            prntAssoc(error, displayText, GUIDs[i], itemMirror);
          }
          if (error) {
            console.log(error);
          }
        });
    }

    function createItemMirrorFromGroupingItem(event) {
        //event.stopPropagation();
        var itemMirror = event.data.itemmirror;
        //console.log(itemMirror);
        var GUID = event.data.guid;
        //This will always run the constructor on Case 3, but has the added benefit of
        //adding a Parent for successful back-navigation
        console.log("Now creating a grouping item for " + GUID);
        itemMirror.createItemMirrorForAssociatedGroupingItem(
          GUID, function (error, newItemMirror) {
          if (error) { throw error; }
          //console.log(newItemMirror);
          //refreshLoop(newItemMirror);
          //newItemMirror._groupingItemURI = newItemMirror._groupingItemURI;
          listAssociations(newItemMirror);
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
     *The Printout for individual iM Associations
     *Uses jQuery to manipulate the DOM
     **/
    
    function prntAssoc(error, displayText, GUID, itemMirror){
      if (error) {
          throw error;
      }
      //code for print to screen
      var $thisAssoc = $('<div>', {'class':"explorirror"});
      $thisAssoc.append($('<p>', {'text':displayText}))
      itemMirror.isAssociatedItemGrouping(GUID, function(error, isGroupingItem){
        if (isGroupingItem) {
            //console.log("GUID is " + GUID);
            //console.log("break");
            $thisAssoc.prepend($('<img>', {'src':"Folder.png", 'alt':displayText, 'title':displayText}));
            $thisAssoc.bind("click",{guid:GUID, itemmirror:itemMirror},createItemMirrorFromGroupingItem);
        }else{
          $thisAssoc.prepend($('<img>', {'src':"Document.png", 'alt':displayText, 'title':displayText}));
        }
      });
      $('#nav').append($thisAssoc);
    }
    
    function upOneLevel(parent) {
      $('a#upOneLvl').remove();
     $('<a>', {'href':"#" + parent._groupingItemURI, 'text':"^ Up One Level ^", id: "upOneLvl"}).on("click", function(){
        if (parent) {
          listAssociations(parent)
           //Event Handler for taking it back to parent
         }
     }).insertBefore('#nav');
    }
    
    run();

  });