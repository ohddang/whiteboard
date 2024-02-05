export const enum ToolType {
  MOVE = 0,
  SELECT,
  RECT,
  ARROW,
  TEXT,
  IMAGE,
}

export const enum TransformToolType {
  NONE = 0,
  MOVE,
  ROTATE,
  SCALE_1,
  SCALE_2,
  SCALE_3,
  SCALE_4,
  SCALE_5,
  SCALE_6,
  SCALE_7,
  SCALE_8,
}

export type Site = { x: number; y: number };

export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface Rect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export interface CanvasElement {
  rect: Rect;
  pickingColor: Color;
  translate: Site;
  rotate: number;
  scale: Site;
  transformOrigin: Site;
}

export interface DrawElement extends CanvasElement {
  isSelect: boolean;
  imageData: ImageData;
  usedTool: ToolType;
}

export interface PickingElement extends CanvasElement {
  rect: Rect;
  pickImage: HTMLImageElement;
}

export interface LineElement extends DrawElement {}

export interface ShapeElement extends DrawElement {}

export interface TextElement extends DrawElement {}

export interface ImageElement extends DrawElement {}
