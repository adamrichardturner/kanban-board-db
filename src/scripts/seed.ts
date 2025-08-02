import config from '../lib/config.js';
import bcrypt from 'bcryptjs';
import { DatabaseClient } from '../lib/database.js';

async function seedDatabase(): Promise<void> {
  const db = new DatabaseClient(config.database);

  try {
    await db.connect();
    console.log('🌱 Starting database seeding...');

    // Create demo user
    console.log('👤 Creating demo user...');
    const hashedPassword = await bcrypt.hash('demo123', 12);

    const userResult = await db.queryOne<{ id: string; email: string }>(
      `
      INSERT INTO users (email, username, password_hash, full_name, is_demo)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
      RETURNING id, email
    `,
      ['demo@kanban.app', 'demo_user', hashedPassword, 'Demo User', true]
    );

    if (!userResult) {
      throw new Error('Failed to create demo user');
    }

    const userId = userResult.id;
    console.log(`✅ Demo user created: ${userResult.email}`);

    // Board templates
    const boardTemplates = [
      {
        name: 'Personal Projects',
        tasks: [
          {
            title: 'Learn TypeScript',
            description: 'Complete TypeScript fundamentals course',
            column: 'In Progress',
          },
          {
            title: 'Build Portfolio Website',
            description: 'Create a personal portfolio using Next.js',
            column: 'To Do',
          },
          {
            title: 'Set up Home Office',
            description: 'Organize workspace for better productivity',
            column: 'Done',
          },
          {
            title: 'Read "Clean Code"',
            description: 'Finish reading this essential programming book',
            column: 'In Progress',
          },
          {
            title: 'Learn Docker',
            description: 'Understand containerization and Docker basics',
            column: 'To Do',
          },
          {
            title: 'Practice Data Structures',
            description: 'Solve 10 problems on LeetCode daily',
            column: 'In Progress',
          },
          {
            title: 'Set up CI/CD Pipeline',
            description: 'Implement automated testing and deployment',
            column: 'To Do',
          },
          {
            title: 'Learn PostgreSQL',
            description: 'Master advanced SQL queries and optimization',
            column: 'To Do',
          },
          {
            title: 'Build REST API',
            description: 'Create a robust API with authentication',
            column: 'Done',
          },
          {
            title: 'Deploy First App',
            description: 'Successfully deploy application to production',
            column: 'Done',
          },
          {
            title: 'Learn GraphQL',
            description: 'Understand GraphQL concepts and implementation',
            column: 'To Do',
          },
          {
            title: 'Contribute to Open Source',
            description: 'Make meaningful contributions to open source projects',
            column: 'To Do',
          },
        ],
      },
      {
        name: 'Work Tasks',
        tasks: [
          {
            title: 'Complete Q4 Performance Review',
            description: 'Prepare documentation and self-assessment',
            column: 'In Progress',
          },
          {
            title: 'Update Team Documentation',
            description: 'Refresh onboarding guides and process docs',
            column: 'To Do',
          },
          {
            title: 'Implement New Feature',
            description: 'Add user notification system to the app',
            column: 'In Progress',
          },
          {
            title: 'Fix Production Bug',
            description: 'Resolve memory leak in payment processing',
            column: 'Done',
          },
          {
            title: 'Code Review Backlog',
            description: 'Review pending pull requests from team',
            column: 'To Do',
          },
          {
            title: 'Database Migration',
            description: 'Migrate user data to new schema safely',
            column: 'In Progress',
          },
          {
            title: 'Security Audit',
            description: 'Conduct comprehensive security review',
            column: 'To Do',
          },
          {
            title: 'Performance Optimization',
            description: 'Improve API response times by 50%',
            column: 'In Progress',
          },
          {
            title: 'Team Meeting Prep',
            description: 'Prepare agenda and materials for sprint planning',
            column: 'Done',
          },
          {
            title: 'Client Presentation',
            description: 'Present new features to stakeholders',
            column: 'Done',
          },
          {
            title: 'Update Dependencies',
            description: 'Upgrade all packages to latest stable versions',
            column: 'To Do',
          },
          {
            title: 'Write Unit Tests',
            description: 'Increase test coverage to 90%+',
            column: 'To Do',
          },
        ],
      },
      {
        name: 'Home & Life',
        tasks: [
          {
            title: 'Plan Weekend Trip',
            description: 'Research and book accommodation for getaway',
            column: 'In Progress',
          },
          {
            title: 'Organize Closet',
            description: 'Declutter and organize seasonal clothing',
            column: 'To Do',
          },
          {
            title: 'Cook New Recipe',
            description: 'Try making homemade pasta from scratch',
            column: 'Done',
          },
          {
            title: 'Exercise Routine',
            description: 'Establish consistent 4x/week workout schedule',
            column: 'In Progress',
          },
          {
            title: 'Call Family',
            description: 'Schedule weekly video call with parents',
            column: 'Done',
          },
          {
            title: 'Read Fiction Book',
            description: 'Finish "The Seven Husbands of Evelyn Hugo"',
            column: 'In Progress',
          },
          {
            title: 'Garden Maintenance',
            description: 'Prune plants and prepare for winter',
            column: 'To Do',
          },
          {
            title: 'Financial Planning',
            description: 'Review and update budget for next year',
            column: 'To Do',
          },
          {
            title: 'Learn Guitar',
            description: 'Practice 30 minutes daily, learn 5 new songs',
            column: 'In Progress',
          },
          {
            title: 'Dental Checkup',
            description: 'Schedule and attend annual dental cleaning',
            column: 'Done',
          },
          {
            title: 'Meditation Practice',
            description: 'Establish daily 10-minute meditation habit',
            column: 'In Progress',
          },
          {
            title: 'Photo Organization',
            description: 'Sort and backup all photos from this year',
            column: 'To Do',
          },
        ],
      },
    ] as const;

    // Create boards with tasks and subtasks
    for (let boardIndex = 0; boardIndex < boardTemplates.length; boardIndex++) {
      const boardTemplate = boardTemplates[boardIndex];

      if (!boardTemplate) {
        console.warn(`⚠️  Board template at index ${boardIndex} not found, skipping`);
        continue;
      }

      console.log(`📋 Creating board: ${boardTemplate.name}`);

      // Create board
      const boardResult = await db.queryOne<{ id: string }>(
        `
        INSERT INTO boards (user_id, name, is_default, position)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, name) DO UPDATE SET
          updated_at = NOW()
        RETURNING id
      `,
        [userId, boardTemplate.name, boardIndex === 0, boardIndex]
      );

      if (!boardResult) {
        throw new Error(`Failed to create board: ${boardTemplate.name}`);
      }

      const boardId = boardResult.id;

      // Create default columns
      const defaultColumns = [
        { name: 'To Do', color: '#6B7280', position: 0 },
        { name: 'In Progress', color: '#F59E0B', position: 1 },
        { name: 'Done', color: '#10B981', position: 2 },
      ] as const;

      const columnIds: Record<string, string> = {};

      for (const column of defaultColumns) {
        const columnResult = await db.queryOne<{ id: string }>(
          `
          INSERT INTO columns (board_id, name, color, position)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (board_id, name) DO UPDATE SET
            color = EXCLUDED.color,
            position = EXCLUDED.position,
            updated_at = NOW()
          RETURNING id
        `,
          [boardId, column.name, column.color, column.position]
        );

        if (columnResult) {
          columnIds[column.name] = columnResult.id;
        }
      }

      console.log(`  ✅ Created ${Object.keys(columnIds).length} columns`);

      // Create tasks
      for (let taskIndex = 0; taskIndex < boardTemplate.tasks.length; taskIndex++) {
        const taskTemplate = boardTemplate.tasks[taskIndex];

        if (!taskTemplate) {
          console.warn(`  ⚠️  Task template at index ${taskIndex} not found, skipping`);
          continue;
        }

        const columnId = columnIds[taskTemplate.column];

        if (!columnId) {
          console.warn(`  ⚠️  Column '${taskTemplate.column}' not found, skipping task`);
          continue;
        }

        // Get position within column (count existing tasks in this column)
        const positionResult = await db.queryOne<{ count: string }>(
          `
          SELECT COUNT(*) as count FROM tasks WHERE column_id = $1
        `,
          [columnId]
        );

        const position = parseInt(positionResult?.count || '0');

        // Determine status based on column
        let status = 'todo';
        if (taskTemplate.column === 'In Progress') status = 'doing';
        if (taskTemplate.column === 'Done') status = 'done';

        const taskResult = await db.queryOne<{ id: string }>(
          `
          INSERT INTO tasks (board_id, column_id, title, description, status, position)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `,
          [boardId, columnId, taskTemplate.title, taskTemplate.description, status, position]
        );

        if (!taskResult) {
          console.warn(`  ⚠️  Failed to create task: ${taskTemplate.title}`);
          continue;
        }

        const taskId = taskResult.id;

        // Add subtasks to roughly half the tasks (with some randomness)
        const shouldAddSubtasks = taskIndex < boardTemplate.tasks.length / 2 || Math.random() > 0.3;

        if (shouldAddSubtasks) {
          const subtaskTemplates = generateSubtasks(taskTemplate.title, taskTemplate.column);

          for (let subtaskIndex = 0; subtaskIndex < subtaskTemplates.length; subtaskIndex++) {
            const subtaskTemplate = subtaskTemplates[subtaskIndex];

            if (!subtaskTemplate) {
              console.warn(`    ⚠️  Subtask template at index ${subtaskIndex} not found, skipping`);
              continue;
            }

            await db.query(
              `
              INSERT INTO subtasks (task_id, title, status, position)
              VALUES ($1, $2, $3, $4)
            `,
              [taskId, subtaskTemplate.title, subtaskTemplate.status, subtaskIndex]
            );
          }

          console.log(`    ├─ Task: ${taskTemplate.title} (${subtaskTemplates.length} subtasks)`);
        } else {
          console.log(`    ├─ Task: ${taskTemplate.title}`);
        }
      }

      console.log(`  ✅ Created ${boardTemplate.tasks.length} tasks`);
    }

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Summary:');
    console.log('   Demo Account:');
    console.log('   Email: demo@kanban.app');
    console.log('   Password: demo123');
    console.log(`   Boards: ${boardTemplates.length}`);
    console.log(
      `   Total Tasks: ${boardTemplates.reduce((sum, board) => sum + board.tasks.length, 0)}`
    );
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await db.disconnect();
  }
}

