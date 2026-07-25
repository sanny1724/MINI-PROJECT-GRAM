// src/routes/lgd.js
import express from 'express';
import prisma from '../prisma.js';

const router = express.Router();

// Seeded pseudorandom helper
function getSeededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate realistic mock data for a village deterministically based on its LGD code
function generateVillageDashboardData(villageCode, villageName, mandalName, districtName) {
  const seed = villageCode;
  
  // Overall score: 70 - 95
  const developmentScore = Math.floor(70 + getSeededRandom(seed * 1) * 26);
  let riskLevel = 'LOW';
  if (developmentScore < 78) riskLevel = 'HIGH';
  else if (developmentScore < 86) riskLevel = 'MEDIUM';
  
  // 5 domains
  const domains = [
    { name: 'Water', scoreKey: 'waterScore', riskKey: 'waterRisk', trendKey: 'waterTrend' },
    { name: 'Education', scoreKey: 'educationScore', riskKey: 'educationRisk', trendKey: 'educationTrend' },
    { name: 'Health', scoreKey: 'healthScore', riskKey: 'healthRisk', trendKey: 'healthTrend' },
    { name: 'Agriculture', scoreKey: 'agricultureScore', riskKey: 'agricultureRisk', trendKey: 'agricultureTrend' },
    { name: 'Governance', scoreKey: 'governanceScore', riskKey: 'governanceRisk', trendKey: 'governanceTrend' }
  ];
  
  const metrics = {
    developmentScore,
    riskLevel,
    lastUpdated: new Date(Date.now() - Math.floor(getSeededRandom(seed * 15) * 10) * 24 * 60 * 60 * 1000).toISOString()
  };
  
  domains.forEach((d, i) => {
    const domainScore = Math.floor(65 + getSeededRandom(seed * (i + 2)) * 31);
    metrics[d.scoreKey] = domainScore;
    
    let domainRisk = 'LOW';
    if (domainScore < 75) domainRisk = 'HIGH';
    else if (domainScore < 85) domainRisk = 'MEDIUM';
    metrics[d.riskKey] = domainRisk;
    
    const trendVal = getSeededRandom(seed * (i + 7));
    metrics[d.trendKey] = trendVal > 0.6 ? 'UP' : (trendVal > 0.3 ? 'STABLE' : 'DOWN');
  });
  
  // Officials
  const firstNames = ['Anitha', 'Srinivas', 'Mallesh', 'Kavitha', 'Rajesh', 'Venkat', 'Laxmi', 'Yadagiri', 'Saritha', 'Bhaskar'];
  const lastNames = ['Reddy', 'Goud', 'Rao', 'Yadav', 'Kuruma', 'Vemula', 'Katta', 'Challa', 'Madiga', 'Mala'];
  const designations = ['Sarpanch', 'Panchayat Secretary', 'Ward Member'];
  
  const officials = designations.map((desig, i) => {
    const fn = firstNames[Math.floor(getSeededRandom(seed * (i + 12)) * firstNames.length)];
    const ln = lastNames[Math.floor(getSeededRandom(seed * (i + 17)) * lastNames.length)];
    const phone = `9${Math.floor(100000000 + getSeededRandom(seed * (i + 22)) * 899999999)}`;
    return {
      id: `official-${i}-${seed}`,
      name: `${fn} ${ln}`,
      designation: desig,
      contact: phone
    };
  });
  
  // Schemes
  const schemeNames = [
    'Mission Bhagiratha (Drinking Water)',
    'Rythu Bandhu (Farmer Investment Support)',
    'Telangana Dalit Bandhu',
    'Mana Ooru Mana Badi (School Infrastructure)',
    'Arogyasri Health Scheme',
    'Kanti Velugu (Free Eye Screenings)',
    'Palle Pragathi (Rural Development)'
  ];
  
  // Pick 3-4 schemes
  const numSchemes = 3 + Math.floor(getSeededRandom(seed * 31) * 2);
  const schemes = [];
  const chosenIndices = new Set();
  
  while (chosenIndices.size < numSchemes) {
    const idx = Math.floor(getSeededRandom(seed * (chosenIndices.size + 33)) * schemeNames.length);
    chosenIndices.add(idx);
  }
  
  Array.from(chosenIndices).forEach((schemeIdx, i) => {
    const alloc = Math.round(500000 + getSeededRandom(seed * (i + 40)) * 2500000);
    const spentRatio = 0.6 + getSeededRandom(seed * (i + 45)) * 0.38; // 60% to 98%
    const spent = Math.round(alloc * spentRatio);
    const statusVal = getSeededRandom(seed * (i + 50));
    const status = statusVal > 0.7 ? 'Completed' : (statusVal > 0.2 ? 'In Progress' : 'Delayed');
    
    schemes.push({
      id: `scheme-${i}-${seed}`,
      name: schemeNames[schemeIdx],
      allocatedBudget: alloc,
      spentBudget: spent,
      status
    });
  });
  
  // Budget Summary
  const budgets = [
    {
      id: `budget-1-${seed}`,
      year: '2025-2026',
      totalAllocation: schemes.reduce((acc, s) => acc + s.allocatedBudget, 0) + 1200000,
      totalSpent: schemes.reduce((acc, s) => acc + s.spentBudget, 0) + 950000,
      infrastructureAlloc: Math.round(schemes.reduce((acc, s) => acc + s.allocatedBudget, 0) * 0.65),
      welfareAlloc: Math.round(schemes.reduce((acc, s) => acc + s.allocatedBudget, 0) * 0.35)
    }
  ];
  
  // Recent Grievances
  const grievanceTitles = [
    { title: 'Drinking water pipeline damage near main road', category: 'Water' },
    { title: 'Primary school roof requires ceiling repair', category: 'Education' },
    { title: 'Local PHC runs out of paracetamol tablets', category: 'Health' },
    { title: 'Street light bulb replacement needed in Ward 3', category: 'Governance' },
    { title: 'Drainage blockage causing water stagnation', category: 'Governance' },
    { title: 'Potholes on village entry connecting highway road', category: 'Infrastructure' },
    { title: 'Delay in Rythu Bandhu transaction disbursement', category: 'Agriculture' }
  ];
  
  const numGrievances = 2 + Math.floor(getSeededRandom(seed * 60) * 3);
  const grievances = [];
  const chosenGrivIndices = new Set();
  
  while (chosenGrivIndices.size < numGrievances) {
    const idx = Math.floor(getSeededRandom(seed * (chosenGrivIndices.size + 65)) * grievanceTitles.length);
    chosenGrivIndices.add(idx);
  }
  
  Array.from(chosenGrivIndices).forEach((grivIdx, i) => {
    const griv = grievanceTitles[grivIdx];
    const statusVal = getSeededRandom(seed * (i + 70));
    const status = statusVal > 0.6 ? 'Resolved' : (statusVal > 0.25 ? 'Pending' : 'Investigating');
    const createdDaysAgo = Math.floor(getSeededRandom(seed * (i + 75)) * 30) + 1;
    const createdAt = new Date(Date.now() - createdDaysAgo * 24 * 60 * 60 * 1000).toISOString();
    
    grievances.push({
      id: `grievance-${i}-${seed}`,
      title: griv.title,
      category: griv.category,
      status,
      createdAt,
      description: `Logged grievance by local village citizen regarding ${griv.title.toLowerCase()}. Immediate action requested.`
    });
  });
  
  return {
    villageInfo: {
      code: villageCode,
      name: villageName,
      mandalName,
      districtName,
      stateName: 'Telangana',
      category: 'Rural',
      status: 'Inhabited'
    },
    metrics,
    officials,
    schemes,
    budgets,
    grievances
  };
}

