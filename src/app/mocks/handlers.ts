import { http, HttpResponse} from 'msw';

export const handlers = [
  http.get('api/auth/profile', () => {
    return HttpResponse.json({
      _id: '1',
      usernaem: 'Test User',
      email: 'test@example.com'
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({}, { status: 200 });
  }),

  http.get('/api/books/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('q');

    if (query === 'harry') {
      return HttpResponse.json({
        items: [
          { id: '1', volumeInfo: { title: "Harry Potter" } }
        ]
      });
    }

    if (query === 'fail') {
      return HttpResponse.error();
    }

    return HttpResponse.json({ items: [] })
  }),
];