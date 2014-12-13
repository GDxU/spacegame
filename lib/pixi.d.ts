// Type definitions for PIXI 1.3
// Project: https://github.com/GoodBoyDigital/pixi.js/
// Definitions by: xperiments <http://github.com/xperiments>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

///<reference path="webgl.d.ts"/>
declare module PIXI
{

	/* STATICS */
	export var gl:WebGLRenderingContext;
	export var BaseTextureCache: {};
	export var texturesToUpdate: BaseTexture[];
	export var texturesToDestroy: BaseTexture[];
	export var TextureCache: {};
	export var FrameCache: {};
	export var blendModes:{ NORMAL:number; SCREEN:number; };
	export var scaleModes:{DEFAULT:number; LINEAR:number; NEAREST:number;};
	export var dontSayHello: boolean;


	/* MODULE FUNCTIONS */
	export function autoDetectRenderer(width: number, height: number, options?: IRendererOptions): IPixiRenderer;
	export function FilterBlock( mask:Graphics ):void;
	export function MaskFilter( graphics:Graphics ):void;
	export function BlurFilter(): void;
	export function rgb2hex( rgb:number[] ):number;
	export function hex2rgb( hex: number): number[];

	/* DEBUG METHODS */

	export function runList( x ):void;

		/*INTERFACES*/

	export interface IRendererOptions
	{
		view?: HTMLCanvasElement;
		transparent?: boolean;
		autoResize?: boolean;
		antialias?: boolean;
		preserveDrawingBuffer?: boolean;
		resolution?: number;
	}

	export interface IBasicCallback
	{
		():void
	}

	export interface IEvent
	{
		type: string;
		content: any;
		target: any;
	}

	export interface IHitArea
	{
		contains(x: number, y: number):boolean;
	}

	export interface IInteractionDataCallback
	{
		(interactionData: InteractionData):void
	}

	export interface IPixiRenderer
	{
		view: HTMLCanvasElement;
		render(stage: Stage): void;
	}

	export interface IBitmapTextStyle
	{
		font?: string;
		align?: string;
	}

	export interface ITextStyle
	{
		font?: string;
		stroke?: string;
		fill?: any;
		align?: string;
		strokeThickness?: number;
		wordWrap?: boolean;
		wordWrapWidth?:number;
	}



	/* CLASES */

	export class AbstractFilter
	{
		constructor(fragmentSrc: string[], uniforms?: any);
	}
	export class AssetLoader extends EventTarget
	{
		assetURLs: string[];
		onComplete: IBasicCallback;
		onProgress: IBasicCallback;
		constructor(assetURLs: string[], crossorigin?:boolean );
		load(): void;
	}

	export class BaseTexture extends EventTarget
	{
		height: number;
		width: number;
		source: string;
		scaleMode: number;

		constructor(source: HTMLImageElement);
		constructor(source: HTMLCanvasElement);
		destroy():void;

		static fromImage(imageUrl: string, crossorigin?:boolean, scaleMode?:number ): BaseTexture;
	}

	export class BitmapFontLoader extends EventTarget
	{
		baseUrl:string;
		crossorigin:boolean;
		texture:Texture;
		url:string;
		constructor(url: string, crossorigin?: boolean);
		load():void;
	}

	export class BitmapText extends DisplayObjectContainer
	{
		width:number;
		height:number;
		constructor(text: string, style: IBitmapTextStyle);
		setStyle(style: IBitmapTextStyle): void;
		setText(text: string): void;
	}

	export class CanvasRenderer implements IPixiRenderer
	{
		context: CanvasRenderingContext2D;
		height: number;
		view: HTMLCanvasElement;
		width: number;
		constructor(width: number, height: number, view?: HTMLCanvasElement, transparent?: boolean);
		render(stage: Stage): void;
		resize(width: number, height: number):void;
	}

	export class Circle implements IHitArea
	{
		x: number;
		y: number;
		radius: number;
		constructor(x: number, y: number, radius: number);
		clone(): Circle;
		contains(x: number, y: number):boolean;
	}

	// TODO what is renderGroup
	export class CustomRenderable extends DisplayObject
	{
		constructor();
		renderCanvas(renderer: CanvasRenderer): void;
		initWebGL(renderer: WebGLRenderer): void;
		renderWebGL(renderGroup: any, projectionMatrix: any): void;
	}

