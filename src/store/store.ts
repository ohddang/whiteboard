import { create } from "zustand";
import { ToolType } from "../type/common";

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