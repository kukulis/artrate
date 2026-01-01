import { Router } from 'express';
import articleRoutes from './articleRoutes';
import authorRoutes from './authorRoutes';

const router = Router();

// Mount routes
router.use('/articles', articleRoutes);
router.use('/authors', authorRoutes);

export default router;
