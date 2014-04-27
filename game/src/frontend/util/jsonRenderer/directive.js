var _ = require('lodash');

module.exports = ['recursiveDirective', function(recursiveDirective) {
	var getType = function(obj) {
		if (obj == null) return 'null'
			
		var type = typeof obj;

		switch (type) {
			case 'object':
				if (_.isArray(obj)) return 'array';
			case 'string':
			case 'number':
			case 'array':
				return type;
				break;
		}

		return 'unknown';
	};

	return {
		restrict: 'E',
		template: require('./template.html'),
		scope: {obj: '=', parent: '=', key: "="},
		link: function($scope, element, attributes) {

		},
		controller: function($scope) {
			$scope._ = _;
			$scope.type = getType($scope.obj);
		},
		compile: function(element) {
			return recursiveDirective.compile(element);
		}
	};
}];