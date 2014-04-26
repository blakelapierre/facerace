module.exports = function() {
	// http://davidwalsh.name/add-rules-stylesheets
	var sheet = (function() {
		var style = document.createElement('style');

		style.appendChild(document.createTextNode('')); // might not be neccesary

		document.head.appendChild(style);

		return style.sheet;
	})();

	// cssanimationstore.js
	// https://github.com/joelambert/CSS-Animation-Store
	// MIT LICENSE
	var KeyframeRule = function(r) {
		this.original = r;
		this.keyText = r.keyText;
		this.css = r.css();
	};
	
	var KeyframeAnimation = function(kf) {
		var _this = this;
		this.original = kf;
		this.name = kf.name;
		this.revision = 0;
		
		this.keyframes = [];
		var keytexts = [],
			keyframeHash = {},
		
		/**
		 * Makes the rule indexable
		 * @param {WebKitKeyframeRule} r The CSSOM keyframe rule
		 * @returns undefined
		 */
		
		indexRule = function(r) {
			var rule = new KeyframeRule(r);
			_this.keyframes.push(rule);
			keytexts.push(rule.keyText);
			keyframeHash[rule.keyText] = rule;
		},
		
		
		/**
		 * Initialises the object
		 * @returns undefined
		 */
		
		init = function() {
			_this.keyframes = [];
			keytexts = [];
			keyframeHash = {};
			
			for(var i=0; i<kf.cssRules.length; i++) {
				indexRule(kf.cssRules[i]);
			}
		};
		
		init();
		
		this.getKeyframeTexts = function() {
			return keytexts;
		};
		
		this.getKeyframe = function(text) {
			return keyframeHash[text];
		};
		
		this.setKeyframe = function(text, css) {
			var cssRule = text + toCss(css);

			var index = _.findIndex(_this.original.cssRules, function(rule) { return rule.keyText == text; });
			if (index >= 0) _this.original.deleteRule(text);

			_this.original.insertRule(cssRule);
			init();
		};

		var toCss = function(config) {
			var rule = '{';
			for (var key in config) rule += key + ':' + config[key] + ';';
			return '{' + _.reduce(config, function(rule, value, key) { return rule + key + ':' + value + ';'; }, '') + '}';
		}

		this.setKeyframes = function(keyframes) {
			Array.prototype.splice.call(_this.original.cssRules, 0, _this.original.cssRules.length);

			_.each(keyframes, function(value, key) { _this.setKeyframe(key, value); });
		}

		this.updateName = function() {
			var name = _this.name + '-' + _this.revision++;
			_this.original.name = name;
			return name;
		};
	};

	var trim = function(str) {
		str = str || "";
		return str.replace(/^\s+|\s+$/g,"");
	};
	
	var prefix = "",
		prefixes = ['WebKit', 'Moz'];
		
	for(var i=0; i<prefixes.length; i++) {
		if(window[prefixes[i]+'CSSKeyframeRule'])
			prefix = prefixes[i];
	}
	
	window[prefix+'CSSKeyframeRule'].prototype.css = function() {
		var css = {};

		var rules = this.style.cssText.split(';');
		for(var i=0; i<rules.length; i++) {
			var parts = rules[i].split(':'),
				key = trim(parts[0]),
				value = trim(parts[1]);
			
			if(key !== '' && value !== '')
				css[key] = value;
		}
		
		return css;
	};

	var eachPrefix = function(fn) {
		_.each(['@-webkit-keyframes', '@-moz-keyframes', '@keyframes'], fn);
	};

	var getKeyframeAnimationRule = function(name) {
		return _.find(sheet.cssRules, function(rule) {
			return rule.name == name;
		});
	};

	var getAnimationRule = function(name) {
		return _.find(sheet.cssRules, function(rule) {
			return rule.selectorText == '.' + name;
		});
	};

	var deleteRule = function(name) {
		var index = _.findIndex(sheet.cssRules, function(rule) {console.log('rule', rule); return rule.selectorText == name; });
		if (index >= 0) sheet.deleteRule(index);
	};

	var setAnimationRule = function(name, duration, iterationCount, timing) {
		deleteRule('.' + name);
		sheet.insertRule('.' + name + ' { -webkit-animation: ' + name + ' ' + duration + ' ' + iterationCount + ' ' + timing + '; }', 0);
	}

	var addAnimation = function(name) {
		var duration = '5s',
			iterationCount = 'infinite',
			timing = 'linear';

		setAnimationRule(name, '5s', 'infinite', 'linear');

		eachPrefix(function(prefix) {
			try { sheet.insertRule(prefix + ' ' + name + ' {}'); } catch (e) {} // ignore bad prefixes
		});

		return {
			name: name,
			keyframeAnimation: new KeyframeAnimation(getKeyframeAnimationRule(name)),
			setDuration: function(d) { 
				//duration = d; setAnimationRule(name, duration, iterationCount, timing);
				duration = d;
				var rule = getAnimationRule(name);
				console.log('r', rule);
				rule.style.webkitAnimationDuration = duration;
			},
			setIterationCount: function(ic) { iterationCount = ic; setAnimationRule(name, duration, iterationCount, timing); },
			setTiming: function(t) { timing = t; setAnimationRule(name, duration, iterationCount, timing); }
		};
	};

	var removeAnimation = function(animation) {
		sheet.deleteRule(animation.name, 0);

		eachPrefix(function(prefix) {
			try { sheet.deleteRule(prefix + ' ' + name); } catch (e) {} // ignore bad prefixes
		});
	};

	console.log('sheet', sheet);

	return {
		addAnimation: addAnimation,
		removeAnimation: removeAnimation,
		sheet: sheet
	};
};