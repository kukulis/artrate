import request from 'supertest';
import express from 'express';
import articleRoutes from './articleRoutes';
import { setupTestDatabase, cleanTestDatabase, waitForDatabase } from '../test-utils/dbSetup';
import { seedTestData, TEST_AUTHORS, TEST_ARTICLES } from '../test-utils/testData';

const app = express();
app.use(express.json());
app.use('/api/articles', articleRoutes);

describe('Article API Integration Tests', () => {
  // Setup: Run once before all tests
  beforeAll(async () => {
    console.log('\n🧪 Setting up integration tests...');
    await waitForDatabase();
    await setupTestDatabase();
  }, 60000); // 60 second timeout for setup

  // Clean and seed data before each test
  beforeEach(async () => {
    await cleanTestDatabase();
    await seedTestData();
  }, 30000); // 30 second timeout

  // Teardown: Clean up after all tests
  afterAll(async () => {
    await cleanTestDatabase();
    console.log('✅ Integration tests completed\n');
  });

  describe('GET /api/articles', () => {
    it('should return all articles', async () => {
      const response = await request(app).get('/api/articles');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(4); // 4 test articles seeded
    });

    it('should return articles with correct structure', async () => {
      const response = await request(app).get('/api/articles');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('author_id');
      expect(response.body[0]).toHaveProperty('content');
      expect(response.body[0]).toHaveProperty('created_at');
      expect(response.body[0]).toHaveProperty('updated_at');
    });
  });

  describe('GET /api/articles/:id', () => {
    it('should return a specific article', async () => {
      const response = await request(app).get(`/api/articles/${TEST_ARTICLES.NODEJS.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(TEST_ARTICLES.NODEJS.id);
      expect(response.body.title).toBe(TEST_ARTICLES.NODEJS.title);
      expect(response.body.author_id).toBe(TEST_ARTICLES.NODEJS.author_id);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app).get('/api/articles/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/articles/author/:authorId', () => {
    it('should return all articles by specific author', async () => {
      const response = await request(app).get(`/api/articles/author/${TEST_AUTHORS.JOHN.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2); // John has 2 articles
      expect(response.body.every((a: any) => a.author_id === TEST_AUTHORS.JOHN.id)).toBe(true);
    });

    it('should return empty array for author with no articles', async () => {
      const response = await request(app).get(`/api/articles/author/${TEST_AUTHORS.BOB.id}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0); // Bob has no articles
    });
  });

  describe('POST /api/articles', () => {
    it('should create a new article', async () => {
      const newArticle = {
        title: 'New Test Article',
        author_id: TEST_AUTHORS.JOHN.id,
        content: 'This is a test article content'
      };

      const response = await request(app)
        .post('/api/articles')
        .send(newArticle);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(newArticle.title);
      expect(response.body.author_id).toBe(newArticle.author_id);
      expect(response.body.content).toBe(newArticle.content);

      // Verify it was actually created in database
      const getResponse = await request(app).get(`/api/articles/${response.body.id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.title).toBe(newArticle.title);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/articles')
        .send({ title: 'Incomplete Article' }); // Missing author_id and content

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when author does not exist', async () => {
      const response = await request(app)
        .post('/api/articles')
        .send({
          title: 'Test Article',
          author_id: 'non-existent-author',
          content: 'Content'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('does not exist');
    });
  });

  describe('PATCH /api/articles/:id', () => {
    it('should update article title', async () => {
      const updatedTitle = 'Updated Title';

      const response = await request(app)
        .patch(`/api/articles/${TEST_ARTICLES.NODEJS.id}`)
        .send({ title: updatedTitle });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updatedTitle);
      expect(response.body.content).toBe(TEST_ARTICLES.NODEJS.content); // Unchanged
    });

    it('should update article content', async () => {
      const updatedContent = 'This is updated content';

      const response = await request(app)
        .patch(`/api/articles/${TEST_ARTICLES.NODEJS.id}`)
        .send({ content: updatedContent });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe(updatedContent);
      expect(response.body.title).toBe(TEST_ARTICLES.NODEJS.title); // Unchanged
    });

    it('should update multiple fields at once', async () => {
      const updates = {
        title: 'New Title',
        content: 'New content'
      };

      const response = await request(app)
        .patch(`/api/articles/${TEST_ARTICLES.NODEJS.id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(updates.title);
      expect(response.body.content).toBe(updates.content);
    });

    it('should return 404 for non-existent article', async () => {
      const response = await request(app)
        .patch('/api/articles/non-existent-id')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when no fields provided', async () => {
      const response = await request(app)
        .patch(`/api/articles/${TEST_ARTICLES.NODEJS.id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('At least one field is required');
    });
  });

  describe('DELETE /api/articles/:id', () => {
    it('should delete an article', async () => {
      const response = await request(app).delete(`/api/articles/${TEST_ARTICLES.NODEJS.id}`);

      expect(response.status).toBe(204);

      // Verify it was deleted
      const getResponse = await request(app).get(`/api/articles/${TEST_ARTICLES.NODEJS.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent article', async () => {
      const response = await request(app).delete('/api/articles/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Integration flow: Create -> Read -> Update -> Delete', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/articles')
        .send({
          title: 'Lifecycle Test Article',
          author_id: TEST_AUTHORS.JANE.id,
          content: 'Original content'
        });

      expect(createResponse.status).toBe(201);
      const articleId = createResponse.body.id;

      // READ
      const readResponse = await request(app).get(`/api/articles/${articleId}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.title).toBe('Lifecycle Test Article');

      // UPDATE
      const updateResponse = await request(app)
        .patch(`/api/articles/${articleId}`)
        .send({ title: 'Updated Lifecycle Article' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Lifecycle Article');

      // DELETE
      const deleteResponse = await request(app).delete(`/api/articles/${articleId}`);
      expect(deleteResponse.status).toBe(204);

      // VERIFY DELETION
      const verifyResponse = await request(app).get(`/api/articles/${articleId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});
