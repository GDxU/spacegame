/// <reference path="../../lib/react.d.ts" />
/// <reference path="../../lib/voronoi.d.ts" />
/// <reference path="../../lib/pixi.d.ts" />
declare module Rance {
    module UIComponents {
        var UnitStrength: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var UnitActions: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var UnitInfo: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var UnitIcon: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var Draggable: {
            getDefaultProps: () => {
                dragThreshhold: number;
            };
            getInitialState: () => {
                mouseDown: boolean;
                dragging: boolean;
                dragOffset: {
                    x: number;
                    y: number;
                };
                mouseDownPosition: {
                    x: number;
                    y: number;
                };
                originPosition: {
                    x: number;
                    y: number;
                };
            };
            handleMouseDown: (e: any) => void;
            handleMouseMove: (e: any) => void;
            handleDrag: (e: any) => void;
            handleMouseUp: (e: any) => void;
            handleDragEnd: (e: any) => void;
            addEventListeners: () => void;
            removeEventListeners: () => void;
            componentDidMount: () => void;
            componentWillUnmount: () => void;
        };
    }
}
declare module Rance {
    module UIComponents {
        var Unit: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var EmptyUnit: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var UnitWrapper: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var FleetColumn: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var Fleet: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var TurnCounter: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var TurnOrder: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var AbilityTooltip: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var Battle: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var SplitMultilineText: {
            splitMultilineText: (text: any) => any;
        };
    }
}
declare module Rance {
    module UIComponents {
        /**
        * props:
        *   listItems
        *   initialColumns
        *
        * state:
        *   selected
        *   columns
        *   sortBy
        *
        * children:
        *   listelement:
        *     key
        *     tr
        *     getData()
        *
        *  columns:
        *    props (classes etc)
        *    label
        *    sorting (alphabet, numeric, null)
        *    title?
        */
        var List: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var UnitListItem: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var UnitList: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var BattlePrep: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var MapGen: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    module UIComponents {
        var Stage: React.ReactComponentFactory<{}, React.ReactComponent<{}, {}>>;
    }
}
declare module Rance {
    class ReactUI {
        public container: HTMLElement;
        public currentScene: string;
        public stage: any;
        public battle: Rance.Battle;
        public battlePrep: Rance.BattlePrep;
        public renderer: Rance.Renderer;
        public mapGen: Rance.MapGen;
        constructor(container: HTMLElement);
        public switchScene(newScene: string): void;
        public render(): void;
    }
}
declare module Rance {
    function randInt(min: any, max: any): number;
    function randRange(min: any, max: any): any;
    function getRandomArrayItem(target: any[]): any;
    function getFrom2dArray(target: any[][], arr: number[][]): any[];
    function flatten2dArray(toFlatten: any[][]): any[];
    function reverseSide(side: string): string;
    function turnOrderSortFunction(a: Unit, b: Unit): number;
    function makeRandomShip(): Unit;
}
declare module Rance {
    interface TargetingFunction {
        (fleets: Rance.Unit[][], target: number[]): Rance.Unit[];
    }
    var targetSingle: TargetingFunction;
    var targetAll: TargetingFunction;
    var targetRow: TargetingFunction;
    var targetColumn: TargetingFunction;
    var targetColumnNeighbors: TargetingFunction;
    var targetNeighbors: TargetingFunction;
}
declare module Rance {
    module Templates {
        interface AbilityTemplate {
            name: string;
            moveDelay: number;
            preparation?: {
                turnsToPrep: number;
                prepDelay: number;
                interruptsNeeded: number;
            };
            actionsUse: any;
            targetFleets: string;
            targetingFunction: Rance.TargetingFunction;
            targetRange: string;
            effect: (user: Rance.Unit, target: Rance.Unit) => void;
        }
        module Abilities {
            var rangedAttack: AbilityTemplate;
            var closeAttack: AbilityTemplate;
            var wholeRowAttack: AbilityTemplate;
            var bombAttack: AbilityTemplate;
            var standBy: AbilityTemplate;
        }
    }
}
declare module Rance {
    module Templates {
        interface TypeTemplate {
            typeName: string;
            isSquadron: boolean;
            icon: string;
            maxStrength: number;
            attributeLevels: {
                attack: number;
                defence: number;
                intelligence: number;
                speed: number;
            };
            abilities: Templates.AbilityTemplate[];
        }
        module ShipTypes {
            var fighterSquadron: TypeTemplate;
            var bomberSquadron: TypeTemplate;
            var battleCruiser: TypeTemplate;
        }
    }
}
declare module Rance {
    class Battle {
        public unitsById: {
            [id: number]: Rance.Unit;
        };
        public unitsBySide: {
            [side: string]: Rance.Unit[];
        };
        public side1: Rance.Unit[][];
        public side2: Rance.Unit[][];
        public turnOrder: Rance.Unit[];
        public activeUnit: Rance.Unit;
        public maxTurns: number;
        public turnsLeft: number;
        constructor(units: {
            side1: Rance.Unit[][];
            side2: Rance.Unit[][];
        });
        public init(): void;
        public forEachUnit(operator: (Unit: any) => any): void;
        public initUnit(unit: Rance.Unit, side: string, position: number[]): void;
        public removeUnitFromTurnOrder(unit: Rance.Unit): boolean;
        public addUnitToTurnOrder(unit: Rance.Unit): boolean;
        public updateTurnOrder(): void;
        public setActiveUnit(): void;
        public endTurn(): void;
        public getFleetsForSide(side: string): any;
    }
}
declare module Rance {
    function useAbility(battle: Battle, user: Unit, ability: Templates.AbilityTemplate, target: Unit): void;
    function validateTarget(battle: Battle, user: Unit, ability: Templates.AbilityTemplate, target: Unit): boolean;
    function getPotentialTargets(battle: Battle, user: Unit, ability: Templates.AbilityTemplate): Unit[];
    function getFleetsToTarget(battle: Battle, user: Unit, ability: Templates.AbilityTemplate): Unit[][];
    function getPotentialTargetsByPosition(battle: Battle, user: Unit, ability: Templates.AbilityTemplate): number[][];
    function getUnitsInAbilityArea(battle: Battle, user: Unit, ability: Templates.AbilityTemplate, target: number[]): Unit[];
    function getTargetsForAllAbilities(battle: Battle, user: Unit): {};
}
declare module Rance {
    class Unit {
        public template: Rance.Templates.TypeTemplate;
        public id: number;
        public name: string;
        public maxStrength: number;
        public currentStrength: number;
        public isSquadron: boolean;
        public maxActionPoints: number;
        public attributes: {
            attack: number;
            defence: number;
            intelligence: number;
            speed: number;
        };
        public battleStats: {
            battle: Rance.Battle;
            moveDelay: number;
            side: string;
            position: number[];
            currentActionPoints: number;
        };
        public abilities: Rance.Templates.AbilityTemplate[];
        constructor(template: Rance.Templates.TypeTemplate);
        public setValues(): void;
        public setBaseHealth(): void;
        public setActionPoints(): void;
        public setAttributes(experience?: number, variance?: number): void;
        public getBaseMoveDelay(): number;
        public resetBattleStats(): void;
        public setBattlePosition(battle: Rance.Battle, side: string, position: number[]): void;
        public removeStrength(amount: number): void;
        public removeActionPoints(amount: any): void;
        public addMoveDelay(amount: number): void;
        public isTargetable(): boolean;
        public getAttackDamageIncrease(damageType: string): number;
        public getDamageReduction(damageType: string): number;
    }
}
declare module Rance {
    class Player {
        public id: number;
        public units: {
            [id: number]: Rance.Unit;
        };
        constructor(id?: number);
        public addUnit(unit: Rance.Unit): void;
    }
}
declare module Rance {
    class BattlePrep {
        public player: Rance.Player;
        public fleet: Rance.Unit[][];
        public alreadyPlaced: {
            [id: number]: number[];
        };
        constructor(player: Rance.Player);
        public getUnitPosition(unit: Rance.Unit): number[];
        public getUnitAtPosition(position: number[]): Rance.Unit;
        public setUnit(unit: Rance.Unit, position: number[]): void;
        public swapUnits(unit1: Rance.Unit, unit2: Rance.Unit): void;
        public removeUnit(unit: Rance.Unit): void;
        public makeBattle(fleet2: Rance.Unit[][]): Rance.Battle;
    }
}
declare module Rance {
    module Templates {
        module MapGen {
            var defaultMap: {
                mapOptions: {
                    width: number;
                    height: number;
                };
                starGeneration: {
                    galaxyType: string;
                    totalAmount: number;
                    arms: number;
                    centerSize: number;
                    amountInCenter: number;
                };
                relaxation: {
                    timesToRelax: number;
                    dampeningFactor: number;
                };
            };
        }
    }
}
declare module Rance {
    interface Point {
        x: number;
        y: number;
    }
}
declare module Rance {
    class Triangle {
        public a: Rance.Point;
        public b: Rance.Point;
        public c: Rance.Point;
        public circumCenterX: number;
        public circumCenterY: number;
        public circumRadius: number;
        constructor(a: Rance.Point, b: Rance.Point, c: Rance.Point);
        public getPoints(): Rance.Point[];
        public getCircumCenter(): number[];
        public calculateCircumCircle(tolerance?: number): void;
        public circumCircleContainsPoint(point: Rance.Point): boolean;
        public getEdges(): Rance.Point[][];
        public getAmountOfSharedVerticesWith(toCheckAgainst: Triangle): number;
    }
}
declare module Rance {
    function triangulate(vertices: Point[]): {
        triangles: Triangle[];
        superTriangle: Triangle;
    };
    function voronoiFromTriangles(triangles: Triangle[]): any;
    function getCentroid(vertices: Point[]): Point;
    function makeSuperTriangle(vertices: Point[], highestCoordinateValue?: number): Triangle;
    function pointsEqual(p1: Point, p2: Point): boolean;
    function edgesEqual(e1: Point[], e2: Point[]): boolean;
}
declare module Rance {
    class Fleet {
        public owner: Rance.Player;
        public ships: Rance.Unit[];
        public location: Rance.Star;
        constructor(owner: Rance.Player, ships: Rance.Unit[], location: Rance.Star);
        public getShipIndex(ship: Rance.Unit): number;
        public hasShip(ship: Rance.Unit): boolean;
        public deleteFleet(): void;
        public addShip(ship: Rance.Unit): boolean;
        public addShips(ships: Rance.Unit[]): void;
        public removeShip(ship: Rance.Unit): boolean;
        public removeShips(ships: Rance.Unit[]): void;
        public split(newShips: Rance.Unit[]): Fleet;
        public move(newLocation: Rance.Star): void;
    }
}
declare module Rance {
    class Star implements Rance.Point {
        public id: number;
        public x: number;
        public y: number;
        public linksTo: Star[];
        public linksFrom: Star[];
        public distance: number;
        public region: string;
        public owner: Rance.Player;
        public fleets: {
            [ownerId: string]: Rance.Fleet[];
        };
        public voronoiId: number;
        public voronoiCell: any;
        constructor(x: number, y: number, id?: number);
        public getFleetIndex(fleet: Rance.Fleet): number;
        public hasFleet(fleet: Rance.Fleet): boolean;
        public addFleet(fleet: Rance.Fleet): boolean;
        public addFleets(fleets: Rance.Fleet[]): void;
        public removeFleet(fleet: Rance.Fleet): boolean;
        public removeFleets(fleets: Rance.Fleet[]): void;
        public setPosition(x: number, y: number): void;
        public hasLink(linkTo: Star): boolean;
        public addLink(linkTo: Star): void;
        public removeLink(linkTo: Star): void;
        public getAllLinks(): Star[];
        public clearLinks(): void;
        public getLinksByRegion(): {
            [regionId: string]: Star[];
        };
        public severLinksToRegion(regionToSever: string): void;
        public severLinksToFiller(): void;
        public severLinksToNonCenter(): void;
        public severLinksToNonAdjacent(): void;
    }
}
declare module Rance {
    class MapGen {
        public maxWidth: number;
        public maxHeight: number;
        public points: Rance.Star[];
        public regions: {
            [id: string]: {
                id: string;
                points: Rance.Star[];
            };
        };
        public triangles: Rance.Triangle[];
        public voronoiDiagram: any;
        public nonFillerVoronoiLines: any[];
        public nonFillerPoints: Rance.Star[];
        public galaxyConstructors: {
            [type: string]: (any: any) => Rance.Star[];
        };
        public drawnMap: PIXI.DisplayObjectContainer;
        constructor();
        public reset(): void;
        public makeMap(options: {
            mapOptions: {
                width: number;
                height?: number;
            };
            starGeneration: {
                galaxyType: string;
                totalAmount: number;
                arms: number;
                centerSize: number;
                amountInCenter: number;
            };
            relaxation: {
                timesToRelax: number;
                dampeningFactor: number;
            };
        }): MapGen;
        public generatePoints(options: {
            galaxyType: string;
            totalAmount: number;
            arms: number;
            centerSize: number;
            amountInCenter: number;
        }): any;
        public makeRegion(name: string): void;
        public makeSpiralPoints(props: {
            amountPerArm: number;
            arms: number;
            amountInCenter: number;
            centerSize?: number;
            armOffsetMax?: number;
        }): any[];
        public triangulate(): void;
        public clearLinks(): void;
        public makeLinks(): void;
        public severArmLinks(): void;
        public makeVoronoi(): void;
        public cleanTriangles(triangles: Rance.Triangle[], superTriangle: Rance.Triangle): Rance.Triangle[];
        public getVerticesFromCell(cell: any): any[];
        public relaxPointsOnce(dampeningFactor?: number): void;
        public relaxPoints(options: {
            timesToRelax: number;
            dampeningFactor: number;
        }): void;
        public getNonFillerPoints(): Rance.Star[];
        public getNonFillerVoronoiLines(): any[];
        public drawMap(): PIXI.DisplayObjectContainer;
    }
}
declare module Rance {
    class MapRenderer {
        public container: PIXI.DisplayObjectContainer;
        public parent: PIXI.DisplayObjectContainer;
        public galaxyMap: Rance.GalaxyMap;
        public layers: {
            [name: string]: {
                drawingFunction: (MapRenderer: any) => PIXI.DisplayObjectContainer;
                container: PIXI.DisplayObjectContainer;
            };
        };
        public mapModes: {
            [name: string]: {
                layer: string;
            };
        };
        public currentMapMode: string;
        constructor(parent: PIXI.DisplayObjectContainer);
        public setParent(newParent: PIXI.DisplayObjectContainer): void;
        public resetContainer(): void;
        public removeLayerContainer(layerName: string): number;
        public updateLayer(layerName: string): void;
        public switchMapMode(newMapMode: string): void;
    }
}
declare module Rance {
    class GalaxyMap {
        public stars: Rance.Star[];
        public mapGen: Rance.MapGen;
        public mapRenderer: Rance.MapRenderer;
        constructor();
        public addMapGen(mapGen: Rance.MapGen): void;
    }
}
declare module Rance {
    /**
    * @class Camera
    * @constructor
    */
    class Camera {
        public container: PIXI.DisplayObjectContainer;
        public width: number;
        public height: number;
        public bounds: any;
        public startPos: number[];
        public startClick: number[];
        public currZoom: number;
        public screenWidth: number;
        public screenHeight: number;
        /**
        * [constructor description]
        * @param {PIXI.DisplayObjectContainer} container [DOC the camera views and manipulates]
        * @param {number}                      bound     [How much of the container is allowed to leave the camera view.
        * 0.0 to 1.0]
        */
        constructor(container: PIXI.DisplayObjectContainer, bound: number);
        /**
        * @method addEventListeners
        * @private
        */
        private addEventListeners();
        /**
        * @method setBound
        * @private
        */
        private setBounds();
        /**
        * @method startScroll
        * @param {number[]} mousePos [description]
        */
        public startScroll(mousePos: number[]): void;
        /**
        * @method end
        */
        public end(): void;
        /**
        * @method getDelta
        * @param {number[]} currPos [description]
        */
        private getDelta(currPos);
        /**
        * @method move
        * @param {number[]} currPos [description]
        */
        public move(currPos: number[]): void;
        /**
        * @method zoom
        * @param {number} zoomAmount [description]
        */
        public zoom(zoomAmount: number): void;
        /**
        * @method deltaZoom
        * @param {number} delta [description]
        * @param {number} scale [description]
        */
        public deltaZoom(delta: number, scale: number): void;
        /**
        * @method clampEdges
        * @private
        */
        private clampEdges();
    }
}
declare module Rance {
    class MouseEventHandler {
        public camera: Rance.Camera;
        public startPoint: number[];
        public currPoint: number[];
        public currAction: string;
        public stashedAction: string;
        public preventingGhost: boolean;
        constructor(camera: Rance.Camera);
        public preventGhost(delay: number): void;
        public mouseDown(event: any, targetType: string): void;
        public mouseMove(event: any, targetType: string): void;
        public mouseUp(event: any, targetType: string): void;
        public startScroll(event: any): void;
        public startZoom(event: any): void;
        public stageMove(event: any): void;
        public stageEnd(event: any): void;
        public hover(event: any): void;
    }
}
declare module Rance {
    class Renderer {
        public stage: PIXI.Stage;
        public renderer: any;
        public pixiContainer: HTMLCanvasElement;
        public layers: {
            [name: string]: PIXI.DisplayObjectContainer;
        };
        public camera: Rance.Camera;
        public mouseEventHandler: Rance.MouseEventHandler;
        constructor();
        public init(): void;
        public setContainer(element: HTMLCanvasElement): void;
        public bindRendererView(): void;
        public initLayers(): void;
        public addCamera(): void;
        public addEventListeners(): void;
        public resize(): void;
        public render(): void;
    }
}
declare var fleet1: any, fleet2: any, player1: any, player2: any, battle: any, battlePrep: any, reactUI: any, renderer: any, mapGen: any;
declare module Rance {
}
