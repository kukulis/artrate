import { connectDatabase } from '../config/database';

/**
 * Seed test data into database
 */
export async function seedTestData() {
  const connection = await connectDatabase();

  try {
    // users
    await connection.query(
      `INSERT INTO users (id, email, name) VALUES
       (1, 'admin@darbelis.eu', 'admin'),
       (101, 'user1@darbelis.eu', 'user1'),
       (102, 'user2@darbelis.eu', 'user2')`
    )

    // Insert test authors
    await connection.query(
      `INSERT INTO authors (id, name, description) VALUES
        ('author-1', 'John Doe', 'Technology writer and blogger'),
        ('author-2', 'Jane Smith', 'Science journalist'),
        ('author-3', 'Bob Johnson', 'Fiction author')`
    );

    // Insert test articles
    await connection.query(
      `INSERT INTO articles (id, title, author_id, user_id, content) VALUES
        ('article-1', 'Introduction to Node.js', 'author-1', 1, 'Node.js is a JavaScript runtime built on Chrome V8 engine...'),
        ('article-2', 'Understanding Async/Await', 'author-1', 1, 'Async/await is a modern way to handle asynchronous operations...'),
        ('article-3', 'The Future of AI', 'author-2', 1,  'Artificial Intelligence is transforming our world...'),
        ('article-4', 'Climate Change Facts', 'author-2', 1, 'Climate change is one of the most pressing issues...')`
    );

    await connection.query(
        `INSERT INTO rankings (id, ranking_type, helper_type, user_id, article_id, value, description) VALUES
          ('ranking-1', 'OBJECTIVITY', 'USER', 101, 'article-1', 5, 'somewhat objective'),
          ('ranking-2', 'OFFENSIVE', 'USER', 101, 'article-1', 3, 'very offensive'),
          ('ranking-3', 'OBJECTIVITY', 'USER', 102, 'article-1', 6, 'quite objective'),
          ('ranking-4', 'OFFENSIVE', 'USER', 102, 'article-1', 4, 'quite offensive'),
          ('ranking-5', 'OBJECTIVITY', 'USER', 102, 'article-2', 6, 'quite objective ...'),
          ('ranking-6', 'OFFENSIVE', 'USER', 102, 'article-2', 4, 'quite offensive ...')`
    );

    // console.log('✅ Test data seeded');
  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    throw error;
  } finally {
    await connection.end();
  }
}

/**
 * Test data constants for use in tests
 */
export const TEST_AUTHORS = {
  JOHN: {
    id: 'author-1',
    name: 'John Doe',
    description: 'Technology writer and blogger'
  },
  JANE: {
    id: 'author-2',
    name: 'Jane Smith',
    description: 'Science journalist'
  },
  BOB: {
    id: 'author-3',
    name: 'Bob Johnson',
    description: 'Fiction author'
  }
};

export const TEST_ARTICLES = {
  NODEJS: {
    id: 'article-1',
    title: 'Introduction to Node.js',
    author_id: 'author-1',
    content: 'Node.js is a JavaScript runtime built on Chrome V8 engine...'
  },
  ASYNC: {
    id: 'article-2',
    title: 'Understanding Async/Await',
    author_id: 'author-1',
    content: 'Async/await is a modern way to handle asynchronous operations...'
  },
  AI: {
    id: 'article-3',
    title: 'The Future of AI',
    author_id: 'author-2',
    content: 'Artificial Intelligence is transforming our world...'
  },
  CLIMATE: {
    id: 'article-4',
    title: 'Climate Change Facts',
    author_id: 'author-2',
    content: 'Climate change is one of the most pressing issues...'
  }
};
