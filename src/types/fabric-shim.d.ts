// Local shim to bypass corrupted Fabric .d.ts files in node_modules.
// Keeps the app building while you fix/replace the Fabric package.

declare module 'fabric' {
  export type TOptions<T = any> = Record<string, any>

  export type Canvas = any
  export type FabricObject = any
  export type FabricImage = any
  export type FabricText = any
  export type IText = any
  export type Textbox = any

  export type Rect = any
  export type Circle = any
  export type Ellipse = any
  export type Triangle = any
  export type Line = any
  export type Polygon = any
  export type Polyline = any
  export type Path = any

  export type Group = any
  export type ActiveSelection = any
  export type Point = any

  export const filters: any
  export const util: any

  export const Canvas: any
  export const FabricObject: any
  export const FabricImage: any
  export const FabricText: any
  export const IText: any
  export const Textbox: any

  export const Rect: any
  export const Circle: any
  export const Ellipse: any
  export const Triangle: any
  export const Line: any
  export const Polygon: any
  export const Polyline: any
  export const Path: any

  export const Group: any
  export const ActiveSelection: any
  export const Point: any
    const _default: any
  export default _default
}
