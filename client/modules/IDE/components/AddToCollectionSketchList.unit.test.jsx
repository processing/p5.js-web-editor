import React, { Suspense } from 'react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { reduxRender, fireEvent, screen, waitFor } from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';
import AddToCollectionSketchList from './AddToCollectionSketchList';
import i18n from '../../../i18n';

let lastSearchParams;
let requestCount = 0;
let addRequestCount = 0;
let removeRequestCount = 0;

// helper to create OP sketch data as returned by GET /user/:userID/sketches
const makeSketches = (prefix, count) =>
  Array.from({ length: count }).map((_, i) => ({
    visualID: `${prefix}-${i + 1}`,
    title: `${prefix}-sketch-${i + 1}`,
    userID: 123456789,
    isPrivate: 0,
    createdOn: new Date().toISOString()
  }));

const server = setupServer(
  rest.get('/user/:userID/sketches', (req, res, ctx) => {
    requestCount += 1;
    lastSearchParams = req.url.searchParams;

    const limit = Number(req.url.searchParams.get('limit') ?? 10);
    const offset = Number(req.url.searchParams.get('offset') ?? 0);
    const page = Math.floor(offset / limit) + 1;

    const sketches = makeSketches(`page${page}`, limit);

    // Total across all pages, surfaced via the X-Total-Count header the
    // OP-backed action reads for pagination metadata.
    return res(
      ctx.status(200),
      ctx.set('X-Total-Count', '54'),
      ctx.json(sketches)
    );
  }),

  rest.post('/curation/:collectionId/sketches/:projectId', (req, res, ctx) => {
    addRequestCount += 1;
    return res(ctx.status(201));
  }),

  // After add/remove the action refetches the curation + its sketches.
  rest.get('/curation/:collectionId', (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        curationID: req.params.collectionId,
        title: 'My Collection',
        userID: 1,
        username: 'happydog'
      })
    )
  ),
  rest.get('/curation/:collectionId/sketches', (req, res, ctx) =>
    res(ctx.status(200), ctx.json([]))
  ),

  rest.delete(
    '/curation/:collectionId/sketches/:projectId',
    (req, res, ctx) => {
      removeRequestCount += 1;
      return res(ctx.status(200));
    }
  )
);

beforeAll(async () => {
  await i18n.init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    resources: { 'en-US': { translation: {} } },
    react: { useSuspense: false },
    interpolation: { escapeValue: false }
  });
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  requestCount = 0;
  addRequestCount = 0;
  removeRequestCount = 0;
  lastSearchParams = undefined;
});

afterAll(() => server.close());

describe('<AddToCollectionSketchList />', () => {
  const collection = {
    id: 'col-1',
    name: 'My Collection',
    items: []
  };

  const subject = (overrideState) =>
    reduxRender(
      <Suspense fallback={<div>loading</div>}>
        <AddToCollectionSketchList collection={collection} />
      </Suspense>,
      { initialState: overrideState ?? initialTestState }
    );

  it('calls the server on mount with page/limit/q', async () => {
    subject();

    await screen.findByText('page1-sketch-1');

    expect(lastSearchParams.get('offset')).toBe('0');
    expect(lastSearchParams.get('limit')).toBe('10');

    const q = lastSearchParams.get('q');
    const expectedQ = initialTestState.search.sketchSearchTerm;

    if (expectedQ && expectedQ.length > 0) {
      expect(q).toBe(expectedQ);
    } else {
      expect([null, '']).toContain(q);
    }
  });

  it('clicking next requests second page and updates sketch list', async () => {
    subject();
    await screen.findByText('page1-sketch-1');

    const before = requestCount;

    fireEvent.click(
      screen.getByRole('button', { name: 'Pagination.NextPageARIA' })
    );

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(before);
      expect(lastSearchParams.get('offset')).toBe('10');
    });

    await screen.findByText('page2-sketch-1');
  });

  it('clicking previous is not available on the first page', async () => {
    subject();
    await screen.findByText('page1-sketch-1');

    expect(
      screen.getByRole('button', { name: 'Pagination.PreviousPageARIA' })
    ).toBeDisabled();
  });

  it('shows empty state if there are no projects', async () => {
    server.use(
      rest.get('/user/:userID/sketches', (req, res, ctx) => {
        requestCount += 1;
        lastSearchParams = req.url.searchParams;

        return res(
          ctx.status(200),
          ctx.set('X-Total-Count', '0'),
          ctx.json([])
        );
      })
    );

    subject();

    await screen.findByText('AddToCollectionSketchList.NoCollections');

    expect(
      screen.queryByRole('button', { name: 'Pagination.NextPageARIA' })
    ).not.toBeInTheDocument();
  });

  it('allows user to add a sketch to the collection', async () => {
    reduxRender(
      <AddToCollectionSketchList
        collection={{ id: 'col-1', name: 'My Collection', items: [] }}
      />,
      { initialState: initialTestState }
    );

    await screen.findByText('page1-sketch-1');

    fireEvent.click(
      screen.getAllByLabelText('QuickAddList.ButtonAddToCollectionARIA')[0]
    );

    await waitFor(() => {
      expect(addRequestCount).toBe(1);
    });
  });

  it('allows user to remove a sketch from the collection', async () => {
    reduxRender(
      <AddToCollectionSketchList
        collection={{
          id: 'col-1',
          name: 'My Collection',
          items: [{ projectId: 'page1-1', isDeleted: false }]
        }}
      />,
      { initialState: initialTestState }
    );

    await screen.findByText('page1-sketch-1');

    fireEvent.click(
      screen.getAllByLabelText('QuickAddList.ButtonRemoveARIA')[0]
    );

    await waitFor(() => {
      expect(removeRequestCount).toBe(1);
    });
  });

  it('renders correct pagination numbers when totalProjects is not a multiple of 10', async () => {
    server.use(
      rest.get('/user/:userID/sketches', (req, res, ctx) => {
        const limit = Number(req.url.searchParams.get('limit') ?? 10);
        const offset = Number(req.url.searchParams.get('offset') ?? 0);
        const page = Math.floor(offset / limit) + 1;

        const totalProjects = 23;

        const start = offset;
        const end = Math.min(start + limit, totalProjects);

        const sketches = makeSketches(`page${page}`, end - start);

        return res(
          ctx.status(200),
          ctx.set('X-Total-Count', String(totalProjects)),
          ctx.json(sketches)
        );
      })
    );

    reduxRender(
      <AddToCollectionSketchList
        collection={{ id: 'col-1', name: 'Test', items: [] }}
      />,
      { initialState: initialTestState }
    );

    await screen.findByText('page1-sketch-1');

    let info = document.querySelector('.pagination-info');
    expect(info.textContent.replace(/\s+/g, ' ').trim()).toContain('1 - 10');

    fireEvent.click(
      screen.getByRole('button', { name: 'Pagination.NextPageARIA' })
    );
    await screen.findByText('page2-sketch-1');

    info = document.querySelector('.pagination-info');
    expect(info.textContent.replace(/\s+/g, ' ').trim()).toContain('11 - 20');

    fireEvent.click(
      screen.getByRole('button', { name: 'Pagination.NextPageARIA' })
    );
    await screen.findByText('page3-sketch-1');

    info = document.querySelector('.pagination-info');
    expect(info.textContent.replace(/\s+/g, ' ').trim()).toContain('21 - 23');
  });
});
