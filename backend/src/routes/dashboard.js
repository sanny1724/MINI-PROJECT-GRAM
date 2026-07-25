// src/routes/dashboard.js
import express from 'express';
import prisma from '../prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/dashboard - Aggregate dashboard statistics for officers
router.get('/', async (req, res) => {
  try {
    const lgdCode = req.user.lgdCode || 569005; // Default to Ankapur
    const role = req.user.role || 'Panchayat';

    // Fetch schemes and grievances for this village
    const [schemes, grievances, metrics] = await Promise.all([
      prisma.villageScheme.findMany({
        where: { villageCode: lgdCode }
      }),
      prisma.villageGrievance.findMany({
        where: { villageCode: lgdCode },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.villageMetric.findUnique({
        where: { villageCode: lgdCode }
      })
    ]);

    // Aggregate statistics
    // 1. Total Schemes
    const totalSchemes = schemes.length;
    
    // 2. Total Budget Allocated (utilization)
    const totalAllocation = schemes.reduce((sum, s) => sum + s.allocatedBudget, 0);

    // 3. Pending Grievances Count
    const pendingGrievances = grievances.filter(g => g.status !== 'Resolved');
    const pendingCount = pendingGrievances.length;

    // Return mapped JSON to fit original dashboard structure
    return res.status(200).json({
      totalProducts: totalSchemes, // Schemes Count
      totalInventoryUnits: totalAllocation, // Total Budget Allocated (₹)
      lowStockCount: pendingCount, // Pending Grievances count
      developmentScore: metrics ? metrics.developmentScore : 87, // Custom addition
      riskLevel: metrics ? metrics.riskLevel : 'LOW', // Custom addition
      defaultThreshold: 0,
      lowStockAlerts: pendingGrievances.slice(0, 5).map(g => ({
        id: g.id,
        name: g.title, // Grievance title
        sku: g.category, // Category (Water, Health, etc.)
        quantity: 0,
        threshold: 0
      }))
    });
  } catch (error) {
    console.error('Dashboard aggregation error:', error);
    return res.status(500).json({ error: 'Internal server error calculating dashboard metrics' });
  }
});

export default router;
