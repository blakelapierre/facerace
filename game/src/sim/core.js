var _ = require('lodash');

module.exports = function(eventHandlers, getEventsFn, updateFn) {
  var clock = 0,
      eventQ = [];

  function tick(transport) {
    clock += 1;

    transport.clock = clock;

    transport.processedEvents = processEventQ();

    updateFn(clock);

    transport.outgoingEvents = swapQ();

    return transport;
  }

  function processEventQ() {
    var events = swapQ(getEventsFn());
    return _.filter(events, function(event) {
      event._c = clock;
      return (eventHandlers[event.type] || defaultHandler)(eventQ, event);
    });
  }

  function swapQ(newQ) {
    var events = newQ || eventQ;
    eventQ = [];
    return events;
  }

  function defaultHandler() {
    console.log('default', arguments);
    return false;
  }

  return tick;
};