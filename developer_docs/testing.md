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
$ npm run test
```

-----

[Run tests that match the pattern](https://stackoverflow.com/questions/28725955/how-do-i-test-a-single-file-using-jest/28775887). Useful if you're writing one specific test and want to only run that one. 
```
$ npm run test -- someFileName
```

-----
Run the tests but update the snapshot if they don't match.

```
$ npm run test -- -u
```

----
For example, if you wanted to run just the SketchList test but also update the snapshot, you could do:
```
$ npm run test -- Sketchlist.test.js -u
```

Find more commands in the [Jest documentation](https://jestjs.io/docs/cli).

## Why write tests
- Good place to start if you're learning the codebase because it's harder to mess up production code
- Benefits all future contributors by allowing them to check their changes for errors
- Increased usage: Most code with only ever have a single invocation point, but this means that code might not be particularly robust and lead to bugs if a different devleoper reuses it in a different context. Writing tests increases the usage of the code in question and may improve the long-term durability, along with leading developers to refactor their code to be more usable. [[3]](#References)
- Lets you check your own work and feel more comfortable sumbitting PRs
- Catches easy-to-miss errors
- Good practice for large projects
- Many of the existing components don't have tests yet, and you could write one :-)

## When to run tests

When you make a git commit, the tests will be run automatically for you (maybe? check with Cassie again). Tests will also be run when you make a PR and if you fail any tests it blocks the merge. 

When you modify an existing component, it's a good idea to run the test suite to make sure it didn't make any changes that break the rest of the application. If they did break some tests, you would either have to fix a bug component or update the tests to match the new expected functionality.

## Writing a test
Want to get started writing a test for a new file or an existing file, but not sure how?


### For React components
1. Make a new file directly adjacent to your file. For example, if ``example.jsx`` is ``src/components/example.jsx``, then you would make a file called ``example.test.jsx`` at ``src/components/example.test.jsx``
2. Check if the component is connected to redux or not.
3. If it is, see the [redux section](#Testing-Redux) below on how to write tests for that.
4. If it's not, see the [section below on writing tests for unconnected components](#Testing-plain-components).
)
5. "Arange, Act, Assert:" In other words, *arrange* the set up for the test, *act* out whatever the subject's supposed to do, and *assert* on the results. [[3]](#References)

### In every test file
Maybe we want to add these as comments??
- What behavior is and isn't covered by the suites What dependencies should be replaced with mocks and what should be left realistic 
- The primary design benefit (if any) of these tests 
- The primary regression protection (if any) provided by these tests 
- What an example test should look like 
- The maximum permissible elapsed time for a run of an individual test or for the full suit

### Consistency across tests
> "Teams that adopt a rigid and consistent structure to each test tend to more readily understand each test, because every deviation from the norm can be trusted to be meaningful and somehow specific to the nature of the subject."
- We want to default to using meaningless test data stored in the redux-test-stores folder. 
- Be sure to follow the folder structure
- Follow the rendering guidelines set up for the components in this README.

### Querying for elements
Read about the recommended order of priority for queries in [the testing library docs](https://testing-library.com/docs/guide-which-query/#priority). We recommend using roles and text, or labels. You can use this [handy extension](https://chrome.google.com/webstore/detail/testing-playground/hejbmebodbijjdhflfknehhcgaklhano/related) to do this.


### What to test
For any type of component, you might want to consider testing:
- The text or divs that you expect to be on the page are actually there. You can use [Queries](https://testing-library.com/docs/queries/about/) for this. 
- a previously saved snapshot of the HTML matches a snapshot taken during testing.
- what else?? help!

>Only test the behaviors you know you need to care about. For example, if the desired behavior of a particular edge case doesn't truly matter yet or isn't fully understood, don't write a test for it yet. Doing so would restrict the freedom to refactor the implementation. Additionally, it will send the signal to future readers that this behavior is actually critical, when it very well might not be (perhaps a form of [accidental creativity]()). [[3]](#References)

**Don't test unreachable edge cases:** You would have to add code to your original implementation to guard against these cases. The future proofing and the added cost to the codebase "is generally not worth their preceived potential benefits" [[3]](#References)

**Make sure your tests are sufficient:** You want to make sure your test actually specifies all the behaviors you want to ensure the code exhibits. For example, testing that ``1+1 > 0`` would be correct, but insufficient. [[3]](#References)

### File structure
Each test should have a top-level ```describe`` block to group related blocks together, with the name of the component under test.
*example.test.ts*

```js
import example from './example';

describe('example', () => {   
  it('creates a new example', () => {
    //your tests here
  }); 
});

```