// 1. GET /api/lgd/districts
router.get('/districts', async (req, res) => {
  try {
    const districts = await prisma.district.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { mandals: true }
        }
      }
    });
    
    // Map response to include mandal count and village counts (mocked or aggregated)
    const formatted = districts.map(d => ({
      code: d.code,
      name: d.name,
      nameLocal: d.nameLocal,
      mandalCount: d._count.mandals
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 2. GET /api/lgd/districts/:districtCode/mandals
router.get('/districts/:districtCode/mandals', async (req, res) => {
  try {
    const districtCode = parseInt(req.params.districtCode);
    const mandals = await prisma.mandal.findMany({
      where: { districtCode },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { villages: true }
        }
      }
    });
    
    const formatted = mandals.map(m => ({
      code: m.code,
      name: m.name,
      nameLocal: m.nameLocal,
      villageCount: m._count.villages
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching mandals:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 3. GET /api/lgd/mandals/:mandalCode/villages
router.get('/mandals/:mandalCode/villages', async (req, res) => {
  try {
    const mandalCode = parseInt(req.params.mandalCode);
    const villages = await prisma.village.findMany({
      where: { mandalCode },
      orderBy: { name: 'asc' }
    });
    
    // For list view, we attach a deterministic development score and risk level so they show in the map markers
    const formatted = villages.map(v => {
      const score = Math.floor(70 + getSeededRandom(v.code * 1) * 26);
      let risk = 'LOW';
      if (score < 78) risk = 'HIGH';
      else if (score < 86) risk = 'MEDIUM';
      
      return {
        code: v.code,
        name: v.name,
        nameLocal: v.nameLocal,
        category: v.category,
        status: v.status,
        developmentScore: score,
        riskLevel: risk
      };
    });
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching villages:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 4. GET /api/lgd/villages/:villageCode
router.get('/villages/:villageCode', async (req, res) => {
  try {
    const villageCode = parseInt(req.params.villageCode);
    
    const village = await prisma.village.findUnique({
      where: { code: villageCode },
      include: {
        mandal: {
          include: {
            district: true
          }
        },
        metrics: true,
        officials: true,
        schemes: true,
        budgets: true,
        grievances: true
      }
    });
    
    if (!village) {
      return res.status(404).json({ error: 'Village not found' });
    }
    
    // Check if sub-records exist in DB, if not, generate dynamically
    if (!village.metrics) {
      // Dynamic generation
      const mockData = generateVillageDashboardData(
        village.code,
        village.name,
        village.mandal.name,
        village.mandal.district.name
      );
      return res.json(mockData);
    }
    
    // If they exist in the DB, return them directly
    res.json({
      villageInfo: {
        code: village.code,
        name: village.name,
        mandalName: village.mandal.name,
        districtName: village.mandal.district.name,
        stateName: 'Telangana',
        category: village.category,
        status: village.status
      },
      metrics: village.metrics,
      officials: village.officials,
      schemes: village.schemes,
      budgets: village.budgets,
      grievances: village.grievances
    });
  } catch (error) {
    console.error('Error fetching village details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// 5. GET /api/lgd/search?q=...
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.json([]);
    }
    
    // Search in parallel: districts, mandals, and villages
    const [districts, mandals, villages] = await Promise.all([
      prisma.district.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        take: 5
      }),
      prisma.mandal.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        include: {
          district: true
        },
        take: 5
      }),
      prisma.village.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' }
        },
        include: {
          mandal: {
            include: {
              district: true
            }
          }
        },
        take: 10
      })
    ]);
    
    // Format combined results
    const results = [];
    
    districts.forEach(d => {
      results.push({
        code: d.code,
        name: d.name,
        type: 'District',
        context: 'State: Telangana'
      });
    });
    
    mandals.forEach(m => {
      results.push({
        code: m.code,
        name: m.name,
        type: 'Mandal',
        context: `District: ${m.district.name}`
      });
    });
    
    villages.forEach(v => {
      results.push({
        code: v.code,
        name: v.name,
        type: 'Village',
        context: `Mandal: ${v.mandal.name}, District: ${v.mandal.district.name}`
      });
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error in search:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
