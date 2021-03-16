# Testing
For an initial basic overview of testing for React apps, [you can read what the React developers have to say about it](https://reactjs.org/docs/testing.html).

We are testing React components by rendering the component trees in a simplified test environment and making assertions on what gets rendered and what functions get called.

Many files still don't have tests, so if you're looking to get started as a contributor, this would be a great place to start!

## What's in this document
- [Testing dependencies](#testing-dependencies)
- [Useful testing commands](#Useful-testing-commands)
- [Why write tests](#Why-write-tests)
- [When to run tests](#When-to-run-tests)
- [Writing a test](#Writing-a-test)
- [Files to be aware of](#Files-to-be-aware-of)
- [Testing plain components](#Testing-plain-components)
- [Testing Redux](#Testing-Redux)
- [How to handle API calls in tests](#How-to-handle-API-calls-in-tests)
- [Some more background on tests](#Some-more-background-on-tests)
- [Internationalization](#internationalization)
- [Tips](#Tips)
- [More resources](#More-resources)
- [References](#References)


## Testing dependencies
1. [Jest](https://jestjs.io/)
2. [react-testing-library](https://testing-library.com/docs/react-testing-library/intro/)
3. [redux-mock-store](https://github.com/reduxjs/redux-mock-store)

## Useful testing commands
Run the whole test suite
```
npm run test
```

-----

[Run tests that match the pattern](https://stackoverflow.com/questions/28725955/how-do-i-test-a-single-file-using-jest/28775887). Useful if you're writing one specific test and want to only run that one. 
```
npm run test -- someFileName
```

-----
Run the tests but update the snapshot if they don't match.

```
npm run test -- -u
```

----
For example, if you wanted to run just the SketchList test but also update the snapshot, you could do:
```
npm run test -- Sketchlist.test.js -u
```

Find more commands in the [Jest documentation](https://jestjs.io/docs/cli).

## Why write tests
- Good place to start if you're learning the codebase because it's harder to mess up production code
- Benefits all future contributors by allowing them to check their changes for errors
- Catches easy-to-miss errors
- Lets you check your own work and feel more comfortable sumbitting PRs
- Good practice for large projects
- Many of the existing components don't have tests yet, and you could write one :-)

## When to run tests

When you make a git commit, the tests will be run automatically for you. 

When you modify an existing component, it's a good idea to run the test suite to make sure it didn't make any changes that break the rest of the application. If they did break some tests, you would either have to fix a bug component or update the tests to match the new expected functionality.

## Writing a test
Want to get started writing a test for a new file or an existing file, but not sure how?
### For React components
(the below assumes we're using proposed folder structure 1)
1. Make a new file in the ``__tests__`` folder that's directly adjacent to your file. For example, if ``example.jsx`` is in ``src/components``, then you would make a file called ``example.test.jsx`` in ``src/components/__tests__``
2. Check if the component is connected to redux or not.
3. If it is, see the redux section below on how to write tests for that.
4. If it's not, see the section below on writing tests for unconnected components.

### For Redux action creators or reducers
See the [redux section](#Testing-Redux) below :)

### Troubleshooting
1. Check if the component makes any API calls. If it's using axios, jest should already be set up to replace the axios library with a mocked version; however, you may want to [mock](https://jestjs.io/docs/mock-function-api#mockfnmockimplementationoncefn) the axios.get() function with your own version so that GET calls "return" whatever data makes sense for that test. 

    ```
    axios.get.mockImplementationOnce(
      (x) => Promise.resolve({ data: 'foo' })
    );
    ```
You can see it used in the context of a test [here](../client/modules/IDE/components/SketchList.test.jsx).

2. If the component makes use of the formatDate util, some of the functions in that rely on the ``./client/i18n.js`` file that also makes an ajax request, which sometimes leads to an ERRCONNECTED error on the console, even though your tests pass. You can fix it by adding a mock for that specific i18n file:
    ```
    jest.mock('_path_to_file_/i18n');
    ```
You can see it used in the context of a test [here](../client/modules/IDE/components/SketchList.test.jsx).

## Files to be aware of

### Proposed folder structure 1
All tests in ``__tests__`` folders that are directly adjacent to the files that they are testing. For example, if you're testing ``examplefolder/Sketchlist.test.jsx``, the test would be in ``examplefolder/__tests__/Sketchlist.test.jsx``. This is so that the tests are close to the files they're testing but are still hidden away from view most of the time. This also means that any snapshot files will be stored in the testing folder, such as ``examplefolder/__tests__/__snapshots__/Sketchlist.test.jsx.snap``

Manual mocks are in ``__mocks__`` folders are adjacent to the modules that they're mocking.

Note: Even if you mock a user module in a ``__mocks__`` folder, user modules have to be explictly mocked in the test too, with ``Jest.mock("path_to_module")``

Node modules are mocked in the ``__mocks__`` folder at the root of the client folder, which also includes any mocks that are needed for user modules at the root of the folder directory.

```
.
└── client
    ├── __mocks__
    │   ├── axios.js
    |   ├── i18n.js
    |   └── ...other Node modules you want to mock
    ├── modules
    │   ├── IDE
    │   │   ├── actions
    │   │   │   ├── __mocks__
    │   │   │   │   ├── projects.js
    │   │   │   │   └─ ... other action creator mocks   
    │   │   │   ├── __tests__
    │   │   │   │   ├── projects.test.js  
    │   │   │   │   └─ ... other redux action creator tests 
    │   │   │   └── ... action creators
    │   │   ├── components  
    │   │   │   ├── __tests__
    │   │   │   │   ├── __snapshots__
    │   │   │   │   │   ├── SketchList.test.jsx.snap  
    │   │   │   │   │   └─ ... other snapshots   
    │   │   │   │   ├── SketchList.test.jsx  
    │   │   │   ├── SketchList.test.jsx     
    │   │   │   └── ... and more component files 
    │   │   ├── reducers
    │   │   │   ├── __tests__
    │   │   │   │   ├── assets.test.js
    │   │   │   │   └─ ... other reducer tests
    │   │   │   ├── assets.js
    │   │   │   └── ...more reducers
    │   └── ... more folders
    ├── redux_test_stores
    |   ├── test_store.js
    │   └── ...any other redux states you want to test
    ├── i18n-test.js
    ├── jest.setup.js
    ├── test-utils.js
    └──... other files and folders
```

### Proposed folder structure 2
All tests are directly adjacent to the files that they are testing. For example, if you're testing ``examplefolder/Sketchlist.test.jsx``, the test would be in ``examplefolder/Sketchlist.test.jsx``. This is so that the tests are as close as possible to the files. This also means that any snapshot files will be stored in the same folder, such as ``examplefolder/__snapshots__/Sketchlist.test.jsx.snap``

Manual mocks are in ``__mocks__`` folders are adjacent to the modules that they're mocking.

Note: Even if you mock a user module in a ``__mocks__`` folder, user modules have to be explictly mocked in the test too, with ``Jest.mock("path_to_module")``

Node modules are mocked in the ``__mocks__`` folder at the root of the client folder, which also includes any mocks that are needed for user modules at the root of the folder directory.

```
.
└── client
    ├── __mocks__
    │   ├── axios.js
    |   ├── i18n.js
    |   └── ...other Node modules you want to mock
    ├── modules
    │   ├── IDE
    │   │   ├── actions
    │   │   │   ├── __mocks__
    │   │   │   │   ├── projects.js
    │   │   │   │   └─ ... other action creator mocks   
    │   │   │   ├── projects.js 
    │   │   │   ├── projects.test.js  
    │   │   │   └─ ... other action creator files 
    │   │   ├── components  
    │   │   │   ├── __snapshots__
    │   │   │   │   ├── SketchList.test.jsx.snap  
    │   │   │   │   └─ ... other snapshots   
    │   │   │   ├── SketchList.jsx  
    │   │   │   ├── SketchList.test.jsx     
    │   │   │   └── ... and more component files 
    │   │   ├── reducers
    │   │   │   ├── assets.test.js
    │   │   │   ├── assets.js
    │   │   │   └── ...more reducers
    │   └── ... more folders
    ├── redux_test_stores
    |   ├── test_store.js
    │   └── ...any other redux states you want to test
    ├── i18n-test.js
    ├── jest.setup.js
    ├── test-utils.js
    └──... other files and folders
```

### test-utils.js
This file overwrites the default react-testing-library's render function so that components rendered through the new render function have access i18next and redux. It exports the rest of react-testing-library as is.

It exports a render function with a i18n wrapper as ``render`` and a render function with a wrapper for both redux and i18n as ``reduxRender``

Thus, in your component test files, instead of calling ``import {functions you want} from 'react-testing-libary'`` importing react-testing library might look something like this:

If your component only needs i18n and not redux:
```
import { render, fireEvent, screen, waitFor } from '../../../test-utils';
```
If your component needs i18n and redux:
```
import { reduxRender, fireEvent, screen, waitFor } from '../../../test-utils';
```

Redux and i18next are made accessible by placing wrappers around the component. We can do this by replacing the render function with one that renders the requested component WITH an additional wrapper added around it. 

For example, the exported render function that adds a wrapper for both redux and i18n looks roughly like this:

```
function reduxRender(
  ui,
  {
    initialState,
    store = createStore(rootReducer, initialState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <I18nextProvider i18n={i18n}>
        <Provider store={store}>
          {children}
        </Provider>
      </I18nextProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}
```


### redux_test_stores
This folder contains the inital redux states that you can provide to the ``reduxRender`` function when testing. For example, if you want to render the SketchList component with a username of ``happydog`` and some sample sketches, ``redux_test_stores\test_store.js`` contains a definition for that state that you can import and provide to the renderer. 

### jest configs in package.json

this i dont know much about yet but want to understand

## Testing plain components
If it doesn't export connect()___ or use redux hooks like ___, then testing your component will be simpler and might look something like this:

```
import React from 'react';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '../../../../test-utils';
import FakePreferences from './index';

/* a helper function to render the components with the
 * props that that component needs to be passed in
 * if you want to access the rendered component itself
 * you'd have to modify it a little to return the what
 * gets returned from the render function, along with the props, which is what it's returning now.
 * the default props in this can be overwritten by using extraProps
 */
const renderComponent = (extraProps = {}, container) => {
  // if we want to overwrite any of these props, we can do it with extraProps because later keys overwrite earlier ones in the spread operator
  const props = {
    t: jest.fn(),
    fontSize: 12,
    autosave: false,
    setFontSize: jest.fn(),
    setAutosave: jest.fn(),
    ...extraProps
  };
  render(<FakePreferences {...props} />, { container });

  return props;
};

describe('<FakePreferences />', () => {
  let container = null;
  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    container.classList.add('testing-container');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
  });

  describe('font tests', () => {
    it('font size increase button says increase', () => {
      let props;
      // render the component
      act(() => {
        props = renderComponent({fontSize: 15}, container);
      });
      
      //I do tests here. 
      //you can access mock functions from props
      //for example, props.setFontSize
      
    });
  });
```

Consider what you want to test. Some possible things might be:
- User input results in the expected function being called with the expected argument. 
  ```
  act(() => {
    fireEvent.click(screen.getByTestId("testid"));
  });
  expect(yourMockFunction).toHaveBeenCalledTimes(1);
  expect(yourMockFunction.mock.calls[0][0]).toBe(argument);
  ``` 
- User input results in the class's method being called. 
  ```
  //component is the return value of calling render()
  const spy1 = jest.spyOn(component.instance(), 'func1');
  act(() => {
    fireEvent.click(screen.getByTestId("testid"));
  });
  expect(spy1).toHaveBeenCalledTimes(1);
  ``` 
- The text or divs that you expect to be on the page are actually there.
- a previously saved snapshot of the HTML matches a snapshot taken during testing.
- what else???? help!

## Testing Redux

When testing redux, the general guidance [[1]](#References) seems to suggest splitting up testing between:
1. action creators
2. reducers
3. connected components

Testing reducers and action creators is covered pretty well in [Redux's documentation](https://redux.js.org/recipes/writing-tests). An example of testing an action creator can be found at [projects.test.js](../client/modules/IDE/components/actions/__tests__/projects.test.jsx)

### Connected Components

Although it's possible to export the components as unconnected components for testing (and in this case you would just manually pass in the props that redux provides), the codebase is being migrated to use hooks, and in this case, that approach no longer works. It also doesn't work if we render components that have connected subcomponents. Thus, for consistency, we suggest testing all redux components while they're connected to redux. We can do this with redux-mock-store.

This works like so:
1. Import the reduxRender function from ``client/test_utils.js`` 
2. Configure the mock store. 
```
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';


const mockStore = configureStore([thunk]);
```
3. Create a mock store. There's an initial state that you can import from ``client/redux_test_stores/test_store.js`` 
```
store = mockStore(initialTestState);
```
3. Render the component with reduxRender and the store that you just created.
```
reduxRender(<SketchList username="happydog1" />, {store, container});
```
4. Test things! You may need to use jest to mock certain functions if the component is making API calls.

All together, it might look something like this.

```
import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';
import MyComponent from './MyComponent';
import { reduxRender, fireEvent, screen } from '../../../test-utils';
import { initialTestState } from '../../../redux_test_stores/test_store';

describe(<MyComponent />, () => {
  let container;
  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  beforeEach(() => {
    // setup a DOM element as a render target
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    // cleanup on exiting
    unmountComponentAtNode(container);
    container.remove();
    container = null;
    store.clearActions();
  });

  it('stuff about the test', () => {
    let component;
    act(() => {
      component = reduxRender(<MyComponent sampleprop="foo" />, {
        store,
        container
      });
    });

    //your tests go here
  });

})
```

Some things to consider testing:
- User input results in the expected redux action.
    ```
    act(() => {
      component = reduxRender(<SketchList username="happydog2" />, {
        store,
        container
      });
    });
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-direction-createdAt'));
    });
    const expectedAction = [{ type: 'TOGGLE_DIRECTION', field: 'createdAt' }];
    
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedAction));
    ```
- User input results in the class's method being called. 
  ```
  //component is the return value of calling render()
  const spy1 = jest.spyOn(component.instance(), 'func1');
  act(() => {
    fireEvent.click(screen.getByTestId("testid"));
  });
  expect(spy1).toHaveBeenCalledTimes(1);
  ``` 
- The text or divs that you expect to be on the page are actually there.
- a previously saved snapshot of the HTML matches a snapshot taken during testing.
- what else???? help!

## How to handle API calls in tests

Some tests throw errors if a part of the client-side code tries to make an API call or AJAX request. Our solution to this is to use jest to replace those functions with [mock functions](https://jestjs.io/docs/mock-functions). 

The code in question for the client side is mostly related to the axios library. We mock the whole library - jest automatically does this since we have an ``axios.js`` file in the ``__mocks__`` folder at the root of the client folder. [[2]](#References)

The benefit of this is that you can control exactly what happens when any axios function gets called, and you can check how many times it's been called. 

A few components also import ``./client/i18n.js`` (or ``./client/utils/formatDate``, which imports the first file), in which the ``i18n.use(Backend)`` line can sometimes throw a sneaky ERRCONNECTED error. You can resolve this by mocking that file as described in [this section](#Troubleshooting).

## Some more background on tests

### test driven development (TDD)
BDD???

### snapshot testing
You can save a snapshot of what the HTML looks like when the component is rendered.

### integration tests
Testing multiple components together. A small example is rendering a parent component and a child component within that.

### unit tests
Most of our tests are of this type. In this, you're testing a the functionality of a single component and no more.

## Internationalization
This project uses i18next for internationalization. If you import the render function with the i18n wrapper from ``test_utils.js``, it's set up to use English, so the components with be rendered with English text and you should be able to count on this to test for specific strings.

## Tips
1. Make test fail at least once to make sure it was a meaningful test
2. "If you or another developer change the component in a way that it changes its behaviour at least one test should fail." -  [How to Unit Test in React](https://itnext.io/how-to-unit-test-in-react-72e911e2b8d)

## More Resources
- stuff
- stuff

## References
1. [Best practices for unit testing with a react redux approach](https://willowtreeapps.com/ideas/best-practices-for-unit-testing-with-a-react-redux-approach)

2. [How to test your react-redux application (this article also references axios)](https://medium.com/asos-techblog/how-to-test-your-react-redux-application-48d90481a253)