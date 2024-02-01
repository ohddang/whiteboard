export const enum ToolType {
  MOVE = 0,
  SELECT,
  RECT,
  ARROW,
  TEXT,
  IMAGE,
}

export type Site = [number, number];

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

export interface DrawElement {
  rect: Rect;

  isSelect: boolean;
  pickingColor: { r: number; g: number; b: number; a: number };
  imageData: ImageData;
  usedTool: ToolType;
}

export interface PickingElement {
  rect: Rect;

  pickImage: HTMLImageElement;
}

export interface LineElement extends DrawElement {}

export interface ShapeElement extends DrawElement {}

export interface TextElement extends DrawElement {}

export interface ImageElement extends DrawElement {}
