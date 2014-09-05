var _ = require('lodash');

module.exports = function(eventHandlers, getEventsFn, updateFn) {
  var clock = 0,
      eventQ = [],
      history = [];

  function tick(transport) {
    clock += 1;

    transport.clock = clock;

    transport.processedEvents = processEventQ();

    updateFn(clock);

    transport.outgoingEvents = swapQ();

    return transport;
  }

  function processEventQ() {
    var queuedEvents = swapQ(getEventsFn());

    var processedEvents = _.filter(queuedEvents, function(event) {
      event._c = clock;
      return (eventHandlers[event.type] || defaultHandler)(eventQ, event);
    });

    history.push([clock, processedEvents]);

    return processedEvents;
  }

  function swapQ(newQ) {
    var events = newQ || eventQ;
    eventQ = [];
    return events;
  }

  function defaultHandler() {
    console.log('defaultHandler()', arguments);
    return false;
  }

  return _.extend(tick, {
    transport: {},
    truncateHistory: function() {
      var existingHistory = history;
      history = [];
      return existingHistory;
    }
  });
};