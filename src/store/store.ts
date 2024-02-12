import { create } from "zustand";
import { Color, ColorCollection, FontType, Site, ToolType, TransformToolType } from "../type/common";

type ToolFixFlag = {
  isFixed: boolean;
};

type ToolFixActions = {
  setIsFixed: (flag: boolean) => void;
  getIsFixed: () => boolean;
};

export const useToolFixStore = create<ToolFixFlag & ToolFixActions>((set, get) => ({
  isFixed: true,
  setIsFixed: (flag: boolean) => set({ isFixed: flag }),
  getIsFixed: () => get().isFixed,
}));

type SelectedTool = {
  tool: ToolType;
};

type SelectedToolActions = {
  setTool: (tool: ToolType) => void;
  getTool: () => ToolType;
};

export const useSelectedToolStore = create<SelectedTool & SelectedToolActions>((set, get) => ({
  tool: ToolType.MOVE,
  setTool: (tool: ToolType) => set({ tool: tool }),
  getTool: () => get().tool,
}));

type TransformTool = {
  tool: TransformToolType;
};

type TransformToolActions = {
  setTransformTool: (tool: TransformToolType) => void;
  getTransformTool: () => TransformToolType;
};

export const useTransformToolStore = create<TransformTool & TransformToolActions>((set, get) => ({
  tool: TransformToolType.MOVE,
  setTransformTool: (tool: TransformToolType) => set({ tool: tool }),
  getTransformTool: () => get().tool,
}));

type SelectionLayoutStyle = {
  width: number;
  height: number;
  transform: string;
  scale: Site;
};

type SelectionLayoutStyleActions = {
  setStyle: (style: SelectionLayoutStyle) => void;
  getStyle: () => SelectionLayoutStyle;
};

export const useSelectionLayoutStyle = create<SelectionLayoutStyle & SelectionLayoutStyleActions>((set, get) => ({
  width: 0,
  height: 0,
  transform: "translate(0px, 0px)",
  scale: { x: 1, y: 1 },
  setStyle: (style: SelectionLayoutStyle) => set(style),
  getStyle: () => get(),
}));

type SelectionTextScrollSize = {
  width: number;
  height: number;
  color: Color;
};

type SelectionTextScrollSizeActions = {
  setScrollSize: (size: SelectionTextScrollSize) => void;
  getScrollSize: () => SelectionTextScrollSize;
};

export const useSelectionTextScrollSize = create<SelectionTextScrollSize & SelectionTextScrollSizeActions>(
  (set, get) => ({
    width: 0,
    height: 0,
    color: { r: 0, g: 0, b: 0, a: 0 },
    setScrollSize: (size: SelectionTextScrollSize) => set(size),
    getScrollSize: () => get(),
  })
);

type FontStoreType = {
  font: FontType;
};

type FontStoreActions = {
  setFont: (font: FontType) => void;
  getFont: () => FontType;
};

export const useFontStoreType = create<FontStoreType & FontStoreActions>((set, get) => ({
  font: FontType.NORMAL,
  setFont: (font: FontType) => set({ font: font }),
  getFont: () => get().font,
}));

type ColorStore = {
  color: ColorCollection;
};

type ColorActions = {
  setColor: (color: ColorCollection) => void;
  getColor: () => ColorCollection;
};

export const useColorStore = create<ColorStore & ColorActions>((set, get) => ({
  color: ColorCollection.RED,
  setColor: (color: ColorCollection) => set({ color: color }),
  getColor: () => get().color,
}));
