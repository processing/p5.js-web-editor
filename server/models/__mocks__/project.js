import sinon from 'sinon';
import 'sinon-mongoose';

// Import the actual model to be mocked
const Project = jest.requireActual('../project').default;

// Wrap Project in a sinon mock
// The returned object is used to configure
// the mocked model's behaviour
export function createMock() {
  return sinon.mock(Project);
}

// Wraps the Project.prototype i.e. the
// instance methods in a mock so
// Project.save() can be mocked
export function createInstanceMock() {
  // See: https://stackoverflow.com/questions/40962960/sinon-mock-of-mongoose-save-method-for-all-future-instances-of-a-model-with-pro
  Object.defineProperty(Project.prototype, 'save', {
    value: Project.prototype.save,
    configurable: true
  });

  Object.defineProperty(Project.prototype, 'remove', {
    value: Project.prototype.remove,
    configurable: true
  });

  return sinon.mock(Project.prototype);
}

// Re-export the model, it will be
// altered by mockingoose whenever
// we call methods on the MockConfig
export default Project;