	export class DisplayObject
	{
		alpha: number;
		buttonMode: boolean;
		filter:boolean;
		hitArea: IHitArea;
		parent: DisplayObjectContainer;
		pivot: Point;
		position: Point;
		x: number;
		y: number;
		rotation: number;
		renderable: boolean;
		scale: Point;
		stage: Stage;
		visible: boolean;
		worldAlpha: number;
		worldTransform: any;
		constructor();
		static autoDetectRenderer(width: number, height: number, view?: HTMLCanvasElement, transparent?: boolean): IPixiRenderer;
		click: IInteractionDataCallback;
		rightclick: IInteractionDataCallback;
		mousedown: IInteractionDataCallback;
		rightdown: IInteractionDataCallback;
		mouseout: IInteractionDataCallback;
		mouseover: IInteractionDataCallback;
		mouseup: IInteractionDataCallback;
		rightup: IInteractionDataCallback;
		mouseupoutside: IInteractionDataCallback;
		rightupoutside: IInteractionDataCallback;
		mousemove: IInteractionDataCallback;
		tap: IInteractionDataCallback;
		touchend: IInteractionDataCallback;
		touchendoutside: IInteractionDataCallback;
		touchstart: IInteractionDataCallback;
		touchmove: IInteractionDataCallback;
		filters: any[];
		filterArea: PIXI.Rectangle;

		//deprecated
		setInteractive(interactive: boolean): void;

		// getters setters
		interactive:boolean;
		mask:Graphics;
	}

	export class DisplayObjectContainer extends DisplayObject
	{
		children: DisplayObject[];
		width: number;
		height: number;
		constructor();

		addChild(child: DisplayObject): void;
		addChildAt(child: DisplayObject, index: number): void;
		generateTexture(): Texture;
		getBounds():Rectangle;
		getLocalBounds():Rectangle;
		getChildAt(index:number):DisplayObject;
		removeChild(child: DisplayObject): void;
		removeChildren(): void;
		swapChildren(child: DisplayObject, child2: DisplayObject): void;
	}

	export class Ellipse implements IHitArea
	{
		x: number;
		y: number;
		width: number;
		height: number;

		constructor(x: number, y: number, width: number, height: number);
		clone(): Ellipse;
		contains(x: number, y: number):boolean;
		getBounds():Rectangle;
	}

	export class EventTarget
	{
		addEventListener(type: string, listener: (event: IEvent) => void );
		removeEventListener(type: string, listener: (event: IEvent) => void );
		dispatchEvent(event: IEvent);
	}

	export class Graphics extends DisplayObjectContainer
	{
		lineWidth:number;
		lineColor:string;
		boundsPadding: number;
		bounds: any;
		filters: any[];
		constructor();

		beginFill(color?: number, alpha?: number): void;
		clear(): void;
		drawCircle(x: number, y: number, radius: number): void;
		drawEllipse(x: number, y: number, width: number, height: number): void;
		drawRect(x: number, y: number, width: number, height: number): void;
		drawPolygon(any): any;
		drawShape(any): any;
		endFill(): void;
		generateTexture(): Texture;
		lineStyle(lineWidth?: number, color?: number, alpha?: number ): void;
		lineTo(x: number, y: number): void;
		moveTo(x: number, y: number): void;

		static POLY:number;
		static RECT:number;
		static CIRC:number;
		static ELIP:number;
	}

	export class ImageLoader extends EventTarget
	{
		texture:Texture;
		constructor(url: string, crossorigin?: boolean);
		load(): void;
	}

	/* TODO determine type of originalEvent*/
	export class InteractionData
	{
		global: Point;
		target: Sprite;
		constructor();
		originalEvent:any;
		getLocalPosition(displayObject: DisplayObject): Point;
	}

	export class InteractionManager
	{
		mouse: InteractionData;
		stage: Stage;
		touchs:{ [id:string]:InteractionData };
		constructor(stage: Stage);
	}

	export class JsonLoader extends EventTarget
	{
		url:string;
		crossorigin: boolean;
		baseUrl:string;
		loaded:boolean;
		constructor(url: string, crossorigin?: boolean);
		load(): void;
	}

	export class MovieClip extends Sprite
	{
		animationSpeed: number;
		currentFrame:number;
		loop: boolean;
		playing: boolean;
		textures: Texture[];
		constructor(textures: Texture[]);
		onComplete:IBasicCallback;
		gotoAndPlay(frameNumber: number): void;
		gotoAndStop(frameNumber: number): void;
		play(): void;
		stop(): void;
	}

