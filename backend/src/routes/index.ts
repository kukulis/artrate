import { Router } from 'express';
import articleRoutes from './articleRoutes';
import authorRoutes from './authorRoutes';
import rankingRoutes from './rankingRoutes';

const router = Router();

// Mount routes
router.use('/articles', articleRoutes);
router.use('/authors', authorRoutes);
router.use('/rankings', rankingRoutes);

export default router;
