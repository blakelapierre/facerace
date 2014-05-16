module.exports = function() {
  return {
    createWatchCollectionFunction: function($scope, obj, config) {
      var newAction = config.newAction,
          removeAction = config.removeAction,
          updateAction = config.updateAction;

      return function(newValue) {
        var currentKeys = _.keys(newValue),
            oldKeys = _.keys(obj),
            newKeys = _.difference(currentKeys, oldKeys),
            removableKeys = _.difference(oldKeys, currentKeys);

        _.each(newKeys, function(key) { newAction(key, $scope[key]); });
        _.each(removableKeys, function(key) { removeAction(key, $scope[key]); });

        var index = 0;
        _.each(obj, function(o) {
          updateAction(o, index++);
        });
      };
    }
  };
};