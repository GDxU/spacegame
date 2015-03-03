/// <reference path="../lib/pixi.d.ts" />
var Rance;
(function (Rance) {
    function EventManager() {
    }
    Rance.EventManager = EventManager;
    ;

    var et = PIXI.EventTarget;

    et.mixin(EventManager.prototype);

    Rance.eventManager = new EventManager();
})(Rance || (Rance = {}));
/// <reference path="../../../lib/tween.js.d.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitStrength = React.createClass({
            displayName: "UnitStrength",
            getInitialState: function () {
                return ({
                    displayedStrength: this.props.currentStrength,
                    activeTween: null
                });
            },
            componentWillReceiveProps: function (newProps) {
                if (newProps.currentStrength !== this.props.currentStrength) {
                    if (this.props.animateStrength) {
                        this.animateDisplayedStrength(newProps.currentStrength, 2000);
                    } else {
                        this.updateDisplayStrength(newProps.currentStrength);
                    }
                }
            },
            componentWillUnmount: function () {
                if (this.activeTween) {
                    this.activeTween.stop();
                }
            },
            updateDisplayStrength: function (newAmount) {
                this.setState({
                    displayedStrength: newAmount
                });
            },
            animateDisplayedStrength: function (newAmount, time) {
                var self = this;
                var stopped = false;

                var animateTween = function () {
                    if (stopped) {
                        cancelAnimationFrame(self.requestAnimFrame);
                        return;
                    }

                    TWEEN.update();
                    self.requestAnimFrame = requestAnimFrame(animateTween);
                };

                var tween = new TWEEN.Tween({
                    health: self.state.displayedStrength
                }).to({
                    health: newAmount
                }, time).onUpdate(function () {
                    self.setState({
                        displayedStrength: this.health
                    });
                }).easing(TWEEN.Easing.Sinusoidal.Out);

                tween.onStop(function () {
                    stopped = true;
                    TWEEN.remove(tween);
                });

                this.activeTween = tween;

                tween.start();
                animateTween();
            },
            makeSquadronInfo: function () {
                return (React.DOM.div({ className: "unit-strength-container" }, this.makeStrengthText()));
            },
            makeCapitalInfo: function () {
                var text = this.makeStrengthText();

                var relativeHealth = this.state.displayedStrength / this.props.maxStrength;

                var bar = React.DOM.div({
                    className: "unit-strength-bar"
                }, React.DOM.div({
                    className: "unit-strength-bar-value",
                    style: {
                        width: "" + relativeHealth * 100 + "%"
                    }
                }));

                return (React.DOM.div({ className: "unit-strength-container" }, text, bar));
            },
            makeStrengthText: function () {
                var critThreshhold = 0.3;
                var currentStyle = {
                    className: "unit-strength-current"
                };

                var healthRatio = this.state.displayedStrength / this.props.maxStrength;

                if (healthRatio <= critThreshhold) {
                    currentStyle.className += " critical";
                } else if (this.state.displayedStrength < this.props.maxStrength) {
                    currentStyle.className += " wounded";
                }

                var containerProps = {
                    className: (this.props.isSquadron ? "unit-strength-amount" : "unit-strength-amount-capital")
                };

                return (React.DOM.div(containerProps, React.DOM.span(currentStyle, Math.ceil(this.state.displayedStrength)), React.DOM.span({ className: "unit-strength-max" }, "/" + this.props.maxStrength)));
            },
            render: function () {
                var toRender;
                if (this.props.isSquadron) {
                    toRender = this.makeSquadronInfo();
                } else {
                    toRender = this.makeCapitalInfo();
                }

                return (toRender);
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="unitstrength.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitActions = React.createClass({
            displayName: "UnitActions",
            render: function () {
                var availableSrc = "img\/icons\/availableAction.png";
                var spentSrc = "img\/icons\/spentAction.png";

                var icons = [];

                for (var i = 0; i < this.props.currentActionPoints; i++) {
                    icons.push(React.DOM.img({
                        src: availableSrc,
                        key: "available" + i
                    }));
                }
                var availableCount = this.props.maxActionPoints - this.props.currentActionPoints;
                for (var i = 0; i < availableCount; i++) {
                    icons.push(React.DOM.img({
                        src: spentSrc,
                        key: "spent" + i
                    }));
                }

                return (React.DOM.div({ className: "unit-action-points" }, icons));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitStatus = React.createClass({
            displayName: "UnitStatus",
            render: function () {
                var statusElement = null;

                if (this.props.guardAmount > 0) {
                    var guard = this.props.guardAmount;
                    statusElement = React.DOM.div({
                        className: "status-container guard-meter-container"
                    }, React.DOM.div({
                        className: "guard-meter-value",
                        style: {
                            width: "" + Rance.clamp(guard, 0, 100) + "%"
                        }
                    }), React.DOM.div({
                        className: "status-inner-wrapper"
                    }, React.DOM.div({
                        className: "guard-text-container status-inner"
                    }, React.DOM.div({
                        className: "guard-text status-text"
                    }, "Guard"), React.DOM.div({
                        className: "guard-text-value status text"
                    }, "" + guard + "%"))));
                }

                return (React.DOM.div({ className: "unit-status" }, statusElement));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="unitstrength.ts"/>
/// <reference path="unitactions.ts"/>
/// <reference path="unitstatus.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitInfo = React.createClass({
            displayName: "UnitInfo",
            mixins: [React.addons.PureRenderMixin],
            render: function () {
                var battleEndStatus = null;
                if (this.props.isDead) {
                    battleEndStatus = React.DOM.div({
                        className: "unit-battle-end-status-container"
                    }, React.DOM.div({
                        className: "unit-battle-end-status unit-battle-end-status-dead"
                    }, "Destroyed"));
                } else if (this.props.isCaptured) {
                    battleEndStatus = React.DOM.div({
                        className: "unit-battle-end-status-container"
                    }, React.DOM.div({
                        className: "unit-battle-end-status unit-battle-end-status-captured"
                    }, "Captured"));
                }

                return (React.DOM.div({ className: "unit-info" }, React.DOM.div({ className: "unit-info-name" }, this.props.name), React.DOM.div({ className: "unit-info-inner" }, Rance.UIComponents.UnitStatus({
                    guardAmount: this.props.guardAmount
                }), Rance.UIComponents.UnitStrength({
                    maxStrength: this.props.maxStrength,
                    currentStrength: this.props.currentStrength,
                    isSquadron: this.props.isSquadron,
                    animateStrength: true
                }), Rance.UIComponents.UnitActions({
                    maxActionPoints: this.props.maxActionPoints,
                    currentActionPoints: this.props.currentActionPoints
                }), battleEndStatus)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitIcon = React.createClass({
            displayName: "UnitIcon",
            mixins: [React.addons.PureRenderMixin],
            render: function () {
                var unit = this.props.unit;

                var imageProps = {
                    className: "unit-icon",
                    src: this.props.icon
                };

                var fillerProps = {
                    className: "unit-icon-filler"
                };

                if (this.props.isActiveUnit) {
                    fillerProps.className += " active-border";
                    imageProps.className += " active-border";
                }

                if (this.props.facesLeft) {
                    fillerProps.className += " unit-border-right";
                    imageProps.className += " unit-border-no-right";
                } else {
                    fillerProps.className += " unit-border-left";
                    imageProps.className += " unit-border-no-left";
                }

                var middleElement = this.props.icon ? React.DOM.img(imageProps) : React.DOM.div(imageProps);

                return (React.DOM.div({ className: "unit-icon-container" }, React.DOM.div(fillerProps), middleElement, React.DOM.div(fillerProps)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../../../lib/react.d.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.Draggable = {
            getDefaultProps: function () {
                return ({
                    dragThreshhold: 5
                });
            },
            getInitialState: function () {
                return ({
                    mouseDown: false,
                    dragging: false,
                    dragOffset: {
                        x: 0,
                        y: 0
                    },
                    mouseDownPosition: {
                        x: 0,
                        y: 0
                    },
                    originPosition: {
                        x: 0,
                        y: 0
                    },
                    clone: null
                });
            },
            handleMouseDown: function (e) {
                var clientRect = this.DOMNode.getBoundingClientRect();

                this.addEventListeners();

                this.setState({
                    mouseDown: true,
                    mouseDownPosition: {
                        x: e.pageX,
                        y: e.pageY
                    },
                    originPosition: {
                        x: clientRect.left + document.body.scrollLeft,
                        y: clientRect.top + document.body.scrollTop
                    },
                    dragOffset: {
                        x: e.clientX - clientRect.left,
                        y: e.clientY - clientRect.top
                    }
                });
            },
            handleMouseMove: function (e) {
                if (e.clientX === 0 && e.clientY === 0)
                    return;

                if (!this.state.dragging) {
                    var deltaX = Math.abs(e.pageX - this.state.mouseDownPosition.x);
                    var deltaY = Math.abs(e.pageY - this.state.mouseDownPosition.y);

                    var delta = deltaX + deltaY;

                    if (delta >= this.props.dragThreshhold) {
                        var stateObj = {
                            dragging: true,
                            dragPos: {
                                width: parseInt(this.DOMNode.offsetWidth),
                                height: parseInt(this.DOMNode.offsetHeight)
                            }
                        };

                        if (this.props.makeClone) {
                            var nextSibling = this.DOMNode.nextSibling;
                            var clone = this.DOMNode.cloneNode(true);
                            Rance.recursiveRemoveAttribute(clone, "data-reactid");

                            this.DOMNode.parentNode.insertBefore(clone, nextSibling);
                            stateObj.clone = clone;
                        }

                        this.setState(stateObj);

                        if (this.onDragStart) {
                            this.onDragStart(e);
                        }
                    }
                }

                if (this.state.dragging) {
                    this.handleDrag(e);
                }
            },
            handleDrag: function (e) {
                var x = e.pageX - this.state.dragOffset.x;
                var y = e.pageY - this.state.dragOffset.y;

                var domWidth = this.state.dragPos.width || parseInt(this.DOMNode.offsetWidth);
                var domHeight = this.state.dragPos.height || parseInt(this.DOMNode.offsetHeight);

                var containerWidth = parseInt(this.containerElement.offsetWidth);
                var containerHeight = parseInt(this.containerElement.offsetHeight);

                var x2 = x + domWidth;
                var y2 = y + domHeight;

                if (x < 0) {
                    x = 0;
                } else if (x2 > containerWidth) {
                    x = containerWidth - domWidth;
                }
                ;

                if (y < 0) {
                    y = 0;
                } else if (y2 > containerHeight) {
                    y = containerHeight - domHeight;
                }
                ;

                this.setState({
                    dragPos: {
                        top: y,
                        left: x,
                        width: this.props.makeClone ? null : this.state.dragPos.width,
                        height: this.props.makeClone ? null : this.state.dragPos.height
                    }
                });

                //this.DOMNode.style.left = x+"px";
                //this.DOMNode.style.top = y+"px";
                if (this.onDragMove) {
                    this.onDragMove(x, y);
                }
            },
            handleMouseUp: function (e) {
                this.setState({
                    mouseDown: false,
                    mouseDownPosition: {
                        x: 0,
                        y: 0
                    }
                });

                if (this.state.dragging) {
                    this.handleDragEnd(e);
                }

                this.removeEventListeners();
            },
            handleDragEnd: function (e) {
                if (this.state.clone) {
                    this.state.clone.parentNode.removeChild(this.state.clone);
                }
                this.setState({
                    dragging: false,
                    dragOffset: {
                        x: 0,
                        y: 0
                    },
                    originPosition: {
                        x: 0,
                        y: 0
                    },
                    clone: null
                });

                if (this.onDragEnd) {
                    var endSuccesful = this.onDragEnd(e);

                    if (!endSuccesful) {
                        this.DOMNode.style.left = this.state.originPosition.x + "px";
                        this.DOMNode.style.top = this.state.originPosition.y + "px";
                    } else {
                        this.DOMNode.style.left = this.props.position.left;
                        this.DOMNode.style.top = this.props.position.top;
                    }
                }
            },
            addEventListeners: function () {
                var self = this;
                this.containerElement.addEventListener("mousemove", self.handleMouseMove);
                document.addEventListener("mouseup", self.handleMouseUp);
            },
            removeEventListeners: function () {
                var self = this;
                this.containerElement.removeEventListener("mousemove", self.handleMouseMove);
                document.removeEventListener("mouseup", self.handleMouseUp);
            },
            componentDidMount: function () {
                this.DOMNode = this.getDOMNode();
                this.containerElement = document.body;
                if (this.props.containerElement) {
                    if (this.props.containerElement.getDOMNode) {
                        // React component
                        this.containerElement = this.props.containerElement.getDOMNode();
                    } else
                        this.containerElement = this.props.containerElement;
                }
            },
            componentWillUnmount: function () {
                this.removeEventListeners();
            }
        };
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="unitinfo.ts"/>
/// <reference path="uniticon.ts"/>
/// <reference path="../mixins/draggable.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.Unit = React.createClass({
            displayName: "Unit",
            mixins: [Rance.UIComponents.Draggable, React.addons.PureRenderMixin],
            getInitialState: function () {
                return ({
                    hasPopup: false,
                    popupElement: null
                });
            },
            onDragStart: function (e) {
                this.props.onDragStart(this.props.unit);
            },
            onDragEnd: function (e) {
                this.props.onDragEnd();
            },
            handleMouseEnter: function (e) {
                if (!this.props.handleMouseEnterUnit)
                    return;
                if (this.props.unit.currentStrength <= 0)
                    return;

                this.props.handleMouseEnterUnit(this.props.unit);
            },
            handleMouseLeave: function (e) {
                if (!this.props.handleMouseLeaveUnit)
                    return;

                this.props.handleMouseLeaveUnit(e);
            },
            render: function () {
                var unit = this.props.unit;
                unit.uiDisplayIsDirty = false;

                var containerProps = {
                    className: "unit-container",
                    key: "container"
                };
                var wrapperProps = {
                    className: "unit",
                    id: "unit-id_" + unit.id
                };

                wrapperProps.onMouseEnter = this.handleMouseEnter;
                wrapperProps.onMouseLeave = this.handleMouseLeave;

                if (this.props.isDraggable) {
                    wrapperProps.className += " draggable";
                    wrapperProps.onMouseDown = this.handleMouseDown;
                }

                if (this.state.dragging) {
                    wrapperProps.style = this.state.dragPos;
                    wrapperProps.className += " dragging";
                }

                if (this.props.facesLeft) {
                    wrapperProps.className += " enemy-unit";
                } else {
                    wrapperProps.className += " friendly-unit";
                }

                var isActiveUnit = (this.props.activeUnit && unit.id === this.props.activeUnit.id);

                if (isActiveUnit) {
                    wrapperProps.className += " active-unit";
                }

                var isInPotentialTargetArea = (this.props.targetsInPotentialArea && this.props.targetsInPotentialArea.indexOf(unit) >= 0);

                if (isInPotentialTargetArea) {
                    wrapperProps.className += " target-unit";
                }

                if (this.props.hoveredUnit && this.props.hoveredUnit.id === unit.id) {
                    wrapperProps.className += " hovered-unit";
                }

                var infoProps = {
                    key: "info",
                    name: unit.name,
                    guardAmount: unit.battleStats.guardAmount,
                    maxStrength: unit.maxStrength,
                    currentStrength: unit.currentStrength,
                    isSquadron: unit.isSquadron,
                    maxActionPoints: unit.attributes.maxActionPoints,
                    currentActionPoints: unit.battleStats.currentActionPoints,
                    isDead: this.props.isDead,
                    isCaptured: this.props.isCaptured
                };

                var containerElements = [
                    React.DOM.div({ className: "unit-image", key: "image" }),
                    Rance.UIComponents.UnitInfo(infoProps)
                ];

                if (this.props.facesLeft) {
                    containerElements = containerElements.reverse();
                }

                if (unit.displayFlags.isAnnihilated) {
                    containerElements.push(React.DOM.div({ key: "overlay", className: "unit-annihilated-overlay" }, "Unit annihilated"));
                }

                var allElements = [
                    React.DOM.div(containerProps, containerElements),
                    Rance.UIComponents.UnitIcon({
                        icon: unit.template.icon,
                        facesLeft: this.props.facesLeft,
                        key: "icon",
                        isActiveUnit: isActiveUnit
                    })
                ];

                if (this.props.facesLeft) {
                    allElements = allElements.reverse();
                }

                return (React.DOM.div(wrapperProps, allElements));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.EmptyUnit = React.createClass({
            displayName: "EmptyUnit",
            shouldComponentUpdate: function () {
                return false;
            },
            render: function () {
                var wrapperProps = {
                    className: "unit empty-unit"
                };

                var containerProps = {
                    className: "unit-container",
                    key: "container"
                };

                if (this.props.facesLeft) {
                    wrapperProps.className += " enemy-unit";
                } else {
                    wrapperProps.className += " friendly-unit";
                }

                var allElements = [
                    React.DOM.div(containerProps, null),
                    Rance.UIComponents.UnitIcon({
                        icon: null,
                        facesLeft: this.props.facesLeft,
                        key: "icon"
                    })
                ];

                if (this.props.facesLeft) {
                    allElements = allElements.reverse();
                }

                return (React.DOM.div(wrapperProps, allElements));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="uniticon.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitWrapper = React.createClass({
            shouldComponentUpdate: function (newProps) {
                if (!this.props.unit && !newProps.unit)
                    return false;

                if (newProps.unit && newProps.unit.uiDisplayIsDirty)
                    return true;

                var targetedProps = {
                    activeUnit: true,
                    hoveredUnit: true,
                    targetsInPotentialArea: true,
                    activeEffectUnits: true
                };

                for (var prop in newProps) {
                    if (!targetedProps[prop] && prop !== "position") {
                        if (newProps[prop] !== this.props[prop]) {
                            return true;
                        }
                    }
                }
                for (var prop in targetedProps) {
                    var unit = newProps.unit;
                    var oldValue = this.props[prop];
                    var newValue = newProps[prop];

                    if (!newValue && !oldValue)
                        continue;

                    if (prop === "targetsInPotentialArea" || prop === "activeEffectUnits") {
                        if (!oldValue) {
                            if (newValue.indexOf(unit) >= 0)
                                return true;
                            else {
                                continue;
                            }
                        }
                        if ((oldValue.indexOf(unit) >= 0) !== (newValue.indexOf(unit) >= 0)) {
                            return true;
                        }
                    } else if (newValue !== oldValue && (oldValue === unit || newValue === unit)) {
                        return true;
                    }
                }

                if (newProps.battle && newProps.battle.ended) {
                    return true;
                }

                return false;
            },
            displayName: "UnitWrapper",
            handleMouseUp: function () {
                this.props.onMouseUp(this.props.position);
            },
            render: function () {
                var allElements = [];

                var wrapperProps = {
                    className: "unit-wrapper"
                };

                if (this.props.onMouseUp) {
                    wrapperProps.onMouseUp = this.handleMouseUp;
                }
                ;
                if (this.props.activeEffectUnits) {
                    if (this.props.activeEffectUnits.indexOf(this.props.unit) >= 0) {
                        wrapperProps.className += " active-effect-unit";
                    }
                }

                var empty = Rance.UIComponents.EmptyUnit({
                    facesLeft: this.props.facesLeft,
                    key: "empty_" + this.props.key,
                    position: this.props.position
                });

                allElements.push(empty);

                if (this.props.unit) {
                    var isDead = false;
                    if (this.props.battle && this.props.battle.deadUnits && this.props.battle.deadUnits.length > 0) {
                        if (this.props.battle.deadUnits.indexOf(this.props.unit) >= 0) {
                            this.props.isDead = true;
                        }
                    }

                    var isCaptured = false;
                    if (this.props.battle && this.props.battle.capturedUnits && this.props.battle.capturedUnits.length > 0) {
                        if (this.props.battle.capturedUnits.indexOf(this.props.unit) >= 0) {
                            this.props.isCaptured = true;
                        }
                    }

                    var unit = Rance.UIComponents.Unit(this.props);
                    allElements.push(unit);
                }

                return (React.DOM.div(wrapperProps, allElements));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../unit/unit.ts"/>
/// <reference path="../unit/emptyunit.ts"/>
/// <reference path="../unit/unitwrapper.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FleetColumn = React.createClass({
            displayName: "FleetColumn",
            render: function () {
                var column = this.props.column;

                var absoluteColumnPosition = this.props.columnPosInOwnFleet + (this.props.facesLeft ? 2 : 0);

                var units = [];

                for (var i = 0; i < column.length; i++) {
                    var data = {};

                    data.key = i;
                    data.unit = column[i];
                    data.position = [absoluteColumnPosition, i];
                    data.battle = this.props.battle;
                    data.facesLeft = this.props.facesLeft;
                    data.activeUnit = this.props.activeUnit;
                    data.activeTargets = this.props.activeTargets;
                    data.hoveredUnit = this.props.hoveredUnit;
                    data.handleMouseLeaveUnit = this.props.handleMouseLeaveUnit;
                    data.handleMouseEnterUnit = this.props.handleMouseEnterUnit;
                    data.targetsInPotentialArea = this.props.targetsInPotentialArea;
                    data.activeEffectUnits = this.props.activeEffectUnits;

                    data.onMouseUp = this.props.onMouseUp;

                    data.isDraggable = this.props.isDraggable;
                    data.onDragStart = this.props.onDragStart;
                    data.onDragEnd = this.props.onDragEnd;

                    /*
                    if (!data.unit)
                    {
                    units.push(UIComponents.EmptyUnit(data));
                    }
                    else
                    {
                    units.push(UIComponents.Unit(data));
                    }*/
                    units.push(Rance.UIComponents.UnitWrapper(data));
                }

                return (React.DOM.div({ className: "battle-fleet-column" }, units));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="fleetcolumn.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.Fleet = React.createClass({
            displayName: "Fleet",
            render: function () {
                var fleet = this.props.fleet;

                var columns = [];

                for (var i = 0; i < fleet.length; i++) {
                    columns.push(Rance.UIComponents.FleetColumn({
                        key: i,
                        column: fleet[i],
                        columnPosInOwnFleet: i,
                        battle: this.props.battle,
                        facesLeft: this.props.facesLeft,
                        activeUnit: this.props.activeUnit,
                        hoveredUnit: this.props.hoveredUnit,
                        handleMouseEnterUnit: this.props.handleMouseEnterUnit,
                        handleMouseLeaveUnit: this.props.handleMouseLeaveUnit,
                        targetsInPotentialArea: this.props.targetsInPotentialArea,
                        activeEffectUnits: this.props.activeEffectUnits,
                        onMouseUp: this.props.onMouseUp,
                        isDraggable: this.props.isDraggable,
                        onDragStart: this.props.onDragStart,
                        onDragEnd: this.props.onDragEnd
                    }));
                }

                return (React.DOM.div({ className: "battle-fleet" }, columns));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.TurnCounter = React.createClass({
            displayName: "TurnCounter",
            mixins: [React.addons.PureRenderMixin],
            render: function () {
                var turnsLeft = this.props.turnsLeft;

                var turns = [];

                var usedTurns = this.props.maxTurns - turnsLeft;

                for (var i = 0; i < usedTurns; i++) {
                    turns.push(React.DOM.div({
                        key: "used" + i,
                        className: "turn-counter used-turn"
                    }));
                }

                for (var i = 0; i < turnsLeft; i++) {
                    turns.push(React.DOM.div({
                        key: "available" + i,
                        className: "turn-counter available-turn"
                    }));
                }

                return (React.DOM.div({ className: "turns-container" }, turns));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.TurnOrder = React.createClass({
            displayName: "TurnOrder",
            getInitialState: function () {
                return ({
                    maxUnits: 7
                });
            },
            componentDidMount: function () {
                this.setMaxUnits();

                window.addEventListener("resize", this.setMaxUnits);
            },
            componentWillUnmount: function () {
                window.removeEventListener("resize", this.setMaxUnits);
            },
            setMaxUnits: function () {
                var minUnits = 7;

                var containerElement = this.getDOMNode();

                var containerWidth = containerElement.getBoundingClientRect().width;
                containerWidth -= 30;
                var unitElementWidth = 160;

                var ceil = Math.ceil(containerWidth / unitElementWidth);

                this.setState({
                    maxUnits: Math.max(ceil, minUnits)
                });
            },
            render: function () {
                var maxUnits = this.state.maxUnits;
                var turnOrder = this.props.turnOrder.slice(0);

                if (this.props.potentialDelay) {
                    var fake = {
                        isFake: true,
                        id: this.props.potentialDelay.id,
                        battleStats: {
                            moveDelay: this.props.potentialDelay.delay
                        }
                    };

                    turnOrder.push(fake);

                    turnOrder.sort(Rance.turnOrderSortFunction);
                }

                var maxUnitsWithFake = maxUnits;

                if (fake && turnOrder.indexOf(fake) <= maxUnits) {
                    maxUnitsWithFake++;
                }

                turnOrder = turnOrder.slice(0, maxUnitsWithFake);

                var toRender = [];

                for (var i = 0; i < turnOrder.length; i++) {
                    var unit = turnOrder[i];

                    if (unit.isFake) {
                        toRender.push(React.DOM.div({
                            className: "turn-order-arrow",
                            key: "" + i
                        }));
                        continue;
                    }

                    var data = {
                        key: "" + i,
                        className: "turn-order-unit",
                        title: "delay: " + unit.battleStats.moveDelay + "\n" + "speed: " + unit.attributes.speed,
                        onMouseEnter: this.props.onMouseEnterUnit.bind(null, unit),
                        onMouseLeave: this.props.onMouseLeaveUnit
                    };

                    if (this.props.unitsBySide.side1.indexOf(unit) > -1) {
                        data.className += " turn-order-unit-friendly";
                    } else if (this.props.unitsBySide.side2.indexOf(unit) > -1) {
                        data.className += " turn-order-unit-enemy";
                    }

                    if (this.props.hoveredUnit && unit.id === this.props.hoveredUnit.id) {
                        data.className += " turn-order-unit-hover";
                    }

                    toRender.push(React.DOM.div(data, unit.name));
                }

                if (this.props.turnOrder.length > maxUnits) {
                    toRender.push(React.DOM.div({
                        className: "turn-order-more",
                        key: "more"
                    }, "..."));
                }

                return (React.DOM.div({ className: "turn-order-container" }, toRender));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.AbilityTooltip = React.createClass({
            displayName: "AbilityTooltip",
            shouldComponentUpdate: function (newProps) {
                for (var prop in newProps) {
                    if (prop !== "activeTargets") {
                        if (this.props[prop] !== newProps[prop]) {
                            return true;
                        }
                    }
                }
                return false;
            },
            render: function () {
                var abilities = this.props.activeTargets[this.props.targetUnit.id];

                var abilityElements = [];

                var containerProps = {
                    className: "ability-tooltip",
                    onMouseLeave: this.props.handleMouseLeave
                };

                var parentRect = this.props.parentElement.getBoundingClientRect();

                if (this.props.facesLeft) {
                    containerProps.className += " ability-tooltip-faces-left";

                    containerProps.style = {
                        position: "fixed",
                        top: parentRect.top,
                        left: parentRect.right - 96 - 128
                    };
                } else {
                    containerProps.className += " ability-tooltip-faces-right";

                    containerProps.style = {
                        position: "fixed",
                        top: parentRect.top,
                        left: parentRect.left + 96
                    };
                }

                for (var i = 0; i < abilities.length; i++) {
                    var ability = abilities[i];
                    var data = {};

                    data.className = "ability-tooltip-ability";
                    data.key = i;
                    data.onClick = this.props.handleAbilityUse.bind(null, ability, this.props.targetUnit);

                    data.onMouseEnter = this.props.handleMouseEnterAbility.bind(null, ability);
                    data.onMouseLeave = this.props.handleMouseLeaveAbility;

                    abilityElements.push(React.DOM.div(data, ability.displayName));
                }

                return (React.DOM.div(containerProps, abilityElements));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BattleScore = React.createClass({
            displayName: "BattleScore",
            render: function () {
                var battle = this.props.battle;
                var evaluation = this.props.battle.getEvaluation();

                var evaluationPercentage = ((1 + evaluation) * 50);

                return (React.DOM.div({
                    className: "battle-score-wrapper"
                }, React.DOM.div({
                    className: "battle-score-container"
                }, React.DOM.div({
                    className: "battle-score-flag-wrapper",
                    style: {
                        backgroundImage: "url(" + battle.side1Player.icon + ")"
                    }
                }), React.DOM.div({
                    className: "battle-score-bar-container"
                }, React.DOM.div({
                    className: "battle-score-bar-value battle-score-bar-side1",
                    style: {
                        flex: 100 - evaluationPercentage,
                        backgroundColor: "#" + Rance.hexToString(battle.side1Player.color),
                        borderColor: "#" + Rance.hexToString(battle.side1Player.secondaryColor)
                    }
                }), React.DOM.div({
                    className: "battle-score-bar-value battle-score-bar-side2",
                    style: {
                        flex: evaluationPercentage,
                        backgroundColor: "#" + Rance.hexToString(battle.side2Player.color),
                        borderColor: "#" + Rance.hexToString(battle.side2Player.secondaryColor)
                    }
                })), React.DOM.div({
                    className: "battle-score-flag-wrapper",
                    style: {
                        backgroundImage: "url(" + battle.side2Player.icon + ")"
                    }
                }))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BattleScene = React.createClass({
            displayName: "BattleScene",
            componentWillReceiveProps: function (newProps) {
                if (newProps.unit1 !== this.props.unit1) {
                    this.renderScene("side1", true, newProps.unit1);
                }

                if (newProps.unit2 !== this.props.unit2) {
                    this.renderScene("side2", true, newProps.unit2);
                }
            },
            componentDidMount: function () {
                window.addEventListener("resize", this.handleResize, false);
            },
            componentWillUnmount: function () {
                window.removeEventListener("resize", this.handleResize);
            },
            handleResize: function () {
                if (this.props.unit1) {
                    this.renderScene("side1", false, this.props.unit1);
                }
                if (this.props.unit2) {
                    this.renderScene("side2", false, this.props.unit2);
                }
            },
            getUnitsContainerForSide: function (side) {
                if (side === "side1")
                    return this.refs["unit1Scene"].getDOMNode();
                else if (side === "side2")
                    return this.refs["unit2Scene"].getDOMNode();
                else
                    throw new Error("Invalid side");
            },
            getSceneProps: function (unit) {
                var container = this.getUnitsContainerForSide(unit.battleStats.side);
                var boundingRect = container.getBoundingClientRect();

                return ({
                    zDistance: 8,
                    xDistance: 5,
                    unitsToDraw: 20,
                    maxUnitsPerColumn: 8,
                    degree: -0.5,
                    rotationAngle: 70,
                    scalingFactor: 0.04,
                    facesRight: unit.battleStats.side === "side1",
                    maxHeight: boundingRect.height
                });
            },
            addUnit: function (side, animate, unit) {
                var container = this.getUnitsContainerForSide(side);

                if (unit) {
                    var scene = unit.drawBattleScene(this.getSceneProps(unit));
                    if (animate) {
                        scene.classList.add("battle-scene-unit-enter-" + side);
                    }

                    container.appendChild(scene);
                }
            },
            removeUnit: function (side, animate, onComplete) {
                var container = this.getUnitsContainerForSide(side);

                // has child. child will be removed with animation if specified, then fire callback
                if (container.firstChild) {
                    if (animate) {
                        container.firstChild.addEventListener("animationend", function () {
                            if (container.firstChild) {
                                container.removeChild(container.firstChild);
                            }
                            onComplete();
                        });

                        container.firstChild.classList.add("battle-scene-unit-leave-" + side);
                    } else {
                        container.removeChild(container.firstChild);
                        if (onComplete)
                            onComplete();
                    }
                } else {
                    if (onComplete)
                        onComplete();
                }
            },
            renderScene: function (side, animate, unit) {
                var container = this.getUnitsContainerForSide(side);

                var addUnitFN = this.addUnit.bind(this, side, animate, unit);

                this.removeUnit(side, animate, addUnitFN);
            },
            render: function () {
                return (React.DOM.div({
                    className: "battle-scene"
                }, React.DOM.div({
                    className: "battle-scene-units-container",
                    ref: "unit1Scene"
                }, null), React.DOM.div({
                    className: "battle-scene-units-container",
                    ref: "unit2Scene"
                }, null)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BattleDisplayStrength = React.createClass({
            displayName: "BattleDisplayStrength",
            getInitialState: function () {
                return ({
                    displayedStrength: this.props.from,
                    activeTween: null
                });
            },
            componentDidMount: function () {
                this.animateDisplayedStrength(this.props.from, this.props.to, this.props.delay);
            },
            componentWillUnmount: function () {
                if (this.activeTween) {
                    this.activeTween.stop();
                }
            },
            updateDisplayStrength: function (newAmount) {
                this.setState({
                    displayedStrength: newAmount
                });
            },
            animateDisplayedStrength: function (from, newAmount, time) {
                var self = this;
                var stopped = false;

                if (this.activeTween) {
                    this.activeTween.stop();
                }

                if (from === newAmount)
                    return;

                var animateTween = function () {
                    if (stopped) {
                        return;
                    }

                    TWEEN.update();
                    self.requestAnimFrame = requestAnimFrame(animateTween);
                };

                var tween = new TWEEN.Tween({
                    health: from
                }).to({
                    health: newAmount
                }, time).onUpdate(function () {
                    self.setState({
                        displayedStrength: this.health
                    });
                }).easing(TWEEN.Easing.Sinusoidal.Out);

                tween.onStop(function () {
                    cancelAnimationFrame(self.requestAnimFrame);
                    stopped = true;
                    TWEEN.remove(tween);
                });

                this.activeTween = tween;

                tween.start();
                animateTween();
            },
            render: function () {
                return (React.DOM.div({ className: "unit-strength-battle-display" }, Math.ceil(this.state.displayedStrength)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="fleet.ts"/>
/// <reference path="turncounter.ts"/>
/// <reference path="turnorder.ts"/>
/// <reference path="abilitytooltip.ts"/>
/// <reference path="battlescore.ts"/>
/// <reference path="battlescene.ts"/>
/// <reference path="battledisplaystrength.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.Battle = React.createClass({
            displayName: "Battle",
            getInitialState: function () {
                return ({
                    abilityTooltip: {
                        parentElement: null,
                        facesLeft: null
                    },
                    targetsInPotentialArea: [],
                    potentialDelay: null,
                    hoveredAbility: null,
                    hoveredUnit: null,
                    battleSceneUnit1StartingStrength: null,
                    battleSceneUnit2StartingStrength: null,
                    battleSceneUnit1: null,
                    battleSceneUnit2: null,
                    playingBattleEffect: false,
                    playingBattleEffectActive: false
                });
            },
            resize: function () {
                var seed = this.props.battle.battleData.location.getBackgroundSeed();

                var blurArea = this.refs.fleetsContainer.getDOMNode().getBoundingClientRect();

                this.props.renderer.blurProps = [
                    blurArea.left,
                    0,
                    blurArea.width,
                    blurArea.height,
                    seed
                ];
            },
            componentDidMount: function () {
                this.props.renderer.isBattleBackground = true;

                this.resize();

                this.props.renderer.bindRendererView(this.refs.pixiContainer.getDOMNode());

                window.addEventListener("resize", this.resize, false);

                this.setBattleSceneUnits(this.state.hoveredUnit);

                if (this.props.battle.getActivePlayer() !== this.props.humanPlayer) {
                    this.useAIAbility();
                }
            },
            componentWillUnmount: function () {
                window.removeEventListener("resize", this.resize);
                this.props.renderer.removeRendererView();
            },
            clearHoveredUnit: function () {
                this.setState({
                    hoveredUnit: null,
                    abilityTooltip: {
                        parentElement: null
                    },
                    hoveredAbility: null,
                    potentialDelay: null,
                    targetsInPotentialArea: []
                });

                this.setBattleSceneUnits(null);
            },
            handleMouseLeaveUnit: function (e) {
                if (!this.state.hoveredUnit || this.state.playingBattleEffect)
                    return;

                var toElement = e.nativeEvent.toElement || e.nativeEvent.relatedTarget;

                if (!toElement) {
                    this.clearHoveredUnit();
                    return;
                }

                if (!this.refs.abilityTooltip) {
                    this.clearHoveredUnit();
                    return;
                }

                var tooltipElement = this.refs.abilityTooltip.getDOMNode();

                if (toElement !== this.state.abilityTooltip.parentElement && (this.refs.abilityTooltip && toElement !== tooltipElement) && toElement.parentElement !== tooltipElement) {
                    this.clearHoveredUnit();
                }
            },
            handleMouseEnterUnit: function (unit) {
                if (this.props.battle.ended || this.state.playingBattleEffect)
                    return;

                var facesLeft = unit.battleStats.side === "side2";
                var parentElement = this.getUnitElement(unit);

                this.setState({
                    abilityTooltip: {
                        parentElement: parentElement,
                        facesLeft: facesLeft
                    },
                    hoveredUnit: unit
                });

                this.setBattleSceneUnits(unit);
            },
            getUnitElement: function (unit) {
                return document.getElementById("unit-id_" + unit.id);
            },
            setBattleSceneUnits: function (hoveredUnit) {
                if (this.state.playingBattleEffect)
                    return;

                var activeUnit = this.props.battle.activeUnit;
                if (!activeUnit) {
                    this.setState({
                        battleSceneUnit1: null,
                        battleSceneUnit2: null
                    });
                    return;
                }

                var shouldDisplayHovered = (hoveredUnit && hoveredUnit.battleStats.side !== activeUnit.battleStats.side);

                var unit1, unit2;

                if (activeUnit.battleStats.side === "side1") {
                    unit1 = activeUnit;
                    unit2 = shouldDisplayHovered ? hoveredUnit : null;
                } else {
                    unit1 = shouldDisplayHovered ? hoveredUnit : null;
                    unit2 = activeUnit;
                }

                this.setState({
                    battleSceneUnit1: unit1,
                    battleSceneUnit2: unit2
                });
            },
            handleAbilityUse: function (ability, target) {
                var abilityData = Rance.getAbilityUseData(this.props.battle, this.props.battle.activeUnit, ability, target);

                for (var i = 0; i < abilityData.beforeUse.length; i++) {
                    abilityData.beforeUse[i]();
                }

                this.playBattleEffect(abilityData, 0);
            },
            playBattleEffect: function (abilityData, i) {
                var effectData = abilityData.effectsToCall;
                if (!effectData[i]) {
                    for (var i = 0; i < abilityData.afterUse.length; i++) {
                        abilityData.afterUse[i]();
                    }

                    this.endBattleEffect(abilityData);

                    this.handleTurnEnd();

                    return;
                }
                ;

                var side1Unit = null;
                var side2Unit = null;
                [effectData[i].user, effectData[i].target].forEach(function (unit) {
                    if (unit.battleStats.side === "side1" && !side1Unit) {
                        side1Unit = unit;
                    } else if (unit.battleStats.side === "side2" && !side2Unit) {
                        side2Unit = unit;
                    }
                });

                var previousUnit1Strength = side1Unit ? side1Unit.currentStrength : null;
                var previousUnit2Strength = side2Unit ? side2Unit.currentStrength : null;

                this.setState({
                    battleSceneUnit1StartingStrength: previousUnit1Strength,
                    battleSceneUnit2StartingStrength: previousUnit2Strength,
                    battleSceneUnit1: side1Unit,
                    battleSceneUnit2: side2Unit,
                    playingBattleEffect: true,
                    hoveredUnit: abilityData.originalTarget,
                    abilityTooltip: {
                        parentElement: null
                    },
                    hoveredAbility: null,
                    potentialDelay: null,
                    targetsInPotentialArea: []
                });

                window.setTimeout(function () {
                    effectData[i].effect();

                    this.setState({
                        playingBattleEffectActive: true
                    });
                }.bind(this), 350 / (1 + Math.log(i + 1)));

                window.setTimeout(this.playBattleEffect.bind(this, abilityData, i + 1), 2750);
            },
            endBattleEffect: function () {
                this.setState({
                    playingBattleEffect: false,
                    hoveredUnit: null
                });
            },
            handleTurnEnd: function () {
                if (this.state.hoveredUnit && this.state.hoveredUnit.isTargetable()) {
                    this.forceUpdate();
                } else {
                    this.clearHoveredUnit();
                }

                this.props.battle.endTurn();
                this.setBattleSceneUnits(this.state.hoveredUnit);

                if (this.props.battle.getActivePlayer() !== this.props.humanPlayer) {
                    this.useAIAbility();
                }
            },
            useAIAbility: function () {
                if (!this.props.battle.activeUnit || this.props.battle.ended)
                    return;

                var tree = new Rance.MCTree(this.props.battle, this.props.battle.activeUnit.battleStats.side);

                var move = tree.evaluate(1000).move;

                var target = this.props.battle.unitsById[move.targetId];

                this.handleAbilityUse(move.ability, target);
            },
            finishBattle: function () {
                var battle = this.props.battle;
                if (!battle.ended)
                    throw new Error();

                battle.finishBattle();
            },
            handleMouseEnterAbility: function (ability) {
                var targetsInPotentialArea = Rance.getUnitsInAbilityArea(this.props.battle, this.props.battle.activeUnit, ability, this.state.hoveredUnit.battleStats.position);

                this.setState({
                    hoveredAbility: ability,
                    potentialDelay: {
                        id: this.props.battle.activeUnit.id,
                        delay: this.props.battle.activeUnit.battleStats.moveDelay + ability.moveDelay
                    },
                    targetsInPotentialArea: targetsInPotentialArea
                });
            },
            handleMouseLeaveAbility: function () {
                this.setState({
                    hoveredAbility: null,
                    potentialDelay: null,
                    targetsInPotentialArea: []
                });
            },
            render: function () {
                var battle = this.props.battle;

                if (!battle.ended) {
                    var activeTargets = Rance.getTargetsForAllAbilities(battle, battle.activeUnit);
                }

                var abilityTooltip = null;

                if (!battle.ended && !this.state.playingBattleEffect && this.state.hoveredUnit && activeTargets[this.state.hoveredUnit.id]) {
                    abilityTooltip = Rance.UIComponents.AbilityTooltip({
                        handleAbilityUse: this.handleAbilityUse,
                        handleMouseLeave: this.handleMouseLeaveUnit,
                        handleMouseEnterAbility: this.handleMouseEnterAbility,
                        handleMouseLeaveAbility: this.handleMouseLeaveAbility,
                        targetUnit: this.state.hoveredUnit,
                        parentElement: this.state.abilityTooltip.parentElement,
                        facesLeft: this.state.abilityTooltip.facesLeft,
                        activeTargets: activeTargets,
                        ref: "abilityTooltip",
                        key: this.state.hoveredUnit.id
                    });
                }
                ;

                var activeEffectUnits = [];
                if (this.state.playingBattleEffect) {
                    activeEffectUnits = [this.state.battleSceneUnit1, this.state.battleSceneUnit2];
                }

                var upperFooterElement;
                if (!this.state.playingBattleEffect) {
                    upperFooterElement = Rance.UIComponents.TurnOrder({
                        key: "turnOrder",
                        turnOrder: battle.turnOrder,
                        unitsBySide: battle.unitsBySide,
                        potentialDelay: this.state.potentialDelay,
                        hoveredUnit: this.state.hoveredUnit,
                        onMouseEnterUnit: this.handleMouseEnterUnit,
                        onMouseLeaveUnit: this.handleMouseLeaveUnit
                    });
                } else {
                    upperFooterElement = React.DOM.div({
                        key: "battleDisplayStrength",
                        className: "battle-display-strength-container"
                    }, React.DOM.div({
                        className: "battle-display-strength battle-display-strength-side1"
                    }, this.state.battleSceneUnit1 ? Rance.UIComponents.BattleDisplayStrength({
                        key: "" + this.state.battleSceneUnit1.id + Date.now(),
                        delay: 2000,
                        from: this.state.battleSceneUnit1StartingStrength,
                        to: this.state.battleSceneUnit1.currentStrength
                    }) : null), React.DOM.div({
                        className: "battle-display-strength battle-display-strength-side2"
                    }, this.state.battleSceneUnit2 ? Rance.UIComponents.BattleDisplayStrength({
                        key: "" + this.state.battleSceneUnit2.id + Date.now(),
                        delay: 2000,
                        from: this.state.battleSceneUnit2StartingStrength,
                        to: this.state.battleSceneUnit2.currentStrength
                    }) : null));
                }

                return (React.DOM.div({
                    className: "battle-pixi-container",
                    ref: "pixiContainer"
                }, React.DOM.div({
                    className: "battle-container",
                    ref: "battleContainer"
                }, React.DOM.div({
                    className: "battle-upper"
                }, Rance.UIComponents.BattleScore({
                    battle: battle
                }), React.addons.CSSTransitionGroup({ transitionName: "battle-upper-footer" }, upperFooterElement), Rance.UIComponents.BattleScene({
                    unit1: this.state.battleSceneUnit1,
                    unit2: this.state.battleSceneUnit2
                })), React.DOM.div({
                    className: "fleets-container",
                    ref: "fleetsContainer"
                }, Rance.UIComponents.Fleet({
                    battle: battle,
                    fleet: battle.side1,
                    activeUnit: battle.activeUnit,
                    hoveredUnit: this.state.hoveredUnit,
                    activeTargets: activeTargets,
                    targetsInPotentialArea: this.state.targetsInPotentialArea,
                    handleMouseEnterUnit: this.handleMouseEnterUnit,
                    handleMouseLeaveUnit: this.handleMouseLeaveUnit,
                    activeEffectUnits: activeEffectUnits
                }), Rance.UIComponents.TurnCounter({
                    turnsLeft: battle.turnsLeft,
                    maxTurns: battle.maxTurns
                }), Rance.UIComponents.Fleet({
                    battle: battle,
                    fleet: battle.side2,
                    facesLeft: true,
                    activeUnit: battle.activeUnit,
                    hoveredUnit: this.state.hoveredUnit,
                    activeTargets: activeTargets,
                    targetsInPotentialArea: this.state.targetsInPotentialArea,
                    handleMouseEnterUnit: this.handleMouseEnterUnit,
                    handleMouseLeaveUnit: this.handleMouseLeaveUnit,
                    activeEffectUnits: activeEffectUnits
                }), abilityTooltip, this.state.playingBattleEffect ? React.DOM.div({ className: "battle-fleets-darken" }, null) : null), battle.ended ? React.DOM.button({
                    className: "end-battle-button",
                    onClick: this.finishBattle
                }, "end") : null)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.SplitMultilineText = {
            splitMultilineText: function (text) {
                if (Array.isArray(text)) {
                    var returnArr = [];
                    for (var i = 0; i < text.length; i++) {
                        returnArr.push(text[i]);
                        returnArr.push(React.DOM.br(null));
                    }
                    return returnArr;
                } else {
                    return text;
                }
            }
        };
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../mixins/splitmultilinetext.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.List = React.createClass({
            displayName: "List",
            mixins: [Rance.UIComponents.SplitMultilineText],
            getInitialState: function () {
                var initialColumn = this.props.initialSortOrder ? this.props.initialSortOrder[0] : this.props.initialColumns[0];

                var initialSelected = this.props.listItems[0];

                return ({
                    columns: this.props.initialColumns,
                    selected: initialSelected,
                    selectedColumn: initialColumn,
                    sortingOrder: this.makeInitialSortingOrder(this.props.initialColumns, initialColumn)
                });
            },
            componentDidMount: function () {
                var self = this;

                if (this.props.autoSelect) {
                    this.handleSelectRow(this.props.sortedItems[0]);
                }

                this.getDOMNode().addEventListener("keydown", function (event) {
                    switch (event.keyCode) {
                        case 40: {
                            self.shiftSelection(1);
                            break;
                        }
                        case 38: {
                            self.shiftSelection(-1);
                            break;
                        }
                        default: {
                            return;
                        }
                    }
                });
            },
            makeInitialSortingOrder: function (columns, initialColumn) {
                var initialSortOrder = this.props.initialSortOrder;
                if (!initialSortOrder || initialSortOrder.length < 1) {
                    initialSortOrder = [initialColumn];
                }

                var order = initialSortOrder;

                for (var i = 0; i < columns.length; i++) {
                    if (!columns[i].order) {
                        columns[i].order = columns[i].defaultOrder;
                    }
                    if (initialSortOrder.indexOf(columns[i]) < 0) {
                        order.push(columns[i]);
                    }
                }

                return order;
            },
            getNewSortingOrder: function (newColumn) {
                var order = this.state.sortingOrder.slice(0);
                var current = order.indexOf(newColumn);

                if (current >= 0) {
                    order.splice(current);
                }

                order.unshift(newColumn);

                return order;
            },
            handleSelectColumn: function (column) {
                if (column.notSortable)
                    return;
                function getReverseOrder(order) {
                    return order === "desc" ? "asc" : "desc";
                }

                if (this.state.selectedColumn.key === column.key) {
                    column.order = getReverseOrder(column.order);
                    this.forceUpdate();
                } else {
                    column.order = column.defaultOrder;
                    this.setState({
                        selectedColumn: column,
                        sortingOrder: this.getNewSortingOrder(column)
                    });
                }
            },
            handleSelectRow: function (row) {
                if (this.props.onRowChange && row)
                    this.props.onRowChange.call(null, row);

                this.setState({
                    selected: row
                });
            },
            sort: function () {
                var itemsToSort = this.props.listItems;
                var columnsToTry = this.state.columns;
                var sortOrder = this.state.sortingOrder;
                var sortFunctions = {};

                function makeSortingFunction(column) {
                    if (column.sortingFunction)
                        return column.sortingFunction;

                    var propToSortBy = column.propToSortBy || column.key;

                    return (function (a, b) {
                        var a1 = a.data[propToSortBy];
                        var b1 = b.data[propToSortBy];

                        if (a1 > b1)
                            return 1;
                        else if (a1 < b1)
                            return -1;
                        else
                            return 0;
                    });
                }

                itemsToSort.sort(function (a, b) {
                    var result = 0;
                    for (var i = 0; i < sortOrder.length; i++) {
                        var columnToSortBy = sortOrder[i];

                        if (!sortFunctions[columnToSortBy.key]) {
                            sortFunctions[columnToSortBy.key] = makeSortingFunction(columnToSortBy);
                        }
                        var sortFunction = sortFunctions[columnToSortBy.key];

                        result = sortFunction(a, b);

                        if (columnToSortBy.order === "desc") {
                            result *= -1;
                        }

                        if (result)
                            return result;
                    }

                    return 0;
                });

                this.props.sortedItems = itemsToSort;
            },
            shiftSelection: function (amountToShift) {
                var reverseIndexes = {};
                for (var i = 0; i < this.props.sortedItems.length; i++) {
                    reverseIndexes[this.props.sortedItems[i].key] = i;
                }
                ;
                var currSelectedIndex = reverseIndexes[this.state.selected.key];
                var nextIndex = (currSelectedIndex + amountToShift) % this.props.sortedItems.length;
                if (nextIndex < 0) {
                    nextIndex += this.props.sortedItems.length;
                }

                this.handleSelectRow(this.props.sortedItems[nextIndex]);
            },
            render: function () {
                var self = this;
                var columns = [];
                var headerLabels = [];

                this.state.columns.forEach(function (column) {
                    var colProps = {
                        key: column.key
                    };

                    if (self.props.colStylingFN) {
                        colProps = self.props.colStylingFN(column, colProps);
                    }

                    columns.push(React.DOM.col(colProps));

                    var sortStatus = null;

                    if (!column.notSortable)
                        sortStatus = "sortable";

                    if (self.state.selectedColumn.key === column.key) {
                        sortStatus += " sorted-" + column.order;
                    } else if (!column.notSortable)
                        sortStatus += " unsorted";

                    headerLabels.push(React.DOM.th({
                        className: sortStatus,
                        title: column.title || colProps.title || null,
                        onMouseDown: self.handleSelectColumn.bind(null, column),
                        onTouchStart: self.handleSelectColumn.bind(null, column),
                        key: column.key
                    }, column.label));
                });

                this.sort();

                var sortedItems = this.props.sortedItems;

                var rows = [];

                sortedItems.forEach(function (item) {
                    item.data.key = item.key;
                    item.data.activeColumns = self.state.columns;
                    item.data.handleClick = self.handleSelectRow.bind(null, item);
                    var row = item.data.rowConstructor(item.data);

                    rows.push(row);
                });

                return (React.DOM.table({
                    tabIndex: 1,
                    className: "react-list"
                }, React.DOM.colgroup(null, columns), React.DOM.thead(null, React.DOM.tr(null, headerLabels)), React.DOM.tbody(null, rows)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../mixins/draggable.ts" />
/// <reference path="../unit/unitstrength.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitListItem = React.createClass({
            displayName: "UnitListItem",
            mixins: [Rance.UIComponents.Draggable],
            onDragStart: function (e) {
                this.props.onDragStart(this.props.unit);
            },
            onDragEnd: function (e) {
                this.props.onDragEnd();
            },
            makeCell: function (type) {
                var unit = this.props.unit;
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "unit-list-item-cell" + " unit-list-" + type;

                var cellContent;

                switch (type) {
                    case "strength": {
                        cellContent = Rance.UIComponents.UnitStrength({
                            maxStrength: this.props.maxStrength,
                            currentStrength: this.props.currentStrength,
                            isSquadron: true
                        });

                        break;
                    }
                    case "attack":
                    case "defence":
                    case "intelligence":
                    case "speed": {
                        cellContent = this.props[type];

                        if (unit.attributes[type] < unit.baseAttributes[type]) {
                            cellProps.className += " lowered-stat";
                        } else if (unit.attributes[type] > unit.baseAttributes[type]) {
                            cellProps.className += " raised-stat";
                        }

                        break;
                    }
                    default: {
                        cellContent = this.props[type];

                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var unit = this.props.unit;
                var columns = this.props.activeColumns;

                var cells = [];

                for (var i = 0; i < columns.length; i++) {
                    var cell = this.makeCell(columns[i].key);

                    cells.push(cell);
                }

                var rowProps = {
                    className: "unit-list-item",
                    onClick: this.props.handleClick
                };

                if (this.props.isDraggable && !this.props.noActionsLeft) {
                    rowProps.className += " draggable";
                    rowProps.onTouchStart = rowProps.onMouseDown = this.handleMouseDown;
                }

                if (this.props.isSelected) {
                    rowProps.className += " selected";
                }
                ;

                if (this.props.isReserved) {
                    rowProps.className += " reserved";
                }

                if (this.props.noActionsLeft) {
                    rowProps.className += " no-actions-left";
                }

                if (this.state.dragging) {
                    rowProps.style = this.state.dragPos;
                    rowProps.className += " dragging";
                }

                return (React.DOM.tr(rowProps, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="list.ts" />
/// <reference path="unitlistitem.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitList = React.createClass({
            displayName: "UnitList",
            render: function () {
                var rows = [];

                for (var id in this.props.units) {
                    var unit = this.props.units[id];

                    var data = {
                        unit: unit,
                        id: unit.id,
                        name: unit.name,
                        typeName: unit.template.typeName,
                        strength: "" + unit.currentStrength + " / " + unit.maxStrength,
                        currentStrength: unit.currentStrength,
                        maxStrength: unit.maxStrength,
                        maxActionPoints: unit.attributes.maxActionPoints,
                        attack: unit.attributes.attack,
                        defence: unit.attributes.defence,
                        intelligence: unit.attributes.intelligence,
                        speed: unit.attributes.speed,
                        rowConstructor: Rance.UIComponents.UnitListItem,
                        makeClone: true,
                        isReserved: (this.props.reservedUnits && this.props.reservedUnits[unit.id]),
                        noActionsLeft: (this.props.checkTimesActed && unit.timesActedThisTurn >= 1),
                        isSelected: (this.props.selectedUnit && this.props.selectedUnit.id === unit.id),
                        isDraggable: this.props.isDraggable,
                        onDragStart: this.props.onDragStart,
                        onDragEnd: this.props.onDragEnd
                    };

                    rows.push({
                        key: unit.id,
                        data: data
                    });
                }

                var columns = [
                    {
                        label: "Id",
                        key: "id",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Type",
                        key: "typeName",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Strength",
                        key: "strength",
                        defaultOrder: "desc",
                        sortingFunction: function (a, b) {
                            return a.data.currentStrength - b.data.currentStrength;
                        }
                    },
                    {
                        label: "Act",
                        key: "maxActionPoints",
                        defaultOrder: "desc"
                    },
                    {
                        label: "Atk",
                        key: "attack",
                        defaultOrder: "desc"
                    },
                    {
                        label: "Def",
                        key: "defence",
                        defaultOrder: "desc"
                    },
                    {
                        label: "Int",
                        key: "intelligence",
                        defaultOrder: "desc"
                    },
                    {
                        label: "Spd",
                        key: "speed",
                        defaultOrder: "desc"
                    }
                ];

                return (React.DOM.div({ className: "unit-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    onRowChange: this.props.onRowChange,
                    autoSelect: this.props.autoSelect
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ItemListItem = React.createClass({
            displayName: "ItemListItem",
            mixins: [Rance.UIComponents.Draggable],
            onDragStart: function (e) {
                this.props.onDragStart(this.props.item);
            },
            onDragEnd: function (e) {
                this.props.onDragEnd();
            },
            makeCell: function (type) {
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "item-list-item-cell" + " item-list-" + type;

                var cellContent;

                switch (type) {
                    default: {
                        cellContent = this.props[type];
                        if (isFinite(cellContent)) {
                            cellProps.className += " center-text";
                        }

                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var item = this.props.item;
                var columns = this.props.activeColumns;

                var cells = [];

                for (var i = 0; i < columns.length; i++) {
                    var cell = this.makeCell(columns[i].key);

                    cells.push(cell);
                }

                var rowProps = {
                    className: "item-list-item",
                    onClick: this.props.handleClick
                };

                if (this.props.isDraggable) {
                    rowProps.className += " draggable";
                    rowProps.onTouchStart = rowProps.onMouseDown = this.handleMouseDown;
                }

                if (this.props.isSelected) {
                    rowProps.className += " selected";
                }
                ;

                if (this.props.isReserved) {
                    rowProps.className += " reserved";
                }

                if (this.state.dragging) {
                    rowProps.style = this.state.dragPos;
                    rowProps.className += " dragging";
                }

                return (React.DOM.tr(rowProps, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="list.ts" />
/// <reference path="itemlistitem.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ItemList = React.createClass({
            displayName: "ItemList",
            getSlotIndex: function (slot) {
                if (slot === "high") {
                    return 2;
                } else if (slot === "mid") {
                    return 1;
                } else
                    return 0;
            },
            render: function () {
                var rows = [];

                for (var i = 0; i < this.props.items.length; i++) {
                    var item = this.props.items[i];

                    var data = {
                        item: item,
                        typeName: item.template.displayName,
                        slot: item.template.slot,
                        slotIndex: this.getSlotIndex(item.template.slot),
                        unit: item.unit ? item.unit : null,
                        unitName: item.unit ? item.unit.name : "",
                        techLevel: item.template.techLevel,
                        cost: item.template.cost,
                        ability: item.template.ability ? item.template.ability.displayName : "",
                        isReserved: Boolean(item.unit),
                        makeClone: true,
                        rowConstructor: Rance.UIComponents.ItemListItem,
                        isDraggable: this.props.isDraggable,
                        onDragStart: this.props.onDragStart,
                        onDragEnd: this.props.onDragEnd
                    };

                    [
                        "maxActionPoints", "attack", "defence",
                        "intelligence", "speed"].forEach(function (stat) {
                        if (!item.template.attributes)
                            data[stat] = null;
                        else
                            data[stat] = item.template.attributes[stat] || null;
                    });

                    rows.push({
                        key: item.id,
                        data: data
                    });
                }

                var columns;

                if (this.props.isItemPurchaseList) {
                    columns = [
                        {
                            label: "Type",
                            key: "typeName",
                            defaultOrder: "asc"
                        },
                        {
                            label: "Slot",
                            key: "slot",
                            propToSortBy: "slotIndex",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Tech",
                            key: "techLevel",
                            defaultOrder: "asc"
                        },
                        {
                            label: "Cost",
                            key: "cost",
                            defaultOrder: "asc"
                        }
                    ];
                } else {
                    columns = [
                        {
                            label: "Type",
                            key: "typeName",
                            defaultOrder: "asc"
                        },
                        {
                            label: "Slot",
                            key: "slot",
                            propToSortBy: "slotIndex",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Unit",
                            key: "unitName",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Act",
                            key: "maxActionPoints",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Atk",
                            key: "attack",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Def",
                            key: "defence",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Int",
                            key: "intelligence",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Spd",
                            key: "speed",
                            defaultOrder: "desc"
                        },
                        {
                            label: "Ability",
                            key: "ability",
                            defaultOrder: "desc"
                        }
                    ];
                }

                return (React.DOM.div({ className: "item-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    initialSortOrder: [columns[1], columns[2]],
                    onRowChange: this.props.onRowChange
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitItem = React.createClass({
            displayName: "UnitItem",
            mixins: [Rance.UIComponents.Draggable],
            onDragStart: function (e) {
                this.props.onDragStart(this.props.item);
            },
            onDragEnd: function (e) {
                this.props.onDragEnd();
            },
            // todo
            getTechIcon: function (techLevel) {
                switch (techLevel) {
                    case 2: {
                        return "img\/items\/t2icon.png";
                    }
                    case 3: {
                        return "img\/items\/t3icon.png";
                    }
                }
            },
            render: function () {
                if (!this.props.item)
                    return (React.DOM.div({ className: "empty-unit-item" }));
                var item = this.props.item;

                var divProps = {
                    className: "unit-item"
                };

                if (this.props.isDraggable) {
                    divProps.className += " draggable";
                    divProps.onMouseDown = divProps.onTouchStart = this.handleMouseDown;
                }

                if (this.state.dragging) {
                    divProps.style = this.state.dragPos;
                    divProps.className += " dragging";
                }

                return (React.DOM.div(divProps, React.DOM.div({
                    className: "item-icon-container"
                }, React.DOM.img({
                    className: "item-icon-base",
                    src: item.template.icon
                }), item.template.techLevel > 1 ? React.DOM.img({
                    className: "item-icon-tech-level",
                    src: this.getTechIcon(item.template.techLevel)
                }) : null)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="unititem.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.UnitItemWrapper = React.createClass({
            displayName: "UnitItemWrapper",
            handleMouseUp: function () {
                this.props.onMouseUp(this.props.slot);
            },
            render: function () {
                var allElements = [];
                var item = this.props.item;

                var wrapperProps = {
                    className: "unit-item-wrapper"
                };

                // if this is declared inside the conditional block
                // the component won't accept the first drop properly
                if (this.props.onMouseUp) {
                    wrapperProps.onMouseUp = this.handleMouseUp;
                }
                ;

                if (this.props.currentDragItem) {
                    var dragItem = this.props.currentDragItem;
                    if (dragItem.template.slot === this.props.slot) {
                    } else {
                        wrapperProps.onMouseUp = null;
                        wrapperProps.className += " invalid-drop-target";
                    }
                }

                return (React.DOM.div(wrapperProps, Rance.UIComponents.UnitItem({
                    item: this.props.item,
                    key: "item",
                    isDraggable: this.props.isDraggable,
                    onDragStart: this.props.onDragStart,
                    onDragEnd: this.props.onDragEnd
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="unititemwrapper.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.MenuUnitInfo = React.createClass({
            displayName: "MenuUnitInfo",
            render: function () {
                var unit = this.props.unit;
                if (!unit)
                    return (React.DOM.div({ className: "menu-unit-info" }));

                var itemSlots = [];

                for (var slot in unit.items) {
                    itemSlots.push(Rance.UIComponents.UnitItemWrapper({
                        key: slot,
                        slot: slot,
                        item: unit.items[slot],
                        onMouseUp: this.props.onMouseUp,
                        isDraggable: true,
                        onDragStart: this.props.onDragStart,
                        onDragEnd: this.props.onDragEnd,
                        currentDragItem: this.props.currentDragItem
                    }));
                }

                var abilityElements = [];
                var abilities = unit.getAllAbilities();

                for (var i = 0; i < abilities.length; i++) {
                    var ability = abilities[i];

                    abilityElements.push(React.DOM.li({
                        key: ability.type
                    }, ability.displayName));
                }

                return (React.DOM.div({
                    className: "menu-unit-info"
                }, React.DOM.div({
                    className: "menu-unit-info-image unit-image"
                }, null), React.DOM.ul({
                    className: "menu-unit-info-abilities"
                }, abilityElements), React.DOM.div({
                    className: "menu-unit-info-items-wrapper"
                }, itemSlots)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="itemlist.ts" />
/// <reference path="unitlist.ts" />
/// <reference path="menuunitinfo.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ItemEquip = React.createClass({
            displayName: "ItemEquip",
            getInitialState: function () {
                return ({
                    selectedUnit: null,
                    currentDragItem: null
                });
            },
            handleSelectRow: function (row) {
                if (!row.data.unit)
                    return;

                this.setState({
                    selectedUnit: row.data.unit
                });
            },
            handleDragStart: function (item) {
                this.setState({
                    currentDragItem: item
                });
            },
            handleDragEnd: function (dropSuccesful) {
                if (typeof dropSuccesful === "undefined") { dropSuccesful = false; }
                if (!dropSuccesful && this.state.currentDragItem && this.state.selectedUnit) {
                    var item = this.state.currentDragItem;
                    if (this.state.selectedUnit.items[item.template.slot] === item) {
                        this.state.selectedUnit.removeItem(item);
                    }
                }

                this.setState({
                    currentDragItem: null
                });
            },
            handleDrop: function () {
                var item = this.state.currentDragItem;
                var unit = this.state.selectedUnit;
                if (unit && item) {
                    if (unit.items[item.template.slot]) {
                        unit.removeItemAtSlot(item.template.slot);
                    }
                    unit.addItem(item);
                }

                this.handleDragEnd(true);
            },
            render: function () {
                var player = this.props.player;

                return (React.DOM.div({ className: "item-equip" }, React.DOM.div({ className: "item-equip-left" }, Rance.UIComponents.MenuUnitInfo({
                    unit: this.state.selectedUnit,
                    onMouseUp: this.handleDrop,
                    onDragStart: this.handleDragStart,
                    onDragEnd: this.handleDragEnd,
                    currentDragItem: this.state.currentDragItem
                }), Rance.UIComponents.ItemList({
                    items: player.items,
                    isDraggable: true,
                    onDragStart: this.handleDragStart,
                    onDragEnd: this.handleDragEnd,
                    onRowChange: this.handleSelectRow
                })), Rance.UIComponents.UnitList({
                    units: player.units,
                    selectedUnit: this.state.selectedUnit,
                    isDraggable: false,
                    onRowChange: this.handleSelectRow,
                    autoSelect: true
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BattlePrep = React.createClass({
            displayName: "BattlePrep",
            getInitialState: function () {
                return ({
                    currentDragUnit: null
                });
            },
            handleDragStart: function (unit) {
                this.setState({
                    currentDragUnit: unit
                });
            },
            handleDragEnd: function (dropSuccesful) {
                if (typeof dropSuccesful === "undefined") { dropSuccesful = false; }
                if (!dropSuccesful && this.state.currentDragUnit) {
                    this.props.battlePrep.removeUnit(this.state.currentDragUnit);
                }

                this.setState({
                    currentDragUnit: null
                });
            },
            handleDrop: function (position) {
                var battlePrep = this.props.battlePrep;
                if (this.state.currentDragUnit) {
                    var unitCurrentlyInPosition = battlePrep.getUnitAtPosition(position);
                    if (unitCurrentlyInPosition) {
                        battlePrep.swapUnits(this.state.currentDragUnit, unitCurrentlyInPosition);
                    } else {
                        battlePrep.setUnit(this.state.currentDragUnit, position);
                    }
                }

                this.handleDragEnd(true);
            },
            render: function () {
                var fleet = Rance.UIComponents.Fleet({
                    fleet: this.props.battlePrep.fleet.slice(0),
                    onMouseUp: this.handleDrop,
                    isDraggable: true,
                    onDragStart: this.handleDragStart,
                    onDragEnd: this.handleDragEnd
                });

                return (React.DOM.div({ className: "battle-prep" }, fleet, Rance.UIComponents.UnitList({
                    units: this.props.battlePrep.availableUnits,
                    reservedUnits: this.props.battlePrep.alreadyPlaced,
                    checkTimesActed: true,
                    isDraggable: true,
                    onDragStart: this.handleDragStart,
                    onDragEnd: this.handleDragEnd
                }), React.DOM.button({
                    className: "start-battle",
                    onClick: function () {
                        var battle = this.props.battlePrep.makeBattle();
                        app.reactUI.battle = battle;
                        app.reactUI.switchScene("battle");
                    }.bind(this)
                }, "Start battle")));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../mixins/draggable.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.Popup = React.createClass({
            displayName: "Popup",
            mixins: [Rance.UIComponents.Draggable],
            getInitialState: function () {
                return ({
                    zIndex: this.props.incrementZIndex()
                });
            },
            onDragStart: function () {
                this.setState({
                    zIndex: this.props.incrementZIndex()
                });
            },
            render: function () {
                var divProps = {
                    className: "popup draggable",
                    onTouchStart: this.handleMouseDown,
                    onMouseDown: this.handleMouseDown,
                    style: {
                        top: this.state.dragPos ? this.state.dragPos.top : 0,
                        left: this.state.dragPos ? this.state.dragPos.left : 0,
                        zIndex: this.state.zIndex
                    }
                };

                if (this.state.dragging) {
                    divProps.className += " dragging";
                }

                var contentProps = this.props.contentProps;

                contentProps.closePopup = this.props.closePopup;

                return (React.DOM.div(divProps, this.props.contentConstructor(contentProps)));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.TutorialPopup = React.createClass({
            displayName: "TutorialPopup",
            getInitialState: function () {
                return ({
                    currentPage: 0
                });
            },
            flipPage: function (amount) {
                var lastPage = this.props.pages.length - 1;
                var newPage = this.state.currentPage + amount;
                newPage = Rance.clamp(newPage, 0, lastPage);

                this.setState({
                    currentPage: newPage
                });
            },
            handleClose: function () {
                if (this.refs.dontShowAgain.getDOMNode().checked) {
                    //do stuff
                }

                this.props.closePopup();
            },
            render: function () {
                var hasBackArrow = this.state.currentPage > 0;
                var backElement;
                if (hasBackArrow) {
                    backElement = React.DOM.div({
                        className: "tutorial-popup-flip-page tutorial-popup-flip-page-back",
                        onClick: this.flipPage.bind(this, -1)
                    }, "<");
                } else {
                    backElement = React.DOM.div({
                        className: "tutorial-popup-flip-page disabled"
                    });
                }

                var hasForwardArrow = this.state.currentPage < this.props.pages.length - 1;
                var forwardElement;
                if (hasForwardArrow) {
                    forwardElement = React.DOM.div({
                        className: "tutorial-popup-flip-page tutorial-popup-flip-page-forward",
                        onClick: this.flipPage.bind(this, 1)
                    }, ">");
                } else {
                    forwardElement = React.DOM.div({
                        className: "tutorial-popup-flip-page disabled"
                    });
                }

                return (React.DOM.div({
                    className: "tutorial-popup"
                }, React.DOM.div({
                    className: "tutorial-popup-inner"
                }, backElement, React.DOM.div({
                    className: "tutorial-popup-content"
                }, this.props.pages[this.state.currentPage]), forwardElement), React.DOM.div({
                    className: "dont-show-again-wrapper"
                }, React.DOM.label(null, React.DOM.input({
                    type: "checkBox",
                    ref: "dontShowAgain",
                    className: "dont-show-again"
                }), "Disable tutorial"), React.DOM.div({
                    className: "popup-buttons"
                }, React.DOM.button({
                    className: "popup-button",
                    onClick: this.handleClose
                }, this.props.cancelText || "Close")))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ConfirmPopup = React.createClass({
            displayName: "ConfirmPopup",
            componentDidMount: function () {
                this.refs.okButton.getDOMNode().focus();
            },
            handleOk: function () {
                if (!this.props.handleOk) {
                    this.handleClose();
                    return;
                }

                var callbackSuccesful = this.props.handleOk();

                if (callbackSuccesful !== false) {
                    this.handleClose();
                }
            },
            handleClose: function () {
                this.props.closePopup();
            },
            render: function () {
                return (React.DOM.div({
                    className: "confirm-popup"
                }, React.DOM.div({
                    className: "confirm-popup-content"
                }, this.props.contentText), React.DOM.div({
                    className: "popup-buttons"
                }, React.DOM.button({
                    className: "popup-button",
                    onClick: this.handleOk,
                    ref: "okButton"
                }, this.props.okText || "Confirm"), React.DOM.button({
                    className: "popup-button",
                    onClick: this.handleClose
                }, this.props.cancelText || "Cancel"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="popup.ts"/>
/// <reference path="tutorialpopup.ts"/>
/// <reference path="confirmpopup.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.PopupManager = React.createClass({
            displayName: "PopupManager",
            componentWillMount: function () {
                this.listeners = {};
                var self = this;
                this.listeners["makePopup"] = Rance.eventManager.addEventListener("makePopup", function (e) {
                    self.makePopup(e.data);
                });
                this.listeners["closePopup"] = Rance.eventManager.addEventListener("closePopup", function (e) {
                    self.closePopup(e.data);
                });
                this.listeners["setPopupContent"] = Rance.eventManager.addEventListener("setPopupContent", function (e) {
                    self.setPopupContent(e.data.id, e.data.content);
                });
            },
            componentWillUnmount: function () {
                for (var listenerId in this.listeners) {
                    Rance.eventManager.removeEventListener(listenerId, this.listeners[listenerId]);
                }
            },
            getInitialState: function () {
                return ({
                    popups: []
                });
            },
            incrementZIndex: function () {
                if (!this.currentZIndex)
                    this.currentZIndex = 0;

                return this.currentZIndex++;
            },
            getPopupId: function () {
                if (!this.popupId)
                    this.popupId = 0;

                return this.popupId++;
            },
            getPopup: function (id) {
                for (var i = 0; i < this.state.popups.length; i++) {
                    if (this.state.popups[i].id === id)
                        return this.state.popups[i];
                }

                return null;
            },
            hasPopup: function (id) {
                for (var i = 0; i < this.state.popups.length; i++) {
                    if (this.state.popups[i].id === id)
                        return true;
                }

                return false;
            },
            closePopup: function (id) {
                if (!this.hasPopup)
                    throw new Error("No such popup");

                var newPopups = [];

                for (var i = 0; i < this.state.popups.length; i++) {
                    if (this.state.popups[i].id !== id) {
                        newPopups.push(this.state.popups[i]);
                    }
                }

                this.setState({ popups: newPopups });
            },
            makePopup: function (props) {
                var popups = this.state.popups.concat({
                    contentConstructor: props.contentConstructor,
                    contentProps: props.contentProps,
                    id: this.getPopupId()
                });

                this.setState({
                    popups: popups
                });
            },
            setPopupContent: function (popupId, newContent) {
                var popup = this.getPopup(popupId);
                if (!popup)
                    throw new Error();

                popup.contentProps = newContent;

                this.forceUpdate();
            },
            render: function () {
                var popups = this.state.popups;

                var toRender = [];

                for (var i = 0; i < popups.length; i++) {
                    var popup = popups[i];

                    toRender.push(Rance.UIComponents.Popup({
                        contentConstructor: popup.contentConstructor,
                        contentProps: popup.contentProps,
                        key: popup.id,
                        incrementZIndex: this.incrementZIndex,
                        closePopup: this.closePopup.bind(this, popup.id)
                    }));
                }

                if (toRender.length < 1) {
                    return null;
                }

                return (React.DOM.div({
                    className: "popup-container"
                }, toRender));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.LightBox = React.createClass({
            displayName: "LightBox",
            render: function () {
                return (React.DOM.div({
                    className: "light-box-wrapper"
                }, React.DOM.div({
                    className: "light-box-container"
                }, React.DOM.button({
                    className: "light-box-close",
                    onClick: this.props.handleClose
                }, "X"), React.DOM.div({
                    className: "light-box-content"
                }, this.props.content))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ItemPurchaseListItem = React.createClass({
            displayName: "ItemPurchaseListItem",
            makeCell: function (type) {
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "item-purchase-list-item-cell " + "item-purchase-list-" + type;

                var cellContent;

                switch (type) {
                    case ("buildCost"): {
                        if (this.props.playerMoney < this.props.buildCost) {
                            cellProps.className += " negative";
                        }
                    }
                    default: {
                        cellContent = this.props[type];
                        if (isFinite(cellContent)) {
                            cellProps.className += " center-text";
                        }

                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var cells = [];
                var columns = this.props.activeColumns;

                for (var i = 0; i < columns.length; i++) {
                    cells.push(this.makeCell(columns[i].key));
                }

                var props = {
                    className: "item-purchase-list-item",
                    onClick: this.props.handleClick
                };
                if (this.props.playerMoney < this.props.buildCost) {
                    props.onClick = null;
                    props.disabled = true;
                    props.className += " disabled";
                }

                return (React.DOM.tr(props, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="itempurchaselistitem.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ItemPurchaseList = React.createClass({
            displayName: "ItemPurchaseList",
            getSlotIndex: function (slot) {
                if (slot === "high") {
                    return 2;
                } else if (slot === "mid") {
                    return 1;
                } else
                    return 0;
            },
            render: function () {
                var rows = [];

                for (var i = 0; i < this.props.items.length; i++) {
                    var item = this.props.items[i];

                    var data = {
                        item: item,
                        typeName: item.template.displayName,
                        slot: item.template.slot,
                        slotIndex: this.getSlotIndex(item.template.slot),
                        techLevel: item.template.techLevel,
                        buildCost: item.template.cost,
                        playerMoney: this.props.playerMoney,
                        rowConstructor: Rance.UIComponents.ItemPurchaseListItem
                    };

                    rows.push({
                        key: item.template.type,
                        data: data
                    });
                }

                var columns = [
                    {
                        label: "Type",
                        key: "typeName",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Slot",
                        key: "slot",
                        propToSortBy: "slotIndex",
                        defaultOrder: "desc"
                    },
                    {
                        label: "Tech",
                        key: "techLevel",
                        defaultOrder: "desc"
                    },
                    {
                        label: "Cost",
                        key: "buildCost",
                        defaultOrder: "asc"
                    }
                ];

                return (React.DOM.div({ className: "item-purchase-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    initialSortOrder: [columns[1], columns[2]],
                    onRowChange: this.props.onRowChange
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="itempurchaselist.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BuyItems = React.createClass({
            displayName: "BuyItems",
            handleSelectRow: function (row) {
                var template = row.data.item.template;
                var item = new Rance.Item(template);

                this.props.player.addItem(item);
                this.props.player.money -= template.cost;

                Rance.eventManager.dispatchEvent("playerControlUpdated");
            },
            render: function () {
                var player = this.props.player;
                var items = player.getAllBuildableItems();

                if (items.length < 1) {
                    return (React.DOM.div({ className: "buy-items" }, "You need to construct an item manufactory first"));
                }

                return (React.DOM.div({ className: "buy-items" }, Rance.UIComponents.ItemPurchaseList({
                    items: items,
                    onRowChange: this.handleSelectRow,
                    playerMoney: this.props.player.money
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.SaveListItem = React.createClass({
            displayName: "SaveListItem",
            makeCell: function (type) {
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "save-list-item-cell" + " save-list-" + type;

                var cellContent;

                switch (type) {
                    case "delete": {
                        cellContent = "X";

                        cellProps.onClick = this.props.handleDelete;
                        break;
                    }
                    default: {
                        cellContent = this.props[type];
                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var columns = this.props.activeColumns;

                var cells = [];

                for (var i = 0; i < columns.length; i++) {
                    var cell = this.makeCell(columns[i].key);

                    cells.push(cell);
                }

                var rowProps = {
                    className: "save-list-item",
                    onClick: this.props.handleClick
                };

                return (React.DOM.tr(rowProps, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="savelistitem.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.SaveList = React.createClass({
            displayName: "SaveList",
            render: function () {
                var rows = [];

                var allKeys = Object.keys(localStorage);

                var saveKeys = allKeys.filter(function (key) {
                    return (key.indexOf("Rance.Save") > -1);
                });

                for (var i = 0; i < saveKeys.length; i++) {
                    var saveData = JSON.parse(localStorage.getItem(saveKeys[i]));
                    var date = new Date(saveData.date);

                    rows.push({
                        key: saveKeys[i],
                        data: {
                            name: saveData.name,
                            date: Rance.prettifyDate(date),
                            accurateDate: saveData.date,
                            rowConstructor: Rance.UIComponents.SaveListItem,
                            handleDelete: this.props.onDelete ? this.props.onDelete.bind(null, saveKeys[i]) : null
                        }
                    });
                }

                var columns = [
                    {
                        label: "Name",
                        key: "name",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Date",
                        key: "date",
                        defaultOrder: "desc",
                        propToSortBy: "accurateDate"
                    }
                ];

                if (this.props.allowDelete) {
                    columns.push({
                        label: "Del",
                        key: "delete",
                        notSortable: true
                    });
                }

                return (React.DOM.div({ className: "save-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    initialSortOrder: [columns[1]],
                    onRowChange: this.props.onRowChange,
                    autoSelect: this.props.autoSelect
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="savelist.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.SaveGame = React.createClass({
            displayName: "SaveGame",
            componentDidMount: function () {
                this.refs.okButton.getDOMNode().focus();
            },
            setInputText: function (newText) {
                this.refs.saveName.getDOMNode().value = newText;
            },
            handleRowChange: function (row) {
                this.setInputText(row.data.name);
            },
            handleSave: function () {
                var saveName = this.refs.saveName.getDOMNode().value;
                var saveKey = "Rance.Save." + saveName;
                if (localStorage[saveKey]) {
                    this.makeConfirmOverWritePopup(saveName);
                } else {
                    this.saveGame();
                }
            },
            saveGame: function () {
                app.game.save(this.refs.saveName.getDOMNode().value);
                this.handleClose();
            },
            handleClose: function () {
                this.props.handleClose();
            },
            makeConfirmOverWritePopup: function (saveName) {
                var confirmProps = {
                    handleOk: this.saveGame,
                    contentText: "Are you sure you want to overwrite " + saveName.replace("Rance.Save.", "") + "?"
                };

                this.refs.popupManager.makePopup({
                    contentConstructor: Rance.UIComponents.ConfirmPopup,
                    contentProps: confirmProps
                });
            },
            render: function () {
                return (React.DOM.div({
                    className: "save-game"
                }, Rance.UIComponents.PopupManager({
                    ref: "popupManager"
                }), Rance.UIComponents.SaveList({
                    onRowChange: this.handleRowChange,
                    autoSelect: true
                }), React.DOM.input({
                    className: "save-game-name",
                    ref: "saveName",
                    type: "text",
                    maxLength: 64
                }), React.DOM.div({
                    className: "save-game-buttons-container"
                }, React.DOM.button({
                    className: "save-game-button",
                    onClick: this.handleSave,
                    ref: "okButton"
                }, "Save"), React.DOM.button({
                    className: "save-game-button",
                    onClick: this.handleClose
                }, "Cancel"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="savelist.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.LoadGame = React.createClass({
            displayName: "LoadGame",
            componentDidMount: function () {
                this.refs.okButton.getDOMNode().focus();
            },
            setInputText: function (newText) {
                this.refs.saveName.getDOMNode().value = newText;
            },
            handleRowChange: function (row) {
                this.setInputText(row.data.name);
            },
            handleLoad: function () {
                var saveName = this.refs.saveName.getDOMNode().value;

                this.handleClose();

                app.load(saveName);
            },
            handleClose: function () {
                this.props.handleClose();
            },
            makeConfirmDeletionPopup: function (saveName) {
                var deleteFN = function (saveName) {
                    localStorage.removeItem(saveName);
                    this.refs.saveName.getDOMNode().value = "";
                    this.forceUpdate();
                }.bind(this, saveName);

                var confirmProps = {
                    handleOk: deleteFN,
                    contentText: "Are you sure you want to delete the save " + saveName.replace("Rance.Save.", "") + "?"
                };

                this.refs.popupManager.makePopup({
                    contentConstructor: Rance.UIComponents.ConfirmPopup,
                    contentProps: confirmProps
                });
            },
            render: function () {
                return (React.DOM.div({
                    className: "save-game"
                }, Rance.UIComponents.PopupManager({
                    ref: "popupManager"
                }), Rance.UIComponents.SaveList({
                    onRowChange: this.handleRowChange,
                    autoSelect: true,
                    allowDelete: true,
                    onDelete: this.makeConfirmDeletionPopup
                }), React.DOM.input({
                    className: "save-game-name",
                    ref: "saveName",
                    type: "text"
                }), React.DOM.div({
                    className: "save-game-buttons-container"
                }, React.DOM.button({
                    className: "save-game-button",
                    onClick: this.handleLoad,
                    ref: "okButton"
                }, "Load"), React.DOM.button({
                    className: "save-game-button",
                    onClick: this.handleClose
                }, "Cancel"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.EconomySummaryItem = React.createClass({
            displayName: "EconomySummaryItem",
            makeCell: function (type) {
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "economy-summary-item-cell" + " economy-summary-" + type;

                var cellContent;

                switch (type) {
                    default: {
                        cellContent = this.props[type];

                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var columns = this.props.activeColumns;

                var cells = [];

                for (var i = 0; i < columns.length; i++) {
                    var cell = this.makeCell(columns[i].key);

                    cells.push(cell);
                }

                var rowProps = {
                    className: "economy-summary-item",
                    onClick: this.props.handleClick
                };

                if (this.props.isSelected) {
                    rowProps.className += " selected";
                }
                ;

                return (React.DOM.tr(rowProps, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../unitlist/list.ts"/>
/// <reference path="economysummaryitem.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.EconomySummary = React.createClass({
            displayName: "EconomySummary",
            render: function () {
                var rows = [];
                var player = this.props.player;

                for (var i = 0; i < player.controlledLocations.length; i++) {
                    var star = player.controlledLocations[i];

                    var data = {
                        star: star,
                        id: star.id,
                        name: star.name,
                        income: star.getIncome(),
                        rowConstructor: Rance.UIComponents.EconomySummaryItem
                    };

                    rows.push({
                        key: star.id,
                        data: data
                    });
                }

                var columns = [
                    {
                        label: "Id",
                        key: "id",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Name",
                        key: "name",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Income",
                        key: "income",
                        defaultOrder: "desc"
                    }
                ];

                return (React.DOM.div({ className: "economy-summary-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    initialSortOrder: [columns[2]]
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="lightbox.ts"/>
/// <reference path="../items/buyitems.ts"/>
/// <reference path="../saves/savegame.ts"/>
/// <reference path="../saves/loadgame.ts"/>
/// <reference path="../unitlist/itemequip.ts"/>
/// <reference path="economysummary.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.TopMenu = React.createClass({
            displayName: "TopMenu",
            getInitialState: function () {
                return ({
                    opened: null,
                    lightBoxElement: null
                });
            },
            handleEquipItems: function () {
                if (this.state.opened === "equipItems") {
                    this.closeLightBox();
                } else {
                    this.setState({
                        opened: "equipItems",
                        lightBoxElement: Rance.UIComponents.LightBox({
                            handleClose: this.closeLightBox,
                            content: Rance.UIComponents.ItemEquip({
                                player: this.props.player
                            })
                        })
                    });
                }
            },
            handleBuyItems: function () {
                if (this.state.opened === "buyItems") {
                    this.closeLightBox();
                } else {
                    this.setState({
                        opened: "buyItems",
                        lightBoxElement: Rance.UIComponents.LightBox({
                            handleClose: this.closeLightBox,
                            content: Rance.UIComponents.BuyItems({
                                player: this.props.player
                            })
                        })
                    });
                }
            },
            handleEconomySummary: function () {
                if (this.state.opened === "economySummary") {
                    this.closeLightBox();
                } else {
                    this.setState({
                        opened: "economySummary",
                        lightBoxElement: Rance.UIComponents.LightBox({
                            handleClose: this.closeLightBox,
                            content: Rance.UIComponents.EconomySummary({
                                player: this.props.player
                            })
                        })
                    });
                }
            },
            handleSaveGame: function () {
                if (this.state.opened === "saveGame") {
                    this.closeLightBox();
                } else {
                    this.setState({
                        opened: "saveGame",
                        lightBoxElement: Rance.UIComponents.LightBox({
                            handleClose: this.closeLightBox,
                            content: Rance.UIComponents.SaveGame({
                                handleClose: this.closeLightBox
                            })
                        })
                    });
                }
            },
            handleLoadGame: function () {
                if (this.state.opened === "loadGame") {
                    this.closeLightBox();
                } else {
                    this.setState({
                        opened: "loadGame",
                        lightBoxElement: Rance.UIComponents.LightBox({
                            handleClose: this.closeLightBox,
                            content: Rance.UIComponents.LoadGame({
                                handleClose: this.closeLightBox
                            })
                        })
                    });
                }
            },
            closeLightBox: function () {
                this.setState({
                    opened: null,
                    lightBoxElement: null
                });
            },
            render: function () {
                return (React.DOM.div({
                    className: "top-menu"
                }, React.DOM.div({
                    className: "top-menu-items"
                }, React.DOM.button({
                    className: "top-menu-items-button",
                    onClick: this.handleSaveGame
                }, "Save"), React.DOM.button({
                    className: "top-menu-items-button",
                    onClick: this.handleLoadGame
                }, "Load"), React.DOM.button({
                    className: "top-menu-items-button",
                    onClick: this.handleBuyItems
                }, "Buy items"), React.DOM.button({
                    className: "top-menu-items-button",
                    onClick: this.handleEquipItems
                }, "Equip")), this.state.lightBoxElement));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.TopBar = React.createClass({
            displayName: "TopBar",
            render: function () {
                var player = this.props.player;

                var income = player.getIncome();

                var incomeClass = "top-bar-money-income";
                if (income < 0)
                    incomeClass += " negative";

                return (React.DOM.div({
                    className: "top-bar"
                }, React.DOM.div({
                    className: "top-bar-player"
                }, React.DOM.img({
                    className: "top-bar-player-icon",
                    src: player.icon
                }), React.DOM.div({
                    className: "top-bar-turn-number"
                }, "Turn " + this.props.game.turnNumber)), React.DOM.div({
                    className: "top-bar-money"
                }, React.DOM.div({
                    className: "top-bar-money-current"
                }, "Money: " + player.money), React.DOM.div({
                    className: incomeClass
                }, "(+" + player.getIncome() + ")"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FleetControls = React.createClass({
            displayName: "FleetControls",
            deselectFleet: function () {
                Rance.eventManager.dispatchEvent("deselectFleet", this.props.fleet);
            },
            selectFleet: function () {
                Rance.eventManager.dispatchEvent("selectFleets", [this.props.fleet]);
            },
            splitFleet: function () {
                Rance.eventManager.dispatchEvent("splitFleet", this.props.fleet);
            },
            render: function () {
                return (React.DOM.div({
                    className: "fleet-controls"
                }, React.DOM.button({
                    className: "fleet-controls-split",
                    onClick: this.splitFleet
                }, "split"), React.DOM.button({
                    className: "fleet-controls-deselect",
                    onClick: this.deselectFleet
                }, "deselect"), !this.props.hasMultipleSelected ? null : React.DOM.button({
                    className: "fleet-controls-select",
                    onClick: this.selectFleet
                }, "select")));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="fleetcontrols.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FleetInfo = React.createClass({
            displayName: "FleetInfo",
            render: function () {
                var fleet = this.props.fleet;
                if (!fleet)
                    return null;
                var totalStrength = fleet.getTotalStrength();

                return (React.DOM.div({
                    className: "fleet-info"
                }, React.DOM.div({
                    className: "fleet-info-header"
                }, React.DOM.div({
                    className: "fleet-info-name"
                }, fleet.name), React.DOM.div({
                    className: "fleet-info-shipcount"
                }, fleet.ships.length), React.DOM.div({
                    className: "fleet-info-strength"
                }, totalStrength.current + "/" + totalStrength.max), React.DOM.div({
                    className: "fleet-info-contols"
                }, Rance.UIComponents.FleetControls({
                    fleet: fleet,
                    hasMultipleSelected: this.props.hasMultipleSelected
                }))), React.DOM.div({
                    className: "fleet-info-move-points"
                }, "Moves: " + fleet.getMinCurrentMovePoints() + "/" + fleet.getMinMaxMovePoints())));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../unit/unitstrength.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.ShipInfo = React.createClass({
            displayName: "ShipInfo",
            render: function () {
                var ship = this.props.ship;

                return (React.DOM.div({
                    className: "ship-info"
                }, React.DOM.div({
                    className: "ship-info-icon-container"
                }, React.DOM.img({
                    className: "ship-info-icon",
                    src: ship.template.icon
                })), React.DOM.div({
                    className: "ship-info-info"
                }, React.DOM.div({
                    className: "ship-info-name"
                }, ship.name), React.DOM.div({
                    className: "ship-info-type"
                }, ship.template.typeName)), Rance.UIComponents.UnitStrength({
                    maxStrength: ship.maxStrength,
                    currentStrength: ship.currentStrength,
                    isSquadron: true
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../mixins/draggable.ts" />
/// <reference path="../unit/unitstrength.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.DraggableShipInfo = React.createClass({
            displayName: "DraggableShipInfo",
            mixins: [Rance.UIComponents.Draggable],
            onDragStart: function (e) {
                this.props.onDragStart(this.props.ship);
            },
            onDragEnd: function (e) {
                this.props.onDragEnd(e);
            },
            render: function () {
                var ship = this.props.ship;

                var divProps = {
                    className: "ship-info draggable",
                    onTouchStart: this.handleMouseDown,
                    onMouseDown: this.handleMouseDown
                };

                if (this.state.dragging) {
                    divProps.style = this.state.dragPos;
                    divProps.className += " dragging";
                }

                return (React.DOM.div(divProps, React.DOM.div({
                    className: "ship-info-icon-container"
                }, React.DOM.img({
                    className: "ship-info-icon",
                    src: ship.template.icon
                })), React.DOM.div({
                    className: "ship-info-info"
                }, React.DOM.div({
                    className: "ship-info-name"
                }, ship.name), React.DOM.div({
                    className: "ship-info-type"
                }, ship.template.typeName)), Rance.UIComponents.UnitStrength({
                    maxStrength: ship.maxStrength,
                    currentStrength: ship.currentStrength,
                    isSquadron: true
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="shipinfo.ts"/>
/// <reference path="draggableshipinfo.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FleetContents = React.createClass({
            displayName: "FleetContents",
            handleMouseUp: function () {
                if (!this.props.onMouseUp)
                    return;

                this.props.onMouseUp(this.props.fleet);
            },
            render: function () {
                var shipInfos = [];

                var draggableContent = (this.props.onDragStart || this.props.onDragEnd);

                for (var i = 0; i < this.props.fleet.ships.length; i++) {
                    if (!draggableContent) {
                        shipInfos.push(Rance.UIComponents.ShipInfo({
                            key: this.props.fleet.ships[i].id,
                            ship: this.props.fleet.ships[i]
                        }));
                    } else {
                        shipInfos.push(Rance.UIComponents.DraggableShipInfo({
                            key: this.props.fleet.ships[i].id,
                            ship: this.props.fleet.ships[i],
                            onDragStart: this.props.onDragStart,
                            onDragMove: this.props.onDragMove,
                            onDragEnd: this.props.onDragEnd
                        }));
                    }
                }

                if (draggableContent) {
                    shipInfos.push(React.DOM.div({
                        className: "fleet-contents-dummy-ship",
                        key: "dummy"
                    }));
                }

                return (React.DOM.div({
                    className: "fleet-contents",
                    onMouseUp: this.handleMouseUp
                }, shipInfos));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="fleetinfo.ts"/>
/// <reference path="fleetcontents.ts"/>
///
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FleetSelection = React.createClass({
            displayName: "FleetSelection",
            mergeFleets: function () {
                Rance.eventManager.dispatchEvent("mergeFleets", null);
            },
            reorganizeFleets: function () {
                Rance.eventManager.dispatchEvent("startReorganizingFleets", this.props.selectedFleets);
            },
            render: function () {
                var selectedFleets = this.props.selectedFleets;
                if (!selectedFleets || selectedFleets.length <= 0) {
                    return null;
                }

                var allFleetsInSameLocation = true;
                var hasMultipleSelected = selectedFleets.length >= 2;

                for (var i = 1; i < selectedFleets.length; i++) {
                    if (selectedFleets[i].location !== selectedFleets[i - 1].location) {
                        allFleetsInSameLocation = false;
                        break;
                    }
                }
                var fleetInfos = [];

                for (var i = 0; i < selectedFleets.length; i++) {
                    var infoProps = {
                        key: selectedFleets[i].id,
                        fleet: selectedFleets[i],
                        hasMultipleSelected: hasMultipleSelected
                    };

                    fleetInfos.push(Rance.UIComponents.FleetInfo(infoProps));
                }

                var fleetSelectionControls = null;

                if (hasMultipleSelected) {
                    var mergeProps = {
                        className: "fleet-selection-controls-merge"
                    };
                    if (allFleetsInSameLocation) {
                        mergeProps.onClick = this.mergeFleets;
                    } else {
                        mergeProps.disabled = true;
                        mergeProps.className += " disabled";
                    }

                    var reorganizeProps = {
                        className: "fleet-selection-controls-reorganize"
                    };
                    if (allFleetsInSameLocation && selectedFleets.length === 2) {
                        reorganizeProps.onClick = this.reorganizeFleets;
                    } else {
                        reorganizeProps.disabled = true;
                        reorganizeProps.className += " disabled";
                    }

                    fleetSelectionControls = React.DOM.div({
                        className: "fleet-selection-controls"
                    }, React.DOM.button(reorganizeProps, "reorganize"), React.DOM.button(mergeProps, "merge"));
                }

                var fleetContents = null;

                if (!hasMultipleSelected) {
                    fleetContents = Rance.UIComponents.FleetContents({
                        fleet: selectedFleets[0]
                    });
                }

                return (React.DOM.div({
                    className: "fleet-selection"
                }, fleetSelectionControls, hasMultipleSelected ? null : fleetInfos, React.DOM.div({
                    className: "fleet-selection-selected-wrapper"
                }, React.DOM.div({
                    className: "fleet-selection-selected"
                }, hasMultipleSelected ? fleetInfos : null, fleetContents))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="fleetcontents.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FleetReorganization = React.createClass({
            displayName: "FleetReorganization",
            getInitialState: function () {
                return ({
                    currentDragUnit: null
                });
            },
            handleDragStart: function (unit) {
                this.setState({
                    currentDragUnit: unit
                });
            },
            handleDragEnd: function (dropSuccesful) {
                if (typeof dropSuccesful === "undefined") { dropSuccesful = false; }
                this.setState({
                    currentDragUnit: null
                });
            },
            handleDrop: function (fleet) {
                var draggingUnit = this.state.currentDragUnit;
                if (draggingUnit) {
                    var oldFleet = draggingUnit.fleet;

                    oldFleet.transferShip(fleet, draggingUnit);
                    Rance.eventManager.dispatchEvent("playerControlUpdated", null);
                }

                this.handleDragEnd(true);
            },
            render: function () {
                var selectedFleets = this.props.fleets;
                if (!selectedFleets || selectedFleets.length < 1) {
                    return null;
                }

                return (React.DOM.div({
                    className: "fleet-reorganization"
                }, React.DOM.div({
                    className: "fleet-reorganization-header"
                }, "Reorganize fleets"), React.DOM.div({
                    className: "fleet-reorganization-subheader"
                }, React.DOM.div({
                    className: "fleet-reorganization-subheader-fleet-name" + " fleet-reorganization-subheader-fleet-name-left"
                }, selectedFleets[0].name), React.DOM.div({
                    className: "fleet-reorganization-subheader-center"
                }, null), React.DOM.div({
                    className: "fleet-reorganization-subheader-fleet-name" + " fleet-reorganization-subheader-fleet-name-right"
                }, selectedFleets[1].name)), React.DOM.div({
                    className: "fleet-reorganization-contents"
                }, Rance.UIComponents.FleetContents({
                    fleet: selectedFleets[0],
                    onMouseUp: this.handleDrop,
                    onDragStart: this.handleDragStart,
                    onDragEnd: this.handleDragEnd
                }), React.DOM.div({
                    className: "fleet-reorganization-contents-divider"
                }, null), Rance.UIComponents.FleetContents({
                    fleet: selectedFleets[1],
                    onMouseUp: this.handleDrop,
                    onDragStart: this.handleDragStart,
                    onDragEnd: this.handleDragEnd
                })), React.DOM.div({
                    className: "fleet-reorganization-footer"
                }, React.DOM.button({
                    className: "close-reorganization",
                    onClick: this.props.closeReorganization
                }, "Close"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.DefenceBuilding = React.createClass({
            displayName: "DefenceBuilding",
            render: function () {
                var building = this.props.building;
                return (React.DOM.div({
                    className: "defence-building"
                }, React.DOM.img({
                    className: "defence-building-icon",
                    src: Rance.colorImageInPlayerColor(building.template.icon, building.controller)
                }), React.DOM.img({
                    className: "defence-building-controller",
                    src: building.controller.icon
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="defencebuilding.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.DefenceBuildingList = React.createClass({
            displayName: "DefenceBuildingList",
            render: function () {
                if (!this.props.buildings)
                    return null;

                var buildings = [];

                for (var i = 0; i < this.props.buildings.length; i++) {
                    buildings.push(Rance.UIComponents.DefenceBuilding({
                        key: i,
                        building: this.props.buildings[i]
                    }));
                }

                return (React.DOM.div({
                    className: "defence-building-list"
                }, buildings));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="defencebuildinglist.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.StarInfo = React.createClass({
            displayName: "StarInfo",
            render: function () {
                var star = this.props.selectedStar;
                if (!star)
                    return null;

                return (React.DOM.div({
                    className: "star-info"
                }, React.DOM.div({
                    className: "star-info-name"
                }, star.name), React.DOM.div({
                    className: "star-info-owner"
                }, star.owner ? star.owner.name : null), React.DOM.div({
                    className: "star-info-location"
                }, "x: " + star.x.toFixed() + " y: " + star.y.toFixed()), React.DOM.div({
                    className: "star-info-income"
                }, "Income: " + star.getIncome()), React.DOM.div({
                    className: "star-info-sector"
                }, "Sector: " + star.sector.id), Rance.UIComponents.DefenceBuildingList({
                    buildings: star.buildings["defence"]
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.AttackTarget = React.createClass({
            displayName: "AttackTarget",
            handleAttack: function () {
                Rance.eventManager.dispatchEvent("attackTarget", this.props.attackTarget);
            },
            render: function () {
                var target = this.props.attackTarget;

                return (React.DOM.div({
                    className: "attack-target",
                    onClick: this.handleAttack
                }, React.DOM.div({
                    className: "attack-target-type"
                }, target.type), React.DOM.img({
                    className: "attack-target-player-icon",
                    src: target.enemy.icon
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BuildableBuilding = React.createClass({
            displayName: "BuildableBuilding",
            makeCell: function (type) {
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "buildable-building-list-item-cell " + type;

                var cellContent;

                switch (type) {
                    case ("buildCost"): {
                        if (this.props.player.money < this.props.buildCost) {
                            cellProps.className += " negative";
                        }
                    }
                    default: {
                        cellContent = this.props[type];

                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var player = this.props.player;
                var cells = [];
                var columns = this.props.activeColumns;

                for (var i = 0; i < columns.length; i++) {
                    cells.push(this.makeCell(columns[i].key));
                }

                var props = {
                    className: "buildable-item buildable-building",
                    onClick: this.props.handleClick
                };
                if (player.money < this.props.buildCost) {
                    props.onClick = null;
                    props.disabled = true;
                    props.className += " disabled";
                }

                return (React.DOM.tr(props, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../unitlist/list.ts" />
/// <reference path="buildablebuilding.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BuildableBuildingList = React.createClass({
            displayName: "BuildableBuildingList",
            getInitialState: function () {
                return ({
                    buildingTemplates: this.props.star.getBuildableBuildings()
                });
            },
            updateBuildings: function () {
                this.setState({
                    buildingTemplates: this.props.star.getBuildableBuildings()
                });

                Rance.eventManager.dispatchEvent("playerControlUpdated");
            },
            buildBuilding: function (rowItem) {
                var template = rowItem.data.template;

                var building = new Rance.Building({
                    template: template,
                    location: this.props.star
                });

                if (!building.controller)
                    building.controller = this.props.humanPlayer;

                this.props.star.addBuilding(building);
                building.controller.money -= template.buildCost;

                //building.totalCost += template.buildCost;
                this.updateBuildings();
            },
            render: function () {
                if (this.state.buildingTemplates.length < 1)
                    return null;
                var rows = [];

                for (var i = 0; i < this.state.buildingTemplates.length; i++) {
                    var template = this.state.buildingTemplates[i];

                    var data = {
                        template: template,
                        typeName: template.name,
                        buildCost: template.buildCost,
                        player: this.props.player,
                        rowConstructor: Rance.UIComponents.BuildableBuilding
                    };

                    rows.push({
                        key: i,
                        data: data
                    });
                }

                var columns = [
                    {
                        label: "Name",
                        key: "typeName",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Cost",
                        key: "buildCost",
                        defaultOrder: "desc"
                    }
                ];

                return (React.DOM.div({ className: "buildable-item-list buildable-building-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    onRowChange: this.buildBuilding
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
/// <reference path="../lib/clipper.d.ts" />
var Rance;
(function (Rance) {
    function randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }
    Rance.randInt = randInt;
    function randRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    Rance.randRange = randRange;
    function getRandomArrayKey(target) {
        return Math.floor(Math.random() * (target.length));
    }
    Rance.getRandomArrayKey = getRandomArrayKey;
    function getRandomArrayItem(target) {
        var _rnd = Math.floor(Math.random() * (target.length));
        return target[_rnd];
    }
    Rance.getRandomArrayItem = getRandomArrayItem;
    function getRandomKey(target) {
        var _targetKeys = Object.keys(target);
        var _rnd = Math.floor(Math.random() * (_targetKeys.length));
        return _targetKeys[_rnd];
    }
    Rance.getRandomKey = getRandomKey;

    function getRandomProperty(target) {
        var _rndProp = target[getRandomKey(target)];
        return _rndProp;
    }
    Rance.getRandomProperty = getRandomProperty;
    function getFrom2dArray(target, arr) {
        var result = [];
        for (var i = 0; i < arr.length; i++) {
            if ((arr[i] !== undefined) && (arr[i][0] >= 0 && arr[i][0] < target.length) && (arr[i][1] >= 0 && arr[i][1] < target[0].length)) {
                result.push(target[arr[i][0]][arr[i][1]]);
            } else {
                result.push(null);
            }
        }
        ;
        return result;
    }
    Rance.getFrom2dArray = getFrom2dArray;
    function divmod(x, y) {
        var a = Math.floor(x / y);
        var b = x % y;
        return [a, b];
    }
    Rance.divmod = divmod;
    function flatten2dArray(toFlatten) {
        var flattened = [];
        for (var i = 0; i < toFlatten.length; i++) {
            for (var j = 0; j < toFlatten[i].length; j++) {
                flattened.push(toFlatten[i][j]);
            }
        }

        return flattened;
    }
    Rance.flatten2dArray = flatten2dArray;
    function reverseSide(side) {
        switch (side) {
            case "side1": {
                return "side2";
            }
            case "side2": {
                return "side1";
            }
            default: {
                throw new Error("Invalid side");
            }
        }
    }
    Rance.reverseSide = reverseSide;

    function turnOrderSortFunction(a, b) {
        if (a.battleStats.moveDelay !== b.battleStats.moveDelay) {
            return a.battleStats.moveDelay - b.battleStats.moveDelay;
        } else {
            return a.id - b.id;
        }
    }
    Rance.turnOrderSortFunction = turnOrderSortFunction;

    function makeRandomShip() {
        var allTypes = Object.keys(Rance.Templates.ShipTypes);
        var type = getRandomArrayItem(allTypes);

        var unit = new Rance.Unit(Rance.Templates.ShipTypes[type]);

        return unit;
    }
    Rance.makeRandomShip = makeRandomShip;

    function centerDisplayObjectContainer(toCenter) {
        toCenter.x -= toCenter.width / 2;
    }
    Rance.centerDisplayObjectContainer = centerDisplayObjectContainer;
    function rectContains(rect, point) {
        var x = point.x;
        var y = point.y;

        var x1 = Math.min(rect.x1, rect.x2);
        var x2 = Math.max(rect.x1, rect.x2);
        var y1 = Math.min(rect.y1, rect.y2);
        var y2 = Math.max(rect.y1, rect.y2);

        return ((x >= x1 && x <= x2) && (y >= y1 && y <= y2));
    }
    Rance.rectContains = rectContains;

    function hexToString(hex) {
        hex = Math.round(hex);
        var converted = hex.toString(16);
        return '000000'.substr(0, 6 - converted.length) + converted;
    }
    Rance.hexToString = hexToString;
    function stringToHex(text) {
        if (text.charAt(0) === "#") {
            text = text.substring(1, 7);
        }

        return parseInt(text, 16);
    }
    Rance.stringToHex = stringToHex;

    function makeTempPlayerIcon(player, size) {
        var canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;

        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#" + hexToString(player.color);
        ctx.fillRect(0, 0, size, size);

        return canvas.toDataURL();
    }
    Rance.makeTempPlayerIcon = makeTempPlayerIcon;
    function colorImageInPlayerColor(imageSrc, player) {
        var image = new Image();
        image.src = imageSrc;
        var canvas = document.createElement("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, image.width, image.height);

        ctx.globalCompositeOperation = "source-in";

        ctx.fillStyle = "#" + hexToString(player.color);
        ctx.fillRect(0, 0, image.width, image.height);

        return canvas.toDataURL();
    }
    Rance.colorImageInPlayerColor = colorImageInPlayerColor;

    function cloneObject(toClone) {
        var result = {};
        for (var prop in toClone) {
            result[prop] = toClone[prop];
        }
        return result;
    }
    Rance.cloneObject = cloneObject;
    function recursiveRemoveAttribute(parent, attribute) {
        parent.removeAttribute(attribute);

        for (var i = 0; i < parent.children.length; i++) {
            recursiveRemoveAttribute(parent.children[i], attribute);
        }
    }
    Rance.recursiveRemoveAttribute = recursiveRemoveAttribute;

    function clamp(value, min, max) {
        if (value < min)
            return min;
        else if (value > max)
            return max;
        else
            return value;
    }
    Rance.clamp = clamp;
    function getAngleBetweenDegrees(degA, degB) {
        var angle = Math.abs(degB - degA) % 360;
        var distance = Math.min(360 - angle, angle);

        //console.log(degA, degB, distance);
        return distance;
    }
    Rance.getAngleBetweenDegrees = getAngleBetweenDegrees;
    function shiftPolygon(polygon, amount) {
        return polygon.map(function (point) {
            return ({
                x: point.x + amount,
                y: point.y + amount
            });
        });
    }
    Rance.shiftPolygon = shiftPolygon;
    function convertCase(polygon) {
        if (isFinite(polygon[0].x)) {
            return polygon.map(function (point) {
                return ({
                    X: point.x,
                    Y: point.y
                });
            });
        } else {
            return polygon.map(function (point) {
                return ({
                    x: point.X,
                    y: point.Y
                });
            });
        }
    }
    Rance.convertCase = convertCase;
    function offsetPolygon(polygon, amount) {
        polygon = convertCase(polygon);
        var scale = 100;
        ClipperLib.JS.ScaleUpPath(polygon, scale);

        ClipperLib.Clipper.SimplifyPolygon(polygon, ClipperLib.PolyFillType.pftNonZero);
        ClipperLib.Clipper.CleanPolygon(polygon, 0.1 * scale);

        var co = new ClipperLib.ClipperOffset(2, 0.01);
        co.AddPath(polygon, ClipperLib.JoinType.jtRound, ClipperLib.EndType.etClosedPolygon);
        var offsetted = new ClipperLib.Path();

        co.Execute(offsetted, amount * scale);

        if (offsetted.length < 1) {
            console.warn("couldn't offset polygon");
            return null;
        }

        var converted = convertCase(offsetted[0]);

        return converted.map(function (point) {
            return ({
                x: point.x / scale,
                y: point.y / scale
            });
        });
    }
    Rance.offsetPolygon = offsetPolygon;

    function arraysEqual(a1, a2) {
        if (a1 === a2)
            return true;
        if (!a1 || !a2)
            return false;
        if (a1.length !== a2.length)
            return false;

        a1.sort();
        a2.sort();

        for (var i = 0; i < a1.length; i++) {
            if (a1[i] !== a2[i])
                return false;
        }

        return true;
    }
    Rance.arraysEqual = arraysEqual;
    function prettifyDate(date) {
        return ([
            [
                date.getDate(),
                date.getMonth() + 1,
                date.getFullYear().toString().slice(2, 4)
            ].join("/"),
            [
                date.getHours(),
                date.getMinutes().toString().length < 2 ? "0" + date.getMinutes() : date.getMinutes().toString()
            ].join(":")
        ].join(" "));
    }
    Rance.prettifyDate = prettifyDate;
    function shuffleArray(toShuffle) {
        var resultArray = toShuffle.slice(0);

        var i = resultArray.length;

        while (i > 0) {
            i--;
            var n = randInt(0, i);

            var temp = resultArray[i];
            resultArray[i] = resultArray[n];
            resultArray[n] = temp;
        }
        return resultArray;
    }
    Rance.shuffleArray = shuffleArray;
    function getRelativeValue(value, min, max) {
        if (min === max)
            return 1;
        else {
            return (value - min) / (max - min);
        }
    }
    Rance.getRelativeValue = getRelativeValue;
})(Rance || (Rance = {}));
/// <reference path="utility.ts"/>
/// <reference path="unit.ts"/>
var Rance;
(function (Rance) {
    //**
    //**
    //X*
    //**
    Rance.targetSingle;
    Rance.targetSingle = function (fleets, target) {
        return Rance.getFrom2dArray(fleets, [target]);
    };

    //XX
    //XX
    //XX
    //XX
    Rance.targetAll;
    Rance.targetAll = function (fleets, target) {
        var allTargets = [];

        for (var i = 0; i < fleets.length; i++) {
            for (var j = 0; j < fleets[i].length; j++) {
                allTargets.push(fleets[i][j]);
            }
        }

        return allTargets;
    };

    //**
    //**
    //XX
    //**
    Rance.targetRow;
    Rance.targetRow = function (fleets, target) {
        var y = target[1];
        var allTargets = [];

        for (var i = 0; i < fleets.length; i++) {
            allTargets.push([i, y]);
        }

        return Rance.getFrom2dArray(fleets, allTargets);
    };

    //X*
    //X*
    //X*
    //X*
    Rance.targetColumn;
    Rance.targetColumn = function (fleets, target) {
        var x = target[0];
        var allTargets = [];

        for (var i = 0; i < fleets[x].length; i++) {
            allTargets.push([x, i]);
        }

        return Rance.getFrom2dArray(fleets, allTargets);
    };

    //**
    //X*
    //X*
    //X*
    Rance.targetColumnNeighbors;
    Rance.targetColumnNeighbors = function (fleets, target) {
        var x = target[0];
        var y = target[1];
        var allTargets = [];

        allTargets.push([x, y]);
        allTargets.push([x, y - 1]);
        allTargets.push([x, y + 1]);

        return Rance.getFrom2dArray(fleets, allTargets);
    };

    //**
    //X*
    //XX
    //X*
    Rance.targetNeighbors;
    Rance.targetNeighbors = function (fleets, target) {
        var x = target[0];
        var y = target[1];
        var allTargets = [];

        allTargets.push([x, y]);
        allTargets.push([x - 1, y]);
        allTargets.push([x + 1, y]);
        allTargets.push([x, y - 1]);
        allTargets.push([x, y + 1]);

        return Rance.getFrom2dArray(fleets, allTargets);
    };
})(Rance || (Rance = {}));
/// <reference path="../../src/targeting.ts" />
/// <reference path="../../src/unit.ts" />
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (Effects) {
            Effects.dummyTargetColumn = {
                name: "dummyTargetColumn",
                targetFleets: "enemy",
                targetingFunction: Rance.targetColumn,
                targetRange: "all",
                effect: function () {
                }
            };
            Effects.dummyTargetAll = {
                name: "dummyTargetAll",
                targetFleets: "enemy",
                targetingFunction: Rance.targetAll,
                targetRange: "all",
                effect: function () {
                }
            };
            Effects.rangedAttack = {
                name: "rangedAttack",
                targetFleets: "enemy",
                targetingFunction: Rance.targetSingle,
                targetRange: "all",
                effect: function (user, target) {
                    var baseDamage = 100;
                    var damageType = "physical";

                    var damageIncrease = user.getAttackDamageIncrease(damageType);
                    var damage = baseDamage * damageIncrease;

                    target.recieveDamage(damage, damageType);
                }
            };
            Effects.closeAttack = {
                name: "closeAttack",
                targetFleets: "enemy",
                targetingFunction: Rance.targetColumnNeighbors,
                targetRange: "close",
                effect: function (user, target) {
                    var baseDamage = 100;
                    var damageType = "physical";

                    var damageIncrease = user.getAttackDamageIncrease(damageType);
                    var damage = baseDamage * damageIncrease;

                    target.recieveDamage(damage, damageType);
                }
            };
            Effects.wholeRowAttack = {
                name: "wholeRowAttack",
                targetFleets: "all",
                targetingFunction: Rance.targetRow,
                targetRange: "all",
                effect: function (user, target) {
                    var baseDamage = 100;
                    var damageType = "magical";

                    var damageIncrease = user.getAttackDamageIncrease(damageType);
                    var damage = baseDamage * damageIncrease;

                    target.recieveDamage(damage, damageType);
                }
            };

            Effects.bombAttack = {
                name: "bombAttack",
                targetFleets: "enemy",
                targetingFunction: Rance.targetNeighbors,
                targetRange: "all",
                effect: function (user, target) {
                    var baseDamage = 100;
                    var damageType = "physical";

                    var damageIncrease = user.getAttackDamageIncrease(damageType);
                    var damage = baseDamage * damageIncrease;

                    target.recieveDamage(damage, damageType);
                }
            };
            Effects.guardColumn = {
                name: "guardColumn",
                targetFleets: "all",
                targetingFunction: Rance.targetSingle,
                targetRange: "self",
                effect: function (user, target) {
                    var guardPerInt = 20;
                    var guardAmount = guardPerInt * user.attributes.intelligence;
                    user.addGuard(guardAmount, "column");
                }
            };

            Effects.standBy = {
                name: "standBy",
                targetFleets: "all",
                targetingFunction: Rance.targetSingle,
                targetRange: "self",
                effect: function () {
                }
            };
        })(Templates.Effects || (Templates.Effects = {}));
        var Effects = Templates.Effects;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
/// <reference path="effecttemplates.ts" />
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (Abilities) {
            Abilities.dummyTargetColumn = {
                type: "dummyTargetColumn",
                displayName: "dummyTargetColumn",
                moveDelay: 0,
                actionsUse: 0,
                mainEffect: Rance.Templates.Effects.dummyTargetColumn
            };
            Abilities.dummyTargetAll = {
                type: "dummyTargetAll",
                displayName: "dummyTargetAll",
                moveDelay: 0,
                actionsUse: 0,
                mainEffect: Rance.Templates.Effects.dummyTargetAll
            };
            Abilities.rangedAttack = {
                type: "rangedAttack",
                displayName: "Ranged Attack",
                moveDelay: 100,
                actionsUse: 1,
                mainEffect: Rance.Templates.Effects.rangedAttack
            };
            Abilities.closeAttack = {
                type: "closeAttack",
                displayName: "Close Attack",
                moveDelay: 90,
                actionsUse: 2,
                mainEffect: Rance.Templates.Effects.closeAttack
            };
            Abilities.wholeRowAttack = {
                type: "wholeRowAttack",
                displayName: "Row Attack",
                moveDelay: 300,
                actionsUse: 1,
                mainEffect: Rance.Templates.Effects.wholeRowAttack
            };

            Abilities.bombAttack = {
                type: "bombAttack",
                displayName: "Bomb Attack",
                moveDelay: 120,
                actionsUse: 1,
                mainEffect: Rance.Templates.Effects.bombAttack
            };
            Abilities.guardColumn = {
                type: "guardColumn",
                displayName: "Guard Column",
                moveDelay: 100,
                actionsUse: 1,
                mainEffect: Rance.Templates.Effects.guardColumn
            };

            Abilities.standBy = {
                type: "standBy",
                displayName: "Standby",
                moveDelay: 50,
                actionsUse: "all",
                mainEffect: Rance.Templates.Effects.standBy
            };
        })(Templates.Abilities || (Templates.Abilities = {}));
        var Abilities = Templates.Abilities;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
/// <reference path="abilitytemplates.ts"/>
/// <reference path="spritetemplate.d.ts"/>
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (ShipTypes) {
            ShipTypes.cheatShip = {
                type: "cheatShip",
                typeName: "Cheat Ship",
                archetype: "combat",
                sprite: {
                    imageSrc: "testShip.png",
                    anchor: { x: 0.5, y: 0.5 }
                },
                isSquadron: false,
                buildCost: 0,
                icon: "img\/icons\/f.png",
                maxStrength: 0.5,
                maxMovePoints: 999,
                visionRange: 999,
                attributeLevels: {
                    attack: 0.7,
                    defence: 0.4,
                    intelligence: 0.5,
                    speed: 0.8
                },
                abilities: [
                    Rance.Templates.Abilities.rangedAttack,
                    Rance.Templates.Abilities.bombAttack,
                    Rance.Templates.Abilities.guardColumn
                ]
            };
            ShipTypes.fighterSquadron = {
                type: "fighterSquadron",
                typeName: "Fighter Squadron",
                archetype: "combat",
                sprite: {
                    imageSrc: "testShip.png",
                    anchor: { x: 0.5, y: 0.5 }
                },
                isSquadron: true,
                buildCost: 100,
                icon: "img\/icons\/f.png",
                maxStrength: 0.7,
                maxMovePoints: 2,
                visionRange: 1,
                attributeLevels: {
                    attack: 0.8,
                    defence: 0.6,
                    intelligence: 0.4,
                    speed: 1
                },
                abilities: [
                    Rance.Templates.Abilities.rangedAttack,
                    Rance.Templates.Abilities.closeAttack
                ]
            };
            ShipTypes.bomberSquadron = {
                type: "bomberSquadron",
                typeName: "Bomber Squadron",
                archetype: "combat",
                sprite: {
                    imageSrc: "testShip2.png",
                    anchor: { x: 0.5, y: 0.5 }
                },
                isSquadron: true,
                buildCost: 200,
                icon: "img\/icons\/f.png",
                maxStrength: 0.5,
                maxMovePoints: 1,
                visionRange: 1,
                attributeLevels: {
                    attack: 0.7,
                    defence: 0.4,
                    intelligence: 0.5,
                    speed: 0.8
                },
                abilities: [
                    Rance.Templates.Abilities.rangedAttack,
                    Rance.Templates.Abilities.bombAttack
                ]
            };
            ShipTypes.battleCruiser = {
                type: "battleCruiser",
                typeName: "Battlecruiser",
                archetype: "combat",
                sprite: {
                    imageSrc: "testShip2.png",
                    anchor: { x: 0.5, y: 0.5 }
                },
                isSquadron: false,
                buildCost: 200,
                icon: "img\/icons\/b.png",
                maxStrength: 1,
                maxMovePoints: 1,
                visionRange: 1,
                attributeLevels: {
                    attack: 0.8,
                    defence: 0.8,
                    intelligence: 0.7,
                    speed: 0.6
                },
                abilities: [
                    Rance.Templates.Abilities.rangedAttack,
                    Rance.Templates.Abilities.wholeRowAttack
                ]
            };
            ShipTypes.scout = {
                type: "scout",
                typeName: "Scout",
                archetype: "utility",
                sprite: {
                    imageSrc: "testShip3.png",
                    anchor: { x: 0.5, y: 0.5 }
                },
                isSquadron: true,
                buildCost: 200,
                icon: "img\/icons\/f.png",
                maxStrength: 0.6,
                maxMovePoints: 2,
                visionRange: 2,
                attributeLevels: {
                    attack: 0.5,
                    defence: 0.5,
                    intelligence: 0.8,
                    speed: 0.7
                },
                abilities: [
                    Rance.Templates.Abilities.rangedAttack
                ]
            };
            ShipTypes.shieldBoat = {
                type: "shieldBoat",
                typeName: "Shield Boat",
                archetype: "defence",
                sprite: {
                    imageSrc: "testShip3.png",
                    anchor: { x: 0.5, y: 0.5 }
                },
                isSquadron: false,
                buildCost: 200,
                icon: "img\/icons\/b.png",
                maxStrength: 0.9,
                maxMovePoints: 1,
                visionRange: 1,
                attributeLevels: {
                    attack: 0.5,
                    defence: 0.9,
                    intelligence: 0.6,
                    speed: 0.4
                },
                abilities: [
                    Rance.Templates.Abilities.guardColumn,
                    Rance.Templates.Abilities.rangedAttack
                ]
            };
        })(Templates.ShipTypes || (Templates.ShipTypes = {}));
        var ShipTypes = Templates.ShipTypes;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (Buildings) {
            Buildings.sectorCommand = {
                type: "sectorCommand",
                category: "defence",
                family: "sectorCommand",
                name: "Sector Command",
                icon: "img\/buildings\/sectorCommand.png",
                buildCost: 200,
                maxPerType: 1,
                maxUpgradeLevel: 1,
                upgradeInto: [
                    {
                        type: "sectorCommand1",
                        level: 1
                    },
                    {
                        type: "sectorCommand2",
                        level: 1
                    }
                ]
            };
            Buildings.sectorCommand1 = {
                type: "sectorCommand1",
                category: "defence",
                family: "sectorCommand",
                name: "Sector Command1",
                icon: "img\/buildings\/sectorCommand.png",
                buildCost: 100,
                maxPerType: 1,
                maxUpgradeLevel: 1,
                upgradeOnly: true
            };
            Buildings.sectorCommand2 = {
                type: "sectorCommand2",
                category: "defence",
                family: "sectorCommand",
                name: "Sector Command2",
                icon: "img\/buildings\/sectorCommand.png",
                buildCost: 200,
                maxPerType: 1,
                maxUpgradeLevel: 1,
                upgradeOnly: true
            };
            Buildings.starBase = {
                type: "starBase",
                category: "defence",
                name: "Starbase",
                icon: "img\/buildings\/starBase.png",
                buildCost: 200,
                maxPerType: 3,
                maxUpgradeLevel: 1
            };
            Buildings.commercialPort = {
                type: "commercialPort",
                category: "economy",
                name: "Commercial Spaceport",
                icon: "img\/buildings\/commercialPort.png",
                buildCost: 200,
                maxPerType: 1,
                maxUpgradeLevel: 4
            };
            Buildings.deepSpaceRadar = {
                type: "deepSpaceRadar",
                category: "vision",
                name: "Deep Space Radar",
                icon: "img\/buildings\/commercialPort.png",
                buildCost: 200,
                maxPerType: 1,
                maxUpgradeLevel: 2
            };
            Buildings.itemManufactory = {
                type: "itemManufactory",
                category: "manufactory",
                name: "Item Manufactory",
                icon: "img\/buildings\/commercialPort.png",
                buildCost: 200,
                maxPerType: 1,
                maxUpgradeLevel: 3
            };
        })(Templates.Buildings || (Templates.Buildings = {}));
        var Buildings = Templates.Buildings;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
/// <reference path="../data/templates/buildingtemplates.ts" />
/// <reference path="star.ts" />
/// <reference path="player.ts" />
var Rance;
(function (Rance) {
    var Building = (function () {
        function Building(props) {
            this.template = props.template;
            this.id = (props.id && isFinite(props.id)) ? props.id : Rance.idGenerators.building++;
            this.location = props.location;
            this.controller = props.controller || this.location.owner;
            this.upgradeLevel = props.upgradeLevel || 1;
            this.totalCost = props.totalCost || this.template.buildCost || 0;
        }
        Building.prototype.getPossibleUpgrades = function () {
            var upgrades = [];

            if (this.upgradeLevel < this.template.maxUpgradeLevel) {
                upgrades.push({
                    template: this.template,
                    level: this.upgradeLevel + 1,
                    cost: this.template.buildCost * (this.upgradeLevel + 1)
                });
            } else if (this.template.upgradeInto && this.template.upgradeInto.length > 0) {
                var templatedUpgrades = this.template.upgradeInto.map(function (upgradeData) {
                    var template = Rance.Templates.Buildings[upgradeData.type];
                    return ({
                        level: upgradeData.level,
                        template: template,
                        cost: template.buildCost
                    });
                });

                upgrades = upgrades.concat(templatedUpgrades);
            }

            return upgrades;
        };
        Building.prototype.upgrade = function () {
        };
        Building.prototype.setController = function (newController) {
            var oldController = this.controller;
            if (oldController === newController)
                return;

            this.controller = newController;
            this.location.updateController();
        };
        Building.prototype.serialize = function () {
            var data = {};

            data.templateType = this.template.type;
            data.id = this.id;

            data.locationId = this.location.id;
            data.controllerId = this.controller.id;

            data.upgradeLevel = this.upgradeLevel;
            data.totalCost = this.totalCost;

            return data;
        };
        return Building;
    })();
    Rance.Building = Building;
})(Rance || (Rance = {}));
/// <reference path="star.ts" />
var Rance;
(function (Rance) {
    var Region = (function () {
        function Region(id, stars, isFiller) {
            this.id = id;
            this.stars = stars;
            this.isFiller = isFiller;
        }
        Region.prototype.addStar = function (star) {
            this.stars.push(star);
            star.region = this;
        };
        return Region;
    })();
    Rance.Region = Region;
})(Rance || (Rance = {}));
/// <reference path="../lib/husl.d.ts" />
/// <reference path="../data/templates/colorranges.ts" />
var Rance;
(function (Rance) {
    function hex2rgb(hex) {
        return ([
            (hex >> 16 & 0xFF) / 255,
            (hex >> 8 & 0xFF) / 255,
            (hex & 0xFF) / 255
        ]);
    }
    Rance.hex2rgb = hex2rgb;

    function rgb2hex(rgb) {
        return ((rgb[0] * 255 << 16) + (rgb[1] * 255 << 8) + rgb[2] * 255);
    }
    Rance.rgb2hex = rgb2hex;

    //http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
    /* accepts parameters
    * h  Object = {h:x, s:y, v:z}
    * OR
    * h, s, v
    */
    function hsvToRgb(h, s, v) {
        var r, g, b, i, f, p, q, t;

        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6) {
            case 0:
                r = v, g = t, b = p;
                break;
            case 1:
                r = q, g = v, b = p;
                break;
            case 2:
                r = p, g = v, b = t;
                break;
            case 3:
                r = p, g = q, b = v;
                break;
            case 4:
                r = t, g = p, b = v;
                break;
            case 5:
                r = v, g = p, b = q;
                break;
        }
        return [r, g, b];
    }
    Rance.hsvToRgb = hsvToRgb;
    function hslToRgb(h, s, l) {
        var r, g, b;

        if (s == 0) {
            r = g = b = l; // achromatic
        } else {
            function hue2rgb(p, q, t) {
                if (t < 0)
                    t += 1;
                if (t > 1)
                    t -= 1;
                if (t < 1 / 6)
                    return p + (q - p) * 6 * t;
                if (t < 1 / 2)
                    return q;
                if (t < 2 / 3)
                    return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            }

            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return [r, g, b];
    }
    Rance.hslToRgb = hslToRgb;
    function rgbToHsv(r, g, b) {
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, v = max;

        var d = max - min;
        s = max == 0 ? 0 : d / max;

        if (max == min) {
            h = 0; // achromatic
        } else {
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, v];
    }
    Rance.rgbToHsv = rgbToHsv;
    function rgbToHsl(r, g, b) {
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }
            h /= 6;
        }

        return [h, s, l];
    }
    Rance.rgbToHsl = rgbToHsl;

    function hslToHex(h, s, l) {
        return rgb2hex(hslToRgb(h, s, l));
    }
    Rance.hslToHex = hslToHex;
    function hsvToHex(h, s, v) {
        return rgb2hex(hsvToRgb(h, s, v));
    }
    Rance.hsvToHex = hsvToHex;

    function hexToHsl(hex) {
        return rgbToHsl.apply(null, hex2rgb(hex));
    }
    Rance.hexToHsl = hexToHsl;
    function hexToHsv(hex) {
        return rgbToHsv.apply(null, hex2rgb(hex));
    }
    Rance.hexToHsv = hexToHsv;

    function excludeFromRanges(ranges, toExclude) {
        var intersecting = getIntersectingRanges(ranges, toExclude);

        var newRanges = ranges.slice(0);

        for (var i = 0; i < intersecting.length; i++) {
            newRanges.splice(newRanges.indexOf(intersecting[i]), 1);

            var intersectedRanges = excludeFromRange(intersecting[i], toExclude);

            if (intersectedRanges) {
                newRanges = newRanges.concat(intersectedRanges);
            }
        }

        return newRanges;
    }
    Rance.excludeFromRanges = excludeFromRanges;

    function getIntersectingRanges(ranges, toIntersectWith) {
        var intersecting = [];
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (toIntersectWith.max < range.min || toIntersectWith.min > range.max) {
                continue;
            }

            intersecting.push(range);
        }
        return intersecting;
    }
    Rance.getIntersectingRanges = getIntersectingRanges;

    function excludeFromRange(range, toExclude) {
        if (toExclude.max < range.min || toExclude.min > range.max) {
            return null;
        } else if (toExclude.min < range.min && toExclude.max > range.max) {
            return null;
        }

        if (toExclude.min <= range.min) {
            return ([{ min: toExclude.max, max: range.max }]);
        } else if (toExclude.max >= range.max) {
            return ([{ min: range.min, max: toExclude.min }]);
        }

        var a = {
            min: range.min,
            max: toExclude.min
        };
        var b = {
            min: toExclude.max,
            max: range.max
        };

        return [a, b];
    }
    Rance.excludeFromRange = excludeFromRange;

    function randomSelectFromRanges(ranges) {
        var totalWeight = 0;
        var rangesByRelativeWeight = {};
        var currentRelativeWeight = 0;

        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            if (!isFinite(range.max))
                range.max = 1;
            if (!isFinite(range.min))
                range.min = 0;
            var weight = range.max - range.min;

            totalWeight += weight;
        }
        for (var i = 0; i < ranges.length; i++) {
            var range = ranges[i];
            var relativeWeight = (range.max - range.min) / totalWeight;
            if (totalWeight === 0)
                relativeWeight = 1;
            currentRelativeWeight += relativeWeight;
            rangesByRelativeWeight[currentRelativeWeight] = range;
        }

        var rand = Math.random();
        var selectedRange;

        var sortedWeights = Object.keys(rangesByRelativeWeight).map(function (w) {
            return parseFloat(w);
        });

        var sortedWeights = sortedWeights.sort();

        for (var i = 0; i < sortedWeights.length; i++) {
            if (rand < sortedWeights[i]) {
                selectedRange = rangesByRelativeWeight[sortedWeights[i]];
                break;
            }
        }
        if (!selectedRange)
            console.log(rangesByRelativeWeight);

        return Rance.randRange(selectedRange.min, selectedRange.max);
    }
    Rance.randomSelectFromRanges = randomSelectFromRanges;

    function makeRandomVibrantColor() {
        var hRanges = [
            { min: 0, max: 90 / 360 },
            { min: 120 / 360, max: 150 / 360 },
            { min: 180 / 360, max: 290 / 360 },
            { min: 320 / 360, max: 1 }
        ];
        return [randomSelectFromRanges(hRanges), Rance.randRange(0.8, 0.9), Rance.randRange(0.88, 0.92)];
    }
    Rance.makeRandomVibrantColor = makeRandomVibrantColor;
    function makeRandomDeepColor() {
        // yellow
        if (Math.random() < 0.1) {
            return [Rance.randRange(15 / 360, 80 / 360), Rance.randRange(0.92, 1), Rance.randRange(0.92, 1)];
        }
        var hRanges = [
            { min: 0, max: 15 / 360 },
            { min: 100 / 360, max: 195 / 360 },
            { min: 210 / 360, max: 1 }
        ];
        return [randomSelectFromRanges(hRanges), 1, Rance.randRange(0.55, 0.65)];
    }
    Rance.makeRandomDeepColor = makeRandomDeepColor;
    function makeRandomLightColor() {
        return [Rance.randRange(0, 360), Rance.randRange(0.55, 0.65), 1];
    }
    Rance.makeRandomLightColor = makeRandomLightColor;

    function makeRandomColor(values) {
        values = values || {};
        var color = {};

        ["h", "s", "l"].forEach(function (v) {
            if (!values[v])
                values[v] = [];
        });

        for (var value in values) {
            if (values[value].length < 1) {
                values[value] = [{ min: 0, max: 1 }];
            }

            color[value] = randomSelectFromRanges(values[value]);
        }

        return [color.h, color.s, color.l];
    }
    Rance.makeRandomColor = makeRandomColor;
    function colorFromScalars(color) {
        return [color[0] * 360, color[1] * 100, color[2] * 100];
    }
    Rance.colorFromScalars = colorFromScalars;
    function scalarsFromColor(scalars) {
        return [scalars[0] / 360, scalars[1] / 100, scalars[2] / 100];
    }
    Rance.scalarsFromColor = scalarsFromColor;

    function makeContrastingColor(props) {
        var initialRanges = props.initialRanges || {};
        var exclusions = props.minDifference || {};
        var maxDifference = props.maxDifference || {};
        var color = props.color;
        var hMaxDiffernece = isFinite(maxDifference.h) ? maxDifference.h : 360;
        var sMaxDiffernece = isFinite(maxDifference.s) ? maxDifference.s : 100;
        var lMaxDiffernece = isFinite(maxDifference.l) ? maxDifference.l : 100;

        var hRange = initialRanges.h || { min: 0, max: 360 };
        var sRange = initialRanges.s || { min: 50, max: 100 };
        var lRange = initialRanges.l || { min: 0, max: 100 };

        var hExclusion = exclusions.h || 30;

        var hMin = (color[0] - hExclusion) % 360;
        var hMax = (color[0] + hExclusion) % 360;

        var hRange2 = excludeFromRange(hRange, { min: hMin, max: hMax });

        var h = randomSelectFromRanges(hRange2);
        h = Rance.clamp(h, color[0] - hMaxDiffernece, color[0] + hMaxDiffernece);
        var hDistance = Rance.getAngleBetweenDegrees(h, color[0]);
        var relativeHDistance = 1 / (180 / hDistance);

        var lExclusion = exclusions.l || 30;

        // if (relativeHDistance < 0.2)
        // {
        //   lExclusion /= 2;
        //   clamp(lExclusion, 0, 100);
        // }
        //
        var lMin = Rance.clamp(color[2] - lExclusion, lRange.min, 100);
        var lMax = Rance.clamp(color[2] + lExclusion, lMin, 100);

        var sExclusion = exclusions.s || 0;
        var sMin = Rance.clamp(color[1] - sExclusion, sRange.min, 100);
        var sMax = Rance.clamp(color[1] + sExclusion, sMin, 100);

        var ranges = {
            h: [{ min: h, max: h }],
            s: excludeFromRange(sRange, { min: sMin, max: sMax }),
            l: excludeFromRange(lRange, { min: lMin, max: lMax })
        };

        return makeRandomColor(ranges);
    }
    Rance.makeContrastingColor = makeContrastingColor;
    function hexToHusl(hex) {
        return HUSL.fromHex(Rance.hexToString(hex));
    }
    Rance.hexToHusl = hexToHusl;
    function generateMainColor() {
        var color;
        var hexColor;
        var genType;
        if (Math.random() < 0.6) {
            color = makeRandomDeepColor();
            hexColor = hsvToHex.apply(null, color);
            genType = "deep";
        } else if (Math.random() < 0.25) {
            color = makeRandomLightColor();
            hexColor = hsvToHex.apply(null, color);
            genType = "light";
        } else if (Math.random() < 0.3) {
            color = makeRandomVibrantColor();
            hexColor = hsvToHex.apply(null, color);
            genType = "vibrant";
        } else {
            color = makeRandomColor({
                s: [{ min: 1, max: 1 }],
                l: [{ min: 0.88, max: 1 }]
            });
            hexColor = Rance.stringToHex(HUSL.toHex.apply(null, colorFromScalars(color)));
            genType = "husl";
        }

        var huslColor = hexToHusl(hexColor);
        huslColor[2] = Rance.clamp(huslColor[2], 30, 100);
        hexColor = Rance.stringToHex(HUSL.toHex.apply(null, huslColor));
        return hexColor;
    }
    Rance.generateMainColor = generateMainColor;
    function generateSecondaryColor(mainColor) {
        var huslColor = hexToHusl(mainColor);
        var hexColor;

        if (huslColor[2] < 0.3 || Math.random() < 0.4) {
            var contrastingColor = makeContrastingColor({
                color: huslColor,
                minDifference: {
                    h: 30,
                    l: 30
                },
                maxDifference: {
                    h: 80
                }
            });
            hexColor = Rance.stringToHex(HUSL.toHex.apply(null, contrastingColor));
        } else {
            function contrasts(c1, c2) {
                return ((c1[2] < c2[2] - 20 || c1[2] > c2[2] + 20));
            }
            function makeColor(c1, easing) {
                var hsvColor = hexToHsv(c1);

                hsvColor = colorFromScalars(hsvColor);
                var contrastingColor = makeContrastingColor({
                    color: hsvColor,
                    initialRanges: {
                        l: { min: 60 * easing, max: 100 }
                    },
                    minDifference: {
                        h: 20 * easing,
                        s: 30 * easing
                    },
                    maxDifference: {
                        h: 100
                    }
                });

                var hex = hsvToHex.apply(null, scalarsFromColor(contrastingColor));

                return hexToHusl(hex);
            }

            var huslBg = hexToHusl(mainColor);
            var easing = 1;
            var candidateColor = makeColor(mainColor, easing);

            while (!contrasts(huslBg, candidateColor)) {
                easing -= 0.1;
                candidateColor = makeColor(mainColor, easing);
            }

            hexColor = Rance.stringToHex(HUSL.toHex.apply(null, candidateColor));
        }

        return hexColor;
    }
    Rance.generateSecondaryColor = generateSecondaryColor;
    function generateColorScheme(mainColor) {
        var mainColor = mainColor !== null && isFinite(mainColor) ? mainColor : generateMainColor();
        var secondaryColor = generateSecondaryColor(mainColor);

        return ({
            main: mainColor,
            secondary: secondaryColor
        });
    }
    Rance.generateColorScheme = generateColorScheme;

    function checkRandomGenHues(amt) {
        var maxBarSize = 80;
        var hues = {};
        for (var i = 0; i < amt; i++) {
            var color = generateMainColor();
            var hue = colorFromScalars(hexToHsv(color))[0];
            var roundedHue = Math.round(hue / 10) * 10;

            if (!hues[roundedHue])
                hues[roundedHue] = 0;
            hues[roundedHue]++;
        }

        var min;
        var max;

        for (var _hue in hues) {
            var count = hues[_hue];

            if (!min) {
                min = count;
            }
            if (!max) {
                max = count;
            }

            min = Math.min(min, count);
            max = Math.max(max, count);
        }

        var args = [""];
        var toPrint = "";

        for (var _hue in hues) {
            var hue = parseInt(_hue);
            var color = hsvToHex(hue / 360, 1, 1);
            var count = hues[_hue];

            var difference = max - min;
            var relative = (count - min) / difference;

            var chars = relative * maxBarSize;

            var line = "\n%c ";
            for (var i = 0; i < chars; i++) {
                line += "#";
            }
            toPrint += line;
            args.push("color: " + "#" + Rance.hexToString(color));
        }

        args[0] = toPrint;

        console.log.apply(console, args);
    }
    Rance.checkRandomGenHues = checkRandomGenHues;
})(Rance || (Rance = {}));
/// <reference path="star.ts" />
/// <reference path="color.ts" />
var Rance;
(function (Rance) {
    var Sector = (function () {
        function Sector(id, color) {
            this.stars = [];
            this.id = isFinite(id) ? id : Rance.idGenerators.sector++;

            this.color = isFinite(color) ? color : Rance.hslToHex.apply(null, [Rance.randRange(0, 1), Rance.randRange(0.8, 1), Rance.randRange(0.4, 0.6)]);
        }
        Sector.prototype.addStar = function (star) {
            if (star.sector) {
                throw new Error("Star already part of a sector");
            }

            this.stars.push(star);
            star.sector = this;
        };

        Sector.prototype.getNeighboringStars = function () {
            var neighbors = [];
            var alreadyAdded = {};

            for (var i = 0; i < this.stars.length; i++) {
                var frontier = this.stars[i].getLinkedInRange(1).all;
                for (var j = 0; j < frontier.length; j++) {
                    if (frontier[j].sector !== this && !alreadyAdded[frontier[j].id]) {
                        neighbors.push(frontier[j]);
                        alreadyAdded[frontier[j].id] = true;
                    }
                }
            }

            return neighbors;
        };

        Sector.prototype.getMajorityRegions = function () {
            var regionsByStars = {};

            var biggestRegionStarCount = 0;
            for (var i = 0; i < this.stars.length; i++) {
                var star = this.stars[i];
                var region = star.region;

                if (!regionsByStars[region.id]) {
                    regionsByStars[region.id] = 0;
                }

                regionsByStars[region.id]++;

                if (regionsByStars[region.id] > biggestRegionStarCount) {
                    biggestRegionStarCount = regionsByStars[region.id];
                }
            }

            var majorityRegions = [];
            for (var regionId in regionsByStars) {
                if (regionsByStars[regionId] === biggestRegionStarCount) {
                    majorityRegions.push(regionId);
                }
            }

            return majorityRegions;
        };

        Sector.prototype.serialize = function () {
            var data = {};

            data.id = this.id;
            data.starIds = this.stars.map(function (star) {
                return star.id;
            });
            data.color = this.color;

            return data;
        };
        return Sector;
    })();
    Rance.Sector = Sector;
})(Rance || (Rance = {}));
/// <reference path="abilitytemplates.ts" />
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (Items) {
            Items.bombLauncher1 = {
                type: "bombLauncher1",
                displayName: "Bomb Launcher 1",
                icon: "img\/items\/25711_64.png",
                techLevel: 1,
                cost: 100,
                slot: "high",
                ability: Rance.Templates.Abilities.bombAttack
            };
            Items.bombLauncher2 = {
                type: "bombLauncher2",
                displayName: "Bomb Launcher 2",
                icon: "img\/items\/25711_64.png",
                techLevel: 2,
                cost: 200,
                attributes: {
                    attack: 1
                },
                slot: "high",
                ability: Rance.Templates.Abilities.bombAttack
            };
            Items.bombLauncher3 = {
                type: "bombLauncher3",
                displayName: "Bomb Launcher 3",
                icon: "img\/items\/25711_64.png",
                techLevel: 3,
                cost: 300,
                attributes: {
                    attack: 3
                },
                slot: "high",
                ability: Rance.Templates.Abilities.bombAttack
            };

            Items.afterBurner1 = {
                type: "afterBurner1",
                displayName: "Afterburner 1",
                icon: "img\/items\/12066_64.png",
                techLevel: 1,
                cost: 100,
                attributes: {
                    speed: 1
                },
                slot: "mid"
            };
            Items.afterBurner2 = {
                type: "afterBurner2",
                displayName: "Afterburner 2",
                icon: "img\/items\/12066_64.png",
                techLevel: 2,
                cost: 200,
                attributes: {
                    speed: 2
                },
                slot: "mid"
            };
            Items.afterBurner3 = {
                type: "afterBurner3",
                displayName: "Afterburner 3",
                icon: "img\/items\/12066_64.png",
                techLevel: 3,
                cost: 300,
                attributes: {
                    maxActionPoints: 1,
                    speed: 3
                },
                slot: "mid"
            };
            Items.shieldPlating1 = {
                type: "shieldPlating1",
                displayName: "Shield Plating 1",
                icon: "img\/items\/578_64.png",
                techLevel: 1,
                cost: 100,
                attributes: {
                    defence: 1
                },
                slot: "low"
            };
            Items.shieldPlating2 = {
                type: "shieldPlating2",
                displayName: "Shield Plating 2",
                icon: "img\/items\/578_64.png",
                techLevel: 2,
                cost: 200,
                attributes: {
                    defence: 2
                },
                slot: "low"
            };
            Items.shieldPlating3 = {
                type: "shieldPlating3",
                displayName: "Shield Plating 3",
                icon: "img\/items\/578_64.png",
                techLevel: 3,
                cost: 300,
                attributes: {
                    defence: 3,
                    speed: -1
                },
                slot: "low",
                ability: Rance.Templates.Abilities.guardColumn
            };
        })(Templates.Items || (Templates.Items = {}));
        var Items = Templates.Items;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
/// <reference path="../data/templates/itemtemplates.ts" />
/// <reference path="unit.ts" />
var Rance;
(function (Rance) {
    var Item = (function () {
        function Item(template, id) {
            this.id = isFinite(id) ? id : Rance.idGenerators.item++;
            this.template = template;
        }
        Item.prototype.serialize = function () {
            var data = {};

            data.id = this.id;
            data.templateType = this.template.type;
            if (this.unit) {
                data.unitId = this.unit.id;
            }

            return data;
        };
        return Item;
    })();
    Rance.Item = Item;
})(Rance || (Rance = {}));
/// <reference path="../data/templates/itemtemplates.ts" />
/// <reference path="item.ts" />
/// <reference path="utility.ts" />
var Rance;
(function (Rance) {
    var ItemGenerator = (function () {
        function ItemGenerator() {
            this.itemsByTechLevel = {};
            this.indexItemsByTechLevel();
        }
        ItemGenerator.prototype.indexItemsByTechLevel = function () {
            for (var itemName in Rance.Templates.Items) {
                var item = Rance.Templates.Items[itemName];

                if (!this.itemsByTechLevel[item.techLevel]) {
                    this.itemsByTechLevel[item.techLevel] = [];
                }

                this.itemsByTechLevel[item.techLevel].push(item);
            }
        };

        ItemGenerator.prototype.getRandomItemOfTechLevel = function (techLevel) {
            return Rance.getRandomArrayItem(this.itemsByTechLevel[techLevel]);
        };
        return ItemGenerator;
    })();
    Rance.ItemGenerator = ItemGenerator;
})(Rance || (Rance = {}));
/// <reference path="point.ts" />
/// <reference path="player.ts" />
/// <reference path="fleet.ts" />
/// <reference path="building.ts" />
/// <reference path="region.ts" />
/// <reference path="sector.ts" />
/// <reference path="itemgenerator.ts" />
var Rance;
(function (Rance) {
    var Star = (function () {
        function Star(x, y, id) {
            this.linksTo = [];
            this.linksFrom = [];
            this.fleets = {};
            this.buildings = {};
            this.indexedNeighborsInRange = {};
            this.indexedDistanceToStar = {};
            this.buildableItems = {
                1: [],
                2: [],
                3: []
            };
            this.id = isFinite(id) ? id : Rance.idGenerators.star++;
            this.name = "Star " + this.id;

            this.x = x;
            this.y = y;
        }
        // BUILDINGS
        Star.prototype.addBuilding = function (building) {
            if (!this.buildings[building.template.category]) {
                this.buildings[building.template.category] = [];
            }

            var buildings = this.buildings[building.template.category];

            if (buildings.indexOf(building) >= 0) {
                throw new Error("Already has building");
            }

            buildings.push(building);

            if (building.template.category === "defence") {
                this.sortDefenceBuildings();
                this.updateController();
            }
            if (building.template.category === "vision") {
                this.owner.updateVisibleStars();
                Rance.eventManager.dispatchEvent("renderMap", null);
            }
        };
        Star.prototype.removeBuilding = function (building) {
            if (!this.buildings[building.template.category] || this.buildings[building.template.category].indexOf(building) < 0) {
                throw new Error("Location doesn't have building");
            }

            var buildings = this.buildings[building.template.category];

            this.buildings[building.template.category].splice(buildings.indexOf(building), 1);
        };
        Star.prototype.sortDefenceBuildings = function () {
            this.buildings["defence"].sort(function (a, b) {
                if (a.template.maxPerType === 1) {
                    return -1;
                } else if (b.template.maxPerType === 1) {
                    return 1;
                }

                if (a.upgradeLevel !== b.upgradeLevel) {
                    return b.upgradeLevel - a.upgradeLevel;
                }

                return a.id - b.id;
            });
        };

        Star.prototype.getSecondaryController = function () {
            if (!this.buildings["defence"])
                return null;

            var defenceBuildings = this.buildings["defence"];
            for (var i = 0; i < defenceBuildings.length; i++) {
                if (defenceBuildings[i].controller !== this.owner) {
                    return defenceBuildings[i].controller;
                }
            }

            return null;
        };
        Star.prototype.updateController = function () {
            if (!this.buildings["defence"])
                return null;

            var oldOwner = this.owner;
            if (oldOwner) {
                if (oldOwner === newOwner)
                    return;

                oldOwner.removeStar(this);
            }
            var newOwner = this.buildings["defence"][0].controller;

            newOwner.addStar(this);

            this.owner = newOwner;

            Rance.eventManager.dispatchEvent("renderMap");
        };
        Star.prototype.getIncome = function () {
            var tempBuildingIncome = 0;
            if (this.buildings["economy"]) {
                for (var i = 0; i < this.buildings["economy"].length; i++) {
                    var building = this.buildings["economy"][i];
                    tempBuildingIncome += building.upgradeLevel * 20;
                }
            }
            return this.baseIncome + tempBuildingIncome;
        };
        Star.prototype.getAllBuildings = function () {
            var buildings = [];

            for (var category in this.buildings) {
                buildings = buildings.concat(this.buildings[category]);
            }

            return buildings;
        };
        Star.prototype.getBuildingsForPlayer = function (player) {
            var allBuildings = this.getAllBuildings();

            return allBuildings.filter(function (building) {
                return building.controller.id === player.id;
            });
        };
        Star.prototype.getBuildingsByType = function (buildingTemplate) {
            var categoryBuildings = this.buildings[buildingTemplate.category];

            var buildings = [];

            if (categoryBuildings) {
                for (var i = 0; i < categoryBuildings.length; i++) {
                    if (categoryBuildings[i].template.type === buildingTemplate.type) {
                        buildings.push(categoryBuildings[i]);
                    }
                }
            }

            return buildings;
        };
        Star.prototype.getBuildingsByFamily = function (buildingTemplate) {
            if (!buildingTemplate.family)
                throw new Error("Building has no family");
            var categoryBuildings = this.buildings[buildingTemplate.category];

            var buildings = [];

            if (categoryBuildings) {
                for (var i = 0; i < categoryBuildings.length; i++) {
                    if (categoryBuildings[i].template.family === buildingTemplate.family) {
                        buildings.push(categoryBuildings[i]);
                    }
                }
            }

            return buildings;
        };
        Star.prototype.getBuildableBuildings = function () {
            var canBuild = [];
            for (var buildingType in Rance.Templates.Buildings) {
                var template = Rance.Templates.Buildings[buildingType];
                var alreadyBuilt;
                if (template.family) {
                    alreadyBuilt = this.getBuildingsByFamily(template);
                } else {
                    alreadyBuilt = this.getBuildingsByType(template);
                }

                if (alreadyBuilt.length < template.maxPerType && !template.upgradeOnly) {
                    canBuild.push(template);
                }
            }

            return canBuild;
        };
        Star.prototype.getBuildingUpgrades = function () {
            var allUpgrades = {};

            var ownerBuildings = this.getBuildingsForPlayer(this.owner);

            for (var i = 0; i < ownerBuildings.length; i++) {
                var building = ownerBuildings[i];
                var upgrades = building.getPossibleUpgrades();

                if (upgrades && upgrades.length > 0) {
                    for (var j = 0; j < upgrades.length; j++) {
                        upgrades[j].parentBuilding = building;
                    }

                    allUpgrades[building.id] = upgrades;
                }
            }

            return allUpgrades;
        };

        // FLEETS
        Star.prototype.getAllFleets = function () {
            var allFleets = [];

            for (var playerId in this.fleets) {
                allFleets = allFleets.concat(this.fleets[playerId]);
            }

            return allFleets;
        };
        Star.prototype.getFleetIndex = function (fleet) {
            if (!this.fleets[fleet.player.id])
                return -1;

            return this.fleets[fleet.player.id].indexOf(fleet);
        };
        Star.prototype.hasFleet = function (fleet) {
            return this.getFleetIndex(fleet) >= 0;
        };
        Star.prototype.addFleet = function (fleet) {
            if (!this.fleets[fleet.player.id]) {
                this.fleets[fleet.player.id] = [];
            }

            if (this.hasFleet(fleet))
                return false;

            this.fleets[fleet.player.id].push(fleet);
        };
        Star.prototype.addFleets = function (fleets) {
            for (var i = 0; i < fleets.length; i++) {
                this.addFleet(fleets[i]);
            }
        };
        Star.prototype.removeFleet = function (fleet) {
            var fleetIndex = this.getFleetIndex(fleet);

            if (fleetIndex < 0)
                return false;

            this.fleets[fleet.player.id].splice(fleetIndex, 1);
        };
        Star.prototype.removeFleets = function (fleets) {
            for (var i = 0; i < fleets.length; i++) {
                this.removeFleet(fleets[i]);
            }
        };
        Star.prototype.getAllShipsOfPlayer = function (player) {
            var allShips = [];

            var fleets = this.fleets[player.id];
            if (!fleets)
                return [];

            for (var i = 0; i < fleets.length; i++) {
                allShips = allShips.concat(fleets[i].ships);
            }

            return allShips;
        };
        Star.prototype.getTargetsForPlayer = function (player) {
            var buildingTarget = this.getFirstEnemyDefenceBuilding(player);
            var buildingController = buildingTarget ? buildingTarget.controller : null;
            var fleetOwners = this.getEnemyFleetOwners(player, buildingController);

            var targets = [];

            if (buildingTarget) {
                targets.push({
                    type: "building",
                    enemy: buildingTarget.controller,
                    building: buildingTarget,
                    ships: this.getAllShipsOfPlayer(buildingTarget.controller)
                });
            }
            for (var i = 0; i < fleetOwners.length; i++) {
                targets.push({
                    type: "fleet",
                    enemy: fleetOwners[i],
                    building: null,
                    ships: this.getAllShipsOfPlayer(fleetOwners[i])
                });
            }

            return targets;
        };
        Star.prototype.getFirstEnemyDefenceBuilding = function (player) {
            if (!this.buildings["defence"])
                return null;

            var defenceBuildings = this.buildings["defence"].slice(0);
            if (this.owner === player)
                defenceBuildings = defenceBuildings.reverse();

            for (var i = defenceBuildings.length - 1; i >= 0; i--) {
                if (defenceBuildings[i].controller.id !== player.id) {
                    return defenceBuildings[i];
                }
            }

            return null;
        };
        Star.prototype.getEnemyFleetOwners = function (player, excludedTarget) {
            var fleetOwners = [];

            for (var playerId in this.fleets) {
                if (playerId == player.id)
                    continue;
                else if (excludedTarget && playerId == excludedTarget.id)
                    continue;
                else if (this.fleets[playerId].length < 1)
                    continue;

                fleetOwners.push(this.fleets[playerId][0].player);
            }

            return fleetOwners;
        };

        // MAP GEN
        Star.prototype.setPosition = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Star.prototype.hasLink = function (linkTo) {
            return this.linksTo.indexOf(linkTo) >= 0 || this.linksFrom.indexOf(linkTo) >= 0;
        };
        Star.prototype.addLink = function (linkTo) {
            if (this.hasLink(linkTo))
                return;

            this.linksTo.push(linkTo);
            linkTo.linksFrom.push(this);
        };
        Star.prototype.removeLink = function (linkTo) {
            if (!this.hasLink(linkTo))
                return;

            var toIndex = this.linksTo.indexOf(linkTo);
            if (toIndex >= 0) {
                this.linksTo.splice(toIndex, 1);
            } else {
                this.linksFrom.splice(this.linksFrom.indexOf(linkTo), 1);
            }

            linkTo.removeLink(this);
        };
        Star.prototype.getAllLinks = function () {
            return this.linksTo.concat(this.linksFrom);
        };
        Star.prototype.clearLinks = function () {
            this.linksTo = [];
            this.linksFrom = [];
        };
        Star.prototype.getLinksByRegion = function () {
            var linksByRegion = {};

            var allLinks = this.getAllLinks();

            for (var i = 0; i < allLinks.length; i++) {
                var star = allLinks[i];
                var region = star.region;

                if (!linksByRegion[region]) {
                    linksByRegion[region] = [];
                }

                linksByRegion[region].push(star);
            }

            return linksByRegion;
        };
        Star.prototype.severLinksToRegion = function (regionToSever) {
            var linksByRegion = this.getLinksByRegion();
            var links = linksByRegion[regionToSever];

            for (var i = 0; i < links.length; i++) {
                var star = links[i];

                this.removeLink(star);
            }
        };
        Star.prototype.severLinksToFiller = function () {
            var linksByRegion = this.getLinksByRegion();
            var fillerRegions = Object.keys(linksByRegion).filter(function (region) {
                return region.indexOf("filler") >= 0;
            });

            for (var i = 0; i < fillerRegions.length; i++) {
                this.severLinksToRegion(fillerRegions[i]);
            }
        };
        Star.prototype.severLinksToNonCenter = function () {
            var self = this;

            var linksByRegion = this.getLinksByRegion();
            var nonCenterRegions = Object.keys(linksByRegion).filter(function (region) {
                return region !== self.region && region !== "center";
            });

            for (var i = 0; i < nonCenterRegions.length; i++) {
                this.severLinksToRegion(nonCenterRegions[i]);
            }
        };
        Star.prototype.getNeighbors = function () {
            var neighbors = [];

            for (var i = 0; i < this.voronoiCell.halfedges.length; i++) {
                var edge = this.voronoiCell.halfedges[i].edge;

                if (edge.lSite !== null && edge.lSite.id !== this.id) {
                    neighbors.push(edge.lSite);
                } else if (edge.rSite !== null && edge.rSite.id !== this.id) {
                    neighbors.push(edge.rSite);
                }
            }

            return neighbors;
        };
        Star.prototype.getLinkedInRange = function (range) {
            if (this.indexedNeighborsInRange[range]) {
                return this.indexedNeighborsInRange[range];
            }

            var visited = {};
            var visitedByRange = {};

            visited[this.id] = this;

            var current = [];
            var frontier = [this];

            for (var i = 0; i < range; i++) {
                current = frontier.slice(0);
                if (current.length <= 0)
                    break;
                frontier = [];
                visitedByRange[i + 1] = [];

                for (var j = 0; j < current.length; j++) {
                    var neighbors = current[j].getAllLinks();

                    for (var k = 0; k < neighbors.length; k++) {
                        if (visited[neighbors[k].id])
                            continue;

                        visited[neighbors[k].id] = neighbors[k];
                        visitedByRange[i + 1].push(neighbors[k]);
                        frontier.push(neighbors[k]);
                        this.indexedDistanceToStar[neighbors[k].id] = i;
                    }
                }
            }
            var allVisited = [];

            for (var id in visited) {
                allVisited.push(visited[id]);
            }

            this.indexedNeighborsInRange[range] = {
                all: allVisited,
                byRange: visitedByRange
            };

            return ({
                all: allVisited,
                byRange: visitedByRange
            });
        };

        // Recursively gets all neighbors that fulfill the callback condition with this star
        // Optional earlyReturnSize parameter returns if an island of specified size is found
        Star.prototype.getIslandForQualifier = function (qualifier, earlyReturnSize) {
            var visited = {};

            var connected = {};

            var sizeFound = 1;

            var initialStar = this;
            var frontier = [initialStar];
            visited[initialStar.id] = true;

            while (frontier.length > 0) {
                var current = frontier.pop();
                connected[current.id] = current;
                var neighbors = current.getLinkedInRange(1).all;

                for (var i = 0; i < neighbors.length; i++) {
                    var neighbor = neighbors[i];
                    if (visited[neighbor.id])
                        continue;

                    visited[neighbor.id] = true;
                    if (qualifier(initialStar, neighbor)) {
                        sizeFound++;
                        frontier.push(neighbor);
                    }
                }

                // breaks when sufficiently big island has been found
                if (earlyReturnSize && sizeFound >= earlyReturnSize) {
                    for (var i = 0; i < frontier.length; i++) {
                        connected[frontier[i].id] = frontier[i];
                    }

                    break;
                }
            }

            var island = [];
            for (var starId in connected) {
                island.push(connected[starId]);
            }

            return island;
        };
        Star.prototype.getDistanceToStar = function (target) {
            if (!this.indexedDistanceToStar[target.id]) {
                var a = Rance.aStar(this, target);
                if (!a) {
                    this.indexedDistanceToStar[target.id] = -1;
                } else {
                    for (var id in a.cost) {
                        this.indexedDistanceToStar[id] = a.cost[id];
                    }
                }
            }

            return this.indexedDistanceToStar[target.id];
        };
        Star.prototype.getVisionRange = function () {
            var baseVision = 1;

            if (this.buildings["vision"]) {
                for (var i = 0; i < this.buildings["vision"].length; i++) {
                    baseVision += this.buildings["vision"][i].upgradeLevel;
                }
            }

            return baseVision;
        };
        Star.prototype.getVision = function () {
            return this.getLinkedInRange(this.getVisionRange()).all;
        };
        Star.prototype.getHealingFactor = function (player) {
            var factor = 0;

            if (player === this.owner) {
                factor += 0.15;
            }

            return factor;
        };
        Star.prototype.getBackgroundSeed = function () {
            if (!this.backgroundSeed) {
                var bgString = "";
                bgString += this.x.toFixed(4);
                bgString += this.y.toFixed(4);
                bgString += new Date().getTime();
                this.backgroundSeed = bgString;
            }

            return this.backgroundSeed;
        };
        Star.prototype.severLinksToNonAdjacent = function () {
            var allLinks = this.getAllLinks();

            var neighborVoronoiIds = this.voronoiCell.getNeighborIds();

            for (var i = 0; i < allLinks.length; i++) {
                var star = allLinks[i];

                if (neighborVoronoiIds.indexOf(star.voronoiId) < 0) {
                    this.removeLink(star);
                }
            }
        };
        Star.prototype.seedBuildableItems = function () {
            for (var techLevel in this.buildableItems) {
                var itemsByTechLevel = app.itemGenerator.itemsByTechLevel[techLevel];

                if (!itemsByTechLevel)
                    continue;

                var maxItemsForTechLevel = this.getItemAmountForTechLevel(techLevel, 999);

                itemsByTechLevel = Rance.shuffleArray(itemsByTechLevel);

                for (var i = 0; i < maxItemsForTechLevel; i++) {
                    this.buildableItems[techLevel].push(itemsByTechLevel.pop());
                }
            }
        };
        Star.prototype.getItemManufactoryLevel = function () {
            var level = 0;
            if (this.buildings["manufactory"]) {
                for (var i = 0; i < this.buildings["manufactory"].length; i++) {
                    level += this.buildings["manufactory"][i].upgradeLevel;
                }
            }

            return level;
        };
        Star.prototype.getItemAmountForTechLevel = function (techLevel, manufactoryLevel) {
            var maxManufactoryLevel = 3;

            manufactoryLevel = Rance.clamp(manufactoryLevel, 0, maxManufactoryLevel);

            var amount = (1 + manufactoryLevel) - techLevel;

            if (amount < 0)
                amount = 0;

            return amount;
        };
        Star.prototype.getBuildableItems = function () {
            if (!this.buildableItems[1] || this.buildableItems[1].length < 1) {
                this.seedBuildableItems();
            }
            ;

            var manufactoryLevel = this.getItemManufactoryLevel();

            var byTechLevel = {};
            var allBuildable = [];

            for (var techLevel in this.buildableItems) {
                var amountBuildable = this.getItemAmountForTechLevel(techLevel, manufactoryLevel);
                var forThisTechLevel = this.buildableItems[techLevel].slice(0, amountBuildable);

                byTechLevel[techLevel] = forThisTechLevel;
                allBuildable = allBuildable.concat(forThisTechLevel);
            }

            return ({
                byTechLevel: byTechLevel,
                all: allBuildable
            });
        };
        Star.prototype.serialize = function () {
            var data = {};

            data.id = this.id;
            data.x = this.x;
            data.y = this.y;

            data.distance = this.distance;
            data.region = this.region;
            data.sectorId = this.sector ? this.sector.id : null;

            data.baseIncome = this.baseIncome;

            data.name = this.name;
            data.ownerId = this.owner ? this.owner.id : null;

            data.linksToIds = this.linksTo.map(function (star) {
                return star.id;
            });
            data.linksFromIds = this.linksFrom.map(function (star) {
                return star.id;
            });

            data.backgroundSeed = this.backgroundSeed;

            data.buildings = {};

            for (var category in this.buildings) {
                data.buildings[category] = [];
                for (var i = 0; i < this.buildings[category].length; i++) {
                    data.buildings[category].push(this.buildings[category][i].serialize());
                }
            }

            data.buildableItems = {};

            for (var techLevel in this.buildableItems) {
                for (var i = 0; i < this.buildableItems[techLevel].length; i++) {
                    data.buildableItems[techLevel] = this.buildableItems[techLevel].map(function (template) {
                        return template.type;
                    });
                }
            }

            return data;
        };
        return Star;
    })();
    Rance.Star = Star;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    // todo: use a heap instead of this crap
    var PriorityQueue = (function () {
        function PriorityQueue() {
            this.items = {};
        }
        PriorityQueue.prototype.isEmpty = function () {
            if (Object.keys(this.items).length > 0)
                return false;
            else
                return true;
        };

        PriorityQueue.prototype.push = function (priority, data) {
            if (!this.items[priority]) {
                this.items[priority] = [];
            }

            this.items[priority].push(data);
        };
        PriorityQueue.prototype.pop = function () {
            var highestPriority = Math.min.apply(null, Object.keys(this.items));

            var toReturn = this.items[highestPriority].pop();
            if (this.items[highestPriority].length < 1) {
                delete this.items[highestPriority];
            }
            return toReturn;
        };
        PriorityQueue.prototype.peek = function () {
            var highestPriority = Math.min.apply(null, Object.keys(this.items));
            var toReturn = this.items[highestPriority][0];

            return [highestPriority, toReturn.mapPosition[1], toReturn.mapPosition[2]];
        };
        return PriorityQueue;
    })();
    Rance.PriorityQueue = PriorityQueue;
})(Rance || (Rance = {}));
/// <reference path="star.ts" />
/// <reference path="priorityqueue.ts" />
var Rance;
(function (Rance) {
    function backTrace(graph, target) {
        var parent = graph[target.id];

        if (!parent)
            return [];

        var path = [
            {
                star: target,
                cost: parent.cost
            }
        ];

        while (parent) {
            path.push({
                star: parent.star,
                cost: parent.cost
            });
            parent = graph[parent.star.id];
        }
        path.reverse();
        path[0].cost = null;

        return path;
    }
    Rance.backTrace = backTrace;

    function aStar(start, target) {
        var frontier = new Rance.PriorityQueue();
        frontier.push(0, start);

        //var frontier = new EasyStar.PriorityQueue("p", 1);
        //frontier.insert({p: 0, tile: start})
        var cameFrom = {};
        var costSoFar = {};
        cameFrom[start.id] = null;
        costSoFar[start.id] = 0;

        while (!frontier.isEmpty()) {
            var current = frontier.pop();

            //var current = frontier.shiftHighestPriorityElement().tile;
            if (current === target)
                return { came: cameFrom, cost: costSoFar, queue: frontier };

            var neighbors = current.getAllLinks();

            for (var i = 0; i < neighbors.length; i++) {
                var neigh = neighbors[i];
                if (!neigh)
                    continue;

                var moveCost = 1;

                var newCost = costSoFar[current.id] + moveCost;

                if (costSoFar[neigh.id] === undefined || newCost < costSoFar[neigh.id]) {
                    costSoFar[neigh.id] = newCost;

                    // ^ done
                    var dx = Math.abs(neigh.id[1] - target.id[1]);
                    var dy = Math.abs(neigh.id[2] - target.id[2]);
                    var priority = newCost;
                    frontier.push(priority, neigh);

                    //frontier.insert({p: priority, tile: neigh});
                    cameFrom[neigh.id] = {
                        star: current,
                        cost: moveCost
                    };
                }
            }
        }

        return null;
    }
    Rance.aStar = aStar;
})(Rance || (Rance = {}));
/// <reference path="player.ts" />
/// <reference path="unit.ts" />
/// <reference path="star.ts" />
/// <reference path="pathfinding.ts"/>
var Rance;
(function (Rance) {
    var Fleet = (function () {
        function Fleet(player, ships, location, id) {
            this.ships = [];
            this.visionIsDirty = true;
            this.visibleStars = [];
            this.player = player;
            this.location = location;
            this.id = isFinite(id) ? id : Rance.idGenerators.fleet++;
            this.name = "Fleet " + this.id;

            this.location.addFleet(this);
            this.player.addFleet(this);

            this.addShips(ships);

            Rance.eventManager.dispatchEvent("renderLayer", "fleets");
        }
        Fleet.prototype.getShipIndex = function (ship) {
            return this.ships.indexOf(ship);
        };
        Fleet.prototype.hasShip = function (ship) {
            return this.getShipIndex(ship) >= 0;
        };
        Fleet.prototype.deleteFleet = function () {
            this.location.removeFleet(this);
            this.player.removeFleet(this);

            Rance.eventManager.dispatchEvent("renderLayer", "fleets");
        };
        Fleet.prototype.mergeWith = function (fleet) {
            fleet.addShips(this.ships);
            this.deleteFleet();
        };
        Fleet.prototype.addShip = function (ship) {
            if (this.hasShip(ship))
                return false;

            this.ships.push(ship);
            ship.addToFleet(this);

            this.visionIsDirty = true;
        };
        Fleet.prototype.addShips = function (ships) {
            for (var i = 0; i < ships.length; i++) {
                this.addShip(ships[i]);
            }
        };
        Fleet.prototype.removeShip = function (ship) {
            var index = this.getShipIndex(ship);

            if (index < 0)
                return false;

            this.ships.splice(index, 1);
            ship.removeFromFleet();

            this.visionIsDirty = true;

            if (this.ships.length <= 0) {
                this.deleteFleet();
            }
        };
        Fleet.prototype.removeShips = function (ships) {
            for (var i = 0; i < ships.length; i++) {
                this.removeShip(ships[i]);
            }
        };
        Fleet.prototype.transferShip = function (fleet, ship) {
            if (fleet === this)
                return;
            var index = this.getShipIndex(ship);

            if (index < 0)
                return false;

            fleet.addShip(ship);

            this.ships.splice(index, 1);
            Rance.eventManager.dispatchEvent("renderLayer", "fleets");
        };
        Fleet.prototype.split = function () {
            var newFleet = new Fleet(this.player, [], this.location);
            this.location.addFleet(newFleet);

            return newFleet;
        };
        Fleet.prototype.getMinCurrentMovePoints = function () {
            if (!this.ships[0])
                return 0;

            var min = this.ships[0].currentMovePoints;

            for (var i = 0; i < this.ships.length; i++) {
                min = Math.min(this.ships[i].currentMovePoints, min);
            }
            return min;
        };
        Fleet.prototype.getMinMaxMovePoints = function () {
            if (!this.ships[0])
                return 0;

            var min = this.ships[0].maxMovePoints;

            for (var i = 0; i < this.ships.length; i++) {
                min = Math.min(this.ships[i].maxMovePoints, min);
            }
            return min;
        };
        Fleet.prototype.canMove = function () {
            for (var i = 0; i < this.ships.length; i++) {
                if (this.ships[i].currentMovePoints <= 0) {
                    return false;
                }
            }

            if (this.getMinCurrentMovePoints() > 0) {
                return true;
            }

            return false;
        };
        Fleet.prototype.subtractMovePoints = function () {
            for (var i = 0; i < this.ships.length; i++) {
                this.ships[i].currentMovePoints--;
            }
        };
        Fleet.prototype.move = function (newLocation) {
            if (newLocation === this.location)
                return;
            if (!this.canMove())
                return;

            var oldLocation = this.location;
            oldLocation.removeFleet(this);

            this.location = newLocation;
            newLocation.addFleet(this);

            this.subtractMovePoints();

            this.visionIsDirty = true;
            this.player.updateVisibleStars();

            Rance.eventManager.dispatchEvent("updateSelection", null);
        };
        Fleet.prototype.getPathTo = function (newLocation) {
            var a = Rance.aStar(this.location, newLocation);

            if (!a)
                return;

            var path = Rance.backTrace(a.came, newLocation);

            return path;
        };
        Fleet.prototype.pathFind = function (newLocation, onMove) {
            var path = this.getPathTo(newLocation);

            var interval = window.setInterval(function () {
                if (!path || path.length <= 0) {
                    window.clearInterval(interval);
                    return;
                }

                var move = path.shift();
                this.move(move.star);
                if (onMove)
                    onMove();
            }.bind(this), 100);
        };
        Fleet.prototype.getFriendlyFleetsAtOwnLocation = function () {
            return this.location.fleets[this.player.id];
        };
        Fleet.prototype.getTotalStrength = function () {
            var total = {
                current: 0,
                max: 0
            };

            for (var i = 0; i < this.ships.length; i++) {
                total.current += this.ships[i].currentStrength;
                total.max += this.ships[i].maxStrength;
            }

            return total;
        };
        Fleet.prototype.updateVisibleStars = function () {
            var highestVisionRange = 0;

            for (var i = 0; i < this.ships.length; i++) {
                if (this.ships[i].template.visionRange > highestVisionRange) {
                    highestVisionRange = this.ships[i].template.visionRange;
                }
            }

            var inVision = this.location.getLinkedInRange(highestVisionRange);

            this.visibleStars = inVision.all;
            this.visionIsDirty = false;
        };
        Fleet.prototype.getVision = function () {
            if (this.visionIsDirty) {
                this.updateVisibleStars();
            }

            return this.visibleStars;
        };
        Fleet.prototype.serialize = function () {
            var data = {};

            data.id = this.id;
            data.name = this.name;

            data.locationId = this.location.id;
            data.playerId = this.player.id;
            data.ships = this.ships.map(function (ship) {
                return ship.serialize(false);
            });

            return data;
        };
        return Fleet;
    })();
    Rance.Fleet = Fleet;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (SubEmblems) {
            SubEmblems.emblem0 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem0.png"
            };
            SubEmblems.emblem33 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem33.png"
            };
            SubEmblems.emblem34 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem34.png"
            };
            SubEmblems.emblem35 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem35.png"
            };
            SubEmblems.emblem36 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem36.png"
            };
            SubEmblems.emblem37 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem37.png"
            };
            SubEmblems.emblem38 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem38.png"
            };
            SubEmblems.emblem39 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem39.png"
            };
            SubEmblems.emblem40 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem40.png"
            };
            SubEmblems.emblem41 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem41.png"
            };
            SubEmblems.emblem42 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem42.png"
            };
            SubEmblems.emblem43 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem43.png"
            };
            SubEmblems.emblem44 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem44.png"
            };
            SubEmblems.emblem45 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem45.png"
            };
            SubEmblems.emblem46 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem46.png"
            };
            SubEmblems.emblem47 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem47.png"
            };
            SubEmblems.emblem48 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem48.png"
            };
            SubEmblems.emblem49 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem49.png"
            };
            SubEmblems.emblem50 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem50.png"
            };
            SubEmblems.emblem51 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem51.png"
            };
            SubEmblems.emblem52 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem52.png"
            };
            SubEmblems.emblem53 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem53.png"
            };
            SubEmblems.emblem54 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem54.png"
            };
            SubEmblems.emblem55 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem55.png"
            };
            SubEmblems.emblem56 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem56.png"
            };
            SubEmblems.emblem57 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem57.png"
            };
            SubEmblems.emblem58 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem58.png"
            };
            SubEmblems.emblem59 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem59.png"
            };
            SubEmblems.emblem61 = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "emblem61.png"
            };
        })(Templates.SubEmblems || (Templates.SubEmblems = {}));
        var SubEmblems = Templates.SubEmblems;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
/// <reference path="../lib/rng.d.ts" />
/// <reference path="../data/templates/subemblemtemplates.ts" />
/// <reference path="color.ts"/>
var Rance;
(function (Rance) {
    var Emblem = (function () {
        function Emblem(color) {
            this.color = color;
        }
        Emblem.prototype.isForegroundOnly = function () {
            if (this.inner.foregroundOnly)
                return true;
            if (this.outer && this.outer.foregroundOnly)
                return true;

            return false;
        };
        Emblem.prototype.generateRandom = function (minAlpha, rng) {
            var rng = rng || new RNG(Math.random);
            this.alpha = rng.uniform();
            this.alpha = Rance.clamp(this.alpha, minAlpha, 1);

            this.generateSubEmblems(rng);
        };
        Emblem.prototype.generateSubEmblems = function (rng) {
            var allEmblems = [];

            function getSeededRandomArrayItem(array) {
                var _rnd = Math.floor(rng.uniform() * array.length);
                return array[_rnd];
            }

            for (var subEmblem in Rance.Templates.SubEmblems) {
                allEmblems.push(Rance.Templates.SubEmblems[subEmblem]);
            }

            var mainEmblem = getSeededRandomArrayItem(allEmblems);

            if (mainEmblem.type === "both") {
                this.inner = mainEmblem;
                return;
            } else if (mainEmblem.type === "inner" || mainEmblem.type === "outer") {
                this[mainEmblem.type] = mainEmblem;
            } else {
                if (rng.uniform() > 0.5) {
                    this.inner = mainEmblem;
                    return;
                } else if (mainEmblem.type === "inner-or-both") {
                    this.inner = mainEmblem;
                } else {
                    this.outer = mainEmblem;
                }
            }

            if (mainEmblem.type === "inner" || mainEmblem.type === "inner-or-both") {
                var subEmblem = getSeededRandomArrayItem(allEmblems.filter(function (emblem) {
                    return (emblem.type === "outer" || emblem.type === "outer-or-both");
                }));

                this.outer = subEmblem;
            } else if (mainEmblem.type === "outer" || mainEmblem.type === "outer-or-both") {
                var subEmblem = getSeededRandomArrayItem(allEmblems.filter(function (emblem) {
                    return (emblem.type === "inner" || emblem.type === "inner-or-both");
                }));

                this.inner = subEmblem;
            }
        };
        Emblem.prototype.draw = function () {
            var canvas = document.createElement("canvas");
            var ctx = canvas.getContext("2d");

            ctx.globalAlpha = this.alpha;

            var inner = this.drawSubEmblem(this.inner);
            canvas.width = inner.width;
            canvas.height = inner.height;
            ctx.drawImage(inner, 0, 0);

            if (this.outer) {
                var outer = this.drawSubEmblem(this.outer);
                ctx.drawImage(outer, 0, 0);
            }

            return canvas;
        };

        Emblem.prototype.drawSubEmblem = function (toDraw) {
            var image = app.images["emblems"][toDraw.imageSrc];

            var width = image.width;
            var height = image.height;

            var canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            var ctx = canvas.getContext("2d");

            ctx.drawImage(image, 0, 0);

            ctx.globalCompositeOperation = "source-in";

            ctx.fillStyle = "#" + Rance.hexToString(this.color);
            ctx.fillRect(0, 0, width, height);

            return canvas;
        };
        return Emblem;
    })();
    Rance.Emblem = Emblem;
})(Rance || (Rance = {}));
/// <reference path="../lib/rng.d.ts" />
/// <reference path="emblem.ts" />
/// <reference path="color.ts"/>
var Rance;
(function (Rance) {
    var Flag = (function () {
        function Flag(props) {
            this.width = props.width;
            this.height = props.height || props.width;

            this.mainColor = props.mainColor;
            this.secondaryColor = props.secondaryColor;
            this.tetriaryColor = props.tetriaryColor;
            this.backgroundEmblem = props.backgroundEmblem;
            this.foregroundEmblem = props.foregroundEmblem;
        }
        Flag.prototype.generateRandom = function (seed) {
            this.seed = seed || Math.random();

            var rng = new RNG(this.seed);

            this.foregroundEmblem = new Rance.Emblem(this.secondaryColor);
            this.foregroundEmblem.generateRandom(100, rng);

            if (!this.foregroundEmblem.isForegroundOnly() && rng.uniform() > 0.5) {
                this.backgroundEmblem = new Rance.Emblem(this.tetriaryColor);
                this.backgroundEmblem.generateRandom(40, rng);
            }
        };
        Flag.prototype.draw = function () {
            var canvas = document.createElement("canvas");
            canvas.width = this.width;
            canvas.height = this.height;
            var ctx = canvas.getContext("2d");

            ctx.globalCompositeOperation = "source-over";

            ctx.fillStyle = "#" + Rance.hexToString(this.mainColor);
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = "#00FF00";

            if (this.backgroundEmblem) {
                var background = this.backgroundEmblem.draw();
                var x = (this.width - background.width) / 2;
                var y = (this.height - background.height) / 2;
                ctx.drawImage(background, x, y);
            }

            var foreground = this.foregroundEmblem.draw();
            var x = (this.width - foreground.width) / 2;
            var y = (this.height - foreground.height) / 2;
            ctx.drawImage(foreground, x, y);

            return canvas;
        };
        Flag.prototype.serialize = function () {
            return ({
                seed: this.seed
            });
        };
        return Flag;
    })();
    Rance.Flag = Flag;
})(Rance || (Rance = {}));
/// <reference path="unit.ts"/>
/// <reference path="fleet.ts"/>
/// <reference path="utility.ts"/>
/// <reference path="building.ts" />
/// <reference path="star.ts" />
/// <reference path="flag.ts" />
/// <reference path="item.ts" />
var Rance;
(function (Rance) {
    var Player = (function () {
        function Player(id) {
            this.units = {};
            this.fleets = [];
            this.items = [];
            this.isIndependent = false;
            this.controlledLocations = [];
            this.visionIsDirty = true;
            this.visibleStars = {};
            this.revealedStars = {};
            this.id = isFinite(id) ? id : Rance.idGenerators.player++;
            this.name = "Player " + this.id;
            this.money = 1000;
        }
        Player.prototype.makeColorScheme = function () {
            var scheme = Rance.generateColorScheme(this.color);

            this.color = scheme.main;
            this.secondaryColor = scheme.secondary;
        };
        Player.prototype.setupPirates = function () {
            this.name = "Independent";
            this.color = 0x000000;
            this.colorAlpha = 0;
            this.secondaryColor = 0xFFFFFF;

            this.isIndependent = true;

            var foregroundEmblem = new Rance.Emblem(this.secondaryColor);
            foregroundEmblem.inner = {
                type: "both",
                foregroundOnly: true,
                imageSrc: "pirateEmblem.png"
            };

            this.flag = new Rance.Flag({
                width: 46,
                mainColor: this.color,
                secondaryColor: this.secondaryColor,
                foregroundEmblem: foregroundEmblem
            });

            var canvas = this.flag.draw();
            this.icon = canvas.toDataURL();
        };
        Player.prototype.makeFlag = function (seed) {
            if (!this.color || !this.secondaryColor)
                this.makeColorScheme();

            this.flag = new Rance.Flag({
                width: 46,
                mainColor: this.color,
                secondaryColor: this.secondaryColor
            });

            this.flag.generateRandom(seed);
            var canvas = this.flag.draw();
            this.icon = canvas.toDataURL();
        };
        Player.prototype.addUnit = function (unit) {
            this.units[unit.id] = unit;
        };
        Player.prototype.removeUnit = function (unit) {
            this.units[unit.id] = null;
            delete this.units[unit.id];
        };
        Player.prototype.getAllUnits = function () {
            var allUnits = [];
            for (var unitId in this.units) {
                allUnits.push(this.units[unitId]);
            }
            return allUnits;
        };
        Player.prototype.forEachUnit = function (operator) {
            for (var unitId in this.units) {
                operator(this.units[unitId]);
            }
        };
        Player.prototype.getFleetIndex = function (fleet) {
            return this.fleets.indexOf(fleet);
        };
        Player.prototype.addFleet = function (fleet) {
            if (this.getFleetIndex(fleet) >= 0) {
                return;
            }

            this.fleets.push(fleet);
            this.visionIsDirty = true;
        };
        Player.prototype.removeFleet = function (fleet) {
            var fleetIndex = this.getFleetIndex(fleet);

            if (fleetIndex < 0)
                return;

            this.fleets.splice(fleetIndex, 1);
            this.visionIsDirty = true;
        };
        Player.prototype.getFleetsWithPositions = function () {
            var positions = [];

            for (var i = 0; i < this.fleets.length; i++) {
                var fleet = this.fleets[i];

                positions.push({
                    position: fleet.location,
                    data: fleet
                });
            }

            return positions;
        };

        Player.prototype.hasStar = function (star) {
            return (this.controlledLocations.indexOf(star) >= 0);
        };
        Player.prototype.addStar = function (star) {
            if (this.hasStar(star))
                return false;

            this.controlledLocations.push(star);
            this.visionIsDirty = true;
        };
        Player.prototype.removeStar = function (star) {
            var index = this.controlledLocations.indexOf(star);

            if (index < 0)
                return false;

            this.controlledLocations.splice(index, 1);
            this.visionIsDirty = true;
        };
        Player.prototype.getIncome = function () {
            var income = 0;

            for (var i = 0; i < this.controlledLocations.length; i++) {
                income += this.controlledLocations[i].getIncome();
            }

            return income;
        };
        Player.prototype.getBuildableShips = function () {
            var templates = [];

            for (var type in Rance.Templates.ShipTypes) {
                templates.push(Rance.Templates.ShipTypes[type]);
            }

            return templates;
        };
        Player.prototype.getNeighboringStars = function () {
            var stars = {};

            for (var i = 0; i < this.controlledLocations.length; i++) {
                var currentOwned = this.controlledLocations[i];
                var frontier = currentOwned.getLinkedInRange(1).all;
                for (var j = 0; j < frontier.length; j++) {
                    if (stars[frontier[j].id]) {
                        continue;
                    } else if (frontier[j].owner.id === this.id) {
                        continue;
                    } else {
                        stars[frontier[j].id] = frontier[j];
                    }
                }
            }

            var allStars = [];

            for (var id in stars) {
                allStars.push(stars[id]);
            }

            return allStars;
        };
        Player.prototype.updateVisibleStars = function () {
            this.visibleStars = {};

            for (var i = 0; i < this.controlledLocations.length; i++) {
                var starVisible = this.controlledLocations[i].getVision();

                for (var j = 0; j < starVisible.length; j++) {
                    var star = starVisible[j];
                    if (!this.visibleStars[star.id]) {
                        this.visibleStars[star.id] = star;

                        if (!this.revealedStars[star.id]) {
                            this.revealedStars[star.id] = star;
                        }
                    }
                }
            }

            for (var i = 0; i < this.fleets.length; i++) {
                var fleetVisible = this.fleets[i].getVision();

                for (var j = 0; j < fleetVisible.length; j++) {
                    var star = fleetVisible[j];
                    if (!this.visibleStars[star.id]) {
                        this.visibleStars[star.id] = star;

                        if (!this.revealedStars[star.id]) {
                            this.revealedStars[star.id] = star;
                        }
                    }
                }
            }

            this.visionIsDirty = false;

            Rance.eventManager.dispatchEvent("renderMap");
        };
        Player.prototype.getVisibleStars = function () {
            if (this.visionIsDirty)
                this.updateVisibleStars();

            var visible = [];

            for (var id in this.visibleStars) {
                visible.push(this.visibleStars[id]);
            }

            return visible;
        };
        Player.prototype.getRevealedStars = function () {
            if (this.visionIsDirty)
                this.updateVisibleStars();

            var toReturn = [];

            for (var id in this.revealedStars) {
                toReturn.push(this.revealedStars[id]);
            }

            return toReturn;
        };
        Player.prototype.getRevealedButNotVisibleStars = function () {
            if (this.visionIsDirty)
                this.updateVisibleStars();

            var toReturn = [];

            for (var id in this.revealedStars) {
                if (!this.visibleStars[id]) {
                    toReturn.push(this.revealedStars[id]);
                }
            }

            return toReturn;
        };
        Player.prototype.addItem = function (item) {
            this.items.push(item);
        };
        Player.prototype.getAllBuildableItems = function () {
            var alreadyAdded = {};
            var allBuildable = [];

            for (var i = 0; i < this.controlledLocations.length; i++) {
                var star = this.controlledLocations[i];

                var buildableItems = star.getBuildableItems().all;
                for (var j = 0; j < buildableItems.length; j++) {
                    var item = buildableItems[j];

                    if (alreadyAdded[item.type]) {
                        continue;
                    } else {
                        alreadyAdded[item.type] = true;
                        allBuildable.push({
                            star: star,
                            template: item
                        });
                    }
                }
            }

            return allBuildable;
        };
        Player.prototype.serialize = function () {
            var data = {};

            data.id = this.id;
            data.name = this.name;
            data.color = this.color;
            data.colorAlpha = this.colorAlpha;
            data.secondaryColor = this.secondaryColor;
            data.isIndependent = this.isIndependent;

            data.flag = this.flag.serialize();

            data.unitIds = [];
            for (var id in this.units) {
                data.unitIds.push(id);
            }
            data.fleets = this.fleets.map(function (fleet) {
                return fleet.serialize();
            });
            data.money = this.money;
            data.controlledLocationIds = this.controlledLocations.map(function (star) {
                return star.id;
            });

            data.items = this.items.map(function (item) {
                return item.serialize();
            });

            data.revealedStarIds = [];
            for (var id in this.revealedStars) {
                data.revealedStarIds.push(parseInt(id));
            }

            data.buildings = [];

            return data;
        };
        return Player;
    })();
    Rance.Player = Player;
})(Rance || (Rance = {}));
/// <reference path="player.ts"/>
/// <reference path="unit.ts"/>
/// <reference path="star.ts"/>
/// <reference path="building.ts"/>
/// <reference path="battledata.ts"/>
/// <reference path="unit.ts"/>
/// <reference path="eventmanager.ts"/>
var Rance;
(function (Rance) {
    var Battle = (function () {
        function Battle(props) {
            this.unitsById = {};
            this.unitsBySide = {
                side1: [],
                side2: []
            };
            this.turnOrder = [];
            this.evaluation = {};
            this.isVirtual = false;
            this.ended = false;
            this.side1 = props.side1;
            this.side1Player = props.side1Player;
            this.side2 = props.side2;
            this.side2Player = props.side2Player;
            this.battleData = props.battleData;
        }
        Battle.prototype.init = function () {
            var self = this;

            ["side1", "side2"].forEach(function (sideId) {
                var side = self[sideId];
                for (var i = 0; i < side.length; i++) {
                    for (var j = 0; j < side[i].length; j++) {
                        if (side[i][j]) {
                            self.unitsById[side[i][j].id] = side[i][j];
                            self.unitsBySide[sideId].push(side[i][j]);

                            var pos = sideId === "side1" ? [i, j] : [i + 2, j];

                            self.initUnit(side[i][j], sideId, pos);
                        }
                    }
                }
            });

            this.currentTurn = 0;
            this.maxTurns = 24;
            this.turnsLeft = this.maxTurns;
            this.updateTurnOrder();
            this.setActiveUnit();

            this.startHealth = {
                side1: this.getTotalHealthForSide("side1").current,
                side2: this.getTotalHealthForSide("side2").current
            };

            if (this.checkBattleEnd()) {
                this.endBattle();
            } else {
                this.swapColumnsIfNeeded();
            }
        };
        Battle.prototype.forEachUnit = function (operator) {
            for (var id in this.unitsById) {
                operator.call(this, this.unitsById[id]);
            }
        };
        Battle.prototype.initUnit = function (unit, side, position) {
            unit.resetBattleStats();
            unit.setBattlePosition(this, side, position);
            this.addUnitToTurnOrder(unit);
            unit.timesActedThisTurn++;
        };
        Battle.prototype.removeUnitFromTurnOrder = function (unit) {
            var unitIndex = this.turnOrder.indexOf(unit);
            if (unitIndex < 0)
                return false;

            this.turnOrder.splice(unitIndex, 1);
        };
        Battle.prototype.addUnitToTurnOrder = function (unit) {
            var unitIndex = this.turnOrder.indexOf(unit);
            if (unitIndex >= 0)
                return false;

            this.turnOrder.push(unit);
        };
        Battle.prototype.updateTurnOrder = function () {
            this.turnOrder.sort(Rance.turnOrderSortFunction);

            function turnOrderFilterFunction(unit) {
                if (unit.battleStats.currentActionPoints <= 0) {
                    return false;
                }

                if (unit.currentStrength <= 0) {
                    return false;
                }

                return true;
            }

            this.turnOrder = this.turnOrder.filter(turnOrderFilterFunction);
        };
        Battle.prototype.setActiveUnit = function () {
            this.activeUnit = this.turnOrder[0];
        };
        Battle.prototype.endTurn = function () {
            this.currentTurn++;
            this.turnsLeft--;
            this.updateTurnOrder();
            this.setActiveUnit();

            if (!this.isVirtual) {
                this.forEachUnit(function (unit) {
                    if (unit.currentStrength <= 0) {
                        unit.displayFlags.isAnnihilated = true;
                        unit.uiDisplayIsDirty = true;
                    }
                });
            }

            var shouldEnd = this.checkBattleEnd();
            if (shouldEnd) {
                this.endBattle();
            } else {
                this.swapColumnsIfNeeded();
            }
        };
        Battle.prototype.getFleetsForSide = function (side) {
            switch (side) {
                case "all": {
                    return this.side1.concat(this.side2);
                }
                case "side1":
                case "side2": {
                    return this[side];
                }
            }
        };
        Battle.prototype.getPlayerForSide = function (side) {
            if (side === "side1")
                return this.side1Player;
            else if (side === "side2")
                return this.side2Player;
            else
                throw new Error("invalid side");
        };
        Battle.prototype.getSideForPlayer = function (player) {
            if (this.side1Player === player)
                return "side1";
            else if (this.side2Player === player)
                return "side2";
            else
                throw new Error("invalid player");
        };
        Battle.prototype.getActivePlayer = function () {
            if (!this.activeUnit)
                return null;

            var side = this.activeUnit.battleStats.side;

            return this.getPlayerForSide(side);
        };
        Battle.prototype.getColumnByPosition = function (position) {
            var side = position <= 1 ? "side1" : "side2";
            var relativePosition = position % 2;

            return this[side][relativePosition];
        };
        Battle.prototype.getCapturedUnits = function (victor, maxCapturedUnits) {
            if (typeof maxCapturedUnits === "undefined") { maxCapturedUnits = 1; }
            if (!victor || victor.isIndependent)
                return [];

            var winningSide = this.getSideForPlayer(victor);
            var losingSide = Rance.reverseSide(winningSide);

            var losingUnits = this.unitsBySide[losingSide].slice(0);
            losingUnits.sort(function (a, b) {
                return b.battleStats.captureChance - a.battleStats.captureChance;
            });

            var capturedUnits = [];

            for (var i = 0; i < losingUnits.length; i++) {
                if (capturedUnits.length >= maxCapturedUnits)
                    break;

                var unit = losingUnits[i];
                if (unit.currentStrength <= 0 && Math.random() <= unit.battleStats.captureChance) {
                    capturedUnits.push(unit);
                }
            }

            return capturedUnits;
        };
        Battle.prototype.getDeadUnits = function (capturedUnits, victor) {
            var INDEPENDENT_DEATH_CHANCE = 1;
            var PLAYER_DEATH_CHANCE = 0.4;
            var LOSER_DEATH_CHANCE = 0.25;

            var winningSide = this.getSideForPlayer(victor);
            var losingSide = Rance.reverseSide(winningSide);
            var losingPlayer = this.getPlayerForSide(losingSide);

            var deadUnits = [];

            this.forEachUnit(function (unit) {
                if (unit.currentStrength <= 0) {
                    var wasCaptured = capturedUnits.indexOf(unit) >= 0;
                    if (!wasCaptured) {
                        var isIndependent = unit.fleet.player.isIndependent;
                        var deathChance = isIndependent ? INDEPENDENT_DEATH_CHANCE : PLAYER_DEATH_CHANCE;
                        if (unit.fleet.player.id === losingPlayer)
                            deathChance += LOSER_DEATH_CHANCE;

                        if (Math.random() <= deathChance) {
                            deadUnits.push(unit);
                        }
                    }
                }
            });

            return deadUnits;
        };
        Battle.prototype.endBattle = function () {
            this.ended = true;

            if (this.isVirtual)
                return;

            this.activeUnit = null;
            var victor = this.getVictor();

            this.capturedUnits = this.getCapturedUnits(victor);
            this.deadUnits = this.getDeadUnits(this.capturedUnits, victor);

            var _ = window;

            var consoleRows = [];
            this.forEachUnit(function (unit) {
                consoleRows.push({
                    id: unit.id,
                    health: unit.currentStrength,
                    destroyed: this.deadUnits.indexOf(unit) >= 0 ? true : null,
                    captureChance: unit.battleStats.captureChance,
                    captured: this.capturedUnits.indexOf(unit) >= 0 ? true : null
                });
            }.bind(this));

            if (_.console.table) {
                _.console.table(consoleRows);
            }

            Rance.eventManager.dispatchEvent("battleEnd", null);
        };
        Battle.prototype.finishBattle = function (forcedVictor) {
            var victor = forcedVictor || this.getVictor();

            for (var i = 0; i < this.deadUnits.length; i++) {
                this.deadUnits[i].removeFromPlayer();
            }

            if (victor) {
                for (var i = 0; i < this.capturedUnits.length; i++) {
                    this.capturedUnits[i].transferToPlayer(victor);
                }
            }

            this.forEachUnit(function (unit) {
                unit.resetBattleStats();
            });
            this.forEachUnit(function (unit) {
                if (unit.currentStrength < Math.round(unit.maxStrength * 0.1)) {
                    unit.currentStrength = Math.round(unit.maxStrength * 0.1);
                }
            });

            if (this.battleData.building) {
                if (victor) {
                    this.battleData.building.setController(victor);
                }
            }
            Rance.eventManager.dispatchEvent("switchScene", "galaxyMap");
            Rance.eventManager.dispatchEvent("centerCameraAt", this.battleData.location);
        };
        Battle.prototype.getVictor = function () {
            var evaluation = this.getEvaluation();

            if (evaluation < 0)
                return this.side1Player;
            else if (evaluation > 0)
                return this.side2Player;
            else
                return null;
        };
        Battle.prototype.getTotalHealthForColumn = function (position) {
            var column = this.getColumnByPosition(position);
            var total = 0;

            for (var i = 0; i < column.length; i++) {
                if (column[i]) {
                    total += column[i].currentStrength;
                }
            }

            return total;
        };
        Battle.prototype.getTotalHealthForSide = function (side) {
            var health = {
                current: 0,
                max: 0
            };

            var units = this.unitsBySide[side];

            for (var i = 0; i < units.length; i++) {
                var unit = units[i];
                health.current += unit.currentStrength;
                health.max += unit.maxStrength;
            }

            return health;
        };
        Battle.prototype.getEvaluation = function () {
            if (!this.evaluation[this.currentTurn]) {
                var self = this;
                var evaluation = 0;

                ["side1", "side2"].forEach(function (side) {
                    var sign = side === "side1" ? 1 : -1;
                    var currentHealth = self.getTotalHealthForSide(side).current;
                    if (currentHealth <= 0) {
                        evaluation += 999 * sign;
                        return;
                    }
                    var currentHealthFactor = currentHealth / self.startHealth[side];
                    var lostHealthFactor = 1 - currentHealthFactor;

                    for (var i = 0; i < self.unitsBySide[side].length; i++) {
                        if (self.unitsBySide[side][i].currentStrength <= 0) {
                            evaluation += 0.2 * sign;
                        }
                    }

                    evaluation += (1 - currentHealthFactor) * sign;
                });

                evaluation = Rance.clamp(evaluation, -1, 1);

                this.evaluation[this.currentTurn] = evaluation;
            }

            return this.evaluation[this.currentTurn];
        };
        Battle.prototype.swapFleetColumnsForSide = function (side) {
            this[side] = this[side].reverse();

            for (var i = 0; i < this[side].length; i++) {
                var column = this[side][i];
                for (var j = 0; j < column.length; j++) {
                    var pos = side === "side1" ? [i, j] : [i + 2, j];

                    if (column[j]) {
                        column[j].setBattlePosition(this, side, pos);
                    }
                }
            }
        };
        Battle.prototype.swapColumnsIfNeeded = function () {
            var side1Front = this.getTotalHealthForColumn(1);
            if (side1Front <= 0) {
                this.swapFleetColumnsForSide("side1");
            }
            var side2Front = this.getTotalHealthForColumn(2);
            if (side2Front <= 0) {
                this.swapFleetColumnsForSide("side2");
            }
        };
        Battle.prototype.checkBattleEnd = function () {
            if (!this.activeUnit)
                return true;

            if (this.turnsLeft <= 0)
                return true;

            if (this.getTotalHealthForSide("side1").current <= 0 || this.getTotalHealthForSide("side2").current <= 0) {
                return true;
            }

            return false;
        };
        Battle.prototype.makeVirtualClone = function () {
            var battleData = this.battleData;

            function cloneUnits(units) {
                var clones = [];
                for (var i = 0; i < units.length; i++) {
                    var column = [];

                    for (var j = 0; j < units[i].length; j++) {
                        var unit = units[i][j];
                        if (!unit) {
                            column.push(unit);
                        } else {
                            column.push(unit.makeVirtualClone());
                        }
                    }
                    clones.push(column);
                }

                return clones;
            }

            var side1 = cloneUnits(this.side1);
            var side2 = cloneUnits(this.side2);

            var side1Player = this.side1Player;
            var side2Player = this.side2Player;

            var clone = new Battle({
                battleData: battleData,
                side1: side1,
                side2: side2,
                side1Player: side1Player,
                side2Player: side2Player
            });

            [side1, side2].forEach(function (side) {
                for (var i = 0; i < side.length; i++) {
                    for (var j = 0; j < side[i].length; j++) {
                        if (!side[i][j])
                            continue;
                        clone.addUnitToTurnOrder(side[i][j]);
                        clone.unitsById[side[i][j].id] = side[i][j];
                        clone.unitsBySide[side[i][j].battleStats.side].push(side[i][j]);
                    }
                }
            });

            clone.isVirtual = true;

            clone.currentTurn = 0;
            clone.maxTurns = 24;
            clone.turnsLeft = clone.maxTurns;
            clone.updateTurnOrder();
            clone.setActiveUnit();

            clone.startHealth = {
                side1: clone.getTotalHealthForSide("side1").current,
                side2: clone.getTotalHealthForSide("side2").current
            };

            if (clone.checkBattleEnd()) {
                clone.endBattle();
            } else {
                clone.swapColumnsIfNeeded();
            }

            return clone;
        };
        return Battle;
    })();
    Rance.Battle = Battle;
})(Rance || (Rance = {}));
/// <reference path="../data/templates/effecttemplates.ts" />
/// <reference path="../data/templates/abilitytemplates.ts" />
/// <reference path="battle.ts"/>
/// <reference path="unit.ts"/>
/// <reference path="targeting.ts"/>
var Rance;
(function (Rance) {
    function getAbilityUseData(battle, user, ability, target) {
        var data = {};
        data.user = user;
        data.originalTarget = target;
        data.actualTarget = getTargetOrGuard(battle, user, ability, target);
        data.beforeUse = [];
        if (!ability.addsGuard) {
            data.beforeUse.push(user.removeAllGuard.bind(user));
        }

        data.effectsToCall = [];

        var effectsToCall = [ability.mainEffect];
        if (ability.secondaryEffects) {
            effectsToCall = effectsToCall.concat(ability.secondaryEffects);
        }

        for (var i = 0; i < effectsToCall.length; i++) {
            var effect = effectsToCall[i];
            var targetsInArea = getUnitsInEffectArea(battle, user, effect, data.actualTarget.battleStats.position);

            for (var j = 0; j < targetsInArea.length; j++) {
                var effectTarget = targetsInArea[j];

                data.effectsToCall.push({
                    effect: effect.effect.bind(null, user, effectTarget),
                    user: user,
                    target: effectTarget
                });
            }
        }

        data.afterUse = [];
        data.afterUse.push(user.removeActionPoints.bind(user, ability.actionsUse));
        data.afterUse.push(user.addMoveDelay.bind(user, ability.moveDelay));

        return data;
    }
    Rance.getAbilityUseData = getAbilityUseData;
    function useAbility(battle, user, ability, target) {
        var abilityData = getAbilityUseData(battle, user, ability, target);

        for (var i = 0; i < abilityData.beforeUse.length; i++) {
            abilityData.beforeUse[i]();
        }

        for (var i = 0; i < abilityData.effectsToCall.length; i++) {
            abilityData.effectsToCall[i].effect();
        }

        for (var i = 0; i < abilityData.afterUse.length; i++) {
            abilityData.afterUse[i]();
        }
    }
    Rance.useAbility = useAbility;
    function validateTarget(battle, user, ability, target) {
        var potentialTargets = getPotentialTargets(battle, user, ability);

        return potentialTargets.indexOf(target) >= 0;
    }
    Rance.validateTarget = validateTarget;
    function getTargetOrGuard(battle, user, ability, target) {
        var guarding = getGuarders(battle, user, ability, target);

        guarding = guarding.sort(function (a, b) {
            return a.battleStats.guardAmount - b.battleStats.guardAmount;
        });

        for (var i = 0; i < guarding.length; i++) {
            var guardRoll = Math.random() * 100;
            if (guardRoll <= guarding[i].battleStats.guardAmount) {
                return guarding[i];
            }
        }

        return target;
    }
    Rance.getTargetOrGuard = getTargetOrGuard;
    function getGuarders(battle, user, ability, target) {
        var allEnemies = getPotentialTargets(battle, user, Rance.Templates.Abilities.dummyTargetAll);

        var guarders = allEnemies.filter(function (unit) {
            if (unit.battleStats.guardCoverage === "all") {
                return unit.battleStats.guardAmount > 0;
            } else if (unit.battleStats.guardCoverage === "column") {
                // same column
                if (unit.battleStats.position[0] === target.battleStats.position[0]) {
                    return unit.battleStats.guardAmount > 0;
                }
            }
        });

        return guarders;
    }
    Rance.getGuarders = getGuarders;
    function getPotentialTargets(battle, user, ability) {
        if (ability.mainEffect.targetRange === "self") {
            return [user];
        }
        var fleetsToTarget = getFleetsToTarget(battle, user, ability.mainEffect);

        if (ability.mainEffect.targetRange === "close") {
            var farColumnForSide = {
                side1: 0,
                side2: 3
            };

            if (user.battleStats.position[0] === farColumnForSide[user.battleStats.side]) {
                return [];
            }

            var oppositeSide = Rance.reverseSide(user.battleStats.side);

            fleetsToTarget[farColumnForSide[oppositeSide]] = [null];
        }

        var fleetFilterFN = function (target) {
            if (!Boolean(target)) {
                return false;
            } else if (!target.isTargetable()) {
                return false;
            }

            return true;
        };

        var targets = Rance.flatten2dArray(fleetsToTarget).filter(fleetFilterFN);

        return targets;
    }
    Rance.getPotentialTargets = getPotentialTargets;
    function getFleetsToTarget(battle, user, effect) {
        var nullFleet = [
            [null, null, null, null],
            [null, null, null, null]
        ];
        var insertNullBefore;
        var toConcat;

        switch (effect.targetFleets) {
            case "all": {
                return battle.side1.concat(battle.side2);
            }
            case "ally": {
                insertNullBefore = user.battleStats.side === "side1" ? false : true;
                toConcat = battle[user.battleStats.side];
                break;
            }
            case "enemy": {
                insertNullBefore = user.battleStats.side === "side1" ? true : false;
                toConcat = battle[Rance.reverseSide(user.battleStats.side)];
                break;
            }
        }

        if (insertNullBefore) {
            return nullFleet.concat(toConcat);
        } else {
            return toConcat.concat(nullFleet);
        }
    }
    Rance.getFleetsToTarget = getFleetsToTarget;
    function getPotentialTargetsByPosition(battle, user, ability) {
        var targets = getPotentialTargets(battle, user, ability);
        var targetPositions = [];

        for (var i = 0; i < targets.length; i++) {
            targetPositions.push(targets[i].battleStats.position);
        }

        return targetPositions;
    }
    Rance.getPotentialTargetsByPosition = getPotentialTargetsByPosition;
    function getUnitsInAbilityArea(battle, user, ability, target) {
        return getUnitsInEffectArea(battle, user, ability.mainEffect, target);
    }
    Rance.getUnitsInAbilityArea = getUnitsInAbilityArea;
    function getUnitsInEffectArea(battle, user, effect, target) {
        var targetFleets = getFleetsToTarget(battle, user, effect);

        var inArea = effect.targetingFunction(targetFleets, target);

        return inArea.filter(function (unit) {
            if (!unit)
                return false;
            else
                return unit.isActiveInBattle();
        });
    }
    Rance.getUnitsInEffectArea = getUnitsInEffectArea;

    function getTargetsForAllAbilities(battle, user) {
        if (!user || !battle.activeUnit) {
            return null;
        }

        var allTargets = {};

        var abilities = user.getAllAbilities();
        for (var i = 0; i < abilities.length; i++) {
            var ability = abilities[i];

            var targets = getPotentialTargets(battle, user, ability);

            for (var j = 0; j < targets.length; j++) {
                var target = targets[j];

                if (!allTargets[target.id]) {
                    allTargets[target.id] = [];
                }

                allTargets[target.id].push(ability);
            }
        }

        return allTargets;
    }
    Rance.getTargetsForAllAbilities = getTargetsForAllAbilities;
})(Rance || (Rance = {}));
/// <reference path="../data/templates/unittemplates.ts" />
/// <reference path="../data/templates/abilitytemplates.ts" />
/// <reference path="utility.ts"/>
/// <reference path="ability.ts"/>
/// <reference path="battle.ts"/>
/// <reference path="item.ts"/>
var Rance;
(function (Rance) {
    var Unit = (function () {
        function Unit(template, id, data) {
            this.items = {
                low: null,
                mid: null,
                high: null
            };
            this.uiDisplayIsDirty = true;
            this.id = isFinite(id) ? id : Rance.idGenerators.unit++;

            this.template = template;
            this.name = this.id + " " + template.typeName;
            this.isSquadron = template.isSquadron;
            if (data) {
                this.makeFromData(data);
            } else {
                this.setInitialValues();
            }

            this.displayFlags = {
                isAnnihilated: false
            };
        }
        Unit.prototype.makeFromData = function (data) {
            var items = {};

            ["low", "mid", "high"].forEach(function (slot) {
                if (data.items[slot]) {
                    var item = data.items[slot];
                    if (!item)
                        return;

                    if (item.templateType) {
                        items[slot] = new Rance.Item(Rance.Templates.Items[item.templateType], item.id);
                    } else {
                        items[slot] = item;
                    }
                }
            });

            this.name = data.name;

            this.maxStrength = data.maxStrength;
            this.currentStrength = data.currentStrength;

            this.currentMovePoints = data.currentMovePoints;
            this.maxMovePoints = data.maxMovePoints;

            this.timesActedThisTurn = data.timesActedThisTurn;

            this.baseAttributes = Rance.cloneObject(data.baseAttributes);
            this.attributes = Rance.cloneObject(this.baseAttributes);

            var battleStats = {};

            battleStats.moveDelay = data.battleStats.moveDelay;
            battleStats.side = data.battleStats.side;
            battleStats.position = data.battleStats.position;
            battleStats.currentActionPoints = data.battleStats.currentActionPoints;
            battleStats.guardAmount = data.battleStats.guardAmount;
            battleStats.guardCoverage = data.battleStats.guardCoverage;
            battleStats.captureChance = data.battleStats.captureChance;

            this.battleStats = battleStats;

            this.items = {
                low: null,
                mid: null,
                high: null
            };

            for (var slot in items) {
                this.addItem(items[slot]);
            }
        };
        Unit.prototype.setInitialValues = function () {
            this.setBaseHealth();
            this.setAttributes();
            this.resetBattleStats();

            this.maxMovePoints = this.template.maxMovePoints;
            this.resetMovePoints();

            this.timesActedThisTurn = 0;
        };
        Unit.prototype.setBaseHealth = function () {
            var min = 500 * this.template.maxStrength;
            var max = 1000 * this.template.maxStrength;
            this.maxStrength = Rance.randInt(min, max);
            if (true) {
                this.currentStrength = this.maxStrength;
            } else {
                this.currentStrength = Rance.randInt(this.maxStrength / 10, this.maxStrength);
            }
        };
        Unit.prototype.setAttributes = function (experience, variance) {
            if (typeof experience === "undefined") { experience = 1; }
            if (typeof variance === "undefined") { variance = 1; }
            var template = this.template;

            var attributes = {
                attack: 1,
                defence: 1,
                intelligence: 1,
                speed: 1,
                maxActionPoints: Rance.randInt(3, 6)
            };

            for (var attribute in template.attributeLevels) {
                var attributeLevel = template.attributeLevels[attribute];

                var min = 4 * experience * attributeLevel + 1;
                var max = 8 * experience * attributeLevel + 1 + variance;

                attributes[attribute] = Rance.randInt(min, max);
                if (attributes[attribute] > 9)
                    attributes[attribute] = 9;
            }

            this.baseAttributes = Rance.cloneObject(attributes);
            this.attributes = attributes;
        };
        Unit.prototype.getBaseMoveDelay = function () {
            return 30 - this.attributes.speed;
        };
        Unit.prototype.resetMovePoints = function () {
            this.currentMovePoints = this.maxMovePoints;
        };
        Unit.prototype.resetBattleStats = function () {
            this.battleStats = {
                moveDelay: this.getBaseMoveDelay(),
                currentActionPoints: this.attributes.maxActionPoints,
                battle: null,
                side: null,
                position: null,
                guardAmount: 0,
                guardCoverage: null,
                captureChance: 1
            };

            this.displayFlags = {
                isAnnihilated: false
            };
        };
        Unit.prototype.setBattlePosition = function (battle, side, position) {
            this.battleStats.side = side;
            this.battleStats.position = position;
        };

        Unit.prototype.addStrength = function (amount) {
            this.currentStrength += Math.round(amount);
            if (this.currentStrength > this.maxStrength) {
                this.currentStrength = this.maxStrength;
            }

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.removeStrength = function (amount) {
            this.currentStrength -= Math.round(amount);
            if (this.currentStrength < 0) {
                this.currentStrength = 0;
            }

            this.removeGuard(50);

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.removeActionPoints = function (amount) {
            if (amount === "all") {
                this.battleStats.currentActionPoints = 0;
            } else if (isFinite(amount)) {
                this.battleStats.currentActionPoints -= amount;
                if (this.battleStats.currentActionPoints < 0) {
                    this.battleStats.currentActionPoints = 0;
                }
            }

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.addMoveDelay = function (amount) {
            this.battleStats.moveDelay += amount;
        };

        // redundant until stealth mechanics are added
        Unit.prototype.isTargetable = function () {
            return this.currentStrength > 0;
        };
        Unit.prototype.isActiveInBattle = function () {
            return this.currentStrength > 0;
        };

        Unit.prototype.addItem = function (item) {
            var itemSlot = item.template.slot;

            if (this.items[itemSlot])
                return false;

            if (item.unit) {
                item.unit.removeItem(item);
            }

            this.items[itemSlot] = item;
            item.unit = this;

            if (item.template.attributes) {
                for (var attribute in item.template.attributes) {
                    this.adjustAttribute(attribute, item.template.attributes[attribute]);
                }
            }
        };
        Unit.prototype.removeItem = function (item) {
            var itemSlot = item.template.slot;

            if (this.items[itemSlot] === item) {
                this.items[itemSlot] = null;
                item.unit = null;

                if (item.template.attributes) {
                    for (var attribute in item.template.attributes) {
                        this.adjustAttribute(attribute, -item.template.attributes[attribute]);
                    }
                }

                return true;
            }

            return false;
        };
        Unit.prototype.adjustAttribute = function (attribute, amount) {
            if (!this.attributes[attribute])
                throw new Error("Invalid attribute");

            this.attributes[attribute] = Rance.clamp(this.attributes[attribute] + amount, 0, 9);
        };
        Unit.prototype.removeItemAtSlot = function (slot) {
            if (this.items[slot]) {
                this.removeItem(this.items[slot]);
                return true;
            }

            return false;
        };
        Unit.prototype.getItemAbilities = function () {
            var itemAbilities = [];

            for (var slot in this.items) {
                if (!this.items[slot] || !this.items[slot].template.ability)
                    continue;
                itemAbilities.push(this.items[slot].template.ability);
            }

            return itemAbilities;
        };
        Unit.prototype.getAllAbilities = function () {
            var abilities = this.template.abilities;

            abilities = abilities.concat(this.getItemAbilities());

            return abilities;
        };
        Unit.prototype.recieveDamage = function (amount, damageType) {
            var damageReduction = this.getReducedDamageFactor(damageType);

            var adjustedDamage = amount * damageReduction;

            this.removeStrength(adjustedDamage);
        };
        Unit.prototype.getAttackDamageIncrease = function (damageType) {
            var attackStat, attackFactor;

            switch (damageType) {
                case "physical": {
                    attackStat = this.attributes.attack;
                    attackFactor = 0.1;
                    break;
                }
                case "magical": {
                    attackStat = this.attributes.intelligence;
                    attackFactor = 0.1;
                    break;
                }
            }

            return 1 + attackStat * attackFactor;
        };
        Unit.prototype.getReducedDamageFactor = function (damageType) {
            var defensiveStat, defenceFactor;
            var finalDamageMultiplier = 1;

            switch (damageType) {
                case "physical": {
                    defensiveStat = this.attributes.defence;
                    defenceFactor = 0.08;

                    var guardAmount = Math.min(this.battleStats.guardAmount, 100);
                    finalDamageMultiplier = 1 - guardAmount / 200; // 1 - 0.5;
                    break;
                }
                case "magical": {
                    defensiveStat = this.attributes.intelligence;
                    defenceFactor = 0.07;
                    break;
                }
            }

            var damageReduction = defensiveStat * defenceFactor;
            var finalDamageFactor = (1 - damageReduction) * finalDamageMultiplier;

            return finalDamageFactor;
        };
        Unit.prototype.addToFleet = function (fleet) {
            this.fleet = fleet;
        };
        Unit.prototype.removeFromFleet = function () {
            this.fleet = null;
        };
        Unit.prototype.removeFromPlayer = function () {
            var player = this.fleet.player;

            player.removeUnit(this);
            this.fleet.removeShip(this);

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.transferToPlayer = function (newPlayer) {
            var oldPlayer = this.fleet.player;
            var location = this.fleet.location;

            this.removeFromPlayer();

            newPlayer.addUnit(this);
            var newFleet = new Rance.Fleet(newPlayer, [this], location);
        };
        Unit.prototype.removeGuard = function (amount) {
            this.battleStats.guardAmount -= amount;
            if (this.battleStats.guardAmount < 0)
                this.removeAllGuard();

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.addGuard = function (amount, coverage) {
            this.battleStats.guardAmount += amount;
            this.battleStats.guardCoverage = coverage;

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.removeAllGuard = function () {
            this.battleStats.guardAmount = 0;
            this.battleStats.guardCoverage = null;

            this.uiDisplayIsDirty = true;
        };
        Unit.prototype.heal = function () {
            var location = this.fleet.location;

            var baseHealFactor = 0.05;
            var healingFactor = baseHealFactor + location.getHealingFactor(this.fleet.player);

            var healAmount = this.maxStrength * healingFactor;

            this.addStrength(healAmount);
        };
        Unit.prototype.drawBattleScene = function (props) {
            //var unitsToDraw = props.unitsToDraw;
            var maxUnitsPerColumn = props.maxUnitsPerColumn;
            var isConvex = true;
            var degree = props.degree;
            if (degree < 0) {
                isConvex = !isConvex;
                degree = Math.abs(degree);
            }

            var xDistance = isFinite(props.xDistance) ? props.xDistance : 5;
            var zDistance = isFinite(props.zDistance) ? props.zDistance : 5;

            var canvas = document.createElement("canvas");
            canvas.width = 2000;
            canvas.height = 2000;

            var ctx = canvas.getContext("2d");

            var unitsToDraw = Math.round(this.currentStrength * 0.05);
            unitsToDraw = Rance.clamp(unitsToDraw, 1, maxUnitsPerColumn * 3);

            var spriteTemplate = this.template.sprite;

            var image = app.images["units"][spriteTemplate.imageSrc];

            var xMin, xMax, yMin, yMax;

            function transformMat3(a, m) {
                var x = m[0] * a.x + m[3] * a.y + m[6];
                var y = m[1] * a.x + m[4] * a.y + m[7];

                return { x: x, y: y };
            }

            var rotationAngle = Math.PI / 180 * props.rotationAngle;
            var sA = Math.sin(rotationAngle);
            var cA = Math.cos(rotationAngle);

            var rotationMatrix = [
                1, 0, 0,
                0, cA, -sA,
                0, sA, cA
            ];

            var minXOffset = isConvex ? 0 : Math.sin(Math.PI / (maxUnitsPerColumn + 1));

            for (var i = unitsToDraw - 1; i >= 0; i--) {
                var column = Math.floor(i / maxUnitsPerColumn);
                var isLastColumn = column === Math.floor(unitsToDraw / maxUnitsPerColumn);

                var zPos;
                if (isLastColumn) {
                    var maxUnitsInThisColumn = unitsToDraw % maxUnitsPerColumn;
                    if (maxUnitsInThisColumn === 1) {
                        zPos = (maxUnitsPerColumn - 1) / 2;
                    } else {
                        var positionInLastColumn = i % maxUnitsInThisColumn;
                        zPos = positionInLastColumn * ((maxUnitsPerColumn - 1) / (maxUnitsInThisColumn - 1));
                    }
                } else {
                    zPos = i % maxUnitsPerColumn;
                }

                var xOffset = Math.sin(Math.PI / (maxUnitsPerColumn + 1) * (zPos + 1));
                if (isConvex) {
                    xOffset = 1 - xOffset;
                }

                xOffset -= minXOffset;

                var scale = 1 - zPos * props.scalingFactor;
                var scaledWidth = image.width * scale;
                var scaledHeight = image.height * scale;

                var x = xOffset * scaledWidth * degree + column * (scaledWidth + xDistance * scale);
                var y = (scaledHeight + zDistance * scale) * (maxUnitsPerColumn - zPos);

                var translated = transformMat3({ x: x, y: y }, rotationMatrix);

                x = Math.round(translated.x);
                y = Math.round(translated.y);

                xMin = isFinite(xMin) ? Math.min(x, xMin) : x;
                xMax = isFinite(xMax) ? Math.max(x + scaledWidth, xMax) : x + scaledWidth;
                yMin = isFinite(yMin) ? Math.min(y, yMin) : y;
                yMax = isFinite(yMax) ? Math.max(y + scaledHeight, yMax) : y + scaledHeight;

                ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
            }

            var resultCanvas = document.createElement("canvas");

            resultCanvas.width = xMax - xMin;
            if (props.maxWidth) {
                resultCanvas.width = Math.min(props.maxWidth, resultCanvas.width);
            }

            resultCanvas.height = yMax - yMin;
            if (props.maxHeight) {
                resultCanvas.height = Math.min(props.maxHeight, resultCanvas.height);
            }

            var resultCtx = resultCanvas.getContext("2d");

            // flip horizontally
            if (props.facesRight) {
                resultCtx.translate(resultCanvas.width, 0);
                resultCtx.scale(-1, 1);
            }
            resultCtx.drawImage(canvas, -xMin, -yMin);

            return resultCanvas;
        };
        Unit.prototype.serialize = function (includeItems) {
            if (typeof includeItems === "undefined") { includeItems = true; }
            var data = {};

            data.templateType = this.template.type;
            data.id = this.id;
            data.name = this.name;

            data.maxStrength = this.maxStrength;
            data.currentStrength = this.currentStrength;

            data.currentMovePoints = this.currentMovePoints;
            data.maxMovePoints = this.maxMovePoints;

            data.timesActedThisTurn = this.timesActedThisTurn;

            data.baseAttributes = Rance.cloneObject(this.baseAttributes);

            data.battleStats = {};
            data.battleStats.moveDelay = this.battleStats.moveDelay;
            data.battleStats.side = this.battleStats.side;
            data.battleStats.position = this.battleStats.position;
            data.battleStats.currentActionPoints = this.battleStats.currentActionPoints;
            data.battleStats.guardAmount = this.battleStats.guardAmount;
            data.battleStats.guardCoverage = this.battleStats.guardCoverage;
            data.battleStats.captureChance = this.battleStats.captureChance;

            if (this.fleet) {
                data.fleetId = this.fleet.id;
            }

            data.items = {};

            if (includeItems) {
                for (var slot in this.items) {
                    if (this.items[slot])
                        data.items[slot] = this.items[slot].serialize();
                }
            }

            return data;
        };
        Unit.prototype.makeVirtualClone = function () {
            var data = this.serialize();
            var clone = new Unit(this.template, this.id, data);

            return clone;
        };
        return Unit;
    })();
    Rance.Unit = Unit;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BuildableShip = React.createClass({
            displayName: "BuildableShip",
            makeCell: function (type) {
                var cellProps = {};
                cellProps.key = type;
                cellProps.className = "buildable-ship-list-item-cell " + type;

                var cellContent;

                switch (type) {
                    case ("buildCost"): {
                        if (this.props.player.money < this.props.buildCost) {
                            cellProps.className += " negative";
                        }
                    }
                    default: {
                        cellContent = this.props[type];
                        break;
                    }
                }

                return (React.DOM.td(cellProps, cellContent));
            },
            render: function () {
                var player = this.props.player;
                var cells = [];
                var columns = this.props.activeColumns;

                for (var i = 0; i < columns.length; i++) {
                    cells.push(this.makeCell(columns[i].key));
                }

                var props = {
                    className: "buildable-item buildable-ship",
                    onClick: this.props.handleClick
                };
                if (player.money < this.props.buildCost) {
                    props.onClick = null;
                    props.disabled = true;
                    props.className += " disabled";
                }

                return (React.DOM.tr(props, cells));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../../unit.ts" />
/// <reference path="../../fleet.ts" />
/// <reference path="../unitlist/list.ts" />
/// <reference path="buildableship.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BuildableShipsList = React.createClass({
            displayName: "BuildableShipsList",
            getInitialState: function () {
                return ({
                    shipTemplates: this.props.player.getBuildableShips()
                });
            },
            buildShip: function (rowItem) {
                var template = rowItem.data.template;

                var ship = new Rance.Unit(template);
                this.props.player.addUnit(ship);

                var fleet = new Rance.Fleet(this.props.player, [ship], this.props.star);

                this.props.player.money -= template.buildCost;

                Rance.eventManager.dispatchEvent("playerControlUpdated");
            },
            render: function () {
                if (this.state.shipTemplates.length < 1)
                    return null;
                var rows = [];

                for (var i = 0; i < this.state.shipTemplates.length; i++) {
                    var template = this.state.shipTemplates[i];

                    var data = {
                        template: template,
                        typeName: template.typeName,
                        buildCost: template.buildCost,
                        player: this.props.player,
                        rowConstructor: Rance.UIComponents.BuildableShip
                    };

                    rows.push({
                        key: i,
                        data: data
                    });
                }

                var columns = [
                    {
                        label: "Name",
                        key: "typeName",
                        defaultOrder: "asc"
                    },
                    {
                        label: "Cost",
                        key: "buildCost",
                        defaultOrder: "desc"
                    }
                ];

                return (React.DOM.div({ className: "buildable-item-list buildable-ship-list" }, Rance.UIComponents.List({
                    listItems: rows,
                    initialColumns: columns,
                    onRowChange: this.buildShip
                })));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
// /// <reference path="buildingupgradelistitem.ts" />
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BuildingUpgradeList = React.createClass({
            displayName: "BuildingUpgradeList",
            upgradeBuilding: function (upgradeData) {
                var star = upgradeData.parentBuilding.location;

                console.log(upgradeData);
                var newBuilding = new Rance.Building({
                    template: upgradeData.template,
                    location: star,
                    controller: upgradeData.parentBuilding.controller,
                    upgradeLevel: upgradeData.level,
                    totalCost: upgradeData.parentBuilding.totalCost + upgradeData.cost
                });

                star.removeBuilding(upgradeData.parentBuilding);
                star.addBuilding(newBuilding);

                upgradeData.parentBuilding.controller.money -= upgradeData.cost;

                Rance.eventManager.dispatchEvent("playerControlUpdated");
            },
            render: function () {
                var possibleUpgrades = this.props.star.getBuildingUpgrades();
                if (Object.keys(possibleUpgrades).length < 1)
                    return null;

                var upgradeGroups = [];

                for (var parentBuildingId in possibleUpgrades) {
                    var upgrades = possibleUpgrades[parentBuildingId];
                    var parentBuilding = upgrades[0].parentBuilding;

                    var upgradeElements = [];

                    for (var i = 0; i < upgrades.length; i++) {
                        var upgrade = upgrades[i];

                        var rowProps = {
                            key: upgrade.template.type,
                            className: "building-upgrade-list-item",
                            onClick: this.upgradeBuilding.bind(this, upgrade)
                        };

                        var costProps = {
                            key: "cost",
                            className: "building-upgrade-list-item-cost"
                        };

                        if (this.props.player.money < upgrade.cost) {
                            rowProps.onClick = null;
                            rowProps.disabled = true;
                            rowProps.className += " disabled";

                            costProps.className += " negative";
                        }

                        upgradeElements.push(React.DOM.tr(rowProps, React.DOM.td({
                            key: "name",
                            className: "building-upgrade-list-item-name"
                        }, upgrade.template.name + " " + upgrade.level), React.DOM.td(costProps, upgrade.cost)));
                    }

                    var parentElement = React.DOM.div({
                        key: parentBuilding.id,
                        className: "building-upgrade-group"
                    }, React.DOM.div({
                        className: "building-upgrade-group-header"
                    }, parentBuilding.template.name), React.DOM.table({
                        className: "buildable-item-list"
                    }, React.DOM.tbody({}, upgradeElements)));

                    upgradeGroups.push(parentElement);
                }

                return (React.DOM.ul({
                    className: "building-upgrade-list"
                }, upgradeGroups));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="attacktarget.ts"/>
/// <reference path="buildablebuildinglist.ts"/>
/// <reference path="buildableshipslist.ts"/>
/// <reference path="buildingupgradelist.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.PossibleActions = React.createClass({
            displayName: "PossibleActions",
            getInitialState: function () {
                return ({
                    expandedAction: null,
                    expandedActionElement: null
                });
            },
            componentWillReceiveProps: function (newProps) {
                if (this.props.selectedStar !== newProps.selectedStar && this.state.expandedActionElement) {
                    this.setState({
                        expandedAction: null,
                        expandedActionElement: null
                    });
                }
            },
            componentDidMount: function () {
                var self = this;
                Rance.eventManager.addEventListener("clearPossibleActions", function () {
                    self.setState({
                        expandedAction: null,
                        expandedActionElement: null
                    });
                });
            },
            componentWillUnmount: function () {
                Rance.eventManager.removeAllListeners("clearPossibleActions");
            },
            buildBuildings: function () {
                if (!this.props.selectedStar || this.state.expandedAction === "buildBuildings") {
                    this.setState({
                        expandedAction: null,
                        expandedActionElement: null
                    });
                } else {
                    var element = React.DOM.div({
                        className: "expanded-action"
                    }, Rance.UIComponents.BuildableBuildingList({
                        player: this.props.player,
                        star: this.props.selectedStar
                    }));

                    this.setState({
                        expandedAction: "buildBuildings",
                        expandedActionElement: element
                    });
                }
            },
            buildShips: function () {
                if (!this.props.selectedStar || this.state.expandedAction === "buildShips") {
                    this.setState({
                        expandedAction: null,
                        expandedActionElement: null
                    });
                } else {
                    var element = React.DOM.div({
                        className: "expanded-action"
                    }, Rance.UIComponents.BuildableShipsList({
                        player: this.props.player,
                        star: this.props.selectedStar
                    }));

                    this.setState({
                        expandedAction: "buildShips",
                        expandedActionElement: element
                    });
                }
            },
            upgradeBuildings: function () {
                if (!this.props.selectedStar || this.state.expandedAction === "upgradeBuildings") {
                    this.setState({
                        expandedAction: null,
                        expandedActionElement: null
                    });
                } else {
                    var element = React.DOM.div({
                        className: "expanded-action"
                    }, Rance.UIComponents.BuildingUpgradeList({
                        player: this.props.player,
                        star: this.props.selectedStar
                    }));

                    this.setState({
                        expandedAction: "upgradeBuildings",
                        expandedActionElement: element
                    });
                }
            },
            render: function () {
                var allActions = [];

                var attackTargets = this.props.attackTargets;
                if (attackTargets && attackTargets.length > 0) {
                    var attackTargetComponents = [];
                    for (var i = 0; i < attackTargets.length; i++) {
                        var props = {
                            key: i,
                            attackTarget: attackTargets[i]
                        };

                        attackTargetComponents.push(Rance.UIComponents.AttackTarget(props));
                    }
                    allActions.push(React.DOM.div({
                        className: "possible-action",
                        key: "attackActions"
                    }, React.DOM.div({ className: "possible-action-title" }, "attack"), attackTargetComponents));
                }

                var star = this.props.selectedStar;
                if (star) {
                    if (star.owner === this.props.player) {
                        allActions.push(React.DOM.div({
                            className: "possible-action",
                            onClick: this.buildShips,
                            key: "buildShipActions"
                        }, "build ship"));

                        if (star.getBuildableBuildings().length > 0) {
                            allActions.push(React.DOM.div({
                                className: "possible-action",
                                onClick: this.buildBuildings,
                                key: "buildActions"
                            }, "construct"));
                        }

                        if (Object.keys(star.getBuildingUpgrades()).length > 0) {
                            allActions.push(React.DOM.div({
                                className: "possible-action",
                                onClick: this.upgradeBuildings,
                                key: "upgradeActions"
                            }, "upgrade"));
                        }
                    }
                }

                var possibleActions = React.DOM.div({
                    className: "possible-actions"
                }, allActions);

                return (React.DOM.div({
                    className: "possible-actions-container"
                }, allActions.length > 0 ? possibleActions : null, this.state.expandedActionElement));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="topmenu.ts"/>
/// <reference path="topbar.ts"/>
/// <reference path="fleetselection.ts"/>
/// <reference path="fleetreorganization.ts"/>
/// <reference path="starinfo.ts"/>
/// <reference path="../possibleactions/possibleactions.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.GalaxyMapUI = React.createClass({
            displayName: "GalaxyMapUI",
            endTurn: function () {
                this.props.game.endTurn();
            },
            getInitialState: function () {
                var pc = this.props.playerControl;

                return ({
                    selectedFleets: pc.selectedFleets,
                    currentlyReorganizing: pc.currentlyReorganizing,
                    selectedStar: pc.selectedStar,
                    attackTargets: pc.currentAttackTargets
                });
            },
            updateSelection: function () {
                var pc = this.props.playerControl;

                var star = null;
                if (pc.selectedStar)
                    star = pc.selectedStar;
                else if (pc.areAllFleetsInSameLocation()) {
                    star = pc.selectedFleets[0].location;
                }
                ;

                this.setState({
                    selectedFleets: pc.selectedFleets,
                    currentlyReorganizing: pc.currentlyReorganizing,
                    selectedStar: star,
                    attackTargets: pc.currentAttackTargets
                });
            },
            closeReorganization: function () {
                Rance.eventManager.dispatchEvent("endReorganizingFleets");
                this.updateSelection();
            },
            render: function () {
                return (React.DOM.div({
                    className: "galaxy-map-ui"
                }, React.DOM.div({
                    className: "galaxy-map-ui-top"
                }, Rance.UIComponents.TopBar({
                    player: this.props.player,
                    game: this.props.game
                }), Rance.UIComponents.TopMenu({
                    player: this.props.player
                }), React.DOM.div({
                    className: "fleet-selection-container"
                }, Rance.UIComponents.FleetSelection({
                    selectedFleets: this.state.selectedFleets
                }), Rance.UIComponents.FleetReorganization({
                    fleets: this.state.currentlyReorganizing,
                    closeReorganization: this.closeReorganization
                }))), React.DOM.div({
                    className: "galaxy-map-ui-bottom-left"
                }, Rance.UIComponents.PossibleActions({
                    attackTargets: this.state.attackTargets,
                    selectedStar: this.state.selectedStar,
                    player: this.props.player
                }), Rance.UIComponents.StarInfo({
                    selectedStar: this.state.selectedStar
                })), React.DOM.button({
                    className: "end-turn-button",
                    onClick: this.endTurn
                }, "End turn")));
            },
            componentWillMount: function () {
                Rance.eventManager.addEventListener("playerControlUpdated", this.updateSelection);
            },
            componentWillUnmount: function () {
                Rance.eventManager.removeEventListener("playerControlUpdated", this.updateSelection);
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../popups/popupmanager.ts"/>
/// <reference path="galaxymapui.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.GalaxyMap = React.createClass({
            displayName: "GalaxyMap",
            switchMapMode: function () {
                var newMode = this.refs.mapModeSelector.getDOMNode().value;

                this.props.galaxyMap.mapRenderer.setMapMode(newMode);
            },
            render: function () {
                return (React.DOM.div({
                    className: "galaxy-map"
                }, Rance.UIComponents.PopupManager(), React.DOM.div({
                    ref: "pixiContainer",
                    id: "pixi-container"
                }, Rance.UIComponents.GalaxyMapUI({
                    playerControl: this.props.playerControl,
                    player: this.props.player,
                    game: this.props.game
                })), React.DOM.select({
                    className: "reactui-selector",
                    ref: "mapModeSelector",
                    onChange: this.switchMapMode
                }, React.DOM.option({ value: "default" }, "default"), React.DOM.option({ value: "noStatic" }, "no static layers"), React.DOM.option({ value: "income" }, "income"), React.DOM.option({ value: "influence" }, "influence"), React.DOM.option({ value: "sectors" }, "sectors"), React.DOM.option({ value: "regions" }, "regions"))));
            },
            componentDidMount: function () {
                this.props.renderer.isBattleBackground = false;
                this.props.renderer.bindRendererView(this.refs.pixiContainer.getDOMNode());
                this.props.galaxyMap.mapRenderer.setMapMode("default");

                this.props.renderer.resume();

                this.props.renderer.camera.centerOnPosition(this.props.galaxyMap.game.humanPlayer.controlledLocations[0]);
            },
            componentWillUnmount: function () {
                this.props.renderer.pause();
                this.props.renderer.removeRendererView();
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.FlagMaker = React.createClass({
            makeFlags: function (delay) {
                if (typeof delay === "undefined") { delay = 0; }
                var flags = [];
                var parent = this.refs.flags.getDOMNode();

                while (parent.lastChild) {
                    parent.removeChild(parent.lastChild);
                }

                for (var i = 0; i < 100; i++) {
                    var colorScheme = Rance.generateColorScheme();

                    var flag = new Rance.Flag({
                        width: 46,
                        mainColor: colorScheme.main,
                        secondaryColor: colorScheme.secondary
                    });

                    flag.generateRandom();

                    var canvas = flag.draw();

                    flags.push(flag);
                }

                function makeHslStringFromHex(hex) {
                    var hsl = Rance.hexToHsv(hex);

                    hsl = Rance.colorFromScalars(hsl);
                    hsl = hsl.map(function (v) {
                        return v.toFixed();
                    });

                    return hsl.join(", ");
                }

                window.setTimeout(function (e) {
                    for (var i = 0; i < flags.length; i++) {
                        var canvas = flags[i].draw();
                        parent.appendChild(canvas);

                        canvas.setAttribute("title", "bgColor: " + makeHslStringFromHex(flags[i].mainColor) + "\n" + "emblemColor: " + makeHslStringFromHex(flags[i].secondaryColor) + "\n");

                        canvas.onclick = function (e) {
                            console.log(Rance.hexToHusl(this.mainColor));
                            console.log(Rance.hexToHusl(this.secondaryColor));
                        }.bind(flags[i]);
                    }
                }, delay);
            },
            componentDidMount: function () {
                this.makeFlags();
            },
            render: function () {
                return (React.DOM.div(null, React.DOM.div({
                    className: "flags",
                    ref: "flags"
                }), React.DOM.button({
                    onClick: this.makeFlags
                }, "make flags")));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.BattleSceneTester = React.createClass({
            displayName: "BattleSceneTester",
            initialValues: {
                zDistance: 5,
                xDistance: 5,
                unitsToDraw: 5,
                maxUnitsPerColumn: 5,
                degree: -0.5,
                rotationAngle: 60,
                scalingFactor: 0.02,
                facesRight: true
            },
            componentDidMount: function () {
                var unit = app.humanPlayer.getAllUnits()[0];
                var image = new Image();
                image.src = "img\/ships\/testShip.png";
                image.onload = this.renderScene;
            },
            renderScene: function () {
                var unit = app.humanPlayer.getAllUnits()[0];
                var canvas = unit.drawBattleScene({
                    zDistance: Number(this.refs["zDistance"].getDOMNode().value),
                    xDistance: Number(this.refs["xDistance"].getDOMNode().value),
                    unitsToDraw: Number(this.refs["unitsToDraw"].getDOMNode().value),
                    maxUnitsPerColumn: Number(this.refs["maxUnitsPerColumn"].getDOMNode().value),
                    degree: Number(this.refs["degree"].getDOMNode().value),
                    rotationAngle: Number(this.refs["rotationAngle"].getDOMNode().value),
                    scalingFactor: Number(this.refs["scalingFactor"].getDOMNode().value),
                    facesRight: this.refs["facesRight"].getDOMNode().checked
                });

                var container = this.refs["canvasContainer"].getDOMNode();
                while (container.firstChild) {
                    container.removeChild(container.firstChild);
                }

                container.appendChild(canvas);
            },
            resetValues: function () {
                for (var prop in this.initialValues) {
                    var element = this.refs[prop].getDOMNode();
                    element.value = this.initialValues[prop];
                }

                this.renderScene();
            },
            render: function () {
                return (React.DOM.div({
                    style: {
                        display: "flex"
                    }
                }, React.DOM.div({ ref: "canvasContainer", style: { flex: 1 } }, null), React.DOM.div({
                    style: {
                        display: "flex",
                        flexFlow: "column"
                    }
                }, React.DOM.label(null, React.DOM.input({
                    ref: "zDistance",
                    type: "number",
                    defaultValue: this.initialValues["zDistance"],
                    onChange: this.renderScene
                }, "zDistance")), React.DOM.label(null, React.DOM.input({
                    ref: "xDistance",
                    type: "number",
                    defaultValue: this.initialValues["xDistance"],
                    onChange: this.renderScene
                }, "xDistance")), React.DOM.label(null, React.DOM.input({
                    ref: "unitsToDraw",
                    type: "number",
                    defaultValue: this.initialValues["unitsToDraw"],
                    onChange: this.renderScene
                }, "unitsToDraw")), React.DOM.label(null, React.DOM.input({
                    ref: "maxUnitsPerColumn",
                    type: "number",
                    defaultValue: this.initialValues["maxUnitsPerColumn"],
                    onChange: this.renderScene
                }, "maxUnitsPerColumn")), React.DOM.label(null, React.DOM.input({
                    ref: "degree",
                    type: "number",
                    defaultValue: this.initialValues["degree"],
                    min: -10,
                    max: 10,
                    step: 0.05,
                    onChange: this.renderScene
                }, "degree")), React.DOM.label(null, React.DOM.input({
                    ref: "rotationAngle",
                    type: "number",
                    defaultValue: this.initialValues["rotationAngle"],
                    onChange: this.renderScene
                }, "rotationAngle")), React.DOM.label(null, React.DOM.input({
                    ref: "scalingFactor",
                    type: "number",
                    defaultValue: this.initialValues["scalingFactor"],
                    max: 1,
                    step: 0.005,
                    onChange: this.renderScene
                }, "scalingFactor")), React.DOM.label(null, React.DOM.input({
                    ref: "facesRight",
                    type: "checkBox",
                    onChange: this.renderScene
                }, "facesRight")), React.DOM.button({
                    onClick: this.resetValues
                }, "Reset"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../../lib/react.d.ts" />
/// <reference path="battle/battle.ts"/>
/// <reference path="unitlist/unitlist.ts"/>
/// <reference path="unitlist/itemequip.ts"/>
/// <reference path="battleprep/battleprep.ts"/>
/// <reference path="galaxymap/galaxymap.ts"/>
/// <reference path="flagmaker.ts"/>
/// <reference path="battlescenetester.ts"/>
var Rance;
(function (Rance) {
    (function (UIComponents) {
        UIComponents.Stage = React.createClass({
            displayName: "Stage",
            changeScene: function () {
                var newScene = this.refs.sceneSelector.getDOMNode().value;

                this.props.changeSceneFunction(newScene);
            },
            render: function () {
                var elementsToRender = [];

                switch (this.props.sceneToRender) {
                    case "battle": {
                        elementsToRender.push(Rance.UIComponents.Battle({
                            battle: this.props.battle,
                            humanPlayer: this.props.player,
                            renderer: this.props.renderer,
                            key: "battle"
                        }));
                        break;
                    }
                    case "itemEquip": {
                        elementsToRender.push(Rance.UIComponents.ItemEquip({
                            player: this.props.player,
                            key: "itemEquip"
                        }));
                        break;
                    }
                    case "battlePrep": {
                        elementsToRender.push(Rance.UIComponents.BattlePrep({
                            battlePrep: this.props.battlePrep,
                            key: "battlePrep"
                        }));
                        break;
                    }
                    case "galaxyMap": {
                        elementsToRender.push(Rance.UIComponents.GalaxyMap({
                            renderer: this.props.renderer,
                            galaxyMap: this.props.galaxyMap,
                            playerControl: this.props.playerControl,
                            player: this.props.player,
                            game: this.props.game,
                            key: "galaxyMap"
                        }));
                        break;
                    }
                    case "flagMaker": {
                        elementsToRender.push(Rance.UIComponents.FlagMaker({
                            key: "flagMaker"
                        }));
                        break;
                    }
                    case "battleScene": {
                        elementsToRender.push(Rance.UIComponents.BattleSceneTester({
                            key: "battleScene"
                        }));
                        break;
                    }
                }
                return (React.DOM.div({ className: "react-stage" }, elementsToRender, React.DOM.select({
                    className: "reactui-selector",
                    ref: "sceneSelector",
                    value: this.props.sceneToRender,
                    onChange: this.changeScene
                }, React.DOM.option({ value: "galaxyMap" }, "map"), React.DOM.option({ value: "itemEquip" }, "equip items"), React.DOM.option({ value: "battlePrep" }, "battle setup"), React.DOM.option({ value: "battle" }, "battle"), React.DOM.option({ value: "flagMaker" }, "make flags"), React.DOM.option({ value: "battleScene" }, "battle scene test"))));
            }
        });
    })(Rance.UIComponents || (Rance.UIComponents = {}));
    var UIComponents = Rance.UIComponents;
})(Rance || (Rance = {}));
/// <reference path="../../lib/react.d.ts" />
/// <reference path="../eventmanager.ts"/>
/// <reference path="stage.ts"/>
var Rance;
(function (Rance) {
    var ReactUI = (function () {
        function ReactUI(container) {
            this.container = container;
            this.addEventListeners();
        }
        ReactUI.prototype.addEventListeners = function () {
            this.switchSceneFN = function (e) {
                this.switchScene(e.data);
            }.bind(this);

            Rance.eventManager.addEventListener("switchScene", this.switchSceneFN);
        };
        ReactUI.prototype.switchScene = function (newScene) {
            this.currentScene = newScene;
            this.render();
        };
        ReactUI.prototype.destroy = function () {
            Rance.eventManager.removeEventListener("switchScene", this.switchSceneFN);
            React.unmountComponentAtNode(this.container);
            this.stage = null;
            this.container = null;
        };
        ReactUI.prototype.render = function () {
            this.stage = React.renderComponent(Rance.UIComponents.Stage({
                sceneToRender: this.currentScene,
                changeSceneFunction: this.switchScene.bind(this),
                battle: this.battle,
                battlePrep: this.battlePrep,
                renderer: this.renderer,
                galaxyMap: this.galaxyMap,
                playerControl: this.playerControl,
                player: this.player,
                game: this.game
            }), this.container);
        };
        return ReactUI;
    })();
    Rance.ReactUI = ReactUI;
})(Rance || (Rance = {}));
/// <reference path="eventmanager.ts"/>
/// <reference path="player.ts"/>
/// <reference path="fleet.ts"/>
/// <reference path="star.ts"/>
/// <reference path="battledata.ts"/>
var Rance;
(function (Rance) {
    var PlayerControl = (function () {
        function PlayerControl(player) {
            this.selectedFleets = [];
            this.currentlyReorganizing = [];
            this.preventingGhost = false;
            this.listeners = {};
            this.player = player;
            this.addEventListeners();
        }
        PlayerControl.prototype.removeEventListener = function (name) {
            Rance.eventManager.removeEventListener(name, this.listeners[name]);
        };
        PlayerControl.prototype.removeEventListeners = function () {
            for (var name in this.listeners) {
                this.removeEventListener(name);
            }
        };
        PlayerControl.prototype.addEventListener = function (name, handler) {
            this.listeners[name] = handler;

            Rance.eventManager.addEventListener(name, handler);
        };
        PlayerControl.prototype.addEventListeners = function () {
            var self = this;

            this.addEventListener("updateSelection", function (e) {
                self.updateSelection();
            });

            this.addEventListener("selectFleets", function (e) {
                self.selectFleets(e.data);
            });
            this.addEventListener("deselectFleet", function (e) {
                self.deselectFleet(e.data);
            });
            this.addEventListener("mergeFleets", function (e) {
                self.mergeFleets();
            });

            this.addEventListener("splitFleet", function (e) {
                self.splitFleet(e.data);
            });
            this.addEventListener("startReorganizingFleets", function (e) {
                self.startReorganizingFleets(e.data);
            });
            this.addEventListener("endReorganizingFleets", function (e) {
                self.endReorganizingFleets();
            });

            this.addEventListener("starClick", function (e) {
                self.selectStar(e.data);
            });
            this.addEventListener("starRightClick", function (e) {
                self.moveFleets(e.data);
            });

            this.addEventListener("setRectangleSelectTargetFN", function (e) {
                e.data.getSelectionTargetsFN = self.player.getFleetsWithPositions.bind(self.player);
            });

            this.addEventListener("attackTarget", function (e) {
                self.attackTarget(e.data);
            });
        };
        PlayerControl.prototype.preventGhost = function (delay) {
            this.preventingGhost = true;
            var self = this;
            var timeout = window.setTimeout(function () {
                self.preventingGhost = false;
                window.clearTimeout(timeout);
            }, delay);
        };
        PlayerControl.prototype.clearSelection = function () {
            this.selectedFleets = [];
            this.selectedStar = null;
        };
        PlayerControl.prototype.updateSelection = function (endReorganizingFleets) {
            if (typeof endReorganizingFleets === "undefined") { endReorganizingFleets = true; }
            if (endReorganizingFleets)
                this.endReorganizingFleets();
            this.currentAttackTargets = this.getCurrentAttackTargets();

            Rance.eventManager.dispatchEvent("playerControlUpdated", null);
            Rance.eventManager.dispatchEvent("clearPossibleActions", null);
        };

        PlayerControl.prototype.areAllFleetsInSameLocation = function () {
            if (this.selectedFleets.length <= 0)
                return false;

            for (var i = 1; i < this.selectedFleets.length; i++) {
                if (this.selectedFleets[i].location !== this.selectedFleets[i - 1].location) {
                    return false;
                }
            }

            return true;
        };
        PlayerControl.prototype.selectFleets = function (fleets) {
            this.clearSelection();

            for (var i = 0; i < fleets.length; i++) {
                if (fleets[i].ships.length < 1) {
                    if (this.currentlyReorganizing.indexOf(fleets[i]) >= 0)
                        continue;
                    fleets[i].deleteFleet();
                    fleets.splice(i, 1);
                }
            }

            var oldFleets = this.selectedFleets.slice(0);

            this.selectedFleets = fleets;

            if (true || !Rance.arraysEqual(fleets, oldFleets)) {
                this.updateSelection();
            }

            if (fleets.length > 0) {
                this.preventGhost(15);
            }
        };
        PlayerControl.prototype.deselectFleet = function (fleet) {
            var fleetIndex = this.selectedFleets.indexOf(fleet);

            if (fleetIndex < 0)
                return;

            this.selectedFleets.splice(fleetIndex, 1);

            this.updateSelection();
        };
        PlayerControl.prototype.getMasterFleetForMerge = function () {
            return this.selectedFleets[0];
        };
        PlayerControl.prototype.mergeFleets = function () {
            var fleets = this.selectedFleets;
            var master = this.getMasterFleetForMerge();

            fleets.splice(fleets.indexOf(master), 1);
            var slaves = fleets;

            for (var i = 0; i < slaves.length; i++) {
                slaves[i].mergeWith(master);
            }

            this.clearSelection();
            this.selectedFleets = [master];
            this.updateSelection();
        };
        PlayerControl.prototype.selectStar = function (star) {
            if (this.preventingGhost)
                return;
            this.clearSelection();

            this.selectedStar = star;

            this.updateSelection();
        };
        PlayerControl.prototype.moveFleets = function (star) {
            for (var i = 0; i < this.selectedFleets.length; i++) {
                this.selectedFleets[i].pathFind(star);
            }
        };
        PlayerControl.prototype.splitFleet = function (fleet) {
            if (fleet.ships.length <= 0)
                return;
            this.endReorganizingFleets();
            var newFleet = fleet.split();

            this.currentlyReorganizing = [fleet, newFleet];
            this.selectedFleets = [fleet, newFleet];

            this.updateSelection(false);
        };
        PlayerControl.prototype.startReorganizingFleets = function (fleets) {
            if (fleets.length !== 2 || fleets[0].location !== fleets[1].location || this.selectedFleets.length !== 2 || this.selectedFleets.indexOf(fleets[0]) < 0 || this.selectedFleets.indexOf(fleets[1]) < 0) {
                throw new Error("cant reorganize fleets");
            }
            this.currentlyReorganizing = fleets;

            this.updateSelection(false);
        };
        PlayerControl.prototype.endReorganizingFleets = function () {
            for (var i = 0; i < this.currentlyReorganizing.length; i++) {
                var fleet = this.currentlyReorganizing[i];
                if (fleet.ships.length <= 0) {
                    var selectedIndex = this.selectedFleets.indexOf(fleet);
                    if (selectedIndex >= 0) {
                        this.selectedFleets.splice(selectedIndex, 1);
                    }
                    fleet.deleteFleet();
                }
            }
            this.currentlyReorganizing = [];
        };
        PlayerControl.prototype.getCurrentAttackTargets = function () {
            if (this.selectedFleets.length < 1)
                return [];
            if (!this.areAllFleetsInSameLocation())
                return [];

            var location = this.selectedFleets[0].location;
            var possibleTargets = location.getTargetsForPlayer(this.player);

            return possibleTargets;
        };

        PlayerControl.prototype.attackTarget = function (target) {
            if (this.currentAttackTargets.indexOf(target) < 0)
                return false;

            var currentLocation = this.selectedFleets[0].location;

            var battleData = {
                location: currentLocation,
                building: target.building,
                attacker: {
                    player: this.player,
                    ships: currentLocation.getAllShipsOfPlayer(this.player)
                },
                defender: {
                    player: target.enemy,
                    ships: target.ships
                }
            };

            // TODO
            var battlePrep = new Rance.BattlePrep(this.player, battleData);
            this.reactUI.battlePrep = battlePrep;
            this.reactUI.switchScene("battlePrep");
        };
        return PlayerControl;
    })();
    Rance.PlayerControl = PlayerControl;
})(Rance || (Rance = {}));
/// <reference path="unit.ts"/>
/// <reference path="player.ts"/>
/// <reference path="battle.ts"/>
/// <reference path="battledata.ts"/>
var Rance;
(function (Rance) {
    var BattlePrep = (function () {
        function BattlePrep(player, battleData) {
            this.alreadyPlaced = {};
            this.player = player;
            this.battleData = battleData;

            this.fleet = this.makeEmptyFleet();

            this.setAvailableUnits();
        }
        BattlePrep.prototype.setAvailableUnits = function () {
            if (this.battleData.attacker.player === this.player) {
                this.availableUnits = this.battleData.attacker.ships;
                this.enemy = this.battleData.defender.player;
                this.enemyUnits = this.battleData.defender.ships;
            } else {
                this.availableUnits = this.battleData.defender.ships;
                this.enemy = this.battleData.attacker.player;
                this.enemyUnits = this.battleData.attacker.ships;
            }
        };
        BattlePrep.prototype.makeEmptyFleet = function () {
            var COLUMNS_PER_FLEET = 2;
            var SHIPS_PER_COLUMN = 3;

            var fleet = [];
            for (var i = 0; i < COLUMNS_PER_FLEET; i++) {
                var column = [];
                for (var j = 0; j < SHIPS_PER_COLUMN; j++) {
                    column.push(null);
                }
                fleet.push(column);
            }

            return fleet;
        };

        // TODO
        BattlePrep.prototype.makeEnemyFleet = function () {
            var fleet = this.makeEmptyFleet();

            for (var i = 0; i < this.enemyUnits.length; i++) {
                var d = Rance.divmod(i, 3);

                if (d[0] > 1)
                    break;

                fleet[d[0]][d[1]] = this.enemyUnits[i];
            }

            return fleet;
        };

        BattlePrep.prototype.getUnitPosition = function (unit) {
            return this.alreadyPlaced[unit.id];
        };
        BattlePrep.prototype.getUnitAtPosition = function (position) {
            return this.fleet[position[0]][position[1]];
        };
        BattlePrep.prototype.setUnit = function (unit, position) {
            this.removeUnit(unit);

            if (!position) {
                return;
            }

            var oldUnitInPosition = this.getUnitAtPosition(position);

            if (oldUnitInPosition) {
                this.removeUnit(oldUnitInPosition);
            }

            this.fleet[position[0]][position[1]] = unit;
            this.alreadyPlaced[unit.id] = position;
        };
        BattlePrep.prototype.swapUnits = function (unit1, unit2) {
            if (unit1 === unit2)
                return;

            var new1Pos = this.getUnitPosition(unit2);
            var new2Pos = this.getUnitPosition(unit1);

            this.setUnit(unit1, new1Pos);
            this.setUnit(unit2, new2Pos);
        };
        BattlePrep.prototype.removeUnit = function (unit) {
            var currentPosition = this.getUnitPosition(unit);

            if (!currentPosition)
                return;

            this.fleet[currentPosition[0]][currentPosition[1]] = null;

            this.alreadyPlaced[unit.id] = null;
            delete this.alreadyPlaced[unit.id];
        };

        BattlePrep.prototype.makeBattle = function () {
            var battle = new Rance.Battle({
                battleData: this.battleData,
                side1: this.fleet,
                side2: this.makeEnemyFleet(),
                side1Player: this.player,
                side2Player: this.enemy
            });

            battle.init();

            return battle;
        };
        return BattlePrep;
    })();
    Rance.BattlePrep = BattlePrep;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (Templates) {
        (function (MapGen) {
            MapGen.defaultMap = {
                mapOptions: {
                    width: 600,
                    height: 600
                },
                starGeneration: {
                    galaxyType: "spiral",
                    totalAmount: 40,
                    arms: 5,
                    centerSize: 0.4,
                    amountInCenter: 0.3
                },
                relaxation: {
                    timesToRelax: 5,
                    dampeningFactor: 2
                }
            };
        })(Templates.MapGen || (Templates.MapGen = {}));
        var MapGen = Templates.MapGen;
    })(Rance.Templates || (Rance.Templates = {}));
    var Templates = Rance.Templates;
})(Rance || (Rance = {}));
/// <reference path="point.ts"/>
var Rance;
(function (Rance) {
    var Triangle = (function () {
        function Triangle(a, b, c) {
            this.a = a;
            this.b = b;
            this.c = c;
        }
        Triangle.prototype.getPoints = function () {
            return [this.a, this.b, this.c];
        };
        Triangle.prototype.getCircumCenter = function () {
            if (!this.circumRadius) {
                this.calculateCircumCircle();
            }

            return [this.circumCenterX, this.circumCenterY];
        };
        Triangle.prototype.calculateCircumCircle = function (tolerance) {
            if (typeof tolerance === "undefined") { tolerance = 0.00001; }
            var pA = this.a;
            var pB = this.b;
            var pC = this.c;

            var m1, m2;
            var mx1, mx2;
            var my1, my2;
            var cX, cY;

            if (Math.abs(pB.y - pA.y) < tolerance) {
                m2 = -(pC.x - pB.x) / (pC.y - pB.y);
                mx2 = (pB.x + pC.x) * 0.5;
                my2 = (pB.y + pC.y) * 0.5;

                cX = (pB.x + pA.x) * 0.5;
                cY = m2 * (cX - mx2) + my2;
            } else {
                m1 = -(pB.x - pA.x) / (pB.y - pA.y);
                mx1 = (pA.x + pB.x) * 0.5;
                my1 = (pA.y + pB.y) * 0.5;

                if (Math.abs(pC.y - pB.y) < tolerance) {
                    cX = (pC.x + pB.x) * 0.5;
                    cY = m1 * (cX - mx1) + my1;
                } else {
                    m2 = -(pC.x - pB.x) / (pC.y - pB.y);
                    mx2 = (pB.x + pC.x) * 0.5;
                    my2 = (pB.y + pC.y) * 0.5;

                    cX = (m1 * mx1 - m2 * mx2 + my2 - my1) / (m1 - m2);
                    cY = m1 * (cX - mx1) + my1;
                }
            }

            this.circumCenterX = cX;
            this.circumCenterY = cY;

            mx1 = pB.x - cX;
            my1 = pB.y - cY;
            this.circumRadius = Math.sqrt(mx1 * mx1 + my1 * my1);
        };
        Triangle.prototype.circumCircleContainsPoint = function (point) {
            this.calculateCircumCircle();
            var x = point.x - this.circumCenterX;
            var y = point.y - this.circumCenterY;

            var contains = x * x + y * y <= this.circumRadius * this.circumRadius;

            return (contains);
        };
        Triangle.prototype.getEdges = function () {
            var edges = [
                [this.a, this.b],
                [this.b, this.c],
                [this.c, this.a]
            ];

            return edges;
        };
        Triangle.prototype.getAmountOfSharedVerticesWith = function (toCheckAgainst) {
            var ownPoints = this.getPoints();
            var otherPoints = toCheckAgainst.getPoints();
            var shared = 0;

            for (var i = 0; i < ownPoints.length; i++) {
                if (otherPoints.indexOf(ownPoints[i]) >= 0) {
                    shared++;
                }
            }

            return shared;
        };
        return Triangle;
    })();
    Rance.Triangle = Triangle;
})(Rance || (Rance = {}));
/// <reference path="triangle.ts" />
/// <reference path="point.ts" />
var Rance;
(function (Rance) {
    function triangulate(vertices) {
        var triangles = [];

        var superTriangle = makeSuperTriangle(vertices);
        triangles.push(superTriangle);

        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            var edgeBuffer = [];

            for (var j = 0; j < triangles.length; j++) {
                var triangle = triangles[j];

                if (triangle.circumCircleContainsPoint(vertex)) {
                    var edges = triangle.getEdges();
                    edgeBuffer = edgeBuffer.concat(edges);
                    triangles.splice(j, 1);
                    j--;
                }
            }
            if (i >= vertices.length)
                continue;

            for (var j = edgeBuffer.length - 2; j >= 0; j--) {
                for (var k = edgeBuffer.length - 1; k >= j + 1; k--) {
                    if (edgesEqual(edgeBuffer[k], edgeBuffer[j])) {
                        edgeBuffer.splice(k, 1);
                        edgeBuffer.splice(j, 1);
                        k--;
                        continue;
                    }
                }
            }
            for (var j = 0; j < edgeBuffer.length; j++) {
                var newTriangle = new Rance.Triangle(edgeBuffer[j][0], edgeBuffer[j][1], vertex);

                triangles.push(newTriangle);
            }
        }

        /*
        for (var i = triangles.length - 1; i >= 0; i--)
        {
        if (triangles[i].getAmountOfSharedVerticesWith(superTriangle))
        {
        triangles.splice(i, 1);
        }
        }*/
        return ({
            triangles: triangles,
            superTriangle: superTriangle
        });
    }
    Rance.triangulate = triangulate;

    function voronoiFromTriangles(triangles) {
        var trianglesPerPoint = {};
        var voronoiData = {};

        for (var i = 0; i < triangles.length; i++) {
            var triangle = triangles[i];
            var points = triangle.getPoints();

            for (var j = 0; j < points.length; j++) {
                if (!trianglesPerPoint[points[j]]) {
                    trianglesPerPoint[points[j]] = [];
                    voronoiData[points[j]] = {
                        point: points[j]
                    };
                }

                trianglesPerPoint[points[j]].push(triangle);
            }
        }
        function makeTrianglePairs(triangles) {
            var toMatch = triangles.slice(0);
            var pairs = [];

            for (var i = toMatch.length - 2; i >= 0; i--) {
                for (var j = toMatch.length - 1; j >= i + 1; j--) {
                    var matchingVertices = toMatch[i].getAmountOfSharedVerticesWith(toMatch[j]);

                    if (matchingVertices === 2) {
                        pairs.push([toMatch[j], toMatch[i]]);
                    }
                }
            }

            return pairs;
        }

        for (var point in trianglesPerPoint) {
            var pointTriangles = trianglesPerPoint[point];

            var trianglePairs = makeTrianglePairs(pointTriangles);
            voronoiData[point].lines = [];

            for (var i = 0; i < trianglePairs.length; i++) {
                voronoiData[point].lines.push([
                    trianglePairs[i][0].getCircumCenter(),
                    trianglePairs[i][1].getCircumCenter()
                ]);
            }
        }

        return voronoiData;
    }
    Rance.voronoiFromTriangles = voronoiFromTriangles;

    function getCentroid(vertices) {
        var signedArea = 0;
        var x = 0;
        var y = 0;
        var x0;
        var y0;
        var x1;
        var y1;
        var a;

        var i = 0;

        for (i = 0; i < vertices.length - 1; i++) {
            x0 = vertices[i].x;
            y0 = vertices[i].y;
            x1 = vertices[i + 1].x;
            y1 = vertices[i + 1].y;
            a = x0 * y1 - x1 * y0;
            signedArea += a;
            x += (x0 + x1) * a;
            y += (y0 + y1) * a;
        }

        x0 = vertices[i].x;
        y0 = vertices[i].y;
        x1 = vertices[0].x;
        y1 = vertices[0].y;
        a = x0 * y1 - x1 * y0;
        signedArea += a;
        x += (x0 + x1) * a;
        y += (y0 + y1) * a;

        signedArea *= 0.5;
        x /= (6.0 * signedArea);
        y /= (6.0 * signedArea);

        return ({
            x: x,
            y: y
        });
    }
    Rance.getCentroid = getCentroid;

    function makeSuperTriangle(vertices, highestCoordinateValue) {
        var max;

        if (highestCoordinateValue) {
            max = highestCoordinateValue;
        } else {
            max = vertices[0].x;

            for (var i = 0; i < vertices.length; i++) {
                if (vertices[i].x > max) {
                    max = vertices[i].x;
                }
                if (vertices[i].y > max) {
                    max = vertices[i].y;
                }
            }
        }

        var triangle = new Rance.Triangle({
            x: 3 * max,
            y: 0
        }, {
            x: 0,
            y: 3 * max
        }, {
            x: -3 * max,
            y: -3 * max
        });

        return (triangle);
    }
    Rance.makeSuperTriangle = makeSuperTriangle;

    function pointsEqual(p1, p2) {
        return (p1.x === p2.x && p1.y === p2.y);
    }
    Rance.pointsEqual = pointsEqual;

    function edgesEqual(e1, e2) {
        return ((pointsEqual(e1[0], e2[0]) && pointsEqual(e1[1], e2[1])) || (pointsEqual(e1[0], e2[1]) && pointsEqual(e1[1], e2[0])));
    }
    Rance.edgesEqual = edgesEqual;
})(Rance || (Rance = {}));
/// <reference path="../lib/voronoi.d.ts" />
/// <reference path="../data/templates/mapgentemplates.ts" />
/// <reference path="triangulation.ts" />
/// <reference path="triangle.ts" />
/// <reference path="star.ts" />
/// <reference path="region.ts" />
/// <reference path="sector.ts" />
/// <reference path="utility.ts" />
/// <reference path="pathfinding.ts"/>
var Rance;
(function (Rance) {
    var MapGen = (function () {
        function MapGen() {
            this.points = [];
            this.regions = {};
            this.triangles = [];
            this.nonFillerVoronoiLines = {};
            this.galaxyConstructors = {};
            this.startLocations = [];
            this.galaxyConstructors = {
                spiral: this.makeSpiralPoints
            };
        }
        MapGen.prototype.reset = function () {
            this.points = [];
            this.regions = {};
            this.triangles = [];
            this.voronoiDiagram = null;

            this.nonFillerPoints = [];
            this.nonFillerVoronoiLines = {};
        };
        MapGen.prototype.makeMap = function (options) {
            this.reset();

            this.maxWidth = options.mapOptions.width;
            this.maxHeight = options.mapOptions.height || this.maxWidth;

            this.points = this.generatePoints(options.starGeneration);

            this.makeVoronoi();
            this.relaxPoints(options.relaxation);

            this.triangulate();
            this.severArmLinks();
            this.partiallyCutConnections(4);

            var isConnected = this.isConnected();
            if (!isConnected) {
                return this.makeMap(options);
            }

            this.sectors = this.makeSectors(3, 5);
            this.setResources();

            this.setPlayers();
            this.setDistanceFromStartLocations();

            this.setupPirates();

            return this;
        };
        MapGen.prototype.isConnected = function () {
            var initialPoint = this.getNonFillerPoints()[0];

            return initialPoint.getLinkedInRange(9999).all.length === this.nonFillerPoints.length;
        };
        MapGen.prototype.setPlayers = function () {
            var regionNames = Object.keys(this.regions);
            var startRegions = regionNames.filter(function (name) {
                return name.indexOf("arm") !== -1;
            });

            for (var i = 0; i < this.players.length; i++) {
                var player = this.players[i];
                var regionName = startRegions[i];

                var location = this.getFurthestPointInRegion(this.regions[regionName]);

                location.owner = player;
                player.addStar(location);
                var sectorCommand = new Rance.Building({
                    template: Rance.Templates.Buildings.sectorCommand,
                    location: location
                });
                location.addBuilding(sectorCommand);

                location.addBuilding(new Rance.Building({
                    template: Rance.Templates.Buildings.starBase,
                    location: location
                }));

                this.startLocations.push(location);

                var ship = new Rance.Unit(Rance.Templates.ShipTypes.battleCruiser);
                player.addUnit(ship);

                var fleet = new Rance.Fleet(player, [ship], location);
            }
        };
        MapGen.prototype.setDistanceFromStartLocations = function () {
            var nonFillerPoints = this.getNonFillerPoints();

            for (var i = 0; i < this.startLocations.length; i++) {
                var startLocation = this.startLocations[i];
                for (var j = 0; j < nonFillerPoints.length; j++) {
                    var star = nonFillerPoints[j];

                    var distance = star.getDistanceToStar(startLocation);

                    if (!isFinite(star.distanceFromNearestStartLocation)) {
                        star.distanceFromNearestStartLocation = distance;
                    } else {
                        star.distanceFromNearestStartLocation = Math.min(distance, star.distanceFromNearestStartLocation);
                    }
                }
            }
        };

        MapGen.prototype.setupPirates = function () {
            var nonFillerPoints = this.getNonFillerPoints();
            var minShips = 2;
            var maxShips = 8;
            var player = this.independents;

            for (var i = 0; i < nonFillerPoints.length; i++) {
                var star = nonFillerPoints[i];

                if (!star.owner) {
                    star.owner = player;
                    player.addStar(star);
                    var sectorCommand = new Rance.Building({
                        template: Rance.Templates.Buildings.sectorCommand,
                        location: star
                    });
                    star.addBuilding(sectorCommand);

                    var shipAmount = minShips;
                    var distance = star.distanceFromNearestStartLocation;

                    for (var j = 2; j < distance; j++) {
                        if (shipAmount >= maxShips)
                            break;

                        shipAmount += Rance.randInt(0, 1);
                    }

                    var ships = [];
                    for (var j = 0; j < shipAmount; j++) {
                        var ship = Rance.makeRandomShip();
                        player.addUnit(ship);
                        ships.push(ship);
                    }
                    var fleet = new Rance.Fleet(player, ships, star);
                }
            }
        };

        MapGen.prototype.generatePoints = function (options) {
            var amountInArms = 1 - options.amountInCenter;

            var starGenerationProps = {
                amountPerArm: options.totalAmount / options.arms * amountInArms,
                arms: options.arms,
                amountInCenter: options.totalAmount * options.amountInCenter,
                centerSize: options.centerSize
            };

            var galaxyConstructor = this.galaxyConstructors[options.galaxyType];

            return galaxyConstructor.call(this, starGenerationProps);
        };
        MapGen.prototype.makeRegion = function (name, isFiller) {
            this.regions[name] = new Rance.Region(name, [], isFiller);
            return this.regions[name];
        };
        MapGen.prototype.makeSpiralPoints = function (props) {
            var totalArms = props.arms * 2;
            var amountPerArm = props.amountPerArm;
            var amountPerFillerArm = amountPerArm / 2;

            var amountInCenter = props.amountInCenter;
            var centerThreshhold = props.centerSize || 0.35;

            var points = [];
            var armDistance = Math.PI * 2 / totalArms;
            var armOffsetMax = props.armOffsetMax || 0.5;
            var armRotationFactor = props.arms / 3;
            var galaxyRotation = Rance.randRange(0, Math.PI * 2);
            var minBound = Math.min(this.maxWidth, this.maxHeight);
            var minBound2 = minBound / 2;

            var makePoint = function makePointFN(distanceMin, distanceMax, region, armOffsetMax) {
                var distance = Rance.randRange(distanceMin, distanceMax);
                var offset = Math.random() * armOffsetMax - armOffsetMax / 2;
                offset *= (1 / distance);

                if (offset < 0)
                    offset = Math.pow(offset, 2) * -1;
                else
                    offset = Math.pow(offset, 2);

                var armRotation = distance * armRotationFactor;
                var angle = arm * armDistance + galaxyRotation + offset + armRotation;

                var x = Math.cos(angle) * distance * this.maxWidth + this.maxWidth;
                var y = Math.sin(angle) * distance * this.maxHeight + this.maxHeight;

                var point = new Rance.Star(x, y);

                point.distance = distance;
                region.addStar(point);
                point.baseIncome = Rance.randInt(2, 10) * 10;

                return point;
            }.bind(this);

            var centerRegion = this.makeRegion("center", false);

            var currentArmIsFiller = false;
            for (var i = 0; i < totalArms; i++) {
                var arm = i;
                var regionName = (currentArmIsFiller ? "filler_" : "arm_") + arm;
                var region = this.makeRegion(regionName, currentArmIsFiller);
                var amountForThisArm = currentArmIsFiller ? amountPerFillerArm : amountPerArm;
                var maxOffsetForThisArm = currentArmIsFiller ? armOffsetMax / 2 : armOffsetMax;

                var amountForThisCenter = Math.round(amountInCenter / totalArms);

                for (var j = 0; j < amountForThisArm; j++) {
                    var point = makePoint(centerThreshhold, 1, region, maxOffsetForThisArm);

                    points.push(point);
                }

                for (var j = 0; j < amountForThisCenter; j++) {
                    var point = makePoint(0, centerThreshhold, centerRegion, armOffsetMax);
                    points.push(point);
                }

                currentArmIsFiller = !currentArmIsFiller;
            }

            return points;
        };
        MapGen.prototype.triangulate = function () {
            if (!this.points || this.points.length < 3)
                throw new Error();
            var triangulationData = Rance.triangulate(this.points);
            this.triangles = this.cleanTriangles(triangulationData.triangles, triangulationData.superTriangle);

            this.makeLinks();
        };
        MapGen.prototype.clearLinks = function () {
            for (var i = 0; i < this.points.length; i++) {
                this.points[i].clearLinks();
            }
        };
        MapGen.prototype.makeLinks = function () {
            if (!this.triangles || this.triangles.length < 1)
                throw new Error();

            this.clearLinks();

            for (var i = 0; i < this.triangles.length; i++) {
                var edges = this.triangles[i].getEdges();
                for (var j = 0; j < edges.length; j++) {
                    edges[j][0].addLink(edges[j][1]);
                }
            }
        };
        MapGen.prototype.severArmLinks = function () {
            for (var i = 0; i < this.points.length; i++) {
                var star = this.points[i];
                star.severLinksToFiller();
                star.severLinksToNonAdjacent();

                if (star.distance > 0.8) {
                    star.severLinksToNonCenter();
                }
            }
        };
        MapGen.prototype.makeVoronoi = function () {
            if (!this.points || this.points.length < 3)
                throw new Error();

            var boundingBox = {
                xl: 0,
                xr: this.maxWidth * 2,
                yt: 0,
                yb: this.maxHeight * 2
            };

            var voronoi = new Voronoi();

            var diagram = voronoi.compute(this.points, boundingBox);

            this.voronoiDiagram = diagram;

            for (var i = 0; i < diagram.cells.length; i++) {
                var cell = diagram.cells[i];
                cell.site.voronoiCell = cell;
                cell.site.voronoiCell.vertices = this.getVerticesFromCell(cell);
            }
        };
        MapGen.prototype.cleanTriangles = function (triangles, superTriangle) {
            for (var i = triangles.length - 1; i >= 0; i--) {
                if (triangles[i].getAmountOfSharedVerticesWith(superTriangle)) {
                    triangles.splice(i, 1);
                }
            }

            return triangles;
        };
        MapGen.prototype.getVerticesFromCell = function (cell) {
            var vertices = [];

            for (var i = 0; i < cell.halfedges.length; i++) {
                vertices.push(cell.halfedges[i].getStartpoint());
            }

            return vertices;
        };
        MapGen.prototype.relaxPointsOnce = function (dampeningFactor) {
            if (typeof dampeningFactor === "undefined") { dampeningFactor = 0; }
            var relaxedPoints = [];

            for (var i = 0; i < this.voronoiDiagram.cells.length; i++) {
                var cell = this.voronoiDiagram.cells[i];
                var point = cell.site;
                var vertices = this.getVerticesFromCell(cell);
                var centroid = Rance.getCentroid(vertices);
                var timesToDampen = point.distance * dampeningFactor;

                for (var j = 0; j < timesToDampen; j++) {
                    centroid.x = (centroid.x + point.x) / 2;
                    centroid.y = (centroid.y + point.y) / 2;
                }

                point.setPosition(centroid.x, centroid.y);
            }
        };
        MapGen.prototype.relaxPoints = function (options) {
            if (!this.points)
                throw new Error();

            if (!this.voronoiDiagram)
                this.makeVoronoi();

            for (var i = 0; i < options.timesToRelax; i++) {
                this.relaxPointsOnce(options.dampeningFactor);
                this.makeVoronoi();
            }
        };
        MapGen.prototype.getNonFillerPoints = function () {
            if (!this.points)
                return [];
            if (!this.nonFillerPoints || this.nonFillerPoints.length <= 0) {
                this.nonFillerPoints = this.points.filter(function (point) {
                    return !point.region.isFiller;
                });
            }

            return this.nonFillerPoints;
        };
        MapGen.prototype.getNonFillerVoronoiLines = function (visibleStars) {
            if (!this.voronoiDiagram)
                return [];

            var indexString = "";
            if (!visibleStars)
                indexString = "all";
            else {
                var ids = visibleStars.map(function (star) {
                    return star.id;
                });
                ids = ids.sort();

                indexString = ids.join();
            }

            if (!this.nonFillerVoronoiLines[indexString] || this.nonFillerVoronoiLines[indexString].length <= 0) {
                console.log("newEdgesIndex");
                this.nonFillerVoronoiLines[indexString] = this.voronoiDiagram.edges.filter(function (edge) {
                    var adjacentSites = [edge.lSite, edge.rSite];
                    var adjacentFillerSites = 0;
                    var maxAllowedFillerSites = 2;

                    for (var i = 0; i < adjacentSites.length; i++) {
                        var site = adjacentSites[i];

                        if (!site) {
                            // draw all border edges
                            //return true;
                            // draw all non filler border edges
                            maxAllowedFillerSites--;
                            if (adjacentFillerSites >= maxAllowedFillerSites) {
                                return false;
                            }
                            continue;
                        }
                        ;

                        if (visibleStars && visibleStars.indexOf(site) < 0) {
                            maxAllowedFillerSites--;
                            if (adjacentFillerSites >= maxAllowedFillerSites) {
                                return false;
                            }
                            continue;
                        }
                        ;

                        if (site.region.isFiller) {
                            adjacentFillerSites++;
                            if (adjacentFillerSites >= maxAllowedFillerSites) {
                                return false;
                            }
                        }
                        ;
                    }

                    return true;
                });
            }

            return this.nonFillerVoronoiLines[indexString];
        };
        MapGen.prototype.getFurthestPointInRegion = function (region) {
            var furthestDistance = 0;
            var furthestStar = null;

            for (var i = 0; i < region.stars.length; i++) {
                if (region.stars[i].distance > furthestDistance) {
                    furthestStar = region.stars[i];
                    furthestDistance = region.stars[i].distance;
                }
            }

            return furthestStar;
        };
        MapGen.prototype.partiallyCutConnections = function (minConnections) {
            var points = this.getNonFillerPoints();
            var cuts = 0;
            var noCuts = 0;
            var reverts = 0;

            for (var i = 0; i < points.length; i++) {
                var point = points[i];

                var neighbors = point.getAllLinks();

                if (neighbors.length < minConnections)
                    continue;

                for (var j = 0; j < neighbors.length; j++) {
                    var neighbor = neighbors[j];
                    var neighborLinks = neighbor.getAllLinks();

                    //if (neighborLinks.length < minConnections) continue;
                    var totalLinks = neighbors.length + neighborLinks.length;

                    var cutThreshhold = 0.05 + 0.025 * (totalLinks - minConnections) * (1 - point.distance);
                    var minMultipleCutThreshhold = 0.15;
                    while (cutThreshhold > 0) {
                        if (Math.random() < cutThreshhold) {
                            point.removeLink(neighbor);
                            cuts++;

                            var path = Rance.aStar(point, neighbor);

                            if (!path) {
                                point.addLink(neighbor);
                                cuts--;
                                reverts++;
                            }
                        } else
                            noCuts++;

                        cutThreshhold -= minMultipleCutThreshhold;
                    }
                }
            }

            console.log(cuts, noCuts, reverts);
        };

        /*
        while average size sectors left to assign && unassigned stars left
        pick random unassigned star
        if star cannot form island bigger than minsize
        put from unassigned into leftovers & continue
        else
        add random neighbors into sector until minsize is met
        
        
        while leftovers
        pick random leftover
        if leftover has no assigned neighbor pick, continue
        
        leftover gets assigned to smallest neighboring sector
        if sizes equal, assign to sector with least neighboring leftovers
        */
        MapGen.prototype.makeSectors = function (minSize, maxSize) {
            var totalStars = this.nonFillerPoints.length;
            var unassignedStars = this.nonFillerPoints.slice(0);
            var leftoverStars = [];

            var averageSize = (minSize + maxSize) / 2;
            var averageSectorsAmount = Math.round(totalStars / averageSize);

            var sectorsById = {};

            var sameSectorFN = function (a, b) {
                return a.sector === b.sector;
            };

            while (averageSectorsAmount > 0 && unassignedStars.length > 0) {
                var seedStar = unassignedStars.pop();
                var canFormMinSizeSector = seedStar.getIslandForQualifier(sameSectorFN, minSize).length >= minSize;

                if (canFormMinSizeSector) {
                    var sector = new Rance.Sector();
                    sectorsById[sector.id] = sector;

                    var discoveryStarIndex = 0;
                    sector.addStar(seedStar);

                    while (sector.stars.length < minSize) {
                        var discoveryStar = sector.stars[discoveryStarIndex];

                        var frontier = discoveryStar.getLinkedInRange(1).all;
                        frontier = frontier.filter(function (star) {
                            return !star.sector;
                        });

                        while (sector.stars.length < minSize && frontier.length > 0) {
                            var randomFrontierKey = Rance.getRandomArrayKey(frontier);
                            var toAdd = frontier.splice(randomFrontierKey, 1)[0];
                            unassignedStars.splice(unassignedStars.indexOf(toAdd), 1);

                            sector.addStar(toAdd);
                        }

                        discoveryStarIndex++;
                    }
                } else {
                    leftoverStars.push(seedStar);
                }
            }

            while (leftoverStars.length > 0) {
                var star = leftoverStars.pop();

                var neighbors = star.getLinkedInRange(1).all;
                var alreadyAddedNeighborSectors = {};
                var candidateSectors = [];

                for (var j = 0; j < neighbors.length; j++) {
                    if (!neighbors[j].sector)
                        continue;
                    else {
                        if (!alreadyAddedNeighborSectors[neighbors[j].sector.id]) {
                            alreadyAddedNeighborSectors[neighbors[j].sector.id] = true;
                            candidateSectors.push(neighbors[j].sector);
                        }
                    }
                }

                // all neighboring stars don't have sectors
                // put star at back of queue and try again later
                if (candidateSectors.length < 1) {
                    leftoverStars.unshift(star);
                    continue;
                }

                var unclaimedNeighborsPerSector = {};

                for (var j = 0; j < candidateSectors.length; j++) {
                    var sectorNeighbors = candidateSectors[j].getNeighboringStars();
                    var unclaimed = 0;
                    for (var k = 0; k < sectorNeighbors.length; k++) {
                        if (!sectorNeighbors[k].sector) {
                            unclaimed++;
                        }
                    }

                    unclaimedNeighborsPerSector[candidateSectors[j].id] = unclaimed;
                }

                candidateSectors.sort(function (a, b) {
                    var sizeSort = a.stars.length - b.stars.length;
                    if (sizeSort)
                        return sizeSort;

                    var unclaimedSort = unclaimedNeighborsPerSector[b.id] - unclaimedNeighborsPerSector[a.id];
                    return unclaimedSort;
                });

                candidateSectors[0].addStar(star);
            }

            return sectorsById;
        };

        MapGen.prototype.setResources = function () {
            // TODO
            var getResourceDistributionFlags = function (region) {
                switch (region) {
                    case "center": {
                        return ["rare"];
                    }
                    default: {
                        return ["common"];
                    }
                }
            };

            for (var sectorId in this.sectors) {
                var sector = this.sectors[sectorId];

                var majorityRegions = sector.getMajorityRegions();

                var resourceDistributionFlags = [];
                var resourcesAlreadyPresentInRegions = {};

                for (var i = 0; i < majorityRegions.length; i++) {
                    resourceDistributionFlags = resourceDistributionFlags.concat(getResourceDistributionFlags(majorityRegions[i]));
                }
            }
        };
        return MapGen;
    })();
    Rance.MapGen = MapGen;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
/// <reference path="eventmanager.ts"/>
/// <reference path="utility.ts"/>
/// <reference path="color.ts"/>
/// <reference path="galaxymap.ts" />
/// <reference path="star.ts" />
/// <reference path="fleet.ts" />
/// <reference path="player.ts" />
var Rance;
(function (Rance) {
    var MapRenderer = (function () {
        function MapRenderer(map) {
            this.occupationShaders = {};
            this.layers = {};
            this.mapModes = {};
            this.fowSpriteCache = {};
            this.isDirty = true;
            this.preventRender = false;
            this.listeners = {};
            this.container = new PIXI.DisplayObjectContainer();

            this.setMap(map);
        }
        MapRenderer.prototype.destroy = function () {
            this.preventRender = true;

            for (var name in this.listeners) {
                Rance.eventManager.removeEventListener(name, this.listeners[name]);
            }
        };
        MapRenderer.prototype.setMap = function (map) {
            this.galaxyMap = map;
            this.galaxyMap.mapRenderer = this;
            this.game = map.game;
            this.player = this.game.humanPlayer;
        };
        MapRenderer.prototype.init = function () {
            this.makeFowSprite();

            this.initLayers();
            this.initMapModes();

            this.addEventListeners();
        };
        MapRenderer.prototype.addEventListeners = function () {
            var self = this;
            this.listeners["renderMap"] = Rance.eventManager.addEventListener("renderMap", this.setAllLayersAsDirty.bind(this));
            this.listeners["renderLayer"] = Rance.eventManager.addEventListener("renderLayer", function (e) {
                self.setLayerAsDirty(e.data);
            });

            var boundUpdateOffsets = this.updateShaderOffsets.bind(this);
            var boundUpdateZoom = this.updateShaderZoom.bind(this);

            this.listeners["registerOnMoveCallback"] = Rance.eventManager.addEventListener("registerOnMoveCallback", function (e) {
                e.data.push(boundUpdateOffsets);
            });
            this.listeners["registerOnZoomCallback"] = Rance.eventManager.addEventListener("registerOnZoomCallback", function (e) {
                e.data.push(boundUpdateZoom);
            });
        };
        MapRenderer.prototype.setPlayer = function (player) {
            this.player = player;
            this.setAllLayersAsDirty();
        };
        MapRenderer.prototype.updateShaderOffsets = function (x, y) {
            for (var owner in this.occupationShaders) {
                for (var occupier in this.occupationShaders[owner]) {
                    var shader = this.occupationShaders[owner][occupier];
                    shader.uniforms.offset.value = { x: -x, y: y };
                }
            }
        };
        MapRenderer.prototype.updateShaderZoom = function (zoom) {
            for (var owner in this.occupationShaders) {
                for (var occupier in this.occupationShaders[owner]) {
                    var shader = this.occupationShaders[owner][occupier];
                    shader.uniforms.zoom.value = zoom;
                }
            }
        };
        MapRenderer.prototype.makeFowSprite = function () {
            if (!this.fowTilingSprite) {
                var fowTexture = PIXI.Texture.fromFrame("img\/fowTexture.png");
                var w = this.galaxyMap.mapGen.maxWidth * 2;
                var h = this.galaxyMap.mapGen.maxHeight * 2;

                this.fowTilingSprite = new PIXI.TilingSprite(fowTexture, w, h);
            }
        };
        MapRenderer.prototype.getFowSpriteForStar = function (star) {
            // silly hack to make sure first texture gets created properly
            if (!this.fowSpriteCache[star.id] || Object.keys(this.fowSpriteCache).length < 4) {
                var poly = new PIXI.Polygon(star.voronoiCell.vertices);
                var gfx = new PIXI.Graphics();
                gfx.beginFill();
                gfx.drawShape(poly);
                gfx.endFill();

                this.fowTilingSprite.removeChildren();

                this.fowTilingSprite.mask = gfx;
                this.fowTilingSprite.addChild(gfx);

                var rendered = this.fowTilingSprite.generateTexture();

                var sprite = new PIXI.Sprite(rendered);

                this.fowSpriteCache[star.id] = sprite;
                this.fowTilingSprite.mask = null;
            }

            return this.fowSpriteCache[star.id];
        };
        MapRenderer.prototype.getOccupationShader = function (owner, occupier) {
            if (!this.occupationShaders[owner.id]) {
                this.occupationShaders[owner.id] = {};
            }

            if (!this.occupationShaders[owner.id][occupier.id]) {
                var baseColor = PIXI.hex2rgb(owner.color);
                baseColor.push(1.0);
                var occupierColor = PIXI.hex2rgb(occupier.color);
                occupierColor.push(1.0);

                var uniforms = {
                    baseColor: { type: "4fv", value: baseColor },
                    lineColor: { type: "4fv", value: occupierColor },
                    gapSize: { type: "1f", value: 3.0 },
                    offset: { type: "2f", value: { x: 0.0, y: 0.0 } },
                    zoom: { type: "1f", value: 1.0 }
                };

                var shaderSrc = [
                    "precision mediump float;",
                    "uniform sampler2D uSampler;",
                    "varying vec2 vTextureCoord;",
                    "varying vec4 vColor;",
                    "uniform vec4 baseColor;",
                    "uniform vec4 lineColor;",
                    "uniform float gapSize;",
                    "uniform vec2 offset;",
                    "uniform float zoom;",
                    "void main( void )",
                    "{",
                    "  vec2 position = gl_FragCoord.xy + offset;",
                    "  position.x += position.y;",
                    "  float scaled = floor(position.x * 0.1 / zoom);",
                    "  float res = mod(scaled, gapSize);",
                    "  if(res > 0.0)",
                    "  {",
                    "    gl_FragColor = mix(gl_FragColor, baseColor, 0.5);",
                    "  }",
                    "  else",
                    "  {",
                    "    gl_FragColor = mix(gl_FragColor, lineColor, 0.5);",
                    "  }",
                    "}"
                ];

                this.occupationShaders[owner.id][occupier.id] = new PIXI.AbstractFilter(shaderSrc, uniforms);
            }

            return this.occupationShaders[owner.id][occupier.id];
        };
        MapRenderer.prototype.initLayers = function () {
            if (this.layers["nonFillerStars"])
                return;
            this.layers["nonFillerStars"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();

                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }

                    var mouseDownFN = function (event) {
                        Rance.eventManager.dispatchEvent("mouseDown", event);
                    };
                    var mouseUpFN = function (event) {
                        Rance.eventManager.dispatchEvent("mouseUp", event);
                    };
                    var onClickFN = function (star) {
                        Rance.eventManager.dispatchEvent("starClick", star);
                    };
                    var rightDownFN = function (star) {
                        Rance.eventManager.dispatchEvent("startPotentialMove", star);
                    };
                    var rightUpFN = function (star) {
                        Rance.eventManager.dispatchEvent("starRightClick", star);
                        Rance.eventManager.dispatchEvent("endPotentialMove");
                    };
                    var mouseOverFN = function (star) {
                        Rance.eventManager.dispatchEvent("setPotentialMoveTarget", star);
                    };
                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        var starSize = 1;
                        if (star.buildings["defence"]) {
                            starSize += star.buildings["defence"].length * 2;
                        }
                        var gfx = new PIXI.Graphics();
                        if (!star.owner.isIndependent) {
                            gfx.lineStyle(starSize / 2, star.owner.color, 1);
                        }
                        gfx.star = star;
                        gfx.beginFill(0xFFFFF0);
                        gfx.drawEllipse(star.x, star.y, starSize, starSize);
                        gfx.endFill;

                        gfx.interactive = true;
                        gfx.hitArea = new PIXI.Polygon(star.voronoiCell.vertices);
                        gfx.mousedown = mouseDownFN;
                        gfx.mouseup = mouseUpFN;
                        gfx.click = function (event) {
                            if (event.originalEvent.button !== 0)
                                return;

                            onClickFN(this.star);
                        }.bind(gfx);
                        gfx.rightdown = rightDownFN.bind(gfx, star);
                        gfx.rightup = rightUpFN.bind(gfx, star);
                        gfx.mouseover = mouseOverFN.bind(gfx, star);

                        doc.addChild(gfx);
                    }

                    // gets set to 0 without this reference. no idea
                    doc.height;
                    return doc;
                }
            };
            this.layers["starOwners"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();
                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        if (!star.owner)
                            continue;

                        var poly = new PIXI.Polygon(star.voronoiCell.vertices);
                        var gfx = new PIXI.Graphics();
                        var alpha = 0.5;
                        if (isFinite(star.owner.colorAlpha))
                            alpha *= star.owner.colorAlpha;
                        gfx.beginFill(star.owner.color, alpha);
                        gfx.drawShape(poly);
                        gfx.endFill;
                        doc.addChild(gfx);

                        var occupier = star.getSecondaryController();
                        if (occupier) {
                            gfx.filters = [this.getOccupationShader(star.owner, occupier)];

                            //gfx.filters = [testFilter];
                            var mask = new PIXI.Graphics();
                            mask.beginFill();
                            mask.drawShape(poly);
                            mask.endFill();
                            gfx.mask = mask;
                            gfx.addChild(mask);
                        }
                    }
                    doc.height;
                    return doc;
                }
            };
            this.layers["fogOfWar"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();
                    if (!this.player)
                        return doc;
                    var points = this.player.getRevealedButNotVisibleStars();

                    if (!points || points.length < 1)
                        return doc;

                    doc.alpha = 0.35;

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        var sprite = this.getFowSpriteForStar(star);

                        doc.addChild(sprite);
                    }

                    doc.height;
                    return doc;
                }
            };
            this.layers["starIncome"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();
                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }
                    var incomeBounds = map.getIncomeBounds();

                    function getRelativeValue(min, max, value) {
                        var difference = max - min;
                        if (difference < 1)
                            difference = 1;

                        // clamps to n different colors
                        var threshhold = difference / 10;
                        if (threshhold < 1)
                            threshhold = 1;
                        var relative = (Math.round(value / threshhold) * threshhold - min) / (difference);
                        return relative;
                    }

                    var colorIndexes = {};

                    function getRelativeColor(min, max, value) {
                        if (!colorIndexes[value]) {
                            if (value < 0)
                                value = 0;
                            else if (value > 1)
                                value = 1;

                            var deviation = Math.abs(0.5 - value) * 2;

                            var hue = 110 * value;
                            var saturation = 0.5 + 0.2 * deviation;
                            var lightness = 0.6 + 0.25 * deviation;

                            colorIndexes[value] = Rance.hslToHex(hue / 360, saturation, lightness / 2);
                        }
                        return colorIndexes[value];
                    }

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        var income = star.getIncome();
                        var relativeIncome = getRelativeValue(incomeBounds.min, incomeBounds.max, income);
                        var color = getRelativeColor(incomeBounds.min, incomeBounds.max, relativeIncome);

                        var poly = new PIXI.Polygon(star.voronoiCell.vertices);
                        var gfx = new PIXI.Graphics();
                        gfx.beginFill(color, 0.6);
                        gfx.drawShape(poly);
                        gfx.endFill;
                        doc.addChild(gfx);
                    }
                    doc.height;
                    return doc;
                }
            };
            this.layers["playerInfluence"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();
                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }
                    var mapEvaluator = new Rance.MapEvaluator(map, this.player);
                    var influenceByStar = mapEvaluator.buildPlayerInfluenceMap(this.player);

                    var minInfluence, maxInfluence;

                    for (var starId in influenceByStar) {
                        var influence = influenceByStar[starId];
                        if (!isFinite(minInfluence) || influence < minInfluence) {
                            minInfluence = influence;
                        }
                        if (!isFinite(maxInfluence) || influence > maxInfluence) {
                            maxInfluence = influence;
                        }
                    }

                    function getRelativeValue(min, max, value) {
                        var difference = max - min;
                        if (difference < 1)
                            difference = 1;

                        // clamps to n different colors
                        var threshhold = difference / 10;
                        if (threshhold < 1)
                            threshhold = 1;
                        var relative = (Math.round(value / threshhold) * threshhold - min) / (difference);
                        return relative;
                    }

                    var colorIndexes = {};

                    function getRelativeColor(min, max, value) {
                        if (!colorIndexes[value]) {
                            if (value < 0)
                                value = 0;
                            else if (value > 1)
                                value = 1;

                            var deviation = Math.abs(0.5 - value) * 2;

                            var hue = 110 * value;
                            var saturation = 0.5 + 0.2 * deviation;
                            var lightness = 0.6 + 0.25 * deviation;

                            colorIndexes[value] = Rance.hslToHex(hue / 360, saturation, lightness / 2);
                        }
                        return colorIndexes[value];
                    }

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        var influence = influenceByStar[star.id];

                        if (!influence)
                            continue;

                        var relativeInfluence = getRelativeValue(minInfluence, maxInfluence, influence);
                        var color = getRelativeColor(minInfluence, maxInfluence, relativeInfluence);

                        var poly = new PIXI.Polygon(star.voronoiCell.vertices);
                        var gfx = new PIXI.Graphics();
                        gfx.beginFill(color, 0.6);
                        gfx.drawShape(poly);
                        gfx.endFill;
                        doc.addChild(gfx);
                    }
                    doc.height;
                    return doc;
                }
            };
            this.layers["nonFillerVoronoiLines"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();

                    var gfx = new PIXI.Graphics();
                    doc.addChild(gfx);
                    gfx.lineStyle(1, 0xA0A0A0, 0.5);

                    var visible = this.player ? this.player.getRevealedStars() : null;

                    var lines = map.mapGen.getNonFillerVoronoiLines(visible);

                    for (var i = 0; i < lines.length; i++) {
                        var line = lines[i];
                        gfx.moveTo(line.va.x, line.va.y);
                        gfx.lineTo(line.vb.x, line.vb.y);
                    }

                    doc.height;
                    return doc;
                }
            };
            this.layers["ownerBorders"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();
                    var gfx = new PIXI.Graphics();
                    doc.addChild(gfx);

                    var revealedStars = this.player.getRevealedStars();
                    var borderEdges = Rance.getAllBorderEdgesByStar(map.mapGen.voronoiDiagram.edges, revealedStars);

                    for (var starId in borderEdges) {
                        var edgeData = borderEdges[starId];

                        var player = edgeData.star.owner;
                        gfx.lineStyle(4, player.secondaryColor, 0.7);

                        for (var i = 0; i < edgeData.edges.length; i++) {
                            var edge = edgeData.edges[i];
                            gfx.moveTo(edge.va.x, edge.va.y);
                            gfx.lineTo(edge.vb.x, edge.vb.y);
                        }
                    }

                    doc.height;
                    return doc;
                }
            };
            this.layers["starLinks"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var doc = new PIXI.DisplayObjectContainer();

                    var gfx = new PIXI.Graphics();
                    doc.addChild(gfx);
                    gfx.lineStyle(1, 0xCCCCCC, 0.6);

                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }

                    var starsFullyConnected = {};

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        if (starsFullyConnected[star.id])
                            continue;

                        starsFullyConnected[star.id] = true;

                        for (var j = 0; j < star.linksTo.length; j++) {
                            gfx.moveTo(star.x, star.y);
                            gfx.lineTo(star.linksTo[j].x, star.linksTo[j].y);
                        }
                        for (var j = 0; j < star.linksFrom.length; j++) {
                            gfx.moveTo(star.linksFrom[j].x, star.linksFrom[j].y);
                            gfx.lineTo(star.x, star.y);
                        }
                    }
                    doc.height;
                    return doc;
                }
            };
            this.layers["sectors"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var self = this;

                    var doc = new PIXI.DisplayObjectContainer();

                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }

                    var sectorsAmount = Object.keys(map.sectors).length;

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        if (!star.sector)
                            break;

                        var hue = (360 / sectorsAmount) * star.sector.id;
                        var color = Rance.hslToHex(hue / 360, 1, 0.5);

                        //var color = star.sector.color;
                        var poly = new PIXI.Polygon(star.voronoiCell.vertices);
                        var gfx = new PIXI.Graphics();
                        gfx.beginFill(color, 0.6);
                        gfx.drawShape(poly);
                        gfx.endFill;
                        doc.addChild(gfx);
                    }

                    doc.height;
                    return doc;
                }
            };
            this.layers["regions"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var self = this;

                    var doc = new PIXI.DisplayObjectContainer();

                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getRevealedStars();
                    }

                    var regionIndexes = {};

                    var i = 0;
                    for (var regionId in map.mapGen.regions) {
                        regionIndexes[regionId] = i++;
                    }
                    var regionsAmount = Object.keys(regionIndexes).length;

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];

                        var hue = (360 / regionsAmount) * regionIndexes[star.region.id];
                        var color = Rance.hslToHex(hue / 360, 1, 0.5);
                        var poly = new PIXI.Polygon(star.voronoiCell.vertices);
                        var gfx = new PIXI.Graphics();
                        gfx.beginFill(color, 0.6);
                        gfx.drawShape(poly);
                        gfx.endFill;
                        doc.addChild(gfx);
                    }

                    doc.height;
                    return doc;
                }
            };
            this.layers["fleets"] = {
                isDirty: true,
                container: new PIXI.DisplayObjectContainer(),
                drawingFunction: function (map) {
                    var self = this;

                    var doc = new PIXI.DisplayObjectContainer();

                    var points;
                    if (!this.player) {
                        points = map.mapGen.getNonFillerPoints();
                    } else {
                        points = this.player.getVisibleStars();
                    }

                    var mouseDownFN = function (event) {
                        Rance.eventManager.dispatchEvent("mouseDown", event);
                    };
                    var mouseUpFN = function (event) {
                        Rance.eventManager.dispatchEvent("mouseUp", event);
                    };

                    function fleetClickFn(fleet) {
                        Rance.eventManager.dispatchEvent("selectFleets", [fleet]);
                    }

                    function singleFleetDrawFN(fleet) {
                        var fleetContainer = new PIXI.DisplayObjectContainer();
                        var playerColor = fleet.player.color;

                        var text = new PIXI.Text(fleet.ships.length, {
                            //fill: "#" + playerColor.toString(16)
                            fill: "#FFFFFF",
                            stroke: "#000000",
                            strokeThickness: 3
                        });

                        var containerGfx = new PIXI.Graphics();
                        containerGfx.lineStyle(1, 0x00000, 1);
                        containerGfx.beginFill(playerColor, 0.7);
                        containerGfx.drawRect(0, 0, text.width + 4, text.height + 4);
                        containerGfx.endFill();

                        containerGfx.interactive = true;
                        if (fleet.player.id === self.player.id) {
                            containerGfx.click = fleetClickFn.bind(containerGfx, fleet);
                        }

                        containerGfx.mousedown = mouseDownFN;
                        containerGfx.mouseup = mouseUpFN;

                        containerGfx.addChild(text);
                        text.x += 2;
                        text.y += 2;
                        containerGfx.y -= 10;
                        fleetContainer.addChild(containerGfx);

                        return fleetContainer;
                    }

                    for (var i = 0; i < points.length; i++) {
                        var star = points[i];
                        var fleets = star.getAllFleets();
                        if (!fleets || fleets.length <= 0)
                            continue;

                        var fleetsContainer = new PIXI.DisplayObjectContainer();
                        fleetsContainer.x = star.x;
                        fleetsContainer.y = star.y - 30;
                        doc.addChild(fleetsContainer);

                        for (var j = 0; j < fleets.length; j++) {
                            var drawnFleet = singleFleetDrawFN(fleets[j]);
                            drawnFleet.position.x = fleetsContainer.width;
                            fleetsContainer.addChild(drawnFleet);
                        }

                        fleetsContainer.x -= fleetsContainer.width / 2;
                    }

                    doc.height;
                    return doc;
                }
            };
        };
        MapRenderer.prototype.initMapModes = function () {
            this.mapModes["default"] = {
                name: "default",
                layers: [
                    { layer: this.layers["starOwners"] },
                    { layer: this.layers["ownerBorders"] },
                    { layer: this.layers["nonFillerVoronoiLines"] },
                    { layer: this.layers["starLinks"] },
                    { layer: this.layers["nonFillerStars"] },
                    { layer: this.layers["fogOfWar"] },
                    { layer: this.layers["fleets"] }
                ]
            };
            this.mapModes["noStatic"] = {
                name: "noStatic",
                layers: [
                    { layer: this.layers["starOwners"] },
                    { layer: this.layers["ownerBorders"] },
                    { layer: this.layers["nonFillerStars"] },
                    { layer: this.layers["fogOfWar"] },
                    { layer: this.layers["fleets"] }
                ]
            };
            this.mapModes["income"] = {
                name: "income",
                layers: [
                    { layer: this.layers["starIncome"] },
                    { layer: this.layers["nonFillerVoronoiLines"] },
                    { layer: this.layers["starLinks"] },
                    { layer: this.layers["nonFillerStars"] },
                    { layer: this.layers["fleets"] }
                ]
            };
            this.mapModes["influence"] = {
                name: "influence",
                layers: [
                    { layer: this.layers["playerInfluence"] },
                    { layer: this.layers["nonFillerVoronoiLines"] },
                    { layer: this.layers["starLinks"] },
                    { layer: this.layers["nonFillerStars"] },
                    { layer: this.layers["fleets"] }
                ]
            };
            this.mapModes["sectors"] = {
                name: "sectors",
                layers: [
                    { layer: this.layers["sectors"] },
                    { layer: this.layers["nonFillerVoronoiLines"] },
                    { layer: this.layers["starLinks"] },
                    { layer: this.layers["nonFillerStars"] },
                    { layer: this.layers["fleets"] }
                ]
            };
            this.mapModes["regions"] = {
                name: "regions",
                layers: [
                    { layer: this.layers["regions"] },
                    { layer: this.layers["nonFillerVoronoiLines"] },
                    { layer: this.layers["starLinks"] },
                    { layer: this.layers["nonFillerStars"] },
                    { layer: this.layers["fleets"] }
                ]
            };
        };
        MapRenderer.prototype.setParent = function (newParent) {
            var oldParent = this.parent;
            if (oldParent) {
                oldParent.removeChild(this.container);
            }

            this.parent = newParent;
            newParent.addChild(this.container);
        };
        MapRenderer.prototype.resetContainer = function () {
            this.container.removeChildren();
        };
        MapRenderer.prototype.hasLayerInMapMode = function (layer) {
            for (var i = 0; i < this.currentMapMode.layers.length; i++) {
                if (this.currentMapMode.layers[i].layer === layer) {
                    return true;
                }
            }

            return false;
        };
        MapRenderer.prototype.setLayerAsDirty = function (layerName) {
            var layer = this.layers[layerName];
            layer.isDirty = true;

            this.isDirty = true;

            // TODO
            this.render();
        };
        MapRenderer.prototype.setAllLayersAsDirty = function () {
            for (var i = 0; i < this.currentMapMode.layers.length; i++) {
                this.currentMapMode.layers[i].layer.isDirty = true;
            }

            this.isDirty = true;

            // TODO
            this.render();
        };
        MapRenderer.prototype.drawLayer = function (layer) {
            if (!layer.isDirty)
                return;
            layer.container.removeChildren();
            layer.container.addChild(layer.drawingFunction.call(this, this.galaxyMap));
            layer.isDirty = false;
        };
        MapRenderer.prototype.setMapMode = function (newMapMode) {
            if (!this.mapModes[newMapMode]) {
                throw new Error("Invalid mapmode");
                return;
            }

            if (this.currentMapMode && this.currentMapMode.name === newMapMode) {
                return;
            }

            this.currentMapMode = this.mapModes[newMapMode];

            this.resetContainer();

            for (var i = 0; i < this.currentMapMode.layers.length; i++) {
                var layer = this.currentMapMode.layers[i].layer;
                this.container.addChild(layer.container);
            }

            this.setAllLayersAsDirty();
        };
        MapRenderer.prototype.render = function () {
            if (this.preventRender || !this.isDirty)
                return;

            console.log("render map");

            for (var i = 0; i < this.currentMapMode.layers.length; i++) {
                var layer = this.currentMapMode.layers[i].layer;

                this.drawLayer(layer);
            }

            this.isDirty = false;
        };
        return MapRenderer;
    })();
    Rance.MapRenderer = MapRenderer;
})(Rance || (Rance = {}));
/// <reference path="../lib/voronoi.d.ts" />
/// <reference path="star.ts" />
/// <reference path="mapgen.ts" />
/// <reference path="maprenderer.ts" />
/// <reference path="sector.ts" />
var Rance;
(function (Rance) {
    var GalaxyMap = (function () {
        function GalaxyMap() {
        }
        GalaxyMap.prototype.setMapGen = function (mapGen) {
            this.mapGen = mapGen;

            this.allPoints = mapGen.points;
            this.stars = mapGen.getNonFillerPoints();
            this.sectors = mapGen.sectors;
        };
        GalaxyMap.prototype.getIncomeBounds = function () {
            var min, max;

            for (var i = 0; i < this.stars.length; i++) {
                var star = this.stars[i];
                var income = star.getIncome();
                if (!min)
                    min = max = income;
                else {
                    if (income < min)
                        min = income;
                    else if (income > max)
                        max = income;
                }
            }

            return ({
                min: min,
                max: max
            });
        };
        GalaxyMap.prototype.serialize = function () {
            var data = {};

            data.allPoints = this.allPoints.map(function (star) {
                return star.serialize();
            });

            data.regionNames = [];

            for (var name in this.mapGen.regions) {
                data.regionNames.push(name);
            }

            data.sectors = [];

            for (var sectorId in this.sectors) {
                data.sectors.push(this.sectors[sectorId].serialize());
            }

            data.maxWidth = this.mapGen.maxWidth;
            data.maxHeight = this.mapGen.maxHeight;

            return data;
        };
        return GalaxyMap;
    })();
    Rance.GalaxyMap = GalaxyMap;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
var Rance;
(function (Rance) {
    /**
    * @class Camera
    * @constructor
    */
    var Camera = (function () {
        /**
        * [constructor description]
        * @param {PIXI.DisplayObjectContainer} container [DOC the camera views and manipulates]
        * @param {number}                      bound     [How much of the container is allowed to leave the camera view.
        * 0.0 to 1.0]
        */
        function Camera(container, bound) {
            this.bounds = {};
            this.currZoom = 1;
            this.onMoveCallbacks = [];
            this.onZoomCallbacks = [];
            this.listeners = {};
            this.container = container;
            this.bounds.min = bound;
            this.bounds.max = Number((1 - bound).toFixed(1));
            var screenElement = window.getComputedStyle(document.getElementById("pixi-container"), null);
            this.screenWidth = parseInt(screenElement.width);
            this.screenHeight = parseInt(screenElement.height);

            this.addEventListeners();
            this.setBounds();
        }
        Camera.prototype.destroy = function () {
            for (var name in this.listeners) {
                Rance.eventManager.removeEventListener(name, this.listeners[name]);
            }
            this.onMoveCallbacks = [];
            this.onZoomCallbacks = [];

            window.removeEventListener("resize", this.resizeListener);
        };

        /**
        * @method addEventListeners
        * @private
        */
        Camera.prototype.addEventListeners = function () {
            var self = this;

            this.resizeListener = function (e) {
                var container = document.getElementById("pixi-container");
                if (!container)
                    return;
                var style = window.getComputedStyle(container, null);
                self.screenWidth = parseInt(style.width);
                self.screenHeight = parseInt(style.height);
            };

            window.addEventListener("resize", this.resizeListener, false);

            this.listeners["centerCameraAt"] = Rance.eventManager.addEventListener("centerCameraAt", function (e) {
                self.centerOnPosition(e.data);
            });

            Rance.eventManager.dispatchEvent("registerOnMoveCallback", self.onMoveCallbacks);

            Rance.eventManager.dispatchEvent("registerOnZoomCallback", self.onZoomCallbacks);
        };

        /**
        * @method setBound
        * @private
        */
        Camera.prototype.setBounds = function () {
            var rect = this.container.getLocalBounds();
            this.width = this.screenWidth;
            this.height = this.screenHeight;
            this.bounds = {
                xMin: (this.width * this.bounds.min) - rect.width * this.container.scale.x,
                xMax: (this.width * this.bounds.max),
                yMin: (this.height * this.bounds.min) - rect.height * this.container.scale.y,
                yMax: (this.height * this.bounds.max),
                min: this.bounds.min,
                max: this.bounds.max
            };
        };

        /**
        * @method startScroll
        * @param {number[]} mousePos [description]
        */
        Camera.prototype.startScroll = function (mousePos) {
            this.setBounds();
            this.startClick = mousePos;
            this.startPos = [this.container.position.x, this.container.position.y];

            var ui = document.getElementsByClassName("galaxy-map-ui")[0];
            if (ui)
                ui.classList.add("prevent-pointer-events");

            var popups = document.getElementsByClassName("popup-container")[0];
            if (popups)
                popups.classList.add("prevent-pointer-events");
        };

        /**
        * @method end
        */
        Camera.prototype.end = function () {
            this.startPos = undefined;

            var ui = document.getElementsByClassName("galaxy-map-ui")[0];
            if (ui)
                ui.classList.remove("prevent-pointer-events");
            var popups = document.getElementsByClassName("popup-container")[0];
            if (popups)
                popups.classList.remove("prevent-pointer-events");
        };

        /**
        * @method getDelta
        * @param {number[]} currPos [description]
        */
        Camera.prototype.getDelta = function (currPos) {
            var x = this.startClick[0] - currPos[0];
            var y = this.startClick[1] - currPos[1];
            return [-x, -y];
        };

        /**
        * @method move
        * @param {number[]} currPos [description]
        */
        Camera.prototype.move = function (currPos) {
            var delta = this.getDelta(currPos);
            this.container.position.x = this.startPos[0] + delta[0];
            this.container.position.y = this.startPos[1] + delta[1];
            this.clampEdges();

            this.onMove();
        };
        Camera.prototype.onMove = function () {
            for (var i = 0; i < this.onMoveCallbacks.length; i++) {
                this.onMoveCallbacks[i](this.container.position.x, this.container.position.y);
            }
        };
        Camera.prototype.getScreenCenter = function () {
            return ({
                x: this.width / 2,
                y: this.height / 2
            });
        };
        Camera.prototype.centerOnPosition = function (pos) {
            this.setBounds();
            var wt = this.container.worldTransform;

            var localPos = wt.apply(pos);
            var center = this.getScreenCenter();

            this.container.position.x += center.x - localPos.x;
            this.container.position.y += center.y - localPos.y;

            this.clampEdges();

            this.onMove();
        };

        /**
        * @method zoom
        * @param {number} zoomAmount [description]
        */
        Camera.prototype.zoom = function (zoomAmount) {
            if (zoomAmount > 1) {
                //zoomAmount = 1;
            }

            var container = this.container;
            var oldZoom = this.currZoom;

            var zoomDelta = oldZoom - zoomAmount;
            var rect = container.getLocalBounds();

            //these 2 get position of screen center in relation to the container
            //0: far left 1: far right
            var xRatio = 1 - ((container.x - this.screenWidth / 2) / rect.width / oldZoom + 1);
            var yRatio = 1 - ((container.y - this.screenHeight / 2) / rect.height / oldZoom + 1);

            var xDelta = rect.width * xRatio * zoomDelta;
            var yDelta = rect.height * yRatio * zoomDelta;
            container.position.x += xDelta;
            container.position.y += yDelta;
            container.scale.set(zoomAmount, zoomAmount);
            this.currZoom = zoomAmount;

            this.onMove();
            this.onZoom();
        };
        Camera.prototype.onZoom = function () {
            for (var i = 0; i < this.onZoomCallbacks.length; i++) {
                this.onZoomCallbacks[i](this.currZoom);
            }
        };

        /**
        * @method deltaZoom
        * @param {number} delta [description]
        * @param {number} scale [description]
        */
        Camera.prototype.deltaZoom = function (delta, scale) {
            if (delta === 0) {
                return;
            }

            //var scaledDelta = absDelta + scale / absDelta;
            var direction = delta < 0 ? "out" : "in";
            var adjDelta = 1 + Math.abs(delta) * scale;
            if (direction === "out") {
                this.zoom(this.currZoom / adjDelta);
            } else {
                this.zoom(this.currZoom * adjDelta);
            }
        };

        /**
        * @method clampEdges
        * @private
        */
        Camera.prototype.clampEdges = function () {
            var x = this.container.position.x;
            var y = this.container.position.y;

            //horizontal
            //left edge
            if (x < this.bounds.xMin) {
                x = this.bounds.xMin;
            } else if (x > this.bounds.xMax) {
                x = this.bounds.xMax;
            }

            //vertical
            //top
            if (y < this.bounds.yMin) {
                y = this.bounds.yMin;
            } else if (y > this.bounds.yMax) {
                y = this.bounds.yMax;
            }

            this.container.position.set(x, y);
        };
        return Camera;
    })();
    Rance.Camera = Camera;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
/// <reference path="eventmanager.ts"/>
/// <reference path="point.ts" />
var Rance;
(function (Rance) {
    var RectangleSelect = (function () {
        function RectangleSelect(parentContainer) {
            this.parentContainer = parentContainer;
            this.graphics = new PIXI.Graphics();
            parentContainer.addChild(this.graphics);

            this.addEventListeners();
        }
        RectangleSelect.prototype.addEventListeners = function () {
            var self = this;

            Rance.eventManager.dispatchEvent("setRectangleSelectTargetFN", this);
        };

        RectangleSelect.prototype.startSelection = function (point) {
            this.selecting = true;
            this.start = point;
            this.current = point;

            var ui = document.getElementsByClassName("galaxy-map-ui")[0];
            if (ui)
                ui.classList.add("prevent-pointer-events");

            var popups = document.getElementsByClassName("popup-container")[0];
            if (popups)
                popups.classList.add("prevent-pointer-events");

            this.setSelectionTargets();
        };
        RectangleSelect.prototype.moveSelection = function (point) {
            this.current = point;
            this.drawSelectionRectangle();
        };
        RectangleSelect.prototype.endSelection = function (point) {
            this.selecting = false;
            var ui = document.getElementsByClassName("galaxy-map-ui")[0];
            if (ui)
                ui.classList.remove("prevent-pointer-events");
            var popups = document.getElementsByClassName("popup-container")[0];
            if (popups)
                popups.classList.remove("prevent-pointer-events");

            this.graphics.clear();

            var inSelection = this.getAllInSelection();
            Rance.eventManager.dispatchEvent("selectFleets", inSelection);

            this.start = null;
            this.current = null;
        };

        RectangleSelect.prototype.drawSelectionRectangle = function () {
            if (!this.current)
                return;

            var gfx = this.graphics;
            var bounds = this.getBounds();

            gfx.clear();
            gfx.lineStyle(1, 0xFFFFFF, 1);
            gfx.beginFill(0x000000, 0);
            gfx.drawRect(bounds.x1, bounds.y1, bounds.width, bounds.height);
            gfx.endFill();
        };
        RectangleSelect.prototype.setSelectionTargets = function () {
            if (!this.getSelectionTargetsFN)
                return;

            this.toSelectFrom = this.getSelectionTargetsFN();
        };
        RectangleSelect.prototype.getBounds = function () {
            var x1 = Math.min(this.start.x, this.current.x);
            var x2 = Math.max(this.start.x, this.current.x);
            var y1 = Math.min(this.start.y, this.current.y);
            var y2 = Math.max(this.start.y, this.current.y);

            return ({
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
                width: x2 - x1,
                height: y2 - y1
            });
        };

        RectangleSelect.prototype.getAllInSelection = function () {
            var toReturn = [];

            for (var i = 0; i < this.toSelectFrom.length; i++) {
                if (this.selectionContains(this.toSelectFrom[i].position)) {
                    toReturn.push(this.toSelectFrom[i].data);
                }
            }
            return toReturn;
        };

        RectangleSelect.prototype.selectionContains = function (point) {
            var x = point.x;
            var y = point.y;

            var bounds = this.getBounds();

            return ((x >= bounds.x1 && x <= bounds.x2) && (y >= bounds.y1 && y <= bounds.y2));
        };
        return RectangleSelect;
    })();
    Rance.RectangleSelect = RectangleSelect;
})(Rance || (Rance = {}));
/// <reference path="fleet.ts"/>
/// <reference path="camera.ts"/>
/// <reference path="renderer.ts"/>
/// <reference path="rectangleselect.ts"/>
var Rance;
(function (Rance) {
    var MouseEventHandler = (function () {
        function MouseEventHandler(renderer, camera) {
            this.preventingGhost = false;
            this.listeners = {};
            this.renderer = renderer;
            this.camera = camera;
            this.rectangleselect = new Rance.RectangleSelect(renderer.layers["select"]);
            this.currAction = undefined;

            window.oncontextmenu = function (event) {
                var eventTarget = event.target;
                if (eventTarget.localName !== "canvas")
                    return;
                event.preventDefault();
                event.stopPropagation();
            };

            this.addEventListeners();
        }
        MouseEventHandler.prototype.addEventListeners = function () {
            var self = this;

            var _canvas = document.getElementById("pixi-container");
            _canvas.addEventListener("DOMMouseScroll", function (e) {
                if (e.target.localName !== "canvas")
                    return;
                self.camera.deltaZoom(-e.detail, 0.05);
            });
            _canvas.addEventListener("mousewheel", function (e) {
                if (e.target.localName !== "canvas")
                    return;
                self.camera.deltaZoom(e.wheelDelta / 40, 0.05);
            });
            _canvas.addEventListener("mouseout", function (e) {
                if (e.target.localName !== "canvas")
                    return;
            });

            this.listeners["mouseDown"] = Rance.eventManager.addEventListener("mouseDown", function (e) {
                self.mouseDown(e.content, "world");
            });
            this.listeners["mouseUp"] = Rance.eventManager.addEventListener("mouseUp", function (e) {
                self.mouseUp(e.content, "world");
            });
        };
        MouseEventHandler.prototype.destroy = function () {
            for (var name in this.listeners) {
                Rance.eventManager.removeEventListener(name, this.listeners[name]);
            }
        };
        MouseEventHandler.prototype.preventGhost = function (delay) {
            this.preventingGhost = true;
            var self = this;
            var timeout = window.setTimeout(function () {
                self.preventingGhost = false;
                window.clearTimeout(timeout);
            }, delay);
        };
        MouseEventHandler.prototype.mouseDown = function (event, targetType) {
            if (targetType === "stage") {
                if (event.originalEvent.ctrlKey || event.originalEvent.metaKey || event.originalEvent.button === 1) {
                    this.startScroll(event);
                }
            } else if (targetType === "world") {
                if (event.originalEvent.button === 0) {
                    this.startSelect(event);
                }
            }
        };

        MouseEventHandler.prototype.mouseMove = function (event, targetType) {
            if (targetType === "stage") {
                if (this.currAction === "scroll") {
                    this.scrollMove(event);
                } else if (this.currAction === "zoom") {
                    this.zoomMove(event);
                }
            } else {
                if (this.currAction === "select") {
                    this.dragSelect(event);
                }
            }
        };
        MouseEventHandler.prototype.mouseUp = function (event, targetType) {
            if (this.currAction === undefined)
                return;

            if (targetType === "stage") {
                if (this.currAction === "scroll") {
                    this.endScroll(event);
                    this.preventGhost(15);
                } else if (this.currAction === "zoom") {
                    this.endZoom(event);
                    this.preventGhost(15);
                }
            } else {
                if (this.currAction === "select") {
                    if (!this.preventingGhost)
                        this.endSelect(event);
                }
            }
        };

        MouseEventHandler.prototype.startScroll = function (event) {
            if (this.currAction === "select")
                this.stashedAction = "select";
            this.currAction = "scroll";
            this.startPoint = [event.global.x, event.global.y];
            this.camera.startScroll(this.startPoint);
        };
        MouseEventHandler.prototype.scrollMove = function (event) {
            this.camera.move([event.global.x, event.global.y]);
        };
        MouseEventHandler.prototype.endScroll = function (event) {
            this.camera.end();
            this.startPoint = undefined;
            this.currAction = this.stashedAction;
            this.stashedAction = undefined;
        };
        MouseEventHandler.prototype.zoomMove = function (event) {
            var delta = event.global.x + this.currPoint[1] - this.currPoint[0] - event.global.y;
            this.camera.deltaZoom(delta, 0.005);
            this.currPoint = [event.global.x, event.global.y];
        };
        MouseEventHandler.prototype.endZoom = function (event) {
            this.startPoint = undefined;
            this.currAction = this.stashedAction;
            this.stashedAction = undefined;
        };
        MouseEventHandler.prototype.startZoom = function (event) {
            if (this.currAction === "select")
                this.stashedAction = "select";
            this.currAction = "zoom";
            this.startPoint = this.currPoint = [event.global.x, event.global.y];
        };
        MouseEventHandler.prototype.startSelect = function (event) {
            this.currAction = "select";
            this.rectangleselect.startSelection(event.getLocalPosition(this.renderer.layers["main"]));
        };
        MouseEventHandler.prototype.dragSelect = function (event) {
            this.rectangleselect.moveSelection(event.getLocalPosition(this.renderer.layers["main"]));
        };
        MouseEventHandler.prototype.endSelect = function (event) {
            this.rectangleselect.endSelection(event.getLocalPosition(this.renderer.layers["main"]));
            this.currAction = undefined;
        };
        MouseEventHandler.prototype.hover = function (event) {
        };
        return MouseEventHandler;
    })();
    Rance.MouseEventHandler = MouseEventHandler;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    var UniformManager = (function () {
        function UniformManager() {
            this.registeredObjects = {};
            this.timeCount = 0;
        }
        UniformManager.prototype.registerObject = function (uniformType, shader) {
            if (!this.registeredObjects[uniformType]) {
                this.registeredObjects[uniformType] = [];
            }

            this.registeredObjects[uniformType].push(shader);
        };

        UniformManager.prototype.updateTime = function () {
            this.timeCount += 0.01;

            if (!this.registeredObjects["time"])
                return;

            for (var i = 0; i < this.registeredObjects["time"].length; i++) {
                this.registeredObjects["time"][i].uniforms.time.value = this.timeCount;
            }
        };
        return UniformManager;
    })();
    Rance.UniformManager = UniformManager;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    (function (ShaderSources) {
        ShaderSources.nebula = [
            "precision mediump float;",
            "",
            "uniform vec3 baseColor;",
            "uniform vec3 overlayColor;",
            "uniform vec3 highlightColor;",
            "",
            "uniform float coverage;",
            "",
            "uniform float scale;",
            "",
            "uniform float diffusion;",
            "uniform float streakiness;",
            "",
            "uniform float streakLightness;",
            "uniform float cloudLightness;",
            "",
            "uniform float highlightA;",
            "uniform float highlightB;",
            "",
            "uniform vec2 seed;",
            "",
            "/*",
            "const vec3 baseColor = vec3(1.0, 0.0, 0.0);",
            "const vec3 overlayColor = vec3(0.0, 0.0, 1.0);",
            "const vec3 highlightColor = vec3(1.0, 1.0, 1.0);",
            "",
            "const float coverage = 0.3;",
            "const float coverage2 = coverage / 2.0;",
            "",
            "const float scale = 4.0;",
            "",
            "const float diffusion = 3.0;",
            "const float streakiness = 2.0;",
            "",
            "const float streakLightness = 1.0;",
            "const float cloudLightness = 1.0;",
            "",
            "const float highlightA = 0.9;",
            "const float highlightB = 2.2;",
            "",
            "const vec2 seed = vec2(69.0, 42.0);",
            "*/",
            "",
            "const int sharpness = 6;",
            "",
            "float hash(vec2 p)",
            "{",
            "  return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x))));",
            "}",
            "",
            "float noise(vec2 x)",
            "{",
            "  vec2 i = floor(x);",
            "  vec2 f = fract(x);",
            "  float a = hash(i);",
            "  float b = hash(i + vec2(1.0, 0.0));",
            "  float c = hash(i + vec2(0.0, 1.0));",
            "  float d = hash(i + vec2(1.0, 1.0));",
            "  vec2 u = f * f * (3.0 - 2.0 * f);",
            "  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;",
            "}",
            "",
            "float fbm(vec2 x)",
            "{",
            "  float v = 0.0;",
            "  float a = 0.5;",
            "  vec2 shift = vec2(100);",
            "  mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));",
            "  for (int i = 0; i < sharpness; ++i)",
            "  {",
            "    v += a * noise(x);",
            "    x = rot * x * 2.0 + shift;",
            "    a *= 0.5;",
            "    }",
            "  return v;",
            "}",
            "",
            "float relativeValue(float v, float min, float max)",
            "{",
            "  return (v - min) / (max - min);",
            "}",
            "",
            "float displace(vec2 pos, out vec2 q)",
            "{",
            "  q = vec2(fbm(pos),",
            "    fbm(pos + vec2(23.3, 46.7)));",
            "  return fbm(pos + vec2(q.x * streakiness, q.y));",
            "}",
            "",
            "vec3 colorLayer(vec2 pos, vec3 color)",
            "{",
            "  float v = fbm(pos);",
            "  return mix(vec3(0.0), color, v);",
            "}",
            "",
            "vec3 nebula(vec2 pos, out float volume)",
            "{",
            "  vec2 on = vec2(0.0);",
            "",
            "  volume = displace(pos, on);",
            "  volume = relativeValue(volume, coverage, streakLightness);",
            "  volume += relativeValue(fbm(pos), coverage, cloudLightness);",
            "  volume = pow(volume, diffusion);",
            "",
            "  vec3 c = colorLayer(pos + vec2(42.0, 6.9), baseColor);",
            "  c = mix(c, overlayColor, dot(on.x, on.y));",
            "  c = mix(c, highlightColor, volume *",
            "    smoothstep(highlightA, highlightB, abs(on.x)+abs(on.y)) );",
            "",
            "",
            "  return c * volume;",
            "}",
            "",
            "float star(vec2 pos, float volume)",
            "{",
            "  float genValue = hash(pos);",
            "",
            "  genValue -= volume * 0.01;",
            "",
            "  float color = 0.0;",
            "",
            "  if (genValue < 0.001)",
            "  {",
            "    float r = hash(pos + vec2(4.20, 6.9));",
            "    color = r;",
            "    return color;",
            "  }",
            "  else",
            "  {",
            "    return color;",
            "  }",
            "}",
            "",
            "void main(void)",
            "{",
            "  vec2 pos = gl_FragCoord.xy / 50.0 / scale;",
            "  pos += seed;",
            "  float volume = 0.0;",
            "  vec3 c = nebula(pos, volume);",
            "  c += vec3(star(pos, volume));",
            "",
            "  gl_FragColor = vec4(c, 1.0);",
            "}"
        ];
    })(Rance.ShaderSources || (Rance.ShaderSources = {}));
    var ShaderSources = Rance.ShaderSources;
})(Rance || (Rance = {}));
/// <reference path="uniformmanager.ts"/>
/// <reference path="shaders/converted/shadersources.ts"/>
var Rance;
(function (Rance) {
    var ShaderManager = (function () {
        function ShaderManager() {
            this.shaders = {};
            this.uniformManager = new Rance.UniformManager();
            this.initNebula();
        }
        ShaderManager.prototype.destroy = function () {
            for (var name in this.shaders) {
                var filter = this.shaders[name];
                for (var i = 0; i < filter.shaders.length; i++) {
                    filter.shaders[i].destroy();
                }
            }
        };
        ShaderManager.prototype.initNebula = function () {
            var nebulaColorScheme = Rance.generateColorScheme();

            var lightness = Rance.randRange(1.1, 1.3);

            var nebulaUniforms = {
                baseColor: { type: "3fv", value: Rance.hex2rgb(nebulaColorScheme.main) },
                overlayColor: { type: "3fv", value: Rance.hex2rgb(nebulaColorScheme.secondary) },
                highlightColor: { type: "3fv", value: [1.0, 1.0, 1.0] },
                coverage: { type: "1f", value: Rance.randRange(0.28, 0.32) },
                scale: { type: "1f", value: Rance.randRange(4, 8) },
                diffusion: { type: "1f", value: Rance.randRange(1.5, 3.0) },
                streakiness: { type: "1f", value: Rance.randRange(1.5, 2.5) },
                streakLightness: { type: "1f", value: lightness },
                cloudLightness: { type: "1f", value: lightness },
                highlightA: { type: "1f", value: 0.9 },
                highlightB: { type: "1f", value: 2.2 },
                seed: { type: "2fv", value: [Math.random() * 100, Math.random() * 100] }
            };

            this.shaders["nebula"] = new PIXI.AbstractFilter(Rance.ShaderSources.nebula, nebulaUniforms);
        };
        return ShaderManager;
    })();
    Rance.ShaderManager = ShaderManager;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
/// <reference path="camera.ts"/>
/// <reference path="mouseeventhandler.ts"/>
/// <reference path="shadermanager.ts"/>
var Rance;
(function (Rance) {
    var Renderer = (function () {
        function Renderer() {
            this.layers = {};
            this.isPaused = false;
            this.forceFrame = false;
            this.backgroundIsDirty = true;
            this.isBattleBackground = false;
            PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

            this.stage = new PIXI.Stage(0x101060);
            this.shaderManager = new Rance.ShaderManager();
        }
        Renderer.prototype.init = function () {
            this.initLayers();

            this.addEventListeners();
        };
        Renderer.prototype.initRenderer = function () {
            var containerStyle = window.getComputedStyle(this.pixiContainer);
            this.renderer = PIXI.autoDetectRenderer(parseInt(containerStyle.width), parseInt(containerStyle.height), {
                autoResize: false,
                antialias: true
            });
        };
        Renderer.prototype.destroy = function () {
            this.pause();

            //window.removeEventListener("resize", this.resizeListener);
            this.mouseEventHandler.destroy();
            this.camera.destroy();

            this.layers["bgFilter"].filters = null;

            this.stage.removeChildren();
            this.removeRendererView();
        };
        Renderer.prototype.removeRendererView = function () {
            if (this.renderer.view.parentNode) {
                this.renderer.view.parentNode.removeChild(this.renderer.view);
            }
        };
        Renderer.prototype.bindRendererView = function (container) {
            this.pixiContainer = container;

            if (!this.renderer) {
                var containerStyle = window.getComputedStyle(this.pixiContainer);
                this.renderer = PIXI.autoDetectRenderer(parseInt(containerStyle.width), parseInt(containerStyle.height), {
                    autoResize: false,
                    antialias: true
                });
            }

            this.pixiContainer.appendChild(this.renderer.view);
            this.renderer.view.setAttribute("id", "pixi-canvas");

            this.resize();

            if (!this.isBattleBackground) {
                this.setupDefaultLayers();
                this.addCamera();
            } else {
                this.setupBackgroundLayers();
            }
        };
        Renderer.prototype.initLayers = function () {
            var _bgSprite = this.layers["bgSprite"] = new PIXI.DisplayObjectContainer();

            var _main = this.layers["main"] = new PIXI.DisplayObjectContainer();

            var _map = this.layers["map"] = new PIXI.DisplayObjectContainer();

            var _bgFilter = this.layers["bgFilter"] = new PIXI.DisplayObjectContainer();

            var _select = this.layers["select"] = new PIXI.DisplayObjectContainer();

            _main.addChild(_map);
            _main.addChild(_select);
        };
        Renderer.prototype.setupDefaultLayers = function () {
            this.stage.removeChildren();
            this.stage.addChild(this.layers["bgSprite"]);
            this.stage.addChild(this.layers["main"]);
            this.renderOnce();
        };
        Renderer.prototype.setupBackgroundLayers = function () {
            this.stage.removeChildren();
            this.stage.addChild(this.layers["bgSprite"]);
            this.renderOnce();
        };
        Renderer.prototype.addCamera = function () {
            if (this.mouseEventHandler)
                this.mouseEventHandler.destroy();
            if (this.camera)
                this.camera.destroy();
            this.camera = new Rance.Camera(this.layers["main"], 0.5);
            this.mouseEventHandler = new Rance.MouseEventHandler(this, this.camera);
        };
        Renderer.prototype.addEventListeners = function () {
            var self = this;
            this.resizeListener = this.resize.bind(this);
            window.addEventListener("resize", this.resizeListener, false);

            this.stage.mousedown = this.stage.rightdown = this.stage.touchstart = function (event) {
                self.mouseEventHandler.mouseDown(event, "stage");
            };
            this.stage.mousemove = this.stage.touchmove = function (event) {
                self.mouseEventHandler.mouseMove(event, "stage");
            };
            this.stage.mouseup = this.stage.rightup = this.stage.touchend = function (event) {
                self.mouseEventHandler.mouseUp(event, "stage");
            };
            this.stage.mouseupoutside = this.stage.rightupoutside = this.stage.touchendoutside = function (event) {
                self.mouseEventHandler.mouseUp(event, "stage");
            };

            var main = this.layers["bgSprite"];
            main.interactive = true;

            main.hitArea = new PIXI.Rectangle(-10000, -10000, 20000, 20000);

            main.mousedown = main.rightdown = main.touchstart = function (event) {
                if (event.target !== main)
                    return;
                self.mouseEventHandler.mouseDown(event, "world");
            };
            main.mousemove = main.touchmove = function (event) {
                if (event.target !== main)
                    return;
                self.mouseEventHandler.mouseMove(event, "world");
            };
            main.mouseup = main.rightup = main.touchend = function (event) {
                if (event.target !== main)
                    return;
                self.mouseEventHandler.mouseUp(event, "world");
            };
            main.mouseupoutside = main.rightupoutside = main.touchendoutside = function (event) {
                if (event.target !== main)
                    return;
                self.mouseEventHandler.mouseUp(event, "world");
            };
        };
        Renderer.prototype.resize = function () {
            if (this.renderer && document.body.contains(this.renderer.view)) {
                var w = this.pixiContainer.offsetWidth;
                var h = this.pixiContainer.offsetHeight;
                this.renderer.resize(w, h);
                this.layers["bgFilter"].filterArea = new PIXI.Rectangle(0, 0, w, h);
                this.backgroundIsDirty = true;
                if (this.isPaused) {
                    this.renderOnce();
                }
            }
        };
        Renderer.prototype.makeBackgroundTexture = function (seed) {
            function copyUniforms(uniformObj, target) {
                if (!target)
                    target = {};
                for (var name in uniformObj) {
                    if (!target[name]) {
                        target[name] = { type: uniformObj[name].type };
                    }

                    target[name].value = uniformObj[name].value;
                }

                return target;
            }

            var nebulaFilter = this.shaderManager.shaders["nebula"];

            var oldRng = Math.random;
            var oldUniforms = copyUniforms(nebulaFilter.uniforms);
            Math.random = RNG.prototype.uniform.bind(new RNG(seed));

            var nebulaColorScheme = Rance.generateColorScheme();

            var lightness = Rance.randRange(1, 1.2);

            var newUniforms = {
                baseColor: { value: Rance.hex2rgb(nebulaColorScheme.main) },
                overlayColor: { value: Rance.hex2rgb(nebulaColorScheme.secondary) },
                highlightColor: { value: [1.0, 1.0, 1.0] },
                coverage: { value: Rance.randRange(0.2, 0.4) },
                scale: { value: Rance.randRange(4, 8) },
                diffusion: { value: Rance.randRange(1.5, 3.0) },
                streakiness: { value: Rance.randRange(1.5, 2.5) },
                streakLightness: { value: lightness },
                cloudLightness: { value: lightness },
                highlightA: { value: 0.9 },
                highlightB: { value: 2.2 },
                seed: { value: [Math.random() * 100, Math.random() * 100] }
            };

            copyUniforms(newUniforms, nebulaFilter.uniforms);

            var texture = this.renderNebula();

            copyUniforms(oldUniforms, nebulaFilter.uniforms);
            Math.random = oldRng;

            return texture;
        };
        Renderer.prototype.renderNebula = function () {
            this.layers["bgFilter"].filters = [this.shaderManager.shaders["nebula"]];

            var texture = this.layers["bgFilter"].generateTexture();

            this.layers["bgFilter"].filters = null;

            return texture;
        };
        Renderer.prototype.renderBackground = function () {
            var texture = this.isBattleBackground ? this.renderBlurredNebula.apply(this, this.blurProps) : this.renderNebula();
            var sprite = new PIXI.Sprite(texture);

            this.layers["bgSprite"].removeChildren();
            this.layers["bgSprite"].addChild(sprite);

            this.backgroundIsDirty = false;
        };
        Renderer.prototype.renderBlurredNebula = function (x, y, width, height, seed) {
            var seed = seed || Math.random();
            var bg = new PIXI.Sprite(this.makeBackgroundTexture(seed));
            var fg = new PIXI.Sprite(this.makeBackgroundTexture(seed));

            var container = new PIXI.DisplayObjectContainer();
            container.addChild(bg);
            container.addChild(fg);

            fg.filters = [new PIXI.BlurFilter()];
            fg.filterArea = new PIXI.Rectangle(x, y, width, height);

            var texture = container.generateTexture();

            return texture;
        };
        Renderer.prototype.renderOnce = function () {
            this.forceFrame = true;
            this.render();
        };
        Renderer.prototype.pause = function () {
            this.isPaused = true;
            this.forceFrame = false;
        };
        Renderer.prototype.resume = function () {
            this.isPaused = false;
            this.forceFrame = false;
            this.render();
        };
        Renderer.prototype.render = function () {
            if (!document.body.contains(this.pixiContainer)) {
                this.pause();
                return;
            }
            if (this.isPaused) {
                if (this.forceFrame) {
                    this.forceFrame = false;
                } else {
                    return;
                }
            }

            if (this.backgroundIsDirty) {
                this.renderBackground();
            }

            this.shaderManager.uniformManager.updateTime();

            this.renderer.render(this.stage);

            requestAnimFrame(this.render.bind(this));
        };
        return Renderer;
    })();
    Rance.Renderer = Renderer;
})(Rance || (Rance = {}));
/// <reference path="player.ts"/>
/// <reference path="playercontrol.ts"/>
/// <reference path="galaxymap.ts"/>
/// <reference path="eventmanager.ts"/>
var Rance;
(function (Rance) {
    var Game = (function () {
        function Game(map, players, humanPlayer) {
            this.independents = [];
            this.galaxyMap = map;
            map.game = this;

            this.playerOrder = players;
            this.humanPlayer = humanPlayer;
            this.turnNumber = 1;
        }
        Game.prototype.endTurn = function () {
            this.setNextPlayer();
            this.processPlayerStartTurn(this.activePlayer);

            // TODO
            if (this.activePlayer !== this.humanPlayer) {
                this.endTurn();
            } else {
                this.turnNumber++;
            }

            Rance.eventManager.dispatchEvent("updateSelection", null);
        };
        Game.prototype.processPlayerStartTurn = function (player) {
            var shipStartTurnFN = function (ship) {
                ship.resetMovePoints();
                ship.heal();
                ship.timesActedThisTurn = 0;
            };

            player.forEachUnit(shipStartTurnFN);
            player.money += player.getIncome();
        };

        Game.prototype.setNextPlayer = function () {
            this.playerOrder.push(this.playerOrder.shift());

            this.activePlayer = this.playerOrder[0];
        };
        Game.prototype.serialize = function () {
            var data = {};

            data.galaxyMap = this.galaxyMap.serialize();
            data.players = this.playerOrder.map(function (player) {
                return player.serialize();
            });
            data.players = data.players.concat(this.independents.map(function (player) {
                return player.serialize();
            }));
            data.humanPlayerId = this.humanPlayer.id;

            return data;
        };
        Game.prototype.save = function (name) {
            var saveString = "Rance.Save." + name;

            var date = new Date();

            var gameData = this.serialize();

            var stringified = JSON.stringify({
                name: name,
                date: date,
                gameData: gameData,
                idGenerators: Rance.cloneObject(Rance.idGenerators)
            });

            localStorage.setItem(saveString, stringified);
        };
        return Game;
    })();
    Rance.Game = Game;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
var Rance;
(function (Rance) {
    var AppLoader = (function () {
        function AppLoader(onLoaded) {
            this.loaded = {
                DOM: false,
                emblems: false,
                units: false,
                other: false
            };
            this.imageCache = {};
            this.onLoaded = onLoaded;
            PIXI.dontSayHello = true;
            this.startTime = new Date().getTime();

            this.loadDOM();
            this.loadEmblems();
            this.loadUnits();
            this.loadOther();
        }
        AppLoader.prototype.spritesheetToDataURLs = function (sheetData, sheetImg) {
            var self = this;
            var frames = {};

            (function splitSpritesheetFN() {
                for (var sprite in sheetData.frames) {
                    var frame = sheetData.frames[sprite].frame;

                    var canvas = document.createElement("canvas");
                    canvas.width = frame.w;
                    canvas.height = frame.h;
                    var context = canvas.getContext("2d");

                    context.drawImage(sheetImg, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

                    var image = new Image();
                    image.src = canvas.toDataURL();

                    frames[sprite] = image;
                }
            }());

            return frames;
        };
        AppLoader.prototype.loadDOM = function () {
            var self = this;
            if (document.readyState === "interactive" || document.readyState === "complete") {
                self.loaded.DOM = true;
                self.checkLoaded();
            } else {
                document.addEventListener('DOMContentLoaded', function () {
                    self.loaded.DOM = true;
                    self.checkLoaded();
                });
            }
        };
        AppLoader.prototype.loadImagesFN = function (identifier) {
            if (this.loaded[identifier] === undefined)
                this.loaded[identifier] = false;

            var self = this;
            var loader = new PIXI.JsonLoader("img\/" + identifier + ".json");
            loader.addEventListener("loaded", function (event) {
                var spriteImages = self.spritesheetToDataURLs(event.target.json, event.target.texture.source);
                self.imageCache[identifier] = spriteImages;
                self.loaded[identifier] = true;
                self.checkLoaded();
            });

            loader.load();
        };
        AppLoader.prototype.loadEmblems = function () {
            this.loadImagesFN("emblems");
        };
        AppLoader.prototype.loadUnits = function () {
            this.loadImagesFN("units");
        };
        AppLoader.prototype.loadOther = function () {
            var self = this;
            var loader = new PIXI.ImageLoader("img\/fowTexture.png");

            loader.addEventListener("loaded", function (event) {
                self.loaded.other = true;
                self.checkLoaded();
            });

            loader.load();
        };
        AppLoader.prototype.checkLoaded = function () {
            for (var prop in this.loaded) {
                if (!this.loaded[prop]) {
                    return;
                }
            }
            var elapsed = new Date().getTime() - this.startTime;
            console.log("Loaded in " + elapsed + " ms");
            this.onLoaded.call();
        };
        return AppLoader;
    })();
    Rance.AppLoader = AppLoader;
})(Rance || (Rance = {}));
/// <reference path="game.ts"/>
/// <reference path="mapgen.ts"/>
/// <reference path="player.ts"/>
/// <reference path="galaxymap.ts"/>
/// <reference path="sector.ts"/>
var Rance;
(function (Rance) {
    var GameLoader = (function () {
        function GameLoader() {
            this.players = [];
            this.independents = [];
            this.playersById = {};
            this.pointsById = {};
            this.unitsById = {};
            this.buildingsByControllerId = {};
            this.sectors = {};
        }
        GameLoader.prototype.deserializeGame = function (data) {
            this.map = this.deserializeMap(data.galaxyMap);

            for (var i = 0; i < data.players.length; i++) {
                var playerData = data.players[i];
                var id = playerData.id;
                var player = this.playersById[id] = this.deserializePlayer(playerData);
                if (player.isIndependent) {
                    this.independents.push(player);
                } else {
                    this.players.push(player);
                }
            }

            this.humanPlayer = this.playersById[data.humanPlayerId];

            this.deserializeBuildings(data.galaxyMap);

            var game = new Rance.Game(this.map, this.players, this.humanPlayer);
            game.independents = game.independents.concat(this.independents);

            return game;
        };
        GameLoader.prototype.deserializeMap = function (data) {
            var mapGen = new Rance.MapGen();
            mapGen.maxWidth = data.maxWidth;
            mapGen.maxHeight = data.maxHeight;

            for (var i = 0; i < data.regionNames; i++) {
                mapGen.makeRegion(data.regionNames[i]);
            }

            var allPoints = [];

            for (var i = 0; i < data.allPoints.length; i++) {
                var point = this.deserializePoint(data.allPoints[i]);
                allPoints.push(point);
                this.pointsById[point.id] = point;
            }

            for (var i = 0; i < data.allPoints.length; i++) {
                var dataPoint = data.allPoints[i];
                var realPoint = this.pointsById[dataPoint.id];

                for (var j = 0; j < dataPoint.linksToIds.length; j++) {
                    var linkId = dataPoint.linksToIds[j];
                    var linkPoint = this.pointsById[linkId];
                    realPoint.addLink(linkPoint);
                }
            }

            for (var i = 0; i < data.sectors.length; i++) {
                this.sectors[data.sectors[i].id] = this.deserializeSector(data.sectors[i]);
            }

            mapGen.points = allPoints;
            mapGen.sectors = this.sectors;
            mapGen.makeVoronoi();

            var galaxyMap = new Rance.GalaxyMap();
            galaxyMap.setMapGen(mapGen);

            return galaxyMap;
        };
        GameLoader.prototype.deserializeSector = function (data) {
            var sector = new Rance.Sector(data.id, data.color);
            for (var i = 0; i < data.starIds.length; i++) {
                sector.addStar(this.pointsById[data.starIds[i]]);
            }
            return sector;
        };
        GameLoader.prototype.deserializePoint = function (data) {
            var star = new Rance.Star(data.x, data.y, data.id);
            star.name = data.name;
            star.distance = data.distance;
            star.region = data.region;
            star.baseIncome = data.baseIncome;
            star.backgroundSeed = data.backgroundSeed;

            var buildableItems = {};

            for (var techLevel in data.buildableItems) {
                buildableItems[techLevel] = data.buildableItems[techLevel].map(function (templateType) {
                    return Rance.Templates.Items[templateType];
                });
            }

            star.buildableItems = buildableItems;

            return star;
        };
        GameLoader.prototype.deserializeBuildings = function (data) {
            for (var i = 0; i < data.allPoints.length; i++) {
                var starData = data.allPoints[i];
                var star = this.pointsById[starData.id];

                for (var category in starData.buildings) {
                    for (var j = 0; j < starData.buildings[category].length; j++) {
                        var buildingData = starData.buildings[category][j];
                        var building = this.deserializeBuilding(buildingData);

                        star.addBuilding(building);
                    }
                }
            }
        };
        GameLoader.prototype.deserializeBuilding = function (data) {
            var template = Rance.Templates.Buildings[data.templateType];
            var building = new Rance.Building({
                template: template,
                location: this.pointsById[data.locationId],
                controller: this.playersById[data.controllerId],
                upgradeLevel: data.upgradeLevel,
                totalCost: data.totalCost,
                id: data.id
            });

            return building;
        };
        GameLoader.prototype.deserializePlayer = function (data) {
            var player = new Rance.Player(data.id);

            player.money = data.money;

            // color scheme & flag
            if (data.isIndependent) {
                player.setupPirates();
            } else {
                player.color = data.color;
                player.secondaryColor = data.secondaryColor;
                player.colorAlpha = data.colorAlpha;

                player.makeFlag(data.flag.seed);
            }

            for (var i = 0; i < data.fleets.length; i++) {
                var fleet = data.fleets[i];
                player.addFleet(this.deserializeFleet(player, fleet));
            }

            for (var i = 0; i < data.controlledLocationIds.length; i++) {
                player.addStar(this.pointsById[data.controlledLocationIds[i]]);
            }

            for (var i = 0; i < data.items.length; i++) {
                this.deserializeItem(data.items[i], player);
            }

            for (var i = 0; i < data.revealedStarIds.length; i++) {
                var id = data.revealedStarIds[i];
                player.revealedStars[id] = this.pointsById[id];
            }

            return player;
        };
        GameLoader.prototype.deserializeFleet = function (player, data) {
            var ships = [];

            for (var i = 0; i < data.ships.length; i++) {
                var ship = this.deserializeShip(data.ships[i]);
                player.addUnit(ship);
                ships.push(ship);
            }

            return new Rance.Fleet(player, ships, this.pointsById[data.locationId], data.id);
        };
        GameLoader.prototype.deserializeShip = function (data) {
            var template = Rance.Templates.ShipTypes[data.templateType];

            var ship = new Rance.Unit(template, data.id, data);

            this.unitsById[ship.id] = ship;

            return ship;
        };
        GameLoader.prototype.deserializeItem = function (data, player) {
            var template = Rance.Templates.Items[data.templateType];

            var item = new Rance.Item(template, data.id);

            player.addItem(item);
            if (isFinite(data.unitId)) {
                this.unitsById[data.unitId].addItem(item);
            }
        };
        return GameLoader;
    })();
    Rance.GameLoader = GameLoader;
})(Rance || (Rance = {}));
// handles assignment of all dynamic properties for templates
/// <reference path="templates/abilitytemplates.ts" />
var Rance;
(function (Rance) {
    function setAllDynamicTemplateProperties() {
        setAbilityGuardAddition();
    }
    Rance.setAllDynamicTemplateProperties = setAllDynamicTemplateProperties;
    function setAbilityGuardAddition() {
        function checkIfAbilityAddsGuard(ability) {
            var effects = [ability.mainEffect];
            if (ability.secondaryEffects) {
                effects = effects.concat(ability.secondaryEffects);
            }

            var dummyUser = new Rance.Unit(Rance.getRandomProperty(Rance.Templates.ShipTypes));
            var dummyTarget = new Rance.Unit(Rance.getRandomProperty(Rance.Templates.ShipTypes));

            for (var i = 0; i < effects.length; i++) {
                effects[i].effect(dummyUser, dummyTarget);
                if (dummyUser.battleStats.guardAmount) {
                    return true;
                }
            }

            return false;
        }

        for (var abilityName in Rance.Templates.Abilities) {
            var ability = Rance.Templates.Abilities[abilityName];
            ability.addsGuard = checkIfAbilityAddsGuard(ability);
        }
    }
})(Rance || (Rance = {}));
/// <reference path="../data/templates/abilitytemplates.ts" />
/// <reference path="unit.ts"/>
var Rance;
(function (Rance) {
    var MCTreeNode = (function () {
        function MCTreeNode(battle, sideId, move) {
            this.depth = 0;
            this.children = [];
            this.visits = 0;
            this.wins = 0;
            this.winRate = 0;
            this.totalScore = 0;
            this.averageScore = 0;
            this.uctIsDirty = true;
            this.battle = battle;
            this.sideId = sideId;
            this.move = move;

            this.currentScore = battle.getEvaluation();
        }
        MCTreeNode.prototype.getPossibleMoves = function () {
            if (!this.battle.activeUnit) {
                return null;
            }
            var targets = Rance.getTargetsForAllAbilities(this.battle, this.battle.activeUnit);

            var actions = [];

            for (var id in targets) {
                var unit = this.battle.unitsById[id];
                var targetActions = targets[id];
                for (var i = 0; i < targetActions.length; i++) {
                    actions.push({
                        targetId: id,
                        ability: targetActions[i]
                    });
                }
            }

            return actions;
        };
        MCTreeNode.prototype.addChild = function () {
            if (!this.possibleMoves) {
                this.possibleMoves = this.getPossibleMoves();
            }

            var move = this.possibleMoves.pop();

            var battle = this.battle.makeVirtualClone();

            Rance.useAbility(battle, battle.activeUnit, move.ability, battle.unitsById[move.targetId]);

            battle.endTurn();

            var child = new MCTreeNode(battle, this.sideId, move);
            child.parent = this;
            child.depth = this.depth + 1;
            this.children.push(child);

            return child;
        };
        MCTreeNode.prototype.updateResult = function (result) {
            this.visits++;
            this.totalScore += result;

            if (this.sideId === "side1") {
                if (result < 0)
                    this.wins++;
            }
            if (this.sideId === "side2") {
                if (result > 0)
                    this.wins++;
            }

            this.averageScore = this.totalScore / this.visits;
            this.winRate = this.wins / this.visits;
            this.uctIsDirty = true;

            if (this.parent)
                this.parent.updateResult(result);
        };
        MCTreeNode.prototype.simulateOnce = function (battle) {
            var actions = Rance.getTargetsForAllAbilities(battle, battle.activeUnit);
            var targetId = Rance.getRandomKey(actions);

            var action = Rance.getRandomArrayItem(actions[targetId]);

            var target = battle.unitsById[targetId];

            Rance.useAbility(battle, battle.activeUnit, action, target);
            battle.endTurn();
        };
        MCTreeNode.prototype.simulateToEnd = function () {
            var battle = this.battle.makeVirtualClone();

            while (!battle.ended) {
                this.simulateOnce(battle);
            }

            this.updateResult(battle.getEvaluation());
        };
        MCTreeNode.prototype.clearResult = function () {
            this.visits = 0;
            this.wins = 0;
            this.averageScore = 0;
            this.totalScore = 0;
        };
        MCTreeNode.prototype.setUct = function () {
            if (!parent) {
                this.uctEvaluation = -1;
                this.uctIsDirty = false;
                return;
            }

            this.uctEvaluation = this.wins / this.visits + Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);

            this.uctIsDirty = false;
        };
        MCTreeNode.prototype.getHighestUctChild = function () {
            var highest = this.children[0];
            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child.uctIsDirty) {
                    child.setUct();
                }

                if (child.uctEvaluation > highest.uctEvaluation) {
                    highest = child;
                }
            }

            return highest;
        };
        MCTreeNode.prototype.getRecursiveBestUctChild = function () {
            if (!this.possibleMoves) {
                this.possibleMoves = this.getPossibleMoves();
            }

            // not fully expanded
            if (this.possibleMoves && this.possibleMoves.length > 0) {
                return this.addChild();
            } else if (this.children.length > 0) {
                return this.getHighestUctChild().getRecursiveBestUctChild();
            } else {
                return this;
            }
        };
        return MCTreeNode;
    })();
    Rance.MCTreeNode = MCTreeNode;
})(Rance || (Rance = {}));
/// <reference path="mctreenode.ts"/>
/// <reference path="battle.ts"/>
var Rance;
(function (Rance) {
    var MCTree = (function () {
        function MCTree(battle, sideId) {
            var cloned = battle.makeVirtualClone();
            this.rootNode = new Rance.MCTreeNode(cloned, sideId);
        }
        MCTree.prototype.sortByWinRateFN = function (a, b) {
            return b.winRate - a.winRate;
        };
        MCTree.prototype.sortByScoreFN = function (a, b) {
            return b.averageScore - a.averageScore;
        };
        MCTree.prototype.evaluate = function (iterations) {
            var root = this.rootNode;
            root.possibleMoves = root.getPossibleMoves();
            for (var i = 0; i < iterations; i++) {
                // select & expand
                var toSimulateFrom = root.getRecursiveBestUctChild();

                // simulate & backpropagate
                toSimulateFrom.simulateToEnd();
            }

            var sortedMoves = root.children.sort(this.sortByWinRateFN);

            var best = sortedMoves[0];

            var consoleRows = [];
            for (var i = 0; i < sortedMoves.length; i++) {
                var node = sortedMoves[i];
                var row = {
                    visits: node.visits,
                    uctEvaluation: node.uctEvaluation,
                    winRate: node.winRate,
                    currentScore: node.currentScore,
                    averageScore: node.averageScore,
                    abilityName: node.move.ability.displayName,
                    targetId: node.move.targetId
                };
                consoleRows.push(row);
            }
            var _ = window;

            if (_.console.table) {
                _.console.table(consoleRows);
            }

            console.log(sortedMoves);

            return best;
        };
        MCTree.prototype.printToConsole = function () {
        };
        return MCTree;
    })();
    Rance.MCTree = MCTree;
})(Rance || (Rance = {}));
/// <reference path="../lib/pixi.d.ts" />
/// <reference path="eventmanager.ts"/>
/// <reference path="fleet.ts" />
/// <reference path="star.ts" />
var Rance;
(function (Rance) {
    var PathfindingArrow = (function () {
        function PathfindingArrow(parentContainer) {
            this.labelCache = {};
            this.listeners = {};
            this.curveStyles = {
                reachable: {
                    color: 0xFFFFF0
                },
                unreachable: {
                    color: 0xFF0000
                }
            };
            this.parentContainer = parentContainer;
            this.container = new PIXI.DisplayObjectContainer();
            this.parentContainer.addChild(this.container);

            this.addEventListeners();
        }
        PathfindingArrow.prototype.removeEventListener = function (name) {
            Rance.eventManager.removeEventListener(name, this.listeners[name]);
        };
        PathfindingArrow.prototype.removeEventListeners = function () {
            for (var name in this.listeners) {
                this.removeEventListener(name);
            }
        };
        PathfindingArrow.prototype.addEventListener = function (name, handler) {
            this.listeners[name] = handler;

            Rance.eventManager.addEventListener(name, handler);
        };
        PathfindingArrow.prototype.addEventListeners = function () {
            var self = this;

            this.addEventListener("startPotentialMove", function (e) {
                self.startMove();
                if (e.data) {
                    self.setTarget(e.data);
                }
            });

            this.addEventListener("setPotentialMoveTarget", function (e) {
                self.setTarget(e.data);
            });
            this.addEventListener("clearPotentialMoveTarget", function (e) {
                self.clearTarget();
            });

            this.addEventListener("endPotentialMove", function (e) {
                self.endMove();
            });

            this.addEventListener("mouseUp", function (e) {
                self.endMove();
            });
        };

        PathfindingArrow.prototype.startMove = function () {
            var fleets = app.playerControl.selectedFleets;

            if (this.active || !fleets || fleets.length < 1) {
                return;
            }

            this.active = true;
            this.currentTarget = null;
            this.selectedFleets = fleets;
            this.clearArrows();
        };

        PathfindingArrow.prototype.setTarget = function (star) {
            if (!this.active) {
                return;
            }

            if (this.clearTargetTimeout) {
                window.clearTimeout(this.clearTargetTimeout);
            }

            this.currentTarget = star;
            this.drawAllCurrentCurves();
        };

        PathfindingArrow.prototype.clearTarget = function () {
            if (!this.active) {
                return;
            }

            var self = this;

            if (this.clearTargetTimeout) {
                window.clearTimeout(this.clearTargetTimeout);
            }

            this.clearTargetTimeout = window.setTimeout(function () {
                self.currentTarget = null;
                self.clearArrows();
                self.clearTargetTimeout = null;
            }, 10);
        };

        PathfindingArrow.prototype.endMove = function () {
            this.active = false;
            this.currentTarget = null;
            this.selectedFleets = null;
            this.clearArrows();
        };

        PathfindingArrow.prototype.clearArrows = function () {
            this.container.removeChildren();
        };

        PathfindingArrow.prototype.makeLabel = function (style, distance) {
            var textStyle;

            switch (style) {
                case "reachable": {
                    textStyle = {
                        fill: 0xFFFFF0
                    };
                    break;
                }
                case "unreachable": {
                    textStyle = {
                        fill: 0xFF0000
                    };
                    break;
                }
            }

            if (!this.labelCache[style]) {
                this.labelCache[style] = {};
            }

            this.labelCache[style][distance] = new PIXI.Text(distance, textStyle);
        };

        PathfindingArrow.prototype.getLabel = function (style, distance) {
            if (!this.labelCache[style] || !this.labelCache[style][distance]) {
                this.makeLabel(style, distance);
            }

            return this.labelCache[style][distance];
        };

        PathfindingArrow.prototype.getAllCurrentPaths = function () {
            var paths = [];

            for (var i = 0; i < this.selectedFleets.length; i++) {
                var fleet = this.selectedFleets[i];

                if (fleet.location.id === this.currentTarget.id)
                    continue;

                var path = fleet.getPathTo(this.currentTarget);

                paths.push({
                    fleet: fleet,
                    path: path
                });
            }

            return paths;
        };

        PathfindingArrow.prototype.getAllCurrentCurves = function () {
            var paths = this.getAllCurrentPaths();
            var self = this;

            var curves = [];

            var totalPathsPerStar = {};
            var alreadyVisitedPathsPerStar = {};

            for (var i = 0; i < paths.length; i++) {
                for (var j = 0; j < paths[i].path.length; j++) {
                    var star = paths[i].path[j].star;

                    if (!totalPathsPerStar[star.id]) {
                        totalPathsPerStar[star.id] = 0;
                        alreadyVisitedPathsPerStar[star.id] = 0;
                    }

                    totalPathsPerStar[star.id]++;
                }
            }

            for (var i = 0; i < paths.length; i++) {
                var fleet = paths[i].fleet;
                var path = paths[i].path;
                var distance = path.length - 1;

                var currentMovePoints = fleet.getMinCurrentMovePoints();
                var canReach = currentMovePoints >= distance;

                var style = canReach ? "reachable" : "unreachable";

                var stars = path.map(function (pathPoint) {
                    var star = pathPoint.star;
                    if (totalPathsPerStar[star.id] > 1 && star !== self.currentTarget) {
                        var visits = ++alreadyVisitedPathsPerStar[star.id];
                        return self.getTargetOffset(star, visits, totalPathsPerStar[star.id], 12);
                    } else {
                        return star;
                    }
                });
                var curveData = this.getCurveData(stars);

                curves.push({
                    style: style,
                    curveData: curveData
                });
            }

            return curves;
        };

        PathfindingArrow.prototype.drawAllCurrentCurves = function () {
            this.clearArrows();
            var curves = this.getAllCurrentCurves();

            for (var i = 0; i < curves.length; i++) {
                var curve = this.drawCurve(curves[i].curveData, this.curveStyles[curves[i].style]);

                this.container.addChild(curve);
            }
        };

        PathfindingArrow.prototype.getCurveData = function (points) {
            var i6 = 1.0 / 6.0;
            var path = [];
            var abababa = [points[0]].concat(points);
            abababa.push(points[points.length - 1]);

            for (var i = 3, n = abababa.length; i < n; i++) {
                var p0 = abababa[i - 3];
                var p1 = abababa[i - 2];
                var p2 = abababa[i - 1];
                var p3 = abababa[i];

                path.push([
                    p2.x * i6 + p1.x - p0.x * i6,
                    p2.y * i6 + p1.y - p0.y * i6,
                    p3.x * -i6 + p2.x + p1.x * i6,
                    p3.y * -i6 + p2.y + p1.y * i6,
                    p2.x,
                    p2.y
                ]);
            }

            path[0][0] = points[0].x;
            path[0][1] = points[0].y;

            return path;
        };

        PathfindingArrow.prototype.drawCurve = function (points, style) {
            var gfx = new PIXI.Graphics();

            gfx.lineStyle(12, style.color, 0.7);
            gfx.moveTo(points[0][0], points[0][1]);

            for (var i = 0; i < points.length; i++) {
                gfx.bezierCurveTo.apply(gfx, points[i]);
            }
            gfx.height;

            this.drawArrowHead(gfx, style.color);

            return gfx;
        };
        PathfindingArrow.prototype.drawArrowHead = function (gfx, color) {
            var points = gfx.graphicsData[0].shape.points;

            var x1 = points[points.length - 12];
            var y1 = points[points.length - 11];
            var x2 = points[points.length - 2];
            var y2 = points[points.length - 1];

            var lineAngle = Math.atan2(y2 - y1, x2 - x1);
            var headLength = 30;
            var buttAngle = 27 * (Math.PI / 180);

            var hypotenuseLength = Math.abs(headLength / Math.cos(buttAngle));

            var angle1 = lineAngle + Math.PI + buttAngle;
            var topX = x2 + Math.cos(angle1) * hypotenuseLength;
            var topY = y2 + Math.sin(angle1) * hypotenuseLength;

            var angle2 = lineAngle + Math.PI - buttAngle;
            var botX = x2 + Math.cos(angle2) * hypotenuseLength;
            var botY = y2 + Math.sin(angle2) * hypotenuseLength;

            gfx.lineStyle(null);

            gfx.moveTo(x2, y2);
            gfx.beginFill(color, 0.7);
            gfx.lineTo(topX, topY);
            gfx.lineTo(botX, botY);
            gfx.lineTo(x2, y2);
            gfx.endFill();

            var buttMidX = x2 + Math.cos(lineAngle + Math.PI) * headLength;
            var buttMidY = y2 + Math.sin(lineAngle + Math.PI) * headLength;

            for (var i = points.length - 1; i >= 0; i -= 2) {
                var y = points[i];
                var x = points[i - 1];
                var distance = Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2));

                if (distance >= headLength + 10) {
                    points.push(buttMidX);
                    points.push(buttMidY);
                    break;
                } else {
                    points.pop();
                    points.pop();
                }
            }

            gfx.height;
        };

        PathfindingArrow.prototype.getTargetOffset = function (target, i, totalPaths, offsetPerOrbit) {
            var maxPerOrbit = 6;

            var currentOrbit = Math.ceil(i / maxPerOrbit);
            var isOuterOrbit = currentOrbit > Math.floor(totalPaths / maxPerOrbit);
            var pathsInCurrentOrbit = isOuterOrbit ? totalPaths % maxPerOrbit : maxPerOrbit;

            var positionInOrbit = (i - 1) % pathsInCurrentOrbit;

            var distance = currentOrbit * offsetPerOrbit;

            var angle = (Math.PI * 2 / pathsInCurrentOrbit) * positionInOrbit;

            var x = Math.sin(angle) * distance;
            var y = Math.cos(angle) * distance;

            return ({
                x: target.x + x,
                y: target.y - y
            });
        };
        return PathfindingArrow;
    })();
    Rance.PathfindingArrow = PathfindingArrow;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    function getAllBorderEdgesByStar(edges, revealedStars) {
        var edgesByStar = {};

        for (var i = 0; i < edges.length; i++) {
            var edge = edges[i];

            if (edge.lSite && edge.rSite && edge.lSite.owner === edge.rSite.owner) {
                continue;
            }

            ["lSite", "rSite"].forEach(function (neighborDirection) {
                var neighbor = edge[neighborDirection];

                if (neighbor && neighbor.owner && !neighbor.owner.isIndependent) {
                    if (!revealedStars || revealedStars.indexOf(neighbor) !== -1) {
                        if (!edgesByStar[neighbor.id]) {
                            edgesByStar[neighbor.id] = {
                                star: neighbor,
                                edges: []
                            };
                        }
                        edgesByStar[neighbor.id].edges.push(edge);
                    }
                }
            });
        }

        return edgesByStar;
    }
    Rance.getAllBorderEdgesByStar = getAllBorderEdgesByStar;
})(Rance || (Rance = {}));
/// <reference path="../galaxymap.ts"/>
/// <reference path="../player.ts"/>
var Rance;
(function (Rance) {
    Rance.defaultEvaluationParameters = {
        starDesirability: {
            neighborRange: 1,
            neighborWeight: 0.5,
            totalIncomeWeight: 1,
            baseIncomeWeight: 0.5,
            infrastructureWeight: 1,
            productionWeight: 1
        }
    };

    var MapEvaluator = (function () {
        function MapEvaluator(map, player) {
            this.map = map;
            this.player = player;

            this.evaluationParameters = Rance.defaultEvaluationParameters;
        }
        MapEvaluator.prototype.evaluateStarIncome = function (star) {
            var evaluation = 0;

            evaluation += star.baseIncome;
            evaluation += (star.getIncome() - star.baseIncome) * (1 - this.evaluationParameters.starDesirability.baseIncomeWeight);

            return evaluation;
        };

        MapEvaluator.prototype.evaluateStarInfrastructure = function (star) {
            var evaluation = 0;

            for (var category in star.buildings) {
                for (var i = 0; i < star.buildings[category].length; i++) {
                    evaluation += star.buildings[category][i].totalCost;
                }
            }

            return evaluation;
        };

        MapEvaluator.prototype.evaluateStarProduction = function (star) {
            var evaluation = 0;

            evaluation += star.getItemManufactoryLevel();

            return evaluation;
        };

        MapEvaluator.prototype.evaluateNeighboringStarsDesirability = function (star, range) {
            var evaluation = 0;

            var getDistanceFalloff = function (distance) {
                return 1 / (distance + 1);
            };
            var inRange = star.getLinkedInRange(range).byRange;

            for (var distanceString in inRange) {
                var stars = inRange[distanceString];
                var distanceFalloff = getDistanceFalloff(parseInt(distanceString));

                for (var i = 0; i < stars.length; i++) {
                    evaluation += this.evaluateIndividualStarDesirability(stars[i]) * distanceFalloff;
                }
            }

            return evaluation;
        };

        MapEvaluator.prototype.evaluateIndividualStarDesirability = function (star) {
            var evaluation = 0;
            var p = this.evaluationParameters.starDesirability;

            evaluation += this.evaluateStarIncome(star) * p.totalIncomeWeight;
            evaluation += this.evaluateStarInfrastructure(star) * p.infrastructureWeight;
            evaluation += this.evaluateStarProduction(star) * p.productionWeight;

            return evaluation;
        };

        MapEvaluator.prototype.evaluateStarDesirability = function (star) {
            var evaluation = 0;
            var p = this.evaluationParameters.starDesirability;

            evaluation += this.evaluateIndividualStarDesirability(star);
            evaluation += this.evaluateNeighboringStarsDesirability(star, p.neighborRange) * p.neighborWeight;

            return evaluation;
        };

        MapEvaluator.prototype.evaluateImmediateExpansionTargets = function () {
            var stars = this.player.getNeighboringStars();
            stars = stars.filter(function (star) {
                return star.owner.isIndependent;
            });

            var evaluationByStar = {};

            for (var i = 0; i < stars.length; i++) {
                var star = stars[i];

                var desirability = this.evaluateStarDesirability(star);
                var independentStrength = this.getIndependentStrengthAtStar(star) || 1;

                var ownInfluenceMap = this.buildPlayerInfluenceMap(this.player);
                var ownInfluenceAtStar = ownInfluenceMap[star.id] || 0;

                evaluationByStar[star.id] = {
                    star: star,
                    desirability: desirability,
                    independentStrength: independentStrength,
                    ownInfluence: ownInfluenceAtStar
                };
            }

            return evaluationByStar;
        };

        MapEvaluator.prototype.scoreExpansionTargets = function (evaluations) {
            var scores = [];

            for (var starId in evaluations) {
                var evaluation = evaluations[starId];

                var easeOfCapturing = Math.log(evaluation.ownInfluence / evaluation.independentStrength);

                var score = evaluation.desirability * easeOfCapturing;

                scores.push({
                    star: evaluation.star,
                    evaluation: evaluation,
                    score: score
                });
            }

            return scores.sort(function (a, b) {
                return b.score - a.score;
            });
        };

        MapEvaluator.prototype.getScoredExpansionTargets = function () {
            var evaluations = this.evaluateImmediateExpansionTargets();
            var scores = this.scoreExpansionTargets(evaluations);

            return scores;
        };

        MapEvaluator.prototype.getHostileShipsAtStar = function (star) {
            var hostilePlayers = star.getEnemyFleetOwners(this.player);

            var shipsByEnemy = {};

            for (var i = 0; i < hostilePlayers.length; i++) {
                shipsByEnemy[hostilePlayers[i].id] = star.getAllShipsOfPlayer(hostilePlayers[i]);
            }

            return shipsByEnemy;
        };

        MapEvaluator.prototype.getHostileStrengthAtStar = function (star) {
            var hostileShipsByPlayer = this.getHostileShipsAtStar(star);

            var strengthByEnemy = {};

            for (var playerId in hostileShipsByPlayer) {
                var strength = 0;

                for (var i = 0; i < hostileShipsByPlayer[playerId].length; i++) {
                    strength += hostileShipsByPlayer[playerId][i].currentStrength;
                }

                strengthByEnemy[playerId] = strength;
            }

            return strengthByEnemy;
        };

        MapEvaluator.prototype.getIndependentStrengthAtStar = function (star) {
            var byPlayer = this.getHostileStrengthAtStar(star);

            var total = 0;

            for (var playerId in byPlayer) {
                // TODO
                var isIndependent = false;
                for (var i = 0; i < this.map.game.independents.length; i++) {
                    if (this.map.game.independents[i].id === parseInt(playerId)) {
                        isIndependent = true;
                        break;
                    }
                }

                // END
                if (isIndependent) {
                    total += byPlayer[playerId];
                } else {
                    continue;
                }
            }

            return total;
        };

        MapEvaluator.prototype.getTotalHostileStrengthAtStar = function (star) {
            var byPlayer = this.getHostileStrengthAtStar(star);

            var total = 0;

            for (var playerId in byPlayer) {
                total += byPlayer[playerId];
            }

            return total;
        };

        MapEvaluator.prototype.getDefenceBuildingStrengthAtStarByPlayer = function (star) {
            var byPlayer = {};

            for (var i = 0; i < star.buildings["defence"].length; i++) {
                var building = star.buildings["defence"][i];

                if (!byPlayer[building.controller.id]) {
                    byPlayer[building.controller.id] = 0;
                }

                byPlayer[building.controller.id] += building.totalCost;
            }

            return byPlayer;
        };

        MapEvaluator.prototype.getTotalDefenceBuildingStrengthAtStar = function (star) {
            var strength = 0;

            for (var i = 0; i < star.buildings["defence"].length; i++) {
                var building = star.buildings["defence"][i];

                if (building.controller.id === this.player.id)
                    continue;

                strength += building.totalCost;
            }

            return strength;
        };

        MapEvaluator.prototype.evaluateFleetStrength = function (fleet) {
            return fleet.getTotalStrength().current;
        };

        MapEvaluator.prototype.getVisibleFleetsByPlayer = function () {
            var stars = this.player.getVisibleStars();

            var byPlayer = {};

            for (var i = 0; i < stars.length; i++) {
                var star = stars[i];

                for (var playerId in star.fleets) {
                    var playerFleets = star.fleets[playerId];

                    if (!byPlayer[playerId]) {
                        byPlayer[playerId] = [];
                    }

                    for (var j = 0; j < playerFleets.length; j++) {
                        byPlayer[playerId] = byPlayer[playerId].concat(playerFleets[j]);
                    }
                }
            }

            return byPlayer;
        };

        MapEvaluator.prototype.buildPlayerInfluenceMap = function (player) {
            var playerIsImmobile = player.isIndependent;

            var influenceByStar = {};

            var stars = this.player.getRevealedStars();

            for (var i = 0; i < stars.length; i++) {
                var star = stars[i];

                var defenceBuildingStrengths = this.getDefenceBuildingStrengthAtStarByPlayer(star);

                if (defenceBuildingStrengths[player.id]) {
                    if (!isFinite(influenceByStar[star.id])) {
                        influenceByStar[star.id] = 0;
                    }
                    ;

                    influenceByStar[star.id] += defenceBuildingStrengths[player.id];
                }
            }

            var fleets = this.getVisibleFleetsByPlayer()[player.id];

            function getDistanceFalloff(distance) {
                return 1 / (distance + 1);
            }

            for (var i = 0; i < fleets.length; i++) {
                var fleet = fleets[i];
                var strength = this.evaluateFleetStrength(fleet);
                var location = fleet.location;

                var range = fleet.getMinMaxMovePoints();
                var turnsToCheck = 2;

                var inFleetRange = location.getLinkedInRange(range * turnsToCheck).byRange;

                inFleetRange[0] = [location];

                for (var distance in inFleetRange) {
                    var numericDistance = parseInt(distance);
                    var turnsToReach = Math.floor((numericDistance - 1) / range);
                    if (turnsToReach < 0)
                        turnsToReach = 0;
                    var distanceFalloff = getDistanceFalloff(turnsToReach);
                    var adjustedStrength = strength * distanceFalloff;

                    for (var j = 0; j < inFleetRange[distance].length; j++) {
                        var star = inFleetRange[distance][j];

                        if (!isFinite(influenceByStar[star.id])) {
                            influenceByStar[star.id] = 0;
                        }
                        ;

                        influenceByStar[star.id] += adjustedStrength;
                    }
                }
            }

            return influenceByStar;
        };
        return MapEvaluator;
    })();
    Rance.MapEvaluator = MapEvaluator;
})(Rance || (Rance = {}));
/// <reference path="../star.ts"/>
/*
objectives:
defend area
attack player at area
expand
processing objectives
*/
var Rance;
(function (Rance) {
    var Objective = (function () {
        function Objective(type, priority, target, data) {
            this.isOngoing = false;
            this.id = Rance.idGenerators.objective++;

            this.type = type;
            this.priority = priority;
            this.target = target;
            this.data = data;
        }
        Object.defineProperty(Objective.prototype, "priority", {
            get: function () {
                return this.isOngoing ? this._basePriority * 1.05 : this._basePriority;
            },
            set: function (priority) {
                this._basePriority = priority;
            },
            enumerable: true,
            configurable: true
        });
        return Objective;
    })();
    Rance.Objective = Objective;
})(Rance || (Rance = {}));
/// <reference path="../galaxymap.ts"/>
/// <reference path="../game.ts"/>
/// <reference path="mapevaluator.ts"/>
/// <reference path="objective.ts"/>
/*
-- objectives ai
get expansion targets
create expansion objectives with priority based on score
add flat amount of priority if objective is ongoing
sort objectives by priority
while under max active expansion objectives
make highest priority expansion objective active
-- fronts ai
divide available units to fronts based on priority
make requests for extra units if needed
muster units at muster location
when requested units arrive
move units to target location
execute action
-- economy ai
build units near request target
*/
var Rance;
(function (Rance) {
    var ObjectivesAI = (function () {
        function ObjectivesAI(mapEvaluator, game) {
            this.objectivesByType = {
                expansion: []
            };
            this.objectives = [];
            this.mapEvaluator = mapEvaluator;
            this.map = mapEvaluator.map;
            this.player = mapEvaluator.player;
            this.game = game;
        }
        ObjectivesAI.prototype.getExpansionObjectives = function () {
            var objectivesByTarget = {};

            var allObjectives = [];

            for (var i = 0; i < this.objectivesByType.expansion.length; i++) {
                var _o = this.objectivesByType.expansion[i];
                _o.isOngoing = true;
                objectivesByTarget[_o.target.id] = _o;
            }

            var minScore, maxScore;

            var expansionScores = this.mapEvaluator.getScoredExpansionTargets();

            for (var i = 0; i < expansionScores.length; i++) {
                var score = expansionScores[i].score;
                minScore = isFinite(minScore) ? Math.min(minScore, score) : score;
                maxScore = isFinite(maxScore) ? Math.max(maxScore, score) : score;
            }

            for (var i = 0; i < expansionScores.length; i++) {
                var star = expansionScores[i].star;
                var relativeScore = Rance.getRelativeValue(expansionScores[i].score, minScore, maxScore);
                if (objectivesByTarget[star.id]) {
                    objectivesByTarget[star.id].priority = relativeScore;
                } else {
                    objectivesByTarget[star.id] = new Rance.Objective("expansion", relativeScore, star, expansionScores[i]);
                }

                allObjectives.push(objectivesByTarget[star.id]);
            }

            return allObjectives;
        };

        ObjectivesAI.prototype.processExpansionObjectives = function (objectives) {
            var activeObjectives = [];
        };
        return ObjectivesAI;
    })();
    Rance.ObjectivesAI = ObjectivesAI;
})(Rance || (Rance = {}));
var Rance;
(function (Rance) {
    var Personality = (function () {
        function Personality(personalityData) {
            for (var property in personalityData) {
                this[property] = personalityData[property];
            }
        }
        return Personality;
    })();
    Rance.Personality = Personality;
})(Rance || (Rance = {}));
/// <reference path="tutorial.d.ts"/>
var Rance;
(function (Rance) {
    (function (Tutorials) {
        Tutorials.uiTutorial = {
            pages: [
                "This is a tutorial",
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas ultricies condimentum ex eget consequat. Cras scelerisque vulputate libero consequat hendrerit. Sed ut mauris sed lorem mattis consectetur feugiat nec enim. Nulla metus magna, aliquam volutpat ornare nec, dictum non tellus. Curabitur quis massa egestas, congue massa at, malesuada velit. Sed ornare dui quam, nec vulputate ipsum blandit sed. Curabitur et consequat nulla. Cras lorem odio, varius ut diam ut, elementum fringilla nisi. In lobortis lectus eu libero volutpat, et viverra metus consectetur. Praesent cursus lacus vitae fermentum dapibus. Aliquam ac auctor eros. Praesent vel felis vel odio congue aliquam a et elit.\n\nDuis ac leo efficitur, lacinia libero at, vulputate lorem. Maecenas elementum aliquet tellus vitae tempus. Aliquam a lectus risus. Mauris porttitor, eros a faucibus vulputate, mauris libero ultricies lectus, eget consectetur orci diam id est. Integer eros nibh, lobortis ac iaculis ut, molestie at mi. Proin sit amet pulvinar ante. Curabitur a purus tempus velit varius sollicitudin. Nullam euismod felis eu elit consectetur tincidunt. Duis sed lobortis purus.\n\nMorbi sit amet sem blandit, cursus felis sit amet, accumsan turpis. Vivamus et facilisis enim. Duis vestibulum sodales neque, ut suscipit nulla ultrices vitae. In ac accumsan erat. Nunc consectetur massa non elit mollis bibendum. Nullam tincidunt augue mi. Vestibulum dapibus et nunc quis auctor. Etiam malesuada cursus purus, et gravida dolor vehicula vel. Nam scelerisque magna ut risus semper, eget iaculis ligula hendrerit. Donec ac varius mauris, a pulvinar diam. Sed elementum, ex molestie dictum suscipit, lectus nunc pellentesque turpis, ac scelerisque tellus odio vel nisi. Donec facilisis, purus id volutpat varius, mi ex accumsan diam, a viverra lectus dui vel turpis. Nam tellus est, volutpat id scelerisque at, auctor id arcu. Proin molestie lobortis tempor. Ut ultricies lectus tincidunt erat consequat, at vestibulum erat commodo.",
                React.DOM.div(null, React.DOM.div(null, "Works with"), React.DOM.button(null, "react elements too"))
            ]
        };
    })(Rance.Tutorials || (Rance.Tutorials = {}));
    var Tutorials = Rance.Tutorials;
})(Rance || (Rance = {}));
/// <reference path="reactui/reactui.ts"/>
/// <reference path="unit.ts"/>
/// <reference path="player.ts"/>
/// <reference path="playercontrol.ts"/>
/// <reference path="battleprep.ts"/>
/// <reference path="mapgen.ts"/>
/// <reference path="galaxymap.ts"/>
/// <reference path="renderer.ts"/>
/// <reference path="game.ts"/>
/// <reference path="itemgenerator.ts" />
/// <reference path="apploader.ts"/>
/// <reference path="gameloader.ts"/>
/// <reference path="../data/setdynamictemplateproperties.ts"/>
/// <reference path="shadermanager.ts"/>
/// <reference path="mctree.ts"/>
/// <reference path="pathfindingarrow.ts"/>
/// <reference path="borderpolygon.ts"/>
/// <reference path="mapai/mapevaluator.ts"/>
/// <reference path="mapai/objectivesai.ts"/>
/// <reference path="mapai/personality.ts"/>
///
/// <reference path="../data/tutorials/uitutorial.ts"/>
var a, b, c;
var Rance;
(function (Rance) {
    Rance.idGenerators = {
        fleet: 0,
        item: 0,
        player: 0,
        star: 0,
        unit: 0,
        building: 0,
        sector: 0,
        objective: 0
    };

    var App = (function () {
        function App() {
            var self = this;

            this.seed = Math.random();

            //this.seed = 0.14325129357166588;
            Math.random = RNG.prototype.uniform.bind(new RNG(this.seed));

            this.loader = new Rance.AppLoader(function () {
                self.makeApp();
            });

            Rance.setAllDynamicTemplateProperties();
        }
        App.prototype.makeApp = function () {
            this.images = this.loader.imageCache;
            this.itemGenerator = new Rance.ItemGenerator();
            this.game = this.makeGame();
            this.initGame();
            this.initDisplay();
            this.initUI();

            a = new Rance.MapEvaluator(this.game.galaxyMap, this.humanPlayer); // TODO
            b = new Rance.PathfindingArrow(this.renderer.layers["select"]); // TODO
            c = new Rance.ObjectivesAI(a, this.game); // TODO
        };
        App.prototype.destroy = function () {
            this.renderer.destroy();
            this.reactUI.destroy();
            this.reactUI = null;
        };
        App.prototype.load = function (saveName) {
            var itemName = "Rance.Save." + saveName;
            var data = localStorage.getItem(itemName);
            var parsed = JSON.parse(data);
            this.mapRenderer.preventRender = true;

            this.destroy();

            this.game = new Rance.GameLoader().deserializeGame(parsed.gameData);

            this.initGame();

            this.mapRenderer.preventRender = false;

            this.mapRenderer.setParent(this.renderer.layers["map"]);
            this.mapRenderer.setMap(this.game.galaxyMap);
            this.mapRenderer.setAllLayersAsDirty();

            Rance.idGenerators = Rance.cloneObject(parsed.idGenerators);

            this.initUI();
        };

        App.prototype.makeGame = function () {
            var playerData = this.makePlayers();
            var players = playerData.players;
            var independents = playerData.independents;
            var map = this.makeMap(playerData);

            var game = new Rance.Game(map, players, players[0]);
            game.independents.push(independents);

            return game;
        };

        App.prototype.makePlayers = function () {
            var players = [];

            for (var i = 0; i < 5; i++) {
                var player = new Rance.Player();
                player.makeFlag();

                players.push(player);
            }

            var pirates = new Rance.Player();
            pirates.setupPirates();

            return ({
                players: players,
                independents: pirates
            });
        };
        App.prototype.makeMap = function (playerData) {
            var mapGen = new Rance.MapGen();
            mapGen.players = playerData.players;
            mapGen.independents = playerData.independents;
            mapGen.makeMap(Rance.Templates.MapGen.defaultMap);
            var galaxyMap = new Rance.GalaxyMap();
            galaxyMap.setMapGen(mapGen);

            return galaxyMap;
        };
        App.prototype.initGame = function () {
            this.humanPlayer = this.game.humanPlayer;

            if (this.playerControl)
                this.playerControl.removeEventListeners();

            this.playerControl = new Rance.PlayerControl(this.humanPlayer);

            return this.game;
        };
        App.prototype.initDisplay = function () {
            this.renderer = new Rance.Renderer();
            this.renderer.init();

            this.mapRenderer = new Rance.MapRenderer(this.game.galaxyMap);
            this.mapRenderer.setParent(this.renderer.layers["map"]);
            this.mapRenderer.init();
            // some initialization is done when the react component owning the
            // renderer mounts, such as in reactui/galaxymap/galaxymap.ts
        };
        App.prototype.initUI = function () {
            var reactUI = this.reactUI = new Rance.ReactUI(document.getElementById("react-container"));

            this.playerControl.reactUI = reactUI;

            reactUI.player = this.humanPlayer;
            reactUI.galaxyMap = this.game.galaxyMap;
            reactUI.game = this.game;
            reactUI.renderer = this.renderer;
            reactUI.playerControl = this.playerControl;

            var uriParser = document.createElement("a");
            uriParser.href = document.URL;
            var hash = uriParser.hash;
            if (hash) {
                reactUI.currentScene = hash.slice(1);
            } else {
                reactUI.currentScene = "galaxyMap";
            }

            reactUI.render();
        };
        return App;
    })();
    Rance.App = App;
})(Rance || (Rance = {}));

var app = new Rance.App();
//# sourceMappingURL=main.js.map
