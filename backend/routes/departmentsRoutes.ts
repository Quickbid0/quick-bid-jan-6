import { Router } from 'express';
import { Pool } from 'pg';

export function createDepartmentsRouter(pool: Pool): Router {
  const router = Router();

  // Get all departments
  router.get('/', async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT * FROM departments ORDER BY name ASC'
      );
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  });

  // Create new department
  router.post('/', async (req, res) => {
    try {
      const { name, description, isActive = true } = req.body;
      
      if (!name) {
        return res.status(400).json({ error: 'Department name is required' });
      }

      const result = await pool.query(
        'INSERT INTO departments (name, description, is_active, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
        [name, description, isActive]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating department:', error);
      res.status(500).json({ error: 'Failed to create department' });
    }
  });

  // Update department
  router.patch('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, isActive } = req.body;
      
      const result = await pool.query(
        'UPDATE departments SET name = COALESCE($1, name), description = COALESCE($2, description), is_active = COALESCE($3, is_active), updated_at = NOW() WHERE id = $4 RETURNING *',
        [name, description, isActive, id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error updating department:', error);
      res.status(500).json({ error: 'Failed to update department' });
    }
  });

  // Delete/Soft-disable department
  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Check if department has any employees
      const employeesResult = await pool.query(
        'SELECT COUNT(*) as count FROM employees WHERE department_id = $1',
        [id]
      );
      
      if (parseInt(employeesResult.rows[0].count) > 0) {
        // Soft disable if has employees
        const result = await pool.query(
          'UPDATE departments SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *',
          [id]
        );
        res.json({ ...result.rows[0], message: 'Department soft-disabled due to existing employees' });
      } else {
        // Hard delete if no employees
        await pool.query('DELETE FROM departments WHERE id = $1', [id]);
        res.json({ message: 'Department deleted successfully' });
      }
    } catch (error) {
      console.error('Error deleting department:', error);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  return router;
}
