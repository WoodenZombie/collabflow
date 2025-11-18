// server/Project/__tests__/projects.test.js

const request = require('supertest');
const app = require('../index');
const db = require('../../db/db');

// víc času kvůli DB a bugům, které visí
jest.setTimeout(15000);

describe('Projects API', () => {
  let createdProjectId; // id projektu vytvořeného v POST testu

  // 1) GET all projects – základní funkčnost
  it('GET /api/projects should return list of projects', async () => {
    const res = await request(app).get('/api/projects');

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('id');
    expect(res.body[0]).toHaveProperty('name');
  });

  // 2) GET project by existing id (předpoklad: id=1 existuje v dumpu)
  it('GET /api/projects/1 should return single project object', async () => {
    const res = await request(app).get('/api/projects/1');

    expect(res.statusCode).toBe(200);
    expect(typeof res.body).toBe('object');
    expect(res.body).toHaveProperty('id', 1);
    expect(res.body).toHaveProperty('name');
  });

  // 3) GET project by non-existing id – očekává se 404 (aktuálně BUG – timeout)
  it('GET /api/projects/9999 should return 404 for non-existing project', async () => {
    const res = await request(app).get('/api/projects/9999');

    expect(res.statusCode).toBe(404);
  });

  // 4) POST – vytvoření validního projektu (happy path)
  it('POST /api/projects should create a new project', async () => {
    const uniqueName = 'Test Project Jest ' + Date.now();

    const newProject = {
      name: uniqueName,
      description: 'Test description from Jest',
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      status: 'In Progress',
      team_id: 1,
      created_by: 1,
    };

    const res = await request(app)
      .post('/api/projects')
      .send(newProject)
      .set('Content-Type', 'application/json');

    // některá API vrací 200, jiná 201 – akceptujeme oboje
    expect([200, 201]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('id');

    createdProjectId = res.body.id;
    expect(res.body.name).toBe(uniqueName);
  });

  // 5) PUT – update existujícího projektu (happy path)
  it('PUT /api/projects/:id should update existing project', async () => {
    if (!createdProjectId) {
      throw new Error('No project created in POST test');
    }

    const updatedProject = {
      name: 'Updated Jest Project ' + Date.now(),
      description: 'Updated description from Jest',
      start_date: '2025-03-01',
      end_date: '2025-04-01',
      status: 'Planning',
      team_id: 1,
      created_by: 1,
    };

    const res = await request(app)
      .put(`/api/projects/${createdProjectId}`)
      .send(updatedProject)
      .set('Content-Type', 'application/json');

    expect([200, 204]).toContain(res.statusCode);

    const getRes = await request(app).get(`/api/projects/${createdProjectId}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.name).toBe(updatedProject.name);
  });

  // 6) PUT – update neexistujícího projektu – očekává se 404
  it('PUT /api/projects/9999 should return 404 for non-existing project', async () => {
    const updatedProject = {
      name: 'Non-existing project',
      description: 'Should not be updated',
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      status: 'In Progress',
      team_id: 1,
      created_by: 1,
    };

    const res = await request(app)
      .put('/api/projects/9999')
      .send(updatedProject)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(404);
  });

  // 7) DELETE – smazání existujícího projektu (vytvořeného výše)
  // (aktuálně u tebe visí – BUG v API)
  it('DELETE /api/projects/:id should delete existing project', async () => {
    if (!createdProjectId) {
      throw new Error('No project created in POST test');
    }

    const res = await request(app).delete(`/api/projects/${createdProjectId}`);
    expect([200, 204]).toContain(res.statusCode);

    const getRes = await request(app).get(`/api/projects/${createdProjectId}`);
    expect(getRes.statusCode).toBe(404);
  });

  // 8) DELETE – neexistující projekt – očekává se 404
  it('DELETE /api/projects/9999 should return 404 for non-existing project', async () => {
    const res = await request(app).delete('/api/projects/9999');

    expect(res.statusCode).toBe(404);
  });

  // 9) VALIDATION – chybí name → očekává se 400
  it('POST /api/projects with missing name should return 400', async () => {
    const newProject = {
      // name intentionally missing
      description: 'Project without name',
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      status: 'In Progress',
      team_id: 1,
      created_by: 1,
    };

    const res = await request(app)
      .post('/api/projects')
      .send(newProject)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
  });

  // 10) VALIDATION – end_date před start_date → očekává se 400 (u tebe BUG – 201)
  it('POST /api/projects with end_date before start_date should return 400', async () => {
    const newProject = {
      name: 'Invalid dates project',
      description: 'End date before start date',
      start_date: '2025-05-01',
      end_date: '2025-04-01', // invalid – earlier than start_date
      status: 'In Progress',
      team_id: 1,
      created_by: 1,
    };

    const res = await request(app)
      .post('/api/projects')
      .send(newProject)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
  });

  // 11) VALIDATION – nevalidní status → očekává se 400
  it('POST /api/projects with invalid status should return 400', async () => {
    const newProject = {
      name: 'Invalid status project',
      description: 'Status not in allowed set',
      start_date: '2025-01-01',
      end_date: '2025-02-01',
      status: 'SOMETHING_WRONG', // očekáváme, že není povolený
      team_id: 1,
      created_by: 1,
    };

    const res = await request(app)
      .post('/api/projects')
      .send(newProject)
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
  });

  // 12) VALIDATION – prázdný body → očekává se 400
  it('POST /api/projects with empty body should return 400', async () => {
    const res = await request(app)
      .post('/api/projects')
      .send({})
      .set('Content-Type', 'application/json');

    expect(res.statusCode).toBe(400);
  });
});

// zavření DB spojení po všech testech
afterAll(async () => {
  await db.destroy();
});
