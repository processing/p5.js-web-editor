import sinon from 'sinon';
import 'sinon-mongoose';

// Import the actual model to be mocked
const User = jest.requireActual('../user').default;

// Wrap User in a sinon mock
// The returned object is used to configure
// the mocked model's behaviour
export function createMock() {
  return sinon.mock(User);
}

// Wraps the User.prototype i.e. the
// instance methods in a mock so
// User.save() can be mocked
export function createInstanceMock() {
  // See: https://stackoverflow.com/questions/40962960/sinon-mock-of-mongoose-save-method-for-all-future-instances-of-a-model-with-pro
  Object.defineProperty(User.prototype, 'save', {
    value: User.prototype.save,
    configurable: true
  });

  return sinon.mock(User.prototype);
}

// Re-export the model, it will be
// altered by mockingoose whenever
// we call methods on the MockConfig
export default User;
