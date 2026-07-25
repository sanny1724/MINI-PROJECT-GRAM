// src/routes/products.js
import express from 'express';
import prisma from '../prisma.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Helper to seed default schemes dynamically for the officer's village if none exist
async function getOrSeedSchemes(villageCode) {
  const schemes = await prisma.villageScheme.findMany({
    where: { villageCode },
    orderBy: { name: 'asc' }
  });

  if (schemes.length > 0) {
    return schemes;
  }

  // Seed default schemes
  const defaultSchemes = [
    { name: 'Mission Bhagiratha (Drinking Water)', allocatedBudget: 1500000, spentBudget: 1350000, status: 'Completed' },
    { name: 'Rythu Bandhu (Farmer Investment Support)', allocatedBudget: 2500000, spentBudget: 2500000, status: 'Completed' },
    { name: 'Mana Ooru Mana Badi (School Infrastructure)', allocatedBudget: 1800000, spentBudget: 1200000, status: 'In Progress' },
    { name: 'Arogyasri Health Scheme Support', allocatedBudget: 800000, spentBudget: 750000, status: 'Completed' },
    { name: 'Palle Pragathi (Rural Development Works)', allocatedBudget: 1200000, spentBudget: 900000, status: 'In Progress' }
  ];

  await prisma.villageScheme.createMany({
    data: defaultSchemes.map(s => ({
      ...s,
      villageCode
    }))
  });

  return prisma.villageScheme.findMany({
    where: { villageCode },
    orderBy: { name: 'asc' }
  });
}

// 1. GET /api/products - List all schemes for the officer's village
router.get('/', async (req, res) => {
  try {
    const lgdCode = req.user.lgdCode || 569005;
    const schemes = await getOrSeedSchemes(lgdCode);

    // Map schemes to the expected product structure
    const formatted = schemes.map(s => ({
      id: s.id,
      name: s.name,
      sku: s.status, // Status mapped to SKU
      quantity: s.allocatedBudget, // Allocated Budget mapped to Quantity
      costPrice: s.spentBudget, // Spent Budget mapped to Cost Price
      sellingPrice: 0,
      description: `Scheme administered by LGD Village: ${lgdCode}.`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Fetch schemes error:', error);
    return res.status(500).json({ error: 'Internal server error fetching village schemes' });
  }
});

// 2. GET /api/products/search - Search schemes by name or status
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q ? String(req.query.q).trim() : '';
    const lgdCode = req.user.lgdCode || 569005;

    const schemes = await prisma.villageScheme.findMany({
      where: {
        villageCode: lgdCode,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { status: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { name: 'asc' }
    });

    const formatted = schemes.map(s => ({
      id: s.id,
      name: s.name,
      sku: s.status,
      quantity: s.allocatedBudget,
      costPrice: s.spentBudget,
      sellingPrice: 0,
      description: `Scheme administered by LGD Village: ${lgdCode}.`
    }));

    return res.status(200).json(formatted);
  } catch (error) {
    console.error('Search schemes error:', error);
    return res.status(500).json({ error: 'Internal server error searching village schemes' });
  }
});

// 3. POST /api/products - Create a new scheme
router.post('/', async (req, res) => {
  try {
    const { name, sku, quantity, costPrice } = req.body;
    const lgdCode = req.user.lgdCode || 569005;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Scheme name is required' });
    }

    const scheme = await prisma.villageScheme.create({
      data: {
        name: name.trim(),
        status: sku || 'In Progress', // Status mapped from sku
        allocatedBudget: parseFloat(quantity) || 0, // Budget mapped from quantity
        spentBudget: parseFloat(costPrice) || 0, // Spent mapped from costPrice
        villageCode: lgdCode
      }
    });

    // Return mapped to product format
    return res.status(201).json({
      id: scheme.id,
      name: scheme.name,
      sku: scheme.status,
      quantity: scheme.allocatedBudget,
      costPrice: scheme.spentBudget,
      sellingPrice: 0
    });
  } catch (error) {
    console.error('Create scheme error:', error);
    return res.status(500).json({ error: 'Internal server error creating scheme' });
  }
});

// 4. PUT /api/products/:id - Update an existing scheme
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, costPrice } = req.body;
    const lgdCode = req.user.lgdCode || 569005;

    // Verify scheme exists and belongs to this village
    const scheme = await prisma.villageScheme.findFirst({
      where: {
        id,
        villageCode: lgdCode
      }
    });

    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found or access denied' });
    }

    const updated = await prisma.villageScheme.update({
      where: { id },
      data: {
        name: name ? name.trim() : scheme.name,
        status: sku ? sku.trim() : scheme.status,
        allocatedBudget: quantity !== undefined ? parseFloat(quantity) : scheme.allocatedBudget,
        spentBudget: costPrice !== undefined ? parseFloat(costPrice) : scheme.spentBudget
      }
    });

    return res.status(200).json({
      id: updated.id,
      name: updated.name,
      sku: updated.status,
      quantity: updated.allocatedBudget,
      costPrice: updated.spentBudget,
      sellingPrice: 0
    });
  } catch (error) {
    console.error('Update scheme error:', error);
    return res.status(500).json({ error: 'Internal server error updating scheme' });
  }
});

// 5. DELETE /api/products/:id - Delete scheme
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const lgdCode = req.user.lgdCode || 569005;

    const scheme = await prisma.villageScheme.findFirst({
      where: {
        id,
        villageCode: lgdCode
      }
    });

    if (!scheme) {
      return res.status(404).json({ error: 'Scheme not found or access denied' });
    }

    await prisma.villageScheme.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Scheme successfully deleted' });
  } catch (error) {
    console.error('Delete scheme error:', error);
    return res.status(500).json({ error: 'Internal server error deleting scheme' });
  }
});

export default router;
