import { create } from "zustand";
import { Site, ToolType, TransformToolType } from "../type/common";

type ToolFixFlag = {
  isFixed: boolean;
};

type ToolFixActions = {
  setIsFixed: (flag: boolean) => void;
  getIsFixed: () => boolean;
};

export const useToolFixStore = create<ToolFixFlag & ToolFixActions>(
  (set, get) => ({
    isFixed: false,
    setIsFixed: (flag: boolean) => set({ isFixed: flag }),
    getIsFixed: () => get().isFixed,
  })
);

type SelectedTool = {
  tool: ToolType;
};

type SelectedToolActions = {
  setTool: (tool: ToolType) => void;
  getTool: () => ToolType;
};

export const useSelectedToolStore = create<SelectedTool & SelectedToolActions>(
  (set, get) => ({
    tool: ToolType.MOVE,
    setTool: (tool: ToolType) => set({ tool: tool }),
    getTool: () => get().tool,
  })
);

type TransformTool = {
  tool: TransformToolType;
};

type TransformToolActions = {
  setTransformTool: (tool: TransformToolType) => void;
  getTransformTool: () => TransformToolType;
};

export const useTransformToolStore = create<
  TransformTool & TransformToolActions
>((set, get) => ({
  tool: TransformToolType.MOVE,
  setTransformTool: (tool: TransformToolType) => set({ tool: tool }),
  getTransformTool: () => get().tool,
}));

type SelectionLayoutStyle = {
  width: string;
  height: string;
  transform: string;
  invertScale: Site;
};

type SelectionLayoutStyleActions = {
  setStyle: (style: SelectionLayoutStyle) => void;
  getStyle: () => SelectionLayoutStyle;
};

export const useSelectionLayoutStyle = create<
  SelectionLayoutStyle & SelectionLayoutStyleActions
>((set, get) => ({
  width: "0",
  height: "0",
  transform: "translate(0px, 0px)",
  invertScale: { x: 1, y: 1 },
  setStyle: (style: SelectionLayoutStyle) => set(style),
  getStyle: () => get(),
}));
