const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const { isAuthenticated } = require('../middleware/auth');

// All routes require authentication
router.use(isAuthenticated);

// List all medications for the logged-in user
router.get('/', async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.render('medications/index', { 
      medications, 
      username: req.session.username 
    });
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).send('Error fetching medications');
  }
});

// Show form to create new medication
router.get('/new', (req, res) => {
  res.render('medications/new', { 
    error: null,
    username: req.session.username 
  });
});

// Create new medication
router.post('/', async (req, res) => {
  try {
    const { name, dosage, description, quantity, manufacturer, expiryDate } = req.body;

    // Validation
    if (!name || !dosage || !quantity) {
      return res.render('medications/new', { 
        error: 'Name, dosage, and quantity are required',
        username: req.session.username 
      });
    }

    const medication = new Medication({
      name,
      dosage,
      description,
      quantity,
      manufacturer,
      expiryDate: expiryDate || null,
      userId: req.session.userId
    });

    await medication.save();
    res.redirect('/medications');
  } catch (error) {
    console.error('Error creating medication:', error);
    res.render('medications/new', { 
      error: 'Error creating medication',
      username: req.session.username 
    });
  }
});

// Show form to edit medication
router.get('/:id/edit', async (req, res) => {
  try {
    const medication = await Medication.findOne({ 
      _id: req.params.id, 
      userId: req.session.userId 
    });

    if (!medication) {
      return res.status(404).send('Medication not found');
    }

    res.render('medications/edit', { 
      medication, 
      error: null,
      username: req.session.username 
    });
  } catch (error) {
    console.error('Error fetching medication:', error);
    res.status(500).send('Error fetching medication');
  }
});

// Update medication
router.put('/:id', async (req, res) => {
  try {
    const { name, dosage, description, quantity, manufacturer, expiryDate } = req.body;

    // Validation
    if (!name || !dosage || !quantity) {
      const medication = await Medication.findById(req.params.id);
      return res.render('medications/edit', { 
        medication, 
        error: 'Name, dosage, and quantity are required',
        username: req.session.username 
      });
    }

    const medication = await Medication.findOneAndUpdate(
      { _id: req.params.id, userId: req.session.userId },
      {
        name,
        dosage,
        description,
        quantity,
        manufacturer,
        expiryDate: expiryDate || null,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!medication) {
      return res.status(404).send('Medication not found');
    }

    res.redirect('/medications');
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).send('Error updating medication');
  }
});

// Delete medication
router.delete('/:id', async (req, res) => {
  try {
    const medication = await Medication.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.session.userId 
    });

    if (!medication) {
      return res.status(404).send('Medication not found');
    }

    res.redirect('/medications');
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).send('Error deleting medication');
  }
});

module.exports = router;
