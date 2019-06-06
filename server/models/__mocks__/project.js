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

// Re-export the model, it will be
// altered by mockingoose whenever
// we call methods on the MockConfig
export default Project;
