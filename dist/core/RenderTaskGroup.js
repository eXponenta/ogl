export class AbstractRenderTaskGroup {
    constructor() {
        this.iRenderGroup = true;
    }
}
export class RenderTaskGroup extends AbstractRenderTaskGroup {
    constructor(_renderTasks) {
        super();
        this._renderTasks = _renderTasks;
    }
    get renderTasks() {
        return this._renderTasks;
    }
    setRenderTask(tasks) {
        this._renderTasks.length = 0;
        this._renderTasks.push(...tasks);
    }
    begin(_context) { }
    finish() { }
    ;
}
