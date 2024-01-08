export type Site = [number, number];

export type DrawElement = {
  start: Site;
  dataUrl: string;
};

export interface LineElement extends DrawElement {}

export interface ShapeElement extends DrawElement {}

export interface TextElement extends DrawElement {}

export interface ImageElement extends DrawElement {}
