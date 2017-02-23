
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

    var PACKAGE_PATH;
    if (typeof window === 'object') {
      PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
    } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = '/home/nedenwang/workspace/arkaflow/emscripten-build/bin/MyGame.data';
    var REMOTE_PACKAGE_BASE = 'MyGame.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
                              Module['locateFile'](REMOTE_PACKAGE_BASE) :
                              ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);
  
    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;
  
    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
          var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onerror = function(event) {
        throw new Error("NetworkError for: " + packageName);
      }
      xhr.onload = function(event) {
        if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
          var packageData = xhr.response;
          callback(packageData);
        } else {
          throw new Error(xhr.statusText + " : " + xhr.responseURL);
        }
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };
  
      var fetched = null, fetchedCallback = null;
      fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);
    
  function runWithFS() {

    function assert(check, msg) {
      if (!check) throw msg + new Error().stack;
    }
Module['FS_createPath']('/', 'audio', true, true);
Module['FS_createPath']('/', 'ui', true, true);
Module['FS_createPath']('/', 'fonts', true, true);

    function DataRequest(start, end, crunched, audio) {
      this.start = start;
      this.end = end;
      this.crunched = crunched;
      this.audio = audio;
    }
    DataRequest.prototype = {
      requests: {},
      open: function(mode, name) {
        this.name = name;
        this.requests[name] = this;
        Module['addRunDependency']('fp ' + this.name);
      },
      send: function() {},
      onload: function() {
        var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

      },
      finish: function(byteArray) {
        var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      }
    };

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
        }

  
    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;
      
        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);
  
          var files = metadata.files;
          for (i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
              Module['removeRunDependency']('datafile_/home/nedenwang/workspace/arkaflow/emscripten-build/bin/MyGame.data');

    };
    Module['addRunDependency']('datafile_/home/nedenwang/workspace/arkaflow/emscripten-build/bin/MyGame.data');
  
    if (!Module.preloadResults) Module.preloadResults = {};
  
      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }
    
  }
  if (Module['calledRun']) {
    runWithFS();
  } else {
    if (!Module['preRun']) Module['preRun'] = [];
    Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
  }

 }
 loadPackage({"files": [{"audio": 0, "start": 0, "crunched": 0, "end": 19939, "filename": "/icon.png"}, {"audio": 0, "start": 19939, "crunched": 0, "end": 32446, "filename": "/ring_i.png"}, {"audio": 0, "start": 32446, "crunched": 0, "end": 35029, "filename": "/target.png"}, {"audio": 0, "start": 35029, "crunched": 0, "end": 58588, "filename": "/ring_o.png"}, {"audio": 0, "start": 58588, "crunched": 0, "end": 172001, "filename": "/g_charmysoft_logo.png"}, {"audio": 0, "start": 172001, "crunched": 0, "end": 180072, "filename": "/diamond_i.png"}, {"audio": 0, "start": 180072, "crunched": 0, "end": 185816, "filename": "/tri_i.png"}, {"audio": 0, "start": 185816, "crunched": 0, "end": 278174, "filename": "/g_charmy_av.png"}, {"audio": 0, "start": 278174, "crunched": 0, "end": 385947, "filename": "/share.jpg"}, {"audio": 0, "start": 385947, "crunched": 0, "end": 397959, "filename": "/diamond_o.png"}, {"audio": 0, "start": 397959, "crunched": 0, "end": 410369, "filename": "/tri_o.png"}, {"audio": 1, "start": 410369, "crunched": 0, "end": 417709, "filename": "/audio/beng.ogg"}, {"audio": 1, "start": 417709, "crunched": 0, "end": 422004, "filename": "/audio/da.ogg"}, {"audio": 1, "start": 422004, "crunched": 0, "end": 957593, "filename": "/audio/bgmusic.ogg"}, {"audio": 1, "start": 957593, "crunched": 0, "end": 962671, "filename": "/audio/ba.ogg"}, {"audio": 1, "start": 962671, "crunched": 0, "end": 967391, "filename": "/audio/di.ogg"}, {"audio": 0, "start": 967391, "crunched": 0, "end": 970463, "filename": "/ui/ball_inner.png"}, {"audio": 0, "start": 970463, "crunched": 0, "end": 973493, "filename": "/ui/ob_sound_on.png"}, {"audio": 0, "start": 973493, "crunched": 0, "end": 974018, "filename": "/ui/slide_to_start_shine.png"}, {"audio": 0, "start": 974018, "crunched": 0, "end": 991049, "filename": "/ui/outlined_button_o.png"}, {"audio": 0, "start": 991049, "crunched": 0, "end": 997950, "filename": "/ui/b_share.png"}, {"audio": 0, "start": 997950, "crunched": 0, "end": 1001345, "filename": "/ui/outlined_button_i.png"}, {"audio": 0, "start": 1001345, "crunched": 0, "end": 1004617, "filename": "/ui/ob_sound_off.png"}, {"audio": 0, "start": 1004617, "crunched": 0, "end": 1008106, "filename": "/ui/ob_restart.png"}, {"audio": 0, "start": 1008106, "crunched": 0, "end": 1013583, "filename": "/ui/slidernode_n.png"}, {"audio": 0, "start": 1013583, "crunched": 0, "end": 1014295, "filename": "/ui/ob_pick_level.png"}, {"audio": 0, "start": 1014295, "crunched": 0, "end": 1016754, "filename": "/ui/string_inner.png"}, {"audio": 0, "start": 1016754, "crunched": 0, "end": 1017514, "filename": "/ui/slidernode_center.png"}, {"audio": 0, "start": 1017514, "crunched": 0, "end": 1019764, "filename": "/ui/ob_music_off.png"}, {"audio": 0, "start": 1019764, "crunched": 0, "end": 1045870, "filename": "/ui/colorful.png"}, {"audio": 0, "start": 1045870, "crunched": 0, "end": 1057076, "filename": "/ui/b_settings.png"}, {"audio": 0, "start": 1057076, "crunched": 0, "end": 1058473, "filename": "/ui/ob_home.png"}, {"audio": 0, "start": 1058473, "crunched": 0, "end": 1058555, "filename": "/ui/slider_back.png"}, {"audio": 0, "start": 1058555, "crunched": 0, "end": 1060960, "filename": "/ui/ob_go_back.png"}, {"audio": 0, "start": 1060960, "crunched": 0, "end": 1061787, "filename": "/ui/streak.png"}, {"audio": 0, "start": 1061787, "crunched": 0, "end": 1066899, "filename": "/ui/b_next.png"}, {"audio": 0, "start": 1066899, "crunched": 0, "end": 1076712, "filename": "/ui/b_website.png"}, {"audio": 0, "start": 1076712, "crunched": 0, "end": 1083431, "filename": "/ui/b_rate.png"}, {"audio": 0, "start": 1083431, "crunched": 0, "end": 1089802, "filename": "/ui/b_leave.png"}, {"audio": 0, "start": 1089802, "crunched": 0, "end": 1103840, "filename": "/ui/ball_outer.png"}, {"audio": 0, "start": 1103840, "crunched": 0, "end": 1116332, "filename": "/ui/ball.png"}, {"audio": 0, "start": 1116332, "crunched": 0, "end": 1121345, "filename": "/ui/b_newgame.png"}, {"audio": 0, "start": 1121345, "crunched": 0, "end": 1121426, "filename": "/ui/slider_progressbar.png"}, {"audio": 0, "start": 1121426, "crunched": 0, "end": 1123784, "filename": "/ui/ob_notif_off.png"}, {"audio": 0, "start": 1123784, "crunched": 0, "end": 1132208, "filename": "/ui/b_restart.png"}, {"audio": 0, "start": 1132208, "crunched": 0, "end": 1138394, "filename": "/ui/b_heart.png"}, {"audio": 0, "start": 1138394, "crunched": 0, "end": 1148617, "filename": "/ui/dialog_i.png"}, {"audio": 0, "start": 1148617, "crunched": 0, "end": 1196725, "filename": "/ui/dialog_o.png"}, {"audio": 0, "start": 1196725, "crunched": 0, "end": 1202184, "filename": "/ui/slidernode_p.png"}, {"audio": 0, "start": 1202184, "crunched": 0, "end": 1202870, "filename": "/ui/ob_pause.png"}, {"audio": 0, "start": 1202870, "crunched": 0, "end": 1206547, "filename": "/ui/b_ok.png"}, {"audio": 0, "start": 1206547, "crunched": 0, "end": 1214007, "filename": "/ui/ob_heart.png"}, {"audio": 0, "start": 1214007, "crunched": 0, "end": 1220667, "filename": "/ui/b_cancel.png"}, {"audio": 0, "start": 1220667, "crunched": 0, "end": 1222007, "filename": "/ui/slide_to_start_bg.png"}, {"audio": 0, "start": 1222007, "crunched": 0, "end": 1223894, "filename": "/ui/ob_notif_on.png"}, {"audio": 0, "start": 1223894, "crunched": 0, "end": 1225624, "filename": "/ui/ob_music_on.png"}, {"audio": 0, "start": 1225624, "crunched": 0, "end": 1226025, "filename": "/ui/shadow.png"}, {"audio": 0, "start": 1226025, "crunched": 0, "end": 1249941, "filename": "/fonts/SF Theramin Gothic Bold.ttf"}, {"audio": 0, "start": 1249941, "crunched": 0, "end": 1274261, "filename": "/fonts/SF Theramin Gothic Condensed.ttf"}, {"audio": 0, "start": 1274261, "crunched": 0, "end": 3261157, "filename": "/fonts/Chinese Font.ttf"}], "remote_package_size": 3261157, "package_uuid": "6f68daaf-9447-4fd0-b6c0-e898c624d04b"});

})();

