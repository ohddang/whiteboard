export const enum ToolType {
  MOVE = 0,
  SELECT,
  RECT,
  ARROW,
  TEXT,
  IMAGE,
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
  width: number;
  height: number;
}

export interface CanvasElement {
  rect: Rect;
  pickingColor: Color;
}

export interface DrawElement extends CanvasElement {
  isSelect: boolean;
  imageData: ImageData;
  usedTool: ToolType;
}

export interface PickingElement extends CanvasElement {
  rect: Rect;
  pickImage: HTMLImageElement;
  translate: Site;
}

export interface LineElement extends DrawElement {}

export interface ShapeElement extends DrawElement {}

export interface TextElement extends DrawElement {}

export interface ImageElement extends DrawElement {}
