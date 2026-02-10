import React from 'react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import {
  reduxRender,
  fireEvent,
  screen,
  within,
  waitFor
} from '../../../test-utils';
import { initialTestState } from '../../../testData/testReduxStore';

import SketchList from './SketchList';
import i18n from '../../../i18n';

let lastSearchParams;
let requestCount = 0;

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
  rest.get(`/${initialTestState.user.username}/projects`, (req, res, ctx) => {
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
  })
);

beforeAll(() => {
  i18n.init({
    lng: 'en-US',
    fallbackLng: 'en-US',
    resources: {
      'en-US': {
        translation: {}
      }
    },
    react: { useSuspense: false },
    interpolation: { escapeValue: false }
  });
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  requestCount = 0;
  lastSearchParams = undefined;
});

afterAll(() => server.close());

describe('<SketchList />', () => {
  const subject = () =>
    reduxRender(<SketchList username={initialTestState.user.username} />, {
      preloadedState: initialTestState
    });

  it('calls the server on mount', async () => {
    subject();

    await screen.findByText('page1-sketch-1');

    expect(lastSearchParams.get('page')).toBe('1');
    expect(lastSearchParams.get('limit')).toBe('10'); // note: would be 7 for mobile
    expect(lastSearchParams.get('sortField')).toBe('createdAt');
    expect(lastSearchParams.get('sortDir')).toBe('desc');

    const q = lastSearchParams.get('q');
    const expectedQ = initialTestState.search.sketchSearchTerm;

    if (expectedQ && expectedQ.length > 0) {
      expect(q).toBe(expectedQ);
    } else {
      expect([null, '']).toContain(q);
    }
  });

  it('shows empty state if the server returns no projects', async () => {
    server.use(
      rest.get(
        `/${initialTestState.user.username}/projects`,
        (req, res, ctx) => {
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
        }
      )
    );

    subject();

    await screen.findByText('SketchList.NoSketches');

    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next Page' })
    ).not.toBeInTheDocument();
  });

  it('clicking on date created row header refetches sort field', async () => {
    subject();
    await screen.findByText('page1-sketch-1');

    const before = requestCount;

    const createdHeader = screen.getByRole('columnheader', {
      name: /SketchList\.HeaderCreatedAt/i
    });
    const createdSortButton = within(createdHeader).getByRole('button');

    fireEvent.click(createdSortButton);

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(before);
      expect(lastSearchParams.get('sortField')).toBe('createdAt');
    });
  });

  it('clicking on row header twice toggles sort direction acordingly', async () => {
    subject();
    await screen.findByText('page1-sketch-1');

    const createdHeader = screen.getByRole('columnheader', {
      name: /SketchList\.HeaderCreatedAt/i
    });
    const createdSortButton = within(createdHeader).getByRole('button');

    // first click on header row
    const beforeOne = requestCount;
    fireEvent.click(createdSortButton);

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(beforeOne);
    });

    expect(lastSearchParams.get('sortField')).toBe('createdAt');
    expect(lastSearchParams.get('sortDir')).toBe('asc');

    // second click on header row
    const beforeTwo = requestCount;
    fireEvent.click(createdSortButton);

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(beforeTwo);
    });

    expect(lastSearchParams.get('sortField')).toBe('createdAt');
    expect(lastSearchParams.get('sortDir')).toBe('desc');
  });

  it('clicking next in pagination requests page 2 and updates table rows', async () => {
    subject();
    await screen.findByText('page1-sketch-1');

    const before = requestCount;

    fireEvent.click(screen.getByRole('button', { name: 'Next Page' }));

    await waitFor(() => {
      expect(requestCount).toBeGreaterThan(before);
      expect(lastSearchParams.get('page')).toBe('2');
    });

    await screen.findByText('page2-sketch-1');
  });

  it('clicking previous is not available on page 1', async () => {
    subject();
    await screen.findByText('page1-sketch-1');

    const prev = screen.getByRole('button', { name: 'Previous Page' });
    expect(prev).toBeDisabled();
  });

  it('pagination is not available when total pages is 1', async () => {
    server.use(
      rest.get(
        `/${initialTestState.user.username}/projects`,
        (req, res, ctx) => {
          requestCount += 1;
          lastSearchParams = req.url.searchParams;

          const limit = Number(req.url.searchParams.get('limit') ?? 10);

          return res(
            ctx.status(200),
            ctx.json({
              projects: makeProjects('singlePage', limit),
              metadata: {
                page: 1,
                totalPages: 1,
                totalProjects: limit,
                limit,
                hasPagination: false
              }
            })
          );
        }
      )
    );

    subject();

    await screen.findByText('singlePage-sketch-1');

    expect(
      screen.queryByRole('button', { name: 'Previous Page' })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next Page' })
    ).not.toBeInTheDocument();
  });
});
