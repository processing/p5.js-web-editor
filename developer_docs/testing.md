# Testing
This guide explains the tools and methods used to test the p5.js Editor. It focuses mainly on the client side, but some of it applies to the server tests too.

For basic overview of testing React Apps, [you can read what the React developers have to say about it](https://reactjs.org/docs/testing.html). There are both unit tests and integration tests.

We are testing React components by rendering the component trees in a simplified test environment and making assertions on what gets rendered and what functions get called.

Many files still don't have tests, so **if you're a new contributor, this is a great place to start!** 

## Table of Contents
- [Testing](#testing)
  - [Table of Contents](#table-of-contents)
  - [Testing Dependencies](#testing-dependencies)
  - [Useful Testing Commands](#useful-testing-commands)
  - [Testing Methods](#testing-methods)
    - [Unit Tests](#unit-tests)
    - [Integration Tests](#integration-tests)
    - [Snapshot Testing](#snapshot-testing)
  - [Why Write Tests](#why-write-tests)
  - [When to Run Tests](#when-to-run-tests)
  - [Writing a Test](#writing-a-test)
    - [For React Components](#for-react-components)
    - [For Redux Action Creators or Reducers](#for-redux-action-creators-or-reducers)
    - [For Utility Files](#for-utility-files)
    - [Querying for Elements](#querying-for-elements)
    - [File Structure](#file-structure)
    - [Consistency Across Tests](#consistency-across-tests)
    - [Troubleshooting](#troubleshooting)
  - [What to Test](#what-to-test)
  - [Files to be Aware of](#files-to-be-aware-of)
    - [Folder structure](#folder-structure)
    - [`test-utils.js`](#test-utilsjs)
    - [`testData`](#testdata)
  - [Testing Plain Components](#testing-plain-components)
  - [Testing Redux](#testing-redux)
    - [Connected Components](#connected-components)
  - [How to Handle API Calls in Tests](#how-to-handle-api-calls-in-tests)
  - [Internationalization](#internationalization)
  - [Useful Terminology](#useful-terminology)
      - [Test double](#test-double)
      - [Stub](#stub)
      - [Fake](#fake)
      - [Mock](#mock)
      - [Partial mock](#partial-mock)
      - [Spy](#spy)
  - [Tips](#tips)
  - [Files to Start With](#files-to-start-with)
  - [More Resources](#more-resources)
  - [References](#references)
  - [Special Thanks](#special-thanks)


## Testing Dependencies
1. [Jest](https://jestjs.io/)
2. [react-testing-library](https://testing-library.com/docs/react-testing-library/intro/)
3. [redux-mock-store](https://github.com/reduxjs/redux-mock-store)
4. [msw](https://github.com/mswjs/msw)

## Useful Testing Commands
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

## Testing Methods

### Unit Tests
Unit tests test the functionality of a single component and nothing else. They provide lots of feedback on the specific component you're testing, with the cost of high [redundant coverage](https://github.com/testdouble/contributing-tests/wiki/Redundant-Coverage) and more time spent refactoring tests when components get rewritten. **Not every file needs a unit test.** Unit tests are most important for components that are either:
1. User facing (like a text input field or a user form component)
2. Used across multiple components like a reusable dropdown menu or reusable table element

In both of these cases, the component being tested is not merely an implementation detail. Thus, it is important for the unit tests to test the error cases that could occur to ensure that the component is robust. For example, for a user-facing input field that should only take positive numbers, a unit test would want to cover what happens when users enter negative numbers or letters.

### Integration Tests
Integration tests test multiple parts of the application together. A small example is rendering a parent component in order to test the interactions between children components. Generally, they validate how multiple units of your application work together. `Jest` uses `jsdom` under the hood to emulate common browser APIs with less overhead than automation like a headless browser, and its mocking tools can stub out external API calls. We use integration tests to maximize coverage and to make sure all the pieces play nice together. We want our integration tests to cover the testing of components that don't have unit tests because they're only used in one place and are merely an implementation detail. The integration tests can test the expected user flows, while we expect the unit tests to have tested the error cases more rigorously.

See [this great article on CSS tricks](https://css-tricks.com/react-integration-testing-greater-coverage-fewer-tests/) about integration tests for more information about this.

To reiterate, integration tests are used to maximize coverage on individual components that are only used once. Unit tests are used to test the robustness of user-facing components and reusable components. 

### Snapshot Testing
You can save a snapshot of what the HTML looks like when the component is rendered. It doesn't hurt to add them to your tests, but they can be brittle. When you change the HTML of a component, they need to be updated.

## Why Write Tests
- Many of the existing components don't have tests yet, and you could write one :-) You can find a few suggested files to start with [in this section](#Files-to-start-with).
- They are a good place to start if you're learning the codebase.
- It benefits all future contributors by allowing them to check their changes for errors.
- It increases usage: most code with only ever have a single invocation point, but this means that code might not be particularly robust and lead to bugs if a different developer reuses it in a different context. Writing tests increases the usage of the code in question and may improve the long-term durability, along with leading developers to refactor their code to be more usable. [[3]](#References)
- Testing lets you check your own work and feel more comfortable submitting PRs.
- It catches easy-to-miss errors.
- It is good practice for large projects.

## When to Run Tests

When you `git push` your code, the tests will be run automatically for you. Tests will also be run when you make a PR and if you fail any tests it blocks the merge. 

When you modify an existing component, it's a good idea to run the test suite to make sure it didn't make any changes that break the rest of the application. If they did break some tests, you would either have to fix a bug component or update the tests to match the new expected functionality.

## Writing a Test
Want to get started writing a test for a new file or an existing file, but not sure how?

### For React Components
1. Make a new file directly adjacent to your file. For example, if `example.jsx` is `src/components/example.jsx`, then you would make a file called `example.[unit|integration].test.jsx` at `src/components/example.[unit|integration].test.jsx`
2. Check if the component uses the `connect` HOC or the `useState` or `useDispatch` hooks from `react-redux`.
3. If it is, see the [redux section](#Testing-Redux) below on how to write tests for that.
4. If it's not, see the [section below on writing tests for unconnected components](#Testing-plain-components).
5. "Arrange, Act, Assert:" In other words, *arrange* the setup for the test, *act* out whatever the subject's supposed to do, and *assert* on the results. [[3]](#References)

### For Redux Action Creators or Reducers
See the [redux section](#Testing-Redux) below :)

### For Utility Files
You might still want to write tests for non-component or non-redux files, such as modules with utility functions, especially ones that are used in many places across your application. What gets tested in this case depends a lot on the module itself, but generally, you would import the module and test the functions within it.

### Querying for Elements
Read about the recommended order of priority for queries in [the testing library docs](https://testing-library.com/docs/guide-which-query/#priority). We recommend using roles and text, or labels. You can use this [handy extension called Testing Playground](https://chrome.google.com/webstore/detail/testing-playground/hejbmebodbijjdhflfknehhcgaklhano/related) to do this.

### File Structure
Each test should have a top-level ``describe`` block to group related blocks together, with the name of the component under test.

*Example.test.js*

```js
import Example from './Example';

describe('<Example.jsx/>', () => {   
  it('creates a new example', () => {
    //your tests here
  }); 
});

```

### Consistency Across Tests
> "Teams that adopt a rigid and consistent structure to each test tend to more readily understand each test, because every deviation from the norm can be trusted to be meaningful and somehow specific to the nature of the subject."
- We want to default to using meaningless test data stored in the redux-test-stores folder. 
- Be sure to follow the [folder structure](#Folder-structure)
- Follow the rendering guidelines set up for the components in this [Writing a Test](#Writing-a-test) section.


### Troubleshooting
1. If you are having network errors like ERRCONNECTED or something like `Cannot read property 'then' of undefined` as a result of an `apiClient` function, then please view the [How to handle API calls in tests](#How-to-handle-API-calls-in-tests) section.

2. In some cases, window functions are not defined because the client tests run in the context of `jsdom` and not a real browser. In this case, you want to define the function as a no op. [See this StackOverflow post for more information.](https://stackoverflow.com/questions/57311971/error-not-implemented-window-scrollto-how-do-we-remove-this-error-from-jest-t)
    ```js
    const noop = () => {};
    Object.defineProperty(window, 'focus', { value: noop, writable: true });
    ```

3. If you see a `range(...).getBoundingClientRect is not a function` error, this is probably related to the CodeMirror code editor, and there is a fix in [this GitHub Issues post](https://github.com/jsdom/jsdom/issues/3002).

## What to Test
For any type of component, you might want to consider testing:
- The text or divs that you expect to be on the page are actually there. You can use [Queries](https://testing-library.com/docs/queries/about/) for this. Assertions should make use of the toBeInTheDocument() matcher when asserting that an element exists:
    ```
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.queryByText('Does not exist')).not.toBeInTheDocument();
    ```
- If it's an integration test, you could consider testing the "happy path" flow. For example, in a login form, you would test how a user might enter their username and password and then enter that information.
- If it's a unit test, you could test possible error cases to ensure that the module being tested is robust and resistant to user or developer error.
- Generally, you want to focus your testing on "user input" -> "expected output" instead of making sure the middle steps work as you would expect. This might mean that you don't need to check that the state changes or class-specific methods occur. This is so that if some of the small details in the implementation of the component changes in the future, the tests can remain the same.
- More details on testing behavior in the component-specific sections

>Only test the behaviors you know you need to care about. For example, if the desired behavior of a particular edge case doesn't truly matter yet or isn't fully understood, don't write a test for it yet. Doing so would restrict the freedom to refactor the implementation. Additionally, it will send the signal to future readers that this behavior is actually critical, when it very well might not be. [[3]](#References)

**Don't test unreachable edge cases:** You would have to add code to your original implementation to guard against these cases. The future proofing and the added cost to the codebase "is generally not worth their perceived potential benefits" [[3]](#References)

**Make sure your tests are sufficient:** You want to make sure your test actually specifies all the behaviors you want to ensure the code exhibits. For example, testing that `1+1 > 0` would be correct, but insufficient. [[3]](#References)

## Files to be Aware of

### Folder structure
All tests are directly adjacent to the files that they are testing, as described in the [React docs](https://reactjs.org/docs/faq-structure.html#grouping-by-file-type). For example, if you're testing ``examplefolder/Sketchlist.jsx``, the test would be in ``examplefolder/Sketchlist.unit.test.jsx``. This is so that the tests are as close as possible to the files. This also means that any snapshot files will be stored in the same folder, such as ``examplefolder/__snapshots__/Sketchlist.unit.test.jsx.snap``

Integration tests should be adjacent to the components they're testing. They should be called ``ComponentName.integration.test.jsx``. Unit tests should be called ``ComponentName.unit.test.jsx``.

Manual mocks are in ``__mocks__`` folders are adjacent to the modules that they're mocking.

Note: Even if you mock a user module in a ``__mocks__`` folder, user modules have to be explictly mocked in the test too, with ``Jest.mock("path_to_module")``

Node modules are mocked in the ``__mocks__`` folder at the root of the client folder, which also includes any mocks that are needed for user modules at the root of the folder directory.

```
.
└── client
    ├── __mocks__
    |   ├── i18n.js
    |   └── ...other Node modules you want to mock
    ├── modules
    │   ├── IDE
    │   │   ├── actions
    │   │   │   ├── __mocks__
    │   │   │   │   ├── projects.js
    │   │   │   │   └─ ... other action creator mocks   
    │   │   │   ├── projects.js 
    │   │   │   ├── projects.unit.test.js  
    │   │   │   └─ ... other action creator files 
    │   │   ├── components  
    │   │   │   ├── __snapshots__
    │   │   │   │   ├── SketchList.unit.test.jsx.snap  
    │   │   │   │   └─ ... other snapshots   
    │   │   │   ├── SketchList.jsx  
    │   │   │   ├── SketchList.unit.test.jsx     
    │   │   │   └── ... and more component files 
    │   │   ├── reducers
    │   │   │   ├── assets.unit.test.js
    │   │   │   ├── assets.js
    │   │   │   └── ...more reducers
    │   └── ... more folders
    ├── testData
    |   ├── testReduxStore.js
    |   ├── testServerResponses.js
    │   └── ...any other placeholder data
    ├── i18n-test.js
    ├── jest.setup.js
    ├── test-utils.js
    └──... other files and folders
```

### `test-utils.js`
This file overwrites the default `react-testing-library`'s render function so that components rendered through the new render function have access `i18next` and `redux`. It exports the rest of `react-testing-library` as is.

It exports a render function with a i18n wrapper as `render` and a render function with a wrapper for both redux and i18n as `reduxRender`.

Thus, in your component test files, instead of calling `import {functions you want} from 'react-testing-libary'` importing `react-testing-library` might look something like this:

If your component only needs i18n and not redux:
```js
import { render, fireEvent, screen, waitFor } from '../../../test-utils';
```
If your component needs i18n and redux:
```js
import { reduxRender, fireEvent, screen, waitFor } from '../../../test-utils';
```

`redux` and `i18next` are made accessible by placing wrappers around the component. We can do this by replacing the render function with one that renders the requested component WITH an additional wrapper added around it. 

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

Then, if you want to call the render function with the wrapper with the `redux` Provider, you can do this, once you have a [store made with redux-mock-store](#Connected-Components):

```js
reduxRender(<SketchList {...subjectProps} />, { store });
```


### `testData`
This folder contains the test data that you can use in your tests, including initial redux states that you can provide to the `reduxRender` function when testing. For example, if you want to render the `SketchList` component with a username of `happydog` and some sample sketches, `testData/testReduxStore.js` contains a definition for that state that you can import and provide to the renderer. The folder also contains test data that you can use for `msw` server so that the server returns json with the correct format and fields. 

## Testing Plain Components
If it doesn't contain `connect(mapStateToProps, mapDispatchToProps)(ComponentName)` or use hooks like `useSelector`, then your component is not directly using Redux and testing your component will be simpler and might look something like the code below. Notably, we describe the component being tested as the [subject under test](http://xunitpatterns.com/SUT.html) by creating a function called `subject` that renders the component with the subject dependencies (the props) that are defined in the same scope. They're declared with `let` so that they can be overwritten in a nested `describe`block that tests different dependencies. This keeps the subject function consistent between test suites and explicitly declares variables that can affect the outcome of the test.

*MyComponent.test.jsx*
```js
import React from 'react';
import { act } from 'react-dom/test-utils';
import { fireEvent, render, screen } from '../../../../test-utils';
import MyComponent from './MyComponent';

describe('<MyComponent />', () => {

  let subjectProps = {
    t: jest.fn(),
    fontSize: 12,
    setFontSize: jest.fn()
  };

  const subject = () => {
    render(<MyComponent {...subjectProps} />);
  };

  afterEach(() => {
    //reset the mocks in subjectProps
    jest.clearAllMocks();
  });
    
  it('I am the test description', () => {
    // render the component
    act(() => {
      subject();
    });
    
    /* Tests go here!
     * You can access mock functions from subjectProps. 
     * For example, subjectProps.setFontSize
     */
  
  });

  describe('test with a different prop', () => {
    
    beforeAll(() => {
      subjectProps = {...subjectProps, fontSize: 14}
    });

    it("here's that test with a different prop", () => {
      act(() => {
        subject();
      });
      //test here
    });
  });

});
```

Consider what you want to test. Some examples are:
- User input results in the [expected function being called with the expected argument](https://jestjs.io/docs/mock-functions). 
  ```js
  act(() => {
    fireEvent.click(screen.getByLabelText('Username'));
  });
  expect(yourMockFunction).toHaveBeenCalledTimes(1);
  expect(yourMockFunction.mock.calls[0][0]).toBe(argument);
  ``` 

## Testing Redux

When testing redux, the general guidance [[1]](#References) seems to suggest splitting up testing between:
1. action creators
2. reducers
3. connected components

Testing reducers and action creators is covered pretty well in [Redux's documentation](https://redux.js.org/recipes/writing-tests). An example of testing an action creator can be found at [projects.test.js](../client/modules/IDE/components/actions/__tests__/projects.test.jsx)

### Connected Components

Although it's possible to export the components as unconnected components for testing (and in this case you would just manually pass in the props that redux provides), the codebase is being migrated to use hooks, and in this case, that approach no longer works. It also doesn't work if we render components that have connected subcomponents. Thus, for consistency, we suggest testing all redux components while they're connected to redux. We can do this with ``redux-mock-store``.

This works like so:
1. Import the reduxRender function from ``client/test_utils.js`` 
2. Configure the mock store. 
```js
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';


const mockStore = configureStore([thunk]);
```
3. Create a mock store. There's an initial state that you can import from ``client/testData/testReduxStore.js`` 
```js
store = mockStore(initialTestState);
```
3. Render the component with reduxRender and the store that you just created.
```js
reduxRender(<SketchList username="happydog1" />, {store});
```
4. Test things! You may need to use jest to mock certain functions if the component is making API calls.

All together, it might look something like this.


*MyReduxComponent.test.jsx*
```js
import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { act } from 'react-dom/test-utils';
import MyReduxComponent from './MyReduxComponent';
import { reduxRender, fireEvent, screen } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';

describe('<MyReduxComponent />', () => {
  const mockStore = configureStore([thunk]);
  const store = mockStore(initialTestState);

  let subjectProps = {
    sampleprop: "foo"
  };

  const subject = () => {
    reduxRender(<MyComponent {...subjectProps} />, {store});
  };

  afterEach(() => {
    //clear the mock store too
    store.clearActions();
  });
    
  it('I am the test description', () => {
    // render the component
    act(() => {
      subject();
    });
    
    /* Tests go here!
     * You can access mock functions from subjectProps. 
     * For example, subjectProps.setFontSize
     */
  
  });

  describe('test with a different prop', () => {

    beforeAll(() => {
      subjectProps = {...subjectProps, fontSize: 14}
    });
    
    it("here's that test with a different prop", () => {
      act(() => {
        subject();
      });
      //test here
    });
  });

});
```

Some things to consider testing:
- User input results in the expected redux action.
    ```js
    act(() => {
      component = reduxRender(<SketchList username="happydog2" />, {store});
    });
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-direction-createdAt'));
    });
    const expectedAction = [{ type: 'TOGGLE_DIRECTION', field: 'createdAt' }];
    
    expect(store.getActions()).toEqual(expect.arrayContaining(expectedAction));
    ```

## How to Handle API Calls in Tests

Some tests throw errors if the client-side code tries to make an API call. This project uses the [Mock Service Worker library](https://mswjs.io/) to mock the API requests by intercepting requests on the network level [[2]](#References). It can handle API calls and return appropriate data (and you can see what shape of data gets returned by looking through the server files). There is some test data available in the `client/testData/testServerResponse.js` file, but you may need to edit the file to add a new json response if an appropriate one doesn't exist already. The example code below sets up a server to respond to a GET request at `/exampleendpoint` by returning `{data: foo}` You can see it in the context of a test [in the SketchList.test.jsx file](../client/modules/IDE/components/SketchList.test.jsx).

There's a longer explanation of the benefits of `msw` in [this article by Kent C Dodds](https://kentcdodds.com/blog/stop-mocking-fetch).

```js
// setup for the msw
const server = setupServer(
  rest.get(`/exampleendpoint`, (req, res, ctx) =>
    res(ctx.json({ data: 'foo' }))
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

If the component makes use of the `formatDate` util, some of the functions in that rely on the `client/i18n.js` file that also makes an AJAX request, which sometimes leads to an `ERRCONNECTED` error on the console, even though your tests pass. You can fix it by adding a mock for that specific i18n file:
```js
jest.mock('_path_to_file_/i18n');
```
You can see it used in the context of a test [in the SketchList.test.jsx file](../client/modules/IDE/components/SketchList.test.jsx).

## Internationalization
This project uses i18next for internationalization. If you import the render function with the i18n wrapper from `test_utils.js`, it's set up to use English, so the components with be rendered with English text and you should be able to count on this to test for specific strings.


## Useful Terminology
Thanks [Test Double Wiki](https://github.com/testdouble/contributing-tests/wiki/Test-Double) for the definitions. You might see some of these words used in testing library documentation, so here are short definitions for them.

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

## Tips
1. Make test fail at least once to make sure it was a meaningful test
2. "If you or another developer change the component in a way that it changes its behavior at least one test should fail." -  [How to Unit Test in React](https://itnext.io/how-to-unit-test-in-react-72e911e2b8d)
3. Avoid using numbers or data that seem "special" in your tests. For example, if you were checking the "age" variable in a component is a integer, but checked it as so `expect(person.ageValidator(18)).toBe(true)`, the reader might assume that the number 18 had some significance to the function because it's a significant age. It would be better to have used 1234.
4. Tests should help other developers understand the expected behavior of the component that it's testing

## Files to Start With

These files still need tests! If you want to contribute by writing tests, please consider starting with these:

- [ ] Integration test for LoginView.jsx
- [ ] Integration test for SignupView.jsx
- [ ] Tests for route switching in routes.jsx
- [ ] Unit testing for common components like Button.jsx

## More Resources
- [React Testing Library Cheatsheet](https://testing-library.com/docs/react-testing-library/cheatsheet/)
- [React connected component test](https://www.robinwieruch.de/react-connected-component-test)
- https://blog.bitsrc.io/testing-a-redux-hooked-app-a8e9d1609061

## References
1. [Best practices for unit testing with a react redux approach](https://willowtreeapps.com/ideas/best-practices-for-unit-testing-with-a-react-redux-approach)

2. [React testing library example intro](https://testing-library.com/docs/react-testing-library/example-intro/#full-example)

3. [Testing Double Wiki (Special thanks to this wiki for being such a comprehensive guide to the history of testing and best practices.)](https://github.com/testdouble/contributing-tests/wiki/Tests%27-Influence-on-Design)

## Special Thanks
Thank you to HipsterBrown for helping us out with writing this documentation.