module.exports = [
  '$rootScope', 'mapLoader', 'trackLoader', 'playersManager', 
  function($scope, mapLoader, trackLoader, playersManager) {
  
  var scene, cssScene, eventHandlers;

  function startQuakeMode () {
    playersManager.setMode('quake');
  };

  function dispatch (event) {
    (eventHandlers[event.type] || function() { })(event);
  };

  return {
    setScene: function(s, cs) {
      if (scene) {} // detach?
      scene = s;
      cssScene = cs;

      eventHandlers = {
        mode: function(event) {
          var mode = event._event;

          switch (mode) {
            case 'quake':
              startQuakeMode();
              break;
          }
        },
        player: function(event) {
          console.log('player', event);
        },
        video: function(event) {
          console.log('video', event);

          var player = $scope.livePlayers[event._player],
            source = $scope.liveSources[event._event];

          if (player && source) {
            scene.remove(source.mesh);
            player.rig.add(source.mesh);
            player.mesh = source.mesh;
          }
        },
        setMap: function(event) {
          mapLoader(scene, event._event);
        },
        setTrack: function(event) {
          trackLoader(scene, event._event);
        },
        offer: function(event) {
          playersManager.offer(event._player, event._event);
        }
      };

      return dispatch;
    },
    dispatch: dispatch
  };
}];