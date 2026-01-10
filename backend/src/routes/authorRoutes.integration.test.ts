import request from 'supertest';
import express from 'express';
import { createAuthorRoutes } from './authorRoutes';
import { setupTestDatabase, cleanTestDatabase, waitForDatabase } from '../test-utils/dbSetup';
import { seedTestData, TEST_AUTHORS } from '../test-utils/testData';
import { createConnectionPool } from '../config/database';
import { Pool } from 'mysql2/promise';
import {loadConfig} from "../config";
import {initLogger} from "../logging";

// Create a dedicated pool for this test suite
let testPool: Pool;
let app: express.Application;

describe('Author API Integration Tests', () => {
  // Setup: Run once before all tests
  beforeAll(async () => {
    const config = loadConfig()
    initLogger({lokiUrl: config.logging.lokiUrl, environment: 'test' } )
    testPool = createConnectionPool(config.database);


    // Create Express app with test-specific pool
    app = express();
    app.use(express.json());
    app.use('/api/authors', createAuthorRoutes(testPool));

    await waitForDatabase();
    await setupTestDatabase();
  }, 60000);

  // Clean and seed data before each test
  beforeEach(async () => {
    await cleanTestDatabase();
    await seedTestData();
  }, 30000);

  // Teardown: Clean up after all tests
  afterAll(async () => {
    await cleanTestDatabase();
    // Close this test suite's connection pool
    await testPool.end();
    // console.log('✅ Author API integration tests completed\n');
  });

  describe('GET /api/authors', () => {
    it('should return all authors', async () => {
      const response = await request(app).get('/api/authors');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(3); // 3 test authors seeded
    });

    it('should return authors with correct structure', async () => {
      const response = await request(app).get('/api/authors');

      expect(response.status).toBe(200);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('description');
      expect(response.body[0]).toHaveProperty('created_at');
      expect(response.body[0]).toHaveProperty('updated_at');
    });

    it('should search authors by name', async () => {
      const response = await request(app).get('/api/authors?name_part=John');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toContain('John');
    });

    it('should return empty array when search has no matches', async () => {
      const response = await request(app).get('/api/authors?name_part=NonExistent');

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });
  });

  describe('GET /api/authors/:id', () => {
    it('should return a specific author', async () => {
      const response = await request(app).get(`/api/authors/${TEST_AUTHORS.JOHN.id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(TEST_AUTHORS.JOHN.id);
      expect(response.body.name).toBe(TEST_AUTHORS.JOHN.name);
      expect(response.body.description).toBe(TEST_AUTHORS.JOHN.description);
    });

    it('should return 404 for non-existent author', async () => {
      const response = await request(app).get('/api/authors/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/authors', () => {
    it('should create a new author', async () => {
      const newAuthor = {
        name: 'New Test Author',
        description: 'A brand new author for testing'
      };

      const response = await request(app)
        .post('/api/authors')
        .send(newAuthor);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(newAuthor.name);
      expect(response.body.description).toBe(newAuthor.description);

      // Verify it was actually created in database
      const getResponse = await request(app).get(`/api/authors/${response.body.id}`);
      expect(getResponse.status).toBe(200);
      expect(getResponse.body.name).toBe(newAuthor.name);
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/authors')
        .send({ name: 'Incomplete Author' }); // Missing description

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 409 when author name already exists', async () => {
      const response = await request(app)
        .post('/api/authors')
        .send({
          name: TEST_AUTHORS.JOHN.name, // Duplicate name
          description: 'Another description'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });

    it('should trim whitespace from name and description', async () => {
      const response = await request(app)
        .post('/api/authors')
        .send({
          name: '  Whitespace Test  ',
          description: '  Trimmed description  '
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('Whitespace Test');
      expect(response.body.description).toBe('Trimmed description');
    });
  });

  describe('PATCH /api/authors/:id', () => {

    // Removed cases to update by a single field for now.

  //   it('should update author name', async () => {
  //     const updatedName = 'Updated Name';
  //
  //     const response = await request(app)
  //       .patch(`/api/authors/${TEST_AUTHORS.JOHN.id}`)
  //       .send({ name: updatedName });
  //
  //     expect(response.status).toBe(200);
  //     expect(response.body.name).toBe(updatedName);
  //     expect(response.body.description).toBe(TEST_AUTHORS.JOHN.description); // Unchanged
  //   });
  //
  //   it('should update author description', async () => {
  //     const updatedDescription = 'Updated description';
  //
  //     const response = await request(app)
  //       .patch(`/api/authors/${TEST_AUTHORS.JOHN.id}`)
  //       .send({ description: updatedDescription });
  //
  //     expect(response.status).toBe(200);
  //     expect(response.body.description).toBe(updatedDescription);
  //     expect(response.body.name).toBe(TEST_AUTHORS.JOHN.name); // Unchanged
  //   });

    it('should update multiple fields at once', async () => {
      const updates = {
        name: 'New Name',
        description: 'New description'
      };

      const response = await request(app)
        .patch(`/api/authors/${TEST_AUTHORS.JOHN.id}`)
        .send(updates);

      expect(response.status).toBe(200);
      expect(response.body.name).toBe(updates.name);
      expect(response.body.description).toBe(updates.description);
    });

    it('should return 404 for non-existent author', async () => {
      const response = await request(app)
        .patch('/api/authors/non-existent-id')
        .send({ name: 'Updated', description: 'baravykas' });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 when no fields provided', async () => {
      const response = await request(app)
        .patch(`/api/authors/${TEST_AUTHORS.JOHN.id}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    it('should return 409 when updating to existing author name', async () => {
      const response = await request(app)
        .patch(`/api/authors/${TEST_AUTHORS.JOHN.id}`)
        .send({ name: TEST_AUTHORS.JANE.name, description: 'baravykas' }); // Try to use Jane's name

      expect(response.status).toBe(409);
      expect(response.body.error).toContain('already exists');
    });
  });

  describe('DELETE /api/authors/:id', () => {
    it('should delete an author', async () => {
      const response = await request(app).delete(`/api/authors/${TEST_AUTHORS.BOB.id}`);

      expect(response.status).toBe(204);

      // Verify it was deleted
      const getResponse = await request(app).get(`/api/authors/${TEST_AUTHORS.BOB.id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent author', async () => {
      const response = await request(app).delete('/api/authors/non-existent-id');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Integration flow: Create -> Read -> Update -> Delete', () => {
    it('should handle complete CRUD lifecycle', async () => {
      // CREATE
      const createResponse = await request(app)
        .post('/api/authors')
        .send({
          name: 'Lifecycle Test Author',
          description: 'Original description'
        });

      expect(createResponse.status).toBe(201);
      const authorId = createResponse.body.id;

      // READ
      const readResponse = await request(app).get(`/api/authors/${authorId}`);
      expect(readResponse.status).toBe(200);
      expect(readResponse.body.name).toBe('Lifecycle Test Author');

      // UPDATE
      const updateResponse = await request(app)
        .patch(`/api/authors/${authorId}`)
        .send({ name: 'Updated Lifecycle Author', description: 'Original description' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.name).toBe('Updated Lifecycle Author');

      // DELETE
      const deleteResponse = await request(app).delete(`/api/authors/${authorId}`);
      expect(deleteResponse.status).toBe(204);

      // VERIFY DELETION
      const verifyResponse = await request(app).get(`/api/authors/${authorId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });

  describe('Data validation and edge cases', () => {
    it('should reject empty name', async () => {
      const response = await request(app)
        .post('/api/authors')
        .send({ name: '', description: 'Description' });

      expect(response.status).toBe(400);
    });

    it('should reject empty description', async () => {
      const response = await request(app)
        .post('/api/authors')
        .send({ name: 'Name', description: '' });

      expect(response.status).toBe(400);
    });

    it('should handle very long names', async () => {
      const longName = 'A'.repeat(255);

      const response = await request(app)
        .post('/api/authors')
        .send({ name: longName, description: 'Description' });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe(longName);
    });
  });
});
