const request = require('supertest');
const app = require('../src/app');
const { connect, clearDatabase, closeDatabase } = require('./testUtils');

beforeAll(async () => connect());
afterEach(async () => clearDatabase());
afterAll(async () => closeDatabase());

async function registerAndLogin(overrides = {}) {
  const user = {
    name: 'Applicant One',
    email: 'applicant1@example.com',
    password: 'Password123',
    confirmPassword: 'Password123',
    ...overrides,
  };
  const res = await request(app).post('/api/auth/register').send(user);
  return { token: res.body.data.token, user: res.body.data.user };
}

const sampleApplication = {
  company: 'Acme Corp',
  position: 'Software Engineer Intern',
  location: 'Remote',
  jobType: 'Internship',
  status: 'Applied',
  applicationDate: new Date().toISOString(),
  salary: '$25/hr',
  jobUrl: 'https://acme.example.com/careers/123',
  description: 'Great opportunity.',
  notes: 'Referred by a friend.',
};

describe('POST /api/applications', () => {
  it('creates an application for the authenticated user', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleApplication);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.application.company).toBe('Acme Corp');
  });

  it('rejects application creation without required fields', async () => {
    const { token } = await registerAndLogin();
    const res = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send({ company: '' });

    expect(res.statusCode).toBe(400);
  });
});

describe('PUT & DELETE /api/applications/:id', () => {
  it('allows the owner to update their application', async () => {
    const { token } = await registerAndLogin();
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleApplication);

    const id = createRes.body.data.application._id;
    const res = await request(app)
      .put(`/api/applications/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Interview' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.application.status).toBe('Interview');
  });

  it('prevents a different user from updating someone else\'s application', async () => {
    const owner = await registerAndLogin({ email: 'owner@example.com' });
    const intruder = await registerAndLogin({ email: 'intruder@example.com' });

    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${owner.token}`)
      .send(sampleApplication);

    const id = createRes.body.data.application._id;

    const res = await request(app)
      .put(`/api/applications/${id}`)
      .set('Authorization', `Bearer ${intruder.token}`)
      .send({ status: 'Offer' });

    expect(res.statusCode).toBe(403);
  });

  it('allows the owner to delete their application', async () => {
    const { token } = await registerAndLogin();
    const createRes = await request(app)
      .post('/api/applications')
      .set('Authorization', `Bearer ${token}`)
      .send(sampleApplication);

    const id = createRes.body.data.application._id;
    const res = await request(app).delete(`/api/applications/${id}`).set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);

    const getRes = await request(app).get(`/api/applications/${id}`).set('Authorization', `Bearer ${token}`);
    expect(getRes.statusCode).toBe(404);
  });
});

describe('GET /api/applications', () => {
  it('only returns the authenticated user\'s own applications', async () => {
    const userA = await registerAndLogin({ email: 'a@example.com' });
    const userB = await registerAndLogin({ email: 'b@example.com' });

    await request(app).post('/api/applications').set('Authorization', `Bearer ${userA.token}`).send(sampleApplication);
    await request(app).post('/api/applications').set('Authorization', `Bearer ${userB.token}`).send(sampleApplication);

    const res = await request(app).get('/api/applications').set('Authorization', `Bearer ${userA.token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.applications).toHaveLength(1);
  });
});