// Generate contextual subtasks based on task title and status
function generateSubtasks(
  taskTitle: string,
  column: string
): Array<{ title: string; status: string }> {
  const subtaskTemplates: Record<string, Array<{ title: string; status: string }>> = {
    'Learn TypeScript': [
      { title: 'Complete basic types tutorial', status: 'done' },
      { title: 'Practice with interfaces and classes', status: 'doing' },
      { title: 'Build small project with TypeScript', status: 'todo' },
    ],
    'Build Portfolio Website': [
      { title: 'Design wireframes and layout', status: 'todo' },
      { title: 'Set up Next.js project', status: 'todo' },
      { title: 'Deploy to Vercel', status: 'todo' },
    ],
    'Set up Home Office': [
      { title: 'Purchase ergonomic chair', status: 'done' },
      { title: 'Install proper lighting', status: 'done' },
    ],
    'Read "Clean Code"': [
      { title: 'Read chapters 1-5', status: 'done' },
      { title: 'Take notes on key principles', status: 'doing' },
      { title: 'Apply concepts to current project', status: 'todo' },
    ],
    'Complete Q4 Performance Review': [
      { title: 'Gather project accomplishments', status: 'doing' },
      { title: 'Request feedback from colleagues', status: 'todo' },
      { title: 'Schedule meeting with manager', status: 'todo' },
    ],
    'Implement New Feature': [
      { title: 'Write technical specification', status: 'done' },
      { title: 'Implement core functionality', status: 'doing' },
      { title: 'Write comprehensive tests', status: 'todo' },
    ],
    'Fix Production Bug': [
      { title: 'Reproduce bug in development', status: 'done' },
      { title: 'Implement fix and test', status: 'done' },
    ],
    'Plan Weekend Trip': [
      { title: 'Research destinations', status: 'done' },
      { title: 'Book accommodation', status: 'doing' },
      { title: 'Plan activities and restaurants', status: 'todo' },
    ],
    'Exercise Routine': [
      { title: 'Choose workout program', status: 'done' },
      { title: 'Schedule workout times', status: 'doing' },
      { title: 'Track progress weekly', status: 'todo' },
    ],
    'Cook New Recipe': [
      { title: 'Shop for ingredients', status: 'done' },
      { title: 'Prepare and cook meal', status: 'done' },
    ],
  };

  // Get specific subtasks for this task, or generate generic ones
  let subtasks = subtaskTemplates[taskTitle];

  if (!subtasks) {
    // Generate 2-3 generic subtasks based on column status
    const genericSubtasks = [
      { title: 'Research and planning', status: 'todo' },
      { title: 'Implementation phase', status: 'todo' },
      { title: 'Review and finalize', status: 'todo' },
    ];

    // Adjust status based on column
    if (column === 'Done') {
      genericSubtasks.forEach(subtask => (subtask.status = 'done'));
    } else if (column === 'In Progress') {
      if (genericSubtasks[0]) genericSubtasks[0].status = 'done';
      if (genericSubtasks[1]) genericSubtasks[1].status = 'doing';
    }

    subtasks = genericSubtasks.slice(0, Math.floor(Math.random() * 2) + 2); // 2-3 subtasks
  }

  return subtasks;
}

// Run the seeding
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('🌱 Seeding completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}
