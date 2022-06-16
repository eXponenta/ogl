import type { Renderer } from "./Renderer.js";
import type { AbstractRenderTask } from "./RenderTask.js";

export abstract class AbstractRenderTaskGroup {
    public readonly iRenderGroup = true;

    abstract begin (context: Renderer): void;
    abstract get renderTasks(): Iterable<AbstractRenderTask>;
    abstract finish (): void;
}

export class RenderTaskGroup extends AbstractRenderTaskGroup {
    constructor (protected _renderTasks: AbstractRenderTask[]) {
        super();
    }

    get renderTasks(): Iterable<AbstractRenderTask> {
        return this._renderTasks;
    }

    setRenderTask(tasks: AbstractRenderTask[]) {
        this._renderTasks.length = 0;
        this._renderTasks.push(...tasks);
    }

    begin(_context: Renderer): void {}
    finish(): void {};
}
