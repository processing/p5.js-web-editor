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

// helper to create test project data
const makeProjects = (prefix, count) =>
  Array.from({ length: count }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    name: `${prefix}-sketch-${i + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    visibility: 'public'
  }));

const server = setupServer(
  rest.get('/projects', (req, res, ctx) => {
    requestCount += 1;
    lastSearchParams = req.url.searchParams;

    const page = Number(req.url.searchParams.get('page') ?? 1);
    const limit = Number(req.url.searchParams.get('limit') ?? 10);

    const projects =
      page === 1 ? makeProjects('page1', limit) : makeProjects('page2', limit);

    return res(
      ctx.status(200),
      ctx.json({
        projects,
        metadata: {
          page,
          totalPages: 6,
          totalProjects: 54,
          limit,
          hasPagination: true
        }
      })
    );
  }),

  rest.post('/collections/:collectionId/:projectId', (req, res, ctx) => {
    addRequestCount += 1;
    return res(ctx.status(200));
  }),

  rest.delete('/collections/:collectionId/:projectId', (req, res, ctx) => {
    removeRequestCount += 1;
    return res(ctx.status(200));
  })
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
      { preloadedState: overrideState ?? initialTestState }
    );

  it('calls the server on mount with page/limit/q', async () => {
    subject();

    await screen.findByText('page1-sketch-1');

    expect(lastSearchParams.get('page')).toBe('1');
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
      expect(lastSearchParams.get('page')).toBe('2');
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
      rest.get('/projects', (req, res, ctx) => {
        requestCount += 1;
        lastSearchParams = req.url.searchParams;

        return res(
          ctx.status(200),
          ctx.json({
            projects: [],
            metadata: {
              page: 1,
              totalPages: 1,
              totalProjects: 0,
              limit: 10,
              hasPagination: false
            }
          })
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
      { preloadedState: initialTestState }
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
      { preloadedState: initialTestState }
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
      rest.get('/projects', (req, res, ctx) => {
        const page = Number(req.url.searchParams.get('page') ?? 1);
        const limit = 10;

        const totalProjects = 23;
        const totalPages = 3;

        const start = (page - 1) * limit;
        const end = Math.min(start + limit, totalProjects);

        const projects = makeProjects(`page${page}`, end - start);

        return res(
          ctx.status(200),
          ctx.json({
            projects,
            metadata: {
              page,
              totalPages,
              totalProjects,
              limit,
              hasPagination: true
            }
          })
        );
      })
    );

    reduxRender(
      <AddToCollectionSketchList
        collection={{ id: 'col-1', name: 'Test', items: [] }}
      />,
      { preloadedState: initialTestState }
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
