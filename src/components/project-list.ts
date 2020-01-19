import {Component} from "./base-component.js";
import {DragTarget} from "../models/drag-drop.js";
import {Project, ProjectStatus} from "../models/project.js";
import {Autobind} from "../decorators/autobind.js";
import {projectState} from "../state/project-state.js";
import {ProjectItem} from "./project-item.js";

// ProjectList Class
export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    super('project-list', 'app', false, `${type}-projects`);

    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {

    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {

      event.preventDefault();
      const listElement = this.element.querySelector('ul')!;
      listElement.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {

    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Finished);
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {

    const listElement = this.element.querySelector('ul')!;
    listElement.classList.remove('droppable');
  }

  configure(): void {

    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {

      this.assignedProjects = projects.filter(prj => {

        if (this.type === 'active') {

          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });

      this.renderProjects();
    });
  }

  renderContent() {

    this.element.querySelector('ul')!.id = `${this.type}-project-list`;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS';
  }

  private renderProjects() {

    const listElement = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement;
    listElement.innerHTML = '';

    for (const projectItem of this.assignedProjects) {

      new ProjectItem(this.element.querySelector('ul')!.id, projectItem)
    }
  }
}
