/**
 * EventView and EventManager module
 * @dependency Event, EventList (GF Core)
 */
GF.Event = (function (GF) {


  /**
   * @class Area (for EventView)
   */
  function Area (x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
    this.w = w;
    this.h = h;
  }

  Area.prototype = {
    containsPoint: function (p) {
      if (this.x1 <= p.x && p.x <= this.x2) {
        if (this.y1 <= p.y && p.y <= this.y2) {
          return true;
        }
      }
      return false;
    },
    getNormX: function (p) {
      return (p.x - this.x1) / this.w;
    },
    getNormY: function (p) {
      return (p.y - this.y1) / this.h;
    },
    getNormPosition: function (p) {
      return {
        x: (p.x - this.x1) / this.w,
        y: (p.y - this.y1) / this.h
      };
    }
  };


  /**
   * @class  EventView
   */
  function EventView(manager) {

    // variables
    var cvs = document.getElementById('i-ui-event');
    var ctx = cvs.getContext('2d');

    var kNumBeat = 8; // 8 beats
    var kBeatDivision = 4; // 1 beat = 4 16th
    var kTotalTick = 8 * 480;
    var kNumLane = 16; // 16 lane

    var kLaneNameWidth = 120;
    var kTimelineHeight = 80;
    var kControlLaneHeight = 80;
    var kWorkSpaceWidth = 768;
    var kWorkSpaceHeight = 320;

    var kNumGridX = kNumBeat * kBeatDivision;
    var kNumGridY = kNumLane;
    var kGridSizeX = kWorkSpaceWidth / kNumGridX;
    var kGridSizeY = kWorkSpaceHeight / kNumGridY;

    var AreaLaneName = new Area(0, 0, kLaneNameWidth, kWorkSpaceHeight);
    var AreaWorkSpace = new Area(kLaneNameWidth, 0, kWorkSpaceWidth, kWorkSpaceHeight);
    var AreaControlLane = new Area(kLaneNameWidth, kWorkSpaceHeight, kWorkSpaceWidth, kControlLaneHeight);

    ctx.canvas.width = kLaneNameWidth + kWorkSpaceWidth;
    ctx.canvas.height = kWorkSpaceHeight + kControlLaneHeight;
    ctx.font = "11px sans-serif";
    ctx.textBaseline = "top";


    // utilities
    function _getMousePosition (event) {
      var b = cvs.getBoundingClientRect();
      return {
        x: event.clientX - b.left,
        y: event.clientY - b.top
      }
    }

    // these elements can be controlled by manager's order
    var _controls = {

    };

    // order from manager
    this.order = function (target, value) {

    };

    // report changes to manager
    this._onchange = function (elementName, action, value) {
      manager.report.call(manager, elementName, action, value);
    };



    /**
     * drawing-related
     */
    this.drawBackground = function () {
      // clear up
      ctx.fillStyle = "#333";
      ctx.fillRect(kLaneNameWidth, 0, kWorkSpaceWidth, kWorkSpaceHeight + kControlLaneHeight);
      // divider
      ctx.fillStyle = "#444";
      ctx.fillRect(kLaneNameWidth, kWorkSpaceHeight, kWorkSpaceWidth, kControlLaneHeight);
      // lane grid
      ctx.beginPath();
      ctx.strokeStyle = "#444";
      for (var i = 0; i < kNumGridY; i++) {
        ctx.moveTo(kLaneNameWidth, kGridSizeY * i);
        ctx.lineTo(kLaneNameWidth + kWorkSpaceWidth, kGridSizeY * i);
      }
      ctx.stroke();
      // time grid: regular
      ctx.beginPath();
      ctx.strokeStyle = "#444";
      for (var i = 0; i < kNumGridX; i++) {
        if (i % 4) {
          ctx.moveTo(kLaneNameWidth + i * kGridSizeX, 0);
          ctx.lineTo(kLaneNameWidth + i * kGridSizeX, kWorkSpaceHeight);
        }
      }
      ctx.stroke();
      // time grid: accent
      ctx.beginPath();
      ctx.strokeStyle = "#999";
      for (var i = 0; i < kNumGridX; i++) {
        if (i % 4 === 0) {
          ctx.moveTo(kLaneNameWidth + i * kGridSizeX, 0);
          ctx.lineTo(kLaneNameWidth + i * kGridSizeX, kWorkSpaceHeight + kControlLaneHeight);
        }
      }
      ctx.stroke();
    };

    this.drawLaneName = function (selectedLane) {
      for (var i = 0; i < kNumGridY; i++) {
        if (selectedLane === i) {
          ctx.fillStyle = "#FFF";
          ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
          ctx.fillStyle = "#555";
          ctx.fillText("sound " + i, 4, kGridSizeY * i + 3);
        } else {
          ctx.fillStyle = "#555";
          ctx.fillRect(0, kGridSizeY * i, kLaneNameWidth - 2, kGridSizeY - 1);
          ctx.fillStyle = "#EEE";
          ctx.fillText("sound " + i, 4, kGridSizeY * i + 3);
        }
      }
    };

    this.drawEvent = function (event) {
      // all events is 16th
      var pos = kLaneNameWidth + event.getTick() / kTotalTick * kWorkSpaceWidth;
      var dur = 120 / kTotalTick * kWorkSpaceWidth;
      ctx.strokeStyle = "#000";
      ctx.fillStyle = "#C66";
      ctx.strokeRect(pos + 2, event.lane * kGridSizeY + 2, dur - 4, kGridSizeY - 4);
      ctx.fillRect(pos + 2, event.lane * kGridSizeY + 2, dur - 4, kGridSizeY - 4);
    };

    this.drawSelectedEvent = function (event) {
      // all events is 16th
      var pos = kLaneNameWidth + event.getTick() / kTotalTick * kWorkSpaceWidth;
      var dur = 120 / kTotalTick * kWorkSpaceWidth;
      ctx.strokeStyle = "#FFF";
      ctx.fillStyle = "#F99";
      ctx.strokeRect(pos + 2, event.lane * kGridSizeY + 2, dur - 4, kGridSizeY - 4);
      ctx.fillRect(pos + 2, event.lane * kGridSizeY + 2, dur - 4, kGridSizeY - 4);
    };

    this.drawControlLane = function (eventsAtLane) {
      if (eventsAtLane) {
        for (var i = 0; i < eventsAtLane.length; i++) {
          var pos = kLaneNameWidth + eventsAtLane[i].getTick() / kTotalTick * kWorkSpaceWidth;
          var barTop = kWorkSpaceHeight + (1.0 - eventsAtLane[i].params.intensity) * kControlLaneHeight;
          var barHeight = eventsAtLane[i].params.intensity * kControlLaneHeight;
          var dur = 120 / kTotalTick * kWorkSpaceWidth;
          ctx.strokeStyle = "#000";
          ctx.strokeRect(pos + 2, barTop, dur - 4, barHeight);
          ctx.fillStyle = "#669";
          ctx.fillRect(pos + 2, barTop, dur - 4, barHeight);
        }
      }
    };

    this.drawPlayhead = function (tick) {
      var pos = tick / kTotalTick * kWorkSpaceWidth + kLaneNameWidth;
      ctx.beginPath();
      ctx.strokeStyle = "#FFF";
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, kWorkSpaceHeight + kControlLaneHeight);
      ctx.stroke();
    };



    /**
     * Event-related
     */
    var _prevTick = 0;

    /**
     * responders
     */
    function _draggedWorkSpace (event) {
      var p = _getMousePosition(event);
      if (AreaWorkSpace.containsPoint(p)) {
        var tick = ~~(AreaWorkSpace.getNormX(p) * 480 * 8);
        var data = {
          lane: ~~(AreaWorkSpace.getNormY(p) * kNumLane),
          tick: tick,
          deltaTick: tick - _prevTick
        };
        manager.report.call(manager, "workspace", "dragged", data);
        _prevTick = tick;
      }
    }

    function _releasedWorkSpace (event) {
      manager.report.call(manager, "workspace", "released", null);
      window.removeEventListener("mousemove", _draggedWorkSpace, false);
      window.removeEventListener("mouseup", _releasedWorkSpace, false);
    }

    function _draggedControlLane (event) {
      var p = _getMousePosition(event);
      if (AreaControlLane.containsPoint(p)) {
        var data = {
          tick: ~~(AreaControlLane.getNormX(p) * 480 * 8),
          value: 1.0 - AreaControlLane.getNormY(p)
        };
        manager.report.call(manager, "controllane", "dragged", data);
      }
    }

    function _releasedControlLane (event) {
      manager.report.call(manager, "controllane", "released", null);
      window.removeEventListener("mousemove", _draggedControlLane, false);
      window.removeEventListener("mouseup", _releasedControlLane, false);
    }


    // event router: on click (entry point)
    cvs.addEventListener("mousedown", function (event) {
      // get mouse position
      var p = _getMousePosition(event);
      // when mouse on lane names
      if (AreaLaneName.containsPoint(p)) {
        var data = {
          lane: ~~(AreaLaneName.getNormY(p) * kNumLane)
        };
        manager.report.call(manager, "lanename", "clicked", data);
      }
      // when mouse on workspace
      else if (AreaWorkSpace.containsPoint(p)) {
        var tick = ~~(AreaWorkSpace.getNormX(p) * 480 * 8);
        var data = {
          lane: ~~(AreaWorkSpace.getNormY(p) * kNumLane),
          tick: tick
        };
        var action = "clicked";
        if (event.shiftKey) {
          action = "shiftclicked";
        } else if (event.altKey) {
          action = "altclicked";
        }
        manager.report.call(manager, "workspace", action, data);
        window.addEventListener("mousemove", _draggedWorkSpace, false);
        window.addEventListener("mouseup", _releasedWorkSpace, false);
        _prevTick = tick;
      }
      // when mouse on control lane
      else if (AreaControlLane.containsPoint(p)) {
        var data = {
          tick: ~~(AreaControlLane.getNormX(p) * 480 * 8),
          value: 1.0 - AreaControlLane.getNormY(p)
        };
        manager.report.call(manager, "controllane", "clicked", data);
        window.addEventListener("mousemove", _draggedControlLane, false);
        window.addEventListener("mouseup", _releasedControlLane, false);
      }
    }, false);

    // handling key
    window.addEventListener("keydown", function (event) {
      switch (event.keyCode) {
        case 8:
        case 46:
          event.preventDefault();
          manager.report.call(manager, "window", "deletekey", null);
          break;
      }
    }, false);

    // block context menu
    cvs.addEventListener("contextmenu", function (event) {
      event.preventDefault();
    }, false);

  }



  /**
   * @class  EventManager
   */
  function EventManager() {

    // view
    this.view = new EventView(this);

    // Eventlist
    this.eventlist = GF.createEventList();
    this.selectBuffer = GF.createEventList();

    // Event filter
    this.eventFilter = GF.createEventFilter();


    // TEMP: filling random data
    for (var i = 0; i < 1; i++) {
      var lane = ~~(Math.random() * 16);
      var mTime = GF.mTime(~~(Math.random() * 8), ~~(Math.random() * 480));
      var params = { intensity: Math.random() * 0.75 + 0.25 };
      this.eventlist.addEvent(GF.createEvent(lane, mTime, params));
    }

    // initial options
    this.drawOptions = {
      selectedLane: 0,
      playheadPosition: 0
    };

    // initial draw
    this._selectEventsFromList(this.eventlist.findEventsAtLane(this.drawOptions.selectedLane));
    this.updateView();

  };

  EventManager.prototype = {
    // report from view
    report: function (element, action, data) {
      //console.log(element, action, data);
      switch (action) {

        // case clicked
        case "clicked":
          switch (element) {
            case "lanename":
              this.drawOptions.selectedLane = data.lane;
              this._insertSelectionToList();
              this._selectEventsFromList(this.eventlist.findEventsAtLane(data.lane));
              this.updateView();
              break
            case "workspace":
              this.drawOptions.selectedLane = data.lane;
              var mTime = GF.mTime(0, data.tick);
              var evt1 = this.eventlist.findEventAtPosition(data.lane, mTime);
              var evt2 = this.selectBuffer.findEventAtPosition(data.lane, mTime);
              if (evt1) {
                this._insertSelectionToList();
                this._selectEventsFromList([evt1]);
              } else if (evt2) {
                // do nothing
              } else {
                // if click on empty area
                // : empty selection and create a new event
                this._insertSelectionToList();
                this.eventlist.addEvent(GF.createEvent(
                  data.lane,
                  GF.mTime(0, data.tick),
                  { intensity: 0.75 }
                ));
              }
              this.updateView();
              break;
            case "controllane":
              var evt = this._findEventAtPosition(
                this.drawOptions.selectedLane,
                GF.mTime(0, data.tick)
              );
              if (evt) {
                evt.params.intensity = data.value;
                this.updateView();
              }

              break;
          }
          break;

        // case shiftclicked
        case "shiftclicked":
          var evt = this._findEventAtPosition(
            data.lane,
            GF.mTime(0, data.tick)
          );
          if (evt) {
            this.drawOptions.selectedLane = data.lane;
            this._selectEventsFromList([evt]);
            this.updateView();
          }
          break;

        // case altclicked
        case "altclicked":
          break;

        // case dragged
        case "dragged":
          switch (element) {
            case "workspace":
              if (this.selectBuffer.head) {
                this.selectBuffer.iterate(function (event) {
                  event.moveTime(GF.mTime(0, data.deltaTick));
                });
                this.updateView();
              } else {
                var evt = this._findEventAtPosition(data.lane, GF.mTime(0, data.tick));
                if (evt) {
                  // do nothing
                } else {
                  this.drawOptions.selectedLane = data.lane;
                  this.eventlist.addEvent(GF.createEvent(
                    data.lane,
                    GF.mTime(0, data.tick),
                    { intensity: 0.75 }
                  ));
                }
                this.updateView();
              }
              break;
            case "controllane":
              var evt = this._findEventAtPosition(
                this.drawOptions.selectedLane,
                GF.mTime(0, data.tick)
              );
              if (evt) {
                evt.params.intensity = data.value;
                this.updateView();
              }
              break;
          }
          break;

          case "deletekey":
            this.selectBuffer.empty();
            this.updateView();
            break;
      }
    },

    // order to the view
    order: function (target, value) {
      this.view.order(target, value);
    },

    // set param from transport
    setParam: function (param, value) {
      switch (param) {
        case 'playheadPosition':
          this.drawOptions.playheadPosition = value;
          break;
      }
    },

    // update view
    updateView: function () {
      var lane = this.drawOptions.selectedLane;
      this.view.drawBackground();
      this.view.drawLaneName(lane);
      this.view.drawControlLane(this.eventlist.findEventsAtLane(lane));
      this.view.drawControlLane(this.selectBuffer.findEventsAtLane(lane));
      this.eventlist.iterate(function (event) {
        this.view.drawEvent(this.eventFilter.filter(event));
      }.bind(this));
      this.selectBuffer.iterate(function (event) {
        this.view.drawSelectedEvent(this.eventFilter.filter(event));
      }.bind(this));
      this.view.drawPlayhead(this.drawOptions.playheadPosition);
    },

    _selectEventsFromList: function (events) {
      // list -> selection
      for (var i = 0; i < events.length; i++) {
        this.selectBuffer.addEvent(events[i]);
        this.eventlist.removeEvent(events[i]);
      }
    },

    _insertSelectionToList: function () {
      // selection -> list
      this.selectBuffer.iterate(function (event) {
        this.eventlist.addEvent(event);
      }.bind(this));
      this.selectBuffer.empty();
    },

    _findEventAtPosition: function (lane, mTime) {
      var evt1 = this.eventlist.findEventAtPosition(lane, mTime);
      var evt2 = this.selectBuffer.findEventAtPosition(lane, mTime);
      return (evt2 || evt1);
    },

    setTimeAtPosition: function (mTime) {
      this.eventlist.setTimeAtPosition(mTime);
      this.selectBuffer.setTimeAtPosition(mTime);
    }
  };


  /**
   * initiate
   */
  GF.EventManager = new EventManager();

})(GF, WX);