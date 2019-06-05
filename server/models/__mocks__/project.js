import mockingoose from 'mockingoose';

// Import the actual model to be mocked
const Project = jest.requireActual('../project').default;

// Wrap Project in mockingoose
// The returned object is used to configure
// the mocked model's behaviour
export const ProjectMock = mockingoose(Project);

// Re-export the model, it will be
// altered by mockingoose whenever
// we call methods on the MockConfig
export default Project;
