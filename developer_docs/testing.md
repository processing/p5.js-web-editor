# Testing
For an initial basic overview of testing for React apps, [you can read what the React developers have to say about it](https://reactjs.org/docs/testing.html).

We are testing React components by rendering the component trees in a simplified test environment and making assertions on what gets rendered and what functions get called.

Many files still don't have tests, so if you're looking to get started as a contributor, this would be a great place to start!

## What's in this document
- [Testing dependencies](#testing-dependencies)
- [Useful testing commands](#Useful-testing-commands)
- [When to run tests](#When-to-run-tests)
- [Why write tests](#Why-write-tests)
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

## When to run tests

Are they actually being run automaticlly???

## Why write tests
- Good place to start if you're learning the codebase because it's harder to mess up production code
- Benefits all future contributors by allowing them to check their changes for errors
- Catches easy-to-miss errors
- Lets you check your own work and feel more comfortable sumbitting PRs
- Good practice for large projects
- Many of the existing components don't have tests yet, and you could write one :-)

## Writing a test
Want to get started writing a test for a new file or an existing file, but not sure how?
### For React components

1. Make a new file in the ``__tests__`` folder that's directly adjacent to your file. For example, if ``example.jsx`` is in ``src/components``, then you would make a file called ``example.test.jsx`` in ``src/components/__tests__``
2. Check if the component is connected to redux or not.
3. If it is, see the redux section below on how to write tests for that.
4. If it's not, see the section below on writing tests for unconnected components.

### For Redux action creators or reducers
See the redux section below :)

### For server side code
lol no clue how to do this yet

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
If it doesn't export connect()__stuffhere_ or use redux hooks like adfasdf, then testing your component will be simpler and will look like this:


## Testing Redux

split up testing between:
1. action creators
2. reducers
3. connected components


4. unconnected components

### action creators
write example code here
- can show cassie projects.test.js because that one is working :)

### reducers
write example code here
### connected components
3 approaches im trying for sketchlist
- mock all of axios, let it run the action creators as usual, redux-mock-store and then render component
- export unconnected component and use that 
  - this method didn't work because the subcomponent that was also redux connected failed. I could use shallow rendering but that's not supported in react-testing-library (I think)
- mock getProjects itself so it never calls apiClient at all

each has its own errors :/ i realized that the third approach is flawed because a lot of the functions rely on apiClient. Also, apiClient calls axios.create before any of the tests even run at all. overall, only mocking getProjects is a fragile solution

## How to handle API calls in tests

doesnt seem to like it when you make calls in a test
so we mock axios
also a little trickery in i18n .use(Backend)
- editor uses axios, we mock the whole library and jest automatically does this since we have a axios.js file in the __mocks__ folder at the root of the client folder. 
- the benefit of this is that you can control exactly what happens when any axios function gets called, and you can check how many times it's been called. 
- [see this for more](https://stackoverflow.com/questions/51393952/mock-inner-axios-create/51414152#51414152)
- [and this too](https://medium.com/asos-techblog/how-to-test-your-react-redux-application-48d90481a253)

## Some more background on tests

### test driven development (TDD)

### snapshot testing
want to make an example 

### integration tests

### unit tests

### mocking functions
Sometimes you might want to mock a function

## Internationalization

## Tips
1. Make test fail at least once to make sure it was a meaningful test
2. "If you or another developer change the component in a way that it changes its behaviour at least one test should fail." -  [How to Unit Test in React](https://itnext.io/how-to-unit-test-in-react-72e911e2b8d)

## More Resources
- stuff
- stuff

## References
[1] stuff here

[2] stuff here