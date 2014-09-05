var Core = require('../core_with_history');

printResults(no_events());
printResults(empty_event());
printResults(simple_event());
printResults(two_simple_events());

function no_events(iterations) {
  var core = Core({}, function() {}, function() {});

  iterations = iterations || 100000;

  var start = new Date();

  for (var i = 0; i < iterations; i++) {
    core(core.transport);
  }

  var end = new Date();

  return ['no_events', iterations, start, end];
}

function empty_event(iterations) {
  var core = Core({
    'event': function() {}
  }, function() {
    return [{type: 'event'}];
  }, function() {});

  iterations = iterations || 100000;

  var start = new Date();

  for (var i = 0; i < iterations; i++) {
    core(core.transport);
  }

  var end = new Date();

  var history = core.truncateHistory();

  return ['empty_event', iterations, start, end, {historyLength: history.length}];
}

function simple_event(iterations) {
  var core = Core({
    'count': function() {
      state.count++;
    }
  }, function() {
    return [{type: 'count'}];
  }, function() {});

  var state = {count: 0};

  iterations = iterations || 100000;

  var start = new Date();

  for (var i = 0; i < iterations; i++) {
    core(core.transport);
  }

  var end = new Date();

  var history = core.truncateHistory();

  return ['simple_event', iterations, start, end, {historyLength: history.length, state: state}];
}

function two_simple_events(iterations) {
  var core = Core({
    'count1': function() {
      state.count1++;
    },
    'count2': function() {
      state.count2++;
    }
  }, function() {
    var events = [];
    if (Math.random() <= 0.5) events.push({type: 'count1'});
    if (Math.random() <= 0.5) events.push({type: 'count2'});
    return events;
  }, function() {});

  var state = {count1: 0, count2: 0};

  iterations = iterations || 100000;

  var start = new Date();

  for (var i = 0; i < iterations; i++) {
    core(core.transport);
  }

  var end = new Date();

  var history = core.truncateHistory();

  return ['two_simple_events', iterations, start, end, {historyLength: history.length, state: state}];
}

function printResults(result) {
  var name = result[0],
      iterations = result[1],
      start = result[2],
      end = result[3],
      misc = result[4],
      time = (end.getTime() - start.getTime()),
      callsPerSecond = iterations / (time / 1000);

  console.log(name, iterations, 'iterations', time + 'ms', callsPerSecond, 'per second', misc);
}