export const enum ToolType {
  MOVE = 0,
  SELECT,
  RECT,
  ARROW,
  TEXT,
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

export const enum FontType {
  NORMAL = "Noto Sans KR",
  PENCIL = "Nanum Pen Script",
  CODE = "Source Code Pro",
}

export const enum ColorCollection {
  PINK = "#f0a0a0",
  RED = "#e03131",
  GREEN = "#2f9e44",
  BLUE = "#1971c2",
  BROWN = "#f08c00",
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
  translate: Site;
  rotate: number;
  scale: Site;
  usedTool: ToolType;
}

export interface DrawElement extends CanvasElement {
  startPos?: Site;
  endPos?: Site;
  imageData?: ImageData;
  isSelect: boolean;
  isEdit: boolean;
  colorHex: string;
  fontFamily: string;
}

export interface PickingElement extends CanvasElement {
  rect: Rect;
  pickImage: HTMLImageElement;
}
