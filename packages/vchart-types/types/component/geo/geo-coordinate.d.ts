import type { IPoint } from '../../typings/coordinate';
import { Projection } from './projection';
import type { IEffect, IModelLayoutOption, IModelRenderOption, ILayoutItem } from '../../model/interface';
import type { IComponentOption } from '../interface';
import { ComponentTypeEnum } from '../interface/type';
import { BaseComponent } from '../base/base-component';
import type { IGeoRegionSpec, IRegion } from '../../region/interface';
import type { IGeoCoordinate, IGeoCoordinateSpec, IProjectionSpec } from './interface';
import type { IChartSpec, StringOrNumber } from '../../typings';
import type { IGraphic } from '@visactor/vrender-core';
export declare function projectionName(key: string, id: number): string;
export declare class GeoCoordinate extends BaseComponent<IGeoRegionSpec> implements IGeoCoordinate {
    static type: ComponentTypeEnum;
    type: ComponentTypeEnum;
    name: string;
    layoutType: ILayoutItem['layoutType'];
    _longitudeField?: string;
    get longitudeField(): string;
    _latitudeField?: string;
    get latitudeField(): string;
    protected _projectionSpec: IProjectionSpec;
    get projectionSpec(): IProjectionSpec;
    setProjection(projectionSpec: IGeoCoordinateSpec['projection']): void;
    protected _projection: Projection;
    protected _centerCache: Map<StringOrNumber, {
        x: number;
        y: number;
    }>;
    private _actualScale;
    getZoom(): number;
    private _evaluated;
    private _lastHeight;
    private _lastWidth;
    static createComponent(spec: IChartSpec, options: IComponentOption): IGeoCoordinate[];
    effect: IEffect;
    setAttrFromSpec(): void;
    created(): void;
    private _handleChartZoom;
    dispatchZoom(zoomDelta: number, center?: {
        x: number;
        y: number;
    }): void;
    initEvent(): void;
    initProjection(): void;
    coordinateHelper(): void;
    onLayoutEnd(ctx: IModelLayoutOption): void;
    onRender(ctx: IModelRenderOption): void;
    changeRegions(regions: IRegion[]): void;
    getVRenderComponents(): IGraphic[];
    protected collectFeatures(): any[];
    dataToPosition(values?: number[]): IPoint;
    dataToLatitude(lat: number): number;
    dataToLongitude(lon: number): number;
    zoom(p: number, anchor?: [number, number]): void;
    pan: (delta?: [number, number]) => void;
    shape(datum?: any): any;
    invert(point: [number, number]): any;
    private evaluateProjection;
    protected _initCenterCache(): void;
    release(): void;
}
export declare const registerGeoCoordinate: () => void;