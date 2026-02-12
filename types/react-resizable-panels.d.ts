declare module "react-resizable-panels" {
  import * as React from "react";

  export interface PanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    direction: "horizontal" | "vertical";
    id?: string;
    tagName?: string;
    autoSaveId?: string;
    children?: React.ReactNode;
    className?: string;
    onLayout?: (sizes: number[]) => void;
  }

  export const PanelGroup: React.FC<PanelGroupProps>;

  export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultSize?: number;
    minSize?: number;
    maxSize?: number;
    id?: string;
    tagName?: string;
    children?: React.ReactNode;
    className?: string;
    collapsible?: boolean;
    onCollapse?: () => void;
    onExpand?: () => void;
    onResize?: (size: number, prevSize: number) => void;
    order?: number;
  }

  export const Panel: React.FC<PanelProps>;

  export interface PanelResizeHandleProps extends React.HTMLAttributes<HTMLDivElement> {
    id?: string;
    tagName?: string;
    className?: string;
    disabled?: boolean;
    hitAreaMargins?: { coarse: number; fine: number };
  }

  export const PanelResizeHandle: React.FC<PanelResizeHandleProps>;

  // Exports based on the actual components being used and aliased in resizable.tsx
  export const Group: typeof PanelGroup;
  export const Separator: typeof PanelResizeHandle;
}