	export class Point
	{
		x: number;
		y: number;
		constructor(x: number, y: number);
		clone(): Point;
		set( x:number, y:number): void;
	}

	export class Polygon implements IHitArea
	{
		points: Point[];

		constructor(points: Point[]);
		constructor(points: {x: number; y: number;}[]);
		constructor(points: number[]);
		constructor(...points: Point[]);
		constructor(...points: number[]);

		clone(): Polygon;
		contains( x:number, y:number ):boolean;
	}

	export class Rectangle implements IHitArea
	{
		x: number;
		y: number;
		width: number;
		height: number;
		constructor(x: number, y: number, width: number, height: number);
		clone(): Rectangle;
		contains(x: number, y: number):boolean
	}

	export class RenderTexture extends Texture
	{
		constructor(width: number, height: number, renderer?: IPixiRenderer, scaleMode?: number);
		resize(width: number, height: number): void;
		render(DisplayObject, position?, clear?): void;
	}

	export class Sprite extends DisplayObjectContainer
	{
		anchor: Point;
		blendMode: number;
		texture: Texture;
		center: any;
		tint: number;

		//getters setters
		height: number;
		width: number;

		constructor(texture: Texture);

		static fromFrame(frameId: string): Sprite;
		static fromImage(url: string, crossorigin?: boolean, scaleMode?: number): Sprite;
		setTexture(texture: Texture): void;
	}
	export class SpriteBatch extends DisplayObjectContainer
	{
		
	}

	/* TODO determine type of frames */
	export class SpriteSheetLoader extends EventTarget
	{
		url:string;
		crossorigin:boolean;
		baseUrl:string;
		texture:Texture;
		frames:Object;
		constructor(url: string, crossorigin?: boolean);
		load();
	}

	export class Stage extends DisplayObjectContainer
	{
		interactive:boolean;
		interactionManager:InteractionManager;
		constructor(backgroundColor: number, interactive?: boolean);
		getMousePosition(): Point;
		setBackgroundColor(backgroundColor: number): void;
	}

	export class Text extends Sprite
	{
		constructor(text: any, style?: ITextStyle);
		canvas: HTMLCanvasElement;
		destroy(destroyTexture:boolean):void;
		setText(text: any): void;
		setStyle(style: ITextStyle): void;
	}

	export class Texture extends EventTarget
	{
		baseTexture: BaseTexture;
		frame: Rectangle;
		trim:Point;
		render( displayObject:DisplayObject, position:Point, clear:boolean ):void;
		constructor(baseTexture: BaseTexture, frame?: Rectangle);
		destroy(destroyBase:boolean):void;
		setFrame(frame: Rectangle): void;

		static addTextureToCache(texture: Texture, id: string): void;
		static fromCanvas(canvas: HTMLCanvasElement): Texture;
		static fromFrame(frameId: string): Texture;
		static fromImage(imageUrl: string, crossorigin?: boolean, scaleMode?:number): Texture;
		static removeTextureFromCache(id: any): Texture;
	}

	export class TilingSprite extends DisplayObjectContainer
	{
		width:number;
		height:number;
		texture:Texture;
		tilePosition: Point;
		tileScale: Point;
		constructor(texture: Texture, width: number, height: number);
		setTexture( texture: Texture ):void;
	}

	export class WebGLBatch
	{
		constructor(webGLContext: WebGLRenderingContext);
		clean():void;
		restoreLostContext(gl:WebGLRenderingContext)
		init(sprite: Sprite): void;
		insertAfter(sprite: Sprite, previousSprite: Sprite): void;
		insertBefore(sprite: Sprite, nextSprite: Sprite): void;
		growBatch(): void;
		merge(batch: WebGLBatch): void;
		refresh(): void;
		remove(sprite: Sprite): void;
		render(): void;
		split(sprite: Sprite): WebGLBatch;
		update(): void;
	}

	/* Determine type of Object */
	export class WebGLRenderGroup
	{
		render(projection:Object):void;
	}

	export class WebGLRenderer implements IPixiRenderer
	{
		view: HTMLCanvasElement;
		constructor(width: number, height: number, view?: HTMLCanvasElement, transparent?: boolean, antialias?:boolean );
		render(stage: Stage): void;
		resize(width: number, height: number): void;
	}

}

declare function requestAnimFrame( animate: PIXI.IBasicCallback );


declare module PIXI.PolyK
{
	export function Triangulate( p:number[]):number[];
}



