import type { Renderer } from "./Renderer.js";
import type { AbstractRenderTask } from "./RenderTask.js";
export declare abstract class AbstractRenderTaskGroup {
    readonly iRenderGroup = true;
    abstract begin(context: Renderer): void;
    abstract get renderTasks(): Iterable<AbstractRenderTask>;
    abstract finish(): void;
}
export declare class RenderTaskGroup extends AbstractRenderTaskGroup {
    protected _renderTasks: AbstractRenderTask[];
    constructor(_renderTasks: AbstractRenderTask[]);
    get renderTasks(): Iterable<AbstractRenderTask>;
    setRenderTask(tasks: AbstractRenderTask[]): void;
    begin(_context: Renderer): void;
    finish(): void;
}
