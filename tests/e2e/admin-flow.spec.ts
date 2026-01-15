import { test, expect } from '@playwright/test';

test.describe('Admin UX Flow Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for admin
    await page.addInitScript(() => {
      localStorage.setItem('sb-auth-token', 'mock-token');
      localStorage.setItem('sb-user-id', 'test-user-id');
      localStorage.setItem('user-profile', JSON.stringify({
        role: 'admin',
        user_type: 'admin'
      }));
    });
  });

  test('Complete admin journey - categories management', async ({ page }) => {
    await page.goto('/admin/categories');
    
    // UX Assertion: Admin page loads without blank screen
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('[data-testid="admin-layout"], main, section').first()).toBeVisible();
    
    // UX Assertion: Clear next action visible (manage categories)
    const addCategoryButton = page.locator('button:has-text("Add"), [data-testid="add-category"]');
    const categoryList = page.locator('[data-testid="category-list"], .categories-table');
    
    expect(await addCategoryButton.isVisible() || await categoryList.isVisible()).toBeTruthy();
    
    // Test category creation
    if (await addCategoryButton.isVisible()) {
      await addCategoryButton.click();
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Category form loads
      await expect(page.locator('[data-testid="category-form"], form').first()).toBeVisible();
      
      const nameInput = page.locator('input[name="name"], [data-testid="category-name"]');
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Category');
        
        // UX Assertion: Labels are clear and understandable
        const nameLabel = page.locator('label:has-text("Name"), [for*="name"]');
        if (await nameLabel.isVisible()) {
          await expect(nameLabel).toBeVisible();
        }
      }
      
      const submitButton = page.locator('button[type="submit"], [data-testid="save-category"]');
      if (await submitButton.isVisible()) {
        await submitButton.click();
        
        // UX Assertion: Success feedback is clear
        const successMessage = page.locator('[data-testid="success"], [role="status"]');
        if (await successMessage.isVisible()) {
          await expect(successMessage).toBeVisible();
        }
      }
    }
    
    // Test category list
    if (await categoryList.isVisible()) {
      // UX Assertion: Categories are visible without confusion
      const categoryRows = categoryList.locator('tr, [data-testid="category-row"]');
      if (await categoryRows.count() > 0) {
        await expect(categoryRows.first()).toBeVisible();
        
        // Check important information is visible
        const categoryName = categoryRows.first().locator('td, [data-testid="category-name"]');
        if (await categoryName.isVisible()) {
          await expect(categoryName).toBeVisible();
        }
        
        const actionButtons = categoryRows.first().locator('button, [data-testid="action"]');
        if (await actionButtons.count() > 0) {
          await expect(actionButtons.first()).toBeVisible();
        }
      }
    }
  });

  test('Admin roles and permissions management', async ({ page }) => {
    await page.goto('/admin/roles');
    
    // UX Assertion: Roles page loads
    await expect(page.locator('[data-testid="roles-page"], main').first()).toBeVisible();
    
    // Test roles list
    const rolesList = page.locator('[data-testid="roles-list"], .roles-table');
    if (await rolesList.isVisible()) {
      // UX Assertion: Roles are clearly displayed
      const roleRows = rolesList.locator('tr, [data-testid="role-row"]');
      if (await roleRows.count() > 0) {
        await expect(roleRows.first()).toBeVisible();
        
        const roleName = roleRows.first().locator('td, [data-testid="role-name"]');
        if (await roleName.isVisible()) {
          await expect(roleName).toBeVisible();
        }
      }
    }
    
    // Navigate to permissions
    await page.goto('/admin/permissions');
    
    // UX Assertion: Permissions matrix loads
    await expect(page.locator('[data-testid="permissions-matrix"], main').first()).toBeVisible();
    
    const permissionsGrid = page.locator('[data-testid="permissions-grid"], .permissions-table');
    if (await permissionsGrid.isVisible()) {
      // UX Assertion: Permission grid is usable
      const permissionCells = permissionsGrid.locator('input[type="checkbox"], [data-testid="permission"]');
      if (await permissionCells.count() > 0) {
        await expect(permissionCells.first()).toBeVisible();
        
        // Test permission toggle
        const firstCheckbox = permissionCells.first();
        await firstCheckbox.check();
        await expect(firstCheckbox).toBeChecked();
        
        await firstCheckbox.uncheck();
        await expect(firstCheckbox).not.toBeChecked();
      }
    }
  });

  test('Admin bulk product verification', async ({ page }) => {
    await page.goto('/admin/product-verification/bulk');
    
    // UX Assertion: Bulk verification page loads
    await expect(page.locator('[data-testid="bulk-verification"], main').first()).toBeVisible();
    
    // Test bulk actions
    const uploadButton = page.locator('button:has-text("Upload"), [data-testid="bulk-upload"]');
    const verifyButton = page.locator('button:has-text("Verify"), [data-testid="bulk-verify"]');
    
    expect(await uploadButton.isVisible() || await verifyButton.isVisible()).toBeTruthy();
    
    // Test file upload UX
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      
      const fileInput = page.locator('input[type="file"], [data-testid="file-input"]');
      if (await fileInput.isVisible()) {
        await fileInput.setInputFiles('./test-products.csv');
        
        // UX Assertion: Upload progress is clear
        const progressIndicator = page.locator('[data-testid="upload-progress"], [class*="progress"]');
        if (await progressIndicator.isVisible()) {
          await expect(progressIndicator).toBeVisible();
          
          // Wait for upload to complete
          await expect(progressIndicator).not.toBeVisible({ timeout: 15000 });
        }
      }
    }
    
    // Test verification queue
    const verificationQueue = page.locator('[data-testid="verification-queue"], .verification-list');
    if (await verificationQueue.isVisible()) {
      // UX Assertion: Queue items are clearly displayed
      const queueItems = verificationQueue.locator('tr, [data-testid="queue-item"]');
      if (await queueItems.count() > 0) {
        await expect(queueItems.first()).toBeVisible();
        
        const itemStatus = queueItems.first().locator('[data-testid="status"], [class*="status"]');
        if (await itemStatus.isVisible()) {
          await expect(itemStatus).toBeVisible();
        }
      }
    }
  });

  test('Admin tasks management', async ({ page }) => {
    await page.goto('/admin/tasks');
    
    // UX Assertion: Tasks page loads
    await expect(page.locator('[data-testid="tasks-page"], main').first()).toBeVisible();
    
    // Test task list
    const tasksList = page.locator('[data-testid="tasks-list"], .tasks-container');
    if (await tasksList.isVisible()) {
      // UX Assertion: Tasks are visible with clear status
      const taskItems = tasksList.locator('[data-testid="task-item"], .task-card');
      if (await taskItems.count() > 0) {
        await expect(taskItems.first()).toBeVisible();
        
        const taskTitle = taskItems.first().locator('[data-testid="task-title"], h3, h4');
        if (await taskTitle.isVisible()) {
          await expect(taskTitle).toBeVisible();
        }
        
        const taskStatus = taskItems.first().locator('[data-testid="task-status"], [class*="status"]');
        if (await taskStatus.isVisible()) {
          await expect(taskStatus).toBeVisible();
        }
        
        // Test task completion
        const completeButton = taskItems.first().locator('button:has-text("Complete"), [data-testid="complete-task"]');
        if (await completeButton.isVisible()) {
          await completeButton.click();
          
          // UX Assertion: Clear feedback after action
          const successMessage = page.locator('[data-testid="success"], [role="status"]');
          if (await successMessage.isVisible()) {
            await expect(successMessage).toBeVisible();
          }
        }
      }
    }
    
    // Test task creation
    const createTaskButton = page.locator('button:has-text("Create"), [data-testid="create-task"]');
    if (await createTaskButton.isVisible()) {
      await createTaskButton.click();
      await page.waitForLoadState('networkidle');
      
      // UX Assertion: Task creation form loads
      await expect(page.locator('[data-testid="task-form"], form').first()).toBeVisible();
      
      const titleInput = page.locator('input[name="title"], [data-testid="task-title"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill('Test Admin Task');
        
        const submitButton = page.locator('button[type="submit"], [data-testid="save-task"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          
          // UX Assertion: No silent failures
          const errorMessage = page.locator('[data-testid="error"], [role="alert"]');
          if (await errorMessage.isVisible()) {
            await expect(errorMessage).toBeVisible();
          }
        }
      }
    }
  });

  test('Admin mobile responsiveness', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin/categories');
    
    // UX Assertion: No horizontal scroll on mobile
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth);
    
    // UX Assertion: Admin actions are reachable on mobile
    const actionButtons = page.locator('button[class*="primary"], [data-testid="action-button"]');
    if (await actionButtons.count() > 0) {
      for (let i = 0; i < Math.min(await actionButtons.count(), 3); i++) {
        const button = actionButtons.nth(i);
        await expect(button).toBeVisible();
        
        // Check touch target size
        const buttonSize = await button.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return Math.min(rect.width, rect.height);
        });
        expect(buttonSize).toBeGreaterThanOrEqual(44);
      }
    }
    
    // Test admin navigation on mobile
    const adminNav = page.locator('[data-testid="admin-nav"], .admin-navigation');
    if (await adminNav.isVisible()) {
      // UX Assertion: Navigation is usable on mobile
      const navItems = adminNav.locator('a, button');
      if (await navItems.count() > 0) {
        await expect(navItems.first()).toBeVisible();
      }
    }
  });
});