### For Redux action creators or reducers
See the [redux section](#Testing-Redux) below :)

### Troubleshooting
1. Check if the component makes any API calls. If it's using axios, jest should already be set up to replace the axios library with a mocked version; however, you may want to [mock](https://jestjs.io/docs/mock-function-api#mockfnmockimplementationoncefn) the axios.get() function with your own version so that GET calls "return" whatever data makes sense for that test. 

    ```js
    axios.get.mockImplementationOnce(
      (x) => Promise.resolve({ data: 'foo' })
    );
    ```
You can see it used in the context of a test [in the SketchList.test.jsx file](../client/modules/IDE/components/SketchList.test.jsx).

2. If the component makes use of the formatDate util, some of the functions in that rely on the ``./client/i18n.js`` file that also makes an ajax request, which sometimes leads to an ERRCONNECTED error on the console, even though your tests pass. You can fix it by adding a mock for that specific i18n file:
    ```js
    jest.mock('_path_to_file_/i18n');
    ```
You can also see it used in the context of a test [in the SketchList.test.jsx file](../client/modules/IDE/components/SketchList.test.jsx).

## Files to be aware of

### Folder structure
All tests are directly adjacent to the files that they are testing, as described in the [React docs](https://reactjs.org/docs/faq-structure.html#grouping-by-file-type). For example, if you're testing ``examplefolder/Sketchlist.test.jsx``, the test would be in ``examplefolder/Sketchlist.test.jsx``. This is so that the tests are as close as possible to the files. This also means that any snapshot files will be stored in the same folder, such as ``examplefolder/__snapshots__/Sketchlist.test.jsx.snap``

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
```js
import { render, fireEvent, screen, waitFor } from '../../../test-utils';
```
If your component needs i18n and redux:
```js
import { reduxRender, fireEvent, screen, waitFor } from '../../../test-utils';
```

Redux and i18next are made accessible by placing wrappers around the component. We can do this by replacing the render function with one that renders the requested component WITH an additional wrapper added around it. 

For example, the exported render function that adds a wrapper for both redux and i18n looks roughly like this:

```js
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

in progress

## Testing plain components
If it doesn't contain ``connect(mapStateToProps, mapDispatchToProps)(ComponentName)`` or use hooks like ``useSelector``, then your component is not directly using Redux and testing your component will be simpler and might look something like this:

```js
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
  ```js
  act(() => {
    fireEvent.click(screen.getByLabelText('Username'));
  });
  expect(yourMockFunction).toHaveBeenCalledTimes(1);
  expect(yourMockFunction.mock.calls[0][0]).toBe(argument);
  ``` 
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
```js
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';


const mockStore = configureStore([thunk]);
```
3. Create a mock store. There's an initial state that you can import from ``client/redux_test_stores/test_store.js`` 
```js
store = mockStore(initialTestState);
```
3. Render the component with reduxRender and the store that you just created.
```js
reduxRender(<SketchList username="happydog1" />, {store, container});
```
4. Test things! You may need to use jest to mock certain functions if the component is making API calls.

All together, it might look something like this.

```js
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
    ```js
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

## How to handle API calls in tests

Some tests throw errors if a part of the client-side code tries to make an API call or AJAX request. Our solution to this is to use jest to replace those functions with [mock functions](https://jestjs.io/docs/mock-functions). 

The code in question for the client side is mostly related to the axios library. We mock the whole library - jest automatically does this since we have an ``axios.js`` file in the ``__mocks__`` folder at the root of the client folder. [[2]](#References)

The benefit of this is that you can control exactly what happens when any axios function gets called, and you can check how many times it's been called. 

A few components also import ``./client/i18n.js`` (or ``./client/utils/formatDate``, which imports the first file), in which the ``i18n.use(Backend)`` line can sometimes throw a sneaky ERRCONNECTED error. You can resolve this by mocking that file as described in [this section](#Troubleshooting).

## Some more background on tests

### Test Driven Development (TDD)
Do we want a section here about TDD history? 

### snapshot testing
You can save a snapshot of what the HTML looks like when the component is rendered.

### integration tests
Testing multiple components together. A small example is rendering a parent component in order to test the interactions between children components. For frontend development, integration tests might focus on end-to-end flows using Puppeter or another type of headless browser testing. We don't do this just yet.

### unit tests
Most of our tests are of this type. In this, you're testing a the functionality of a single component and no more. They provide lots of feedback on the specific component that you're testing, with the cost of high [redundant coverage](https://github.com/testdouble/contributing-tests/wiki/Redundant-Coverage) and more time spent refactoring tests when components get rewritten.

### Other terminology for mocking
Thanks [Test Double Wiki](https://github.com/testdouble/contributing-tests/wiki/Test-Double) for the definitions.
#### Test double
Broadest available term to describe any fake thing used in place of a real thing for a test.
#### Stub
Any test double that uses a preconfigured response, such always responding with placeholder json to a certain fetch call.
#### Fake
A test double that provides an alternate implementation of a real thing for the purpose of a test.
#### Mock
Colloquially can mean any of the above, just used generally for test doubles.
#### Partial mock
Refers to any actual object which has been wrapped or changed to provide artificial responses to
some methods but not others. Partial mocks are widely considered to be an anti-pattern of test double usage.

#### Spy
Records every invocation made against it and can verify certain interactions took place after the fact.

## Internationalization
This project uses i18next for internationalization. If you import the render function with the i18n wrapper from ``test_utils.js``, it's set up to use English, so the components with be rendered with English text and you should be able to count on this to test for specific strings.

## Tips
1. Make test fail at least once to make sure it was a meaningful test
2. "If you or another developer change the component in a way that it changes its behaviour at least one test should fail." -  [How to Unit Test in React](https://itnext.io/how-to-unit-test-in-react-72e911e2b8d)
3. Avoid using numbers or data that seem "special" in your tests. For example, if you were checking the "age" variable in a component is a integer, but checked it as so ``expect(person.ageValidator(18)).toBe(true)``, the reader might assume that the number 18 had some significance to the function because it's a significant age. It would be better to have used 1234.

## More Resources
- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)

## References
1. [Best practices for unit testing with a react redux approach](https://willowtreeapps.com/ideas/best-practices-for-unit-testing-with-a-react-redux-approach)

2. [How to test your react-redux application (this article also references axios)](https://medium.com/asos-techblog/how-to-test-your-react-redux-application-48d90481a253)

3. [Testing Double Wiki (Special thanks to this wiki for being such a comprehensive guide to the history of testing and best practices.)](https://github.com/testdouble/contributing-tests/wiki/Tests%27-Influence-on-Design)

## Special thanks
Thank you to HipsterBrown for helping us out with writing this documentation.