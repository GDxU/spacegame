/// <reference path="../../../../lib/pixi.d.ts" />

import SFXFragmentPropTypes from "./SFXFragmentPropTypes";
import
{
  shallowCopy
} from "../../../../src/utility";

let idGenerator = 0;

abstract class SFXFragment<P extends PartialProps, PartialProps>
{
  public id: number;
  public abstract key: string;
  public abstract displayName: string;
  
  public propTypes: SFXFragmentPropTypes;
  private readonly defaultProps: P;
  public readonly props: P;

  
  protected _displayObject: PIXI.DisplayObject;
  public get displayObject(): PIXI.DisplayObject
  {
    return this._displayObject;
  }
  protected setDisplayObject(newDisplayObject: PIXI.DisplayObject): void
  {
    const oldDisplayObject = this.displayObject;
    if (oldDisplayObject)
    {
      newDisplayObject.position = oldDisplayObject.position.clone();
      
      const parent = oldDisplayObject.parent;
      if (parent)
      {
        const childIndex = parent.getChildIndex(oldDisplayObject);
        parent.removeChildAt(childIndex);
        parent.addChildAt(newDisplayObject, childIndex);
      }
    }

    this._displayObject = newDisplayObject;
  }

  public get bounds(): PIXI.Rectangle
  {
    return this.displayObject.getBounds();
  }
  public get position(): PIXI.Point
  {
    return this.displayObject.position;
  }
  public get scale(): Point
  {
    return this.displayObject.scale;
  }
  public set scale(scale: Point)
  {
    this.displayObject.scale.set(scale.x, scale.y);
  }
  constructor(propTypes: SFXFragmentPropTypes, defaultProps: P, props?: PartialProps)
  {
    this.id = idGenerator++;

    this.propTypes = propTypes;
    this.defaultProps = defaultProps;

    this.props = <P> {};
    this.setDefaultProps();
    if (props)
    {
      this.setProps(props);
    }
  }

  public abstract animate(relativeTime: number): void;
  public abstract draw(): void;

  public setDefaultProps(): void
  {
    this.setProps(this.defaultProps);
  }

  private setProps(props: PartialProps): void
  {
    for (let prop in props)
    {
      const propType = this.propTypes[prop];
      switch (propType)
      {
        case "number":
        {
          this.props[prop] = props[prop];
          break;
        };
        case "point":
        {
          this.props[prop] = shallowCopy(props[prop]);
          break;
        }
        case "color":
        {
          this.props[prop] = props[prop].clone();
          break;
        }
      }
    }
  }
}

export default SFXFragment;