export type Site = [number, number];

export interface DrawElement {
  top: number;
  left: number;
  width: number;
  height: number;

  imageData: ImageData;
  pickingColor: { r: number; g: number; b: number; a: number };
  isSelect: boolean;
  pickImage: HTMLImageElement;
}

export interface LineElement extends DrawElement {}

export interface ShapeElement extends DrawElement {}

export interface TextElement extends DrawElement {}

export interface ImageElement extends DrawElement {}
