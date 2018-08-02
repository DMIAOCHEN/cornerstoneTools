/* eslint no-loop-func: 0 */ // --> OFF
import external from './../externalModules.js';
import baseTool from './../base/baseTool.js';
import angleBetweenPoints from './shared/angleBetweenPoints.js';

const defaultStrategy = (evt) => {
  const eventData = evt.detail;
  const { element, viewport } = eventData;
  const initialRotation = viewport.initialRotation;

  // Calculate the center of the image
  const rect = element.getBoundingClientRect(element);
  const { clientWidth: width, clientHeight: height } = element;

  const initialPoints = {
    x: eventData.startPoints.client.x,
    y: eventData.startPoints.client.y
  };
  const { scale, translation } = viewport;
  const centerPoints = {
    x: rect.left + width / 2 + translation.x * scale,
    y: rect.top + height / 2 + translation.y * scale
  };

  const currentPoints = {
    x: eventData.currentPoints.client.x,
    y: eventData.currentPoints.client.y
  };

  const angleInfo = angleBetweenPoints(centerPoints, initialPoints, currentPoints);

  if (angleInfo.direction < 0) {
    angleInfo.angle = -angleInfo.angle;
  }

  viewport.rotation = initialRotation + angleInfo.angle;
};

const horizontalStrategy = (evt) => {
  const eventData = evt.detail;
  const { viewport, deltaPoints } = eventData;

  viewport.rotation += (deltaPoints.page.x / viewport.scale);
};

const verticalStrategy = (evt) => {
  const eventData = evt.detail;
  const { viewport, deltaPoints } = eventData;

  viewport.rotation += (deltaPoints.page.y / viewport.scale);
};

export default class extends baseTool {
  constructor (name) {
    const strategies = {
      default: defaultStrategy,
      horizontal: horizontalStrategy,
      vertical: verticalStrategy
    };

    super({
      name: name || 'rotate',
      strategies,
      defaultStrategy: 'default',
      supportedInteractionTypes: ['mouse', 'touch']
    });
  }

  touchDragCallback (evt) {
    this.dragCallback(evt);
  }

  mouseDragCallback (evt) {
    this.dragCallback(evt);
  }

  /**
   * TODO: Using addNewMeasurement for now until we get a better solution for mouseDown
   * for tools that are not annotation
   */
  addNewMeasurement (evt) {
    this.initialRotation = evt.detail.viewport.rotation;
  }

  dragCallback (evt) {
    evt.detail.viewport.initialRotation = this.initialRotation;
    this.applyActiveStrategy(evt, this.configuration);
    external.cornerstone.setViewport(evt.detail.element, evt.detail.viewport);
  }
}
