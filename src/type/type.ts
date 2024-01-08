export type Site = [number, number];

export type DrawElement = {
  top: number;
  left: number;
  width: number;
  height: number;

  dataUrl: string;
};

export interface LineElement extends DrawElement {}

export interface ShapeElement extends DrawElement {}

export interface TextElement extends DrawElement {}

export interface ImageElement extends DrawElement {}
