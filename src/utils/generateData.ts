import type { Employee } from '../types/table.types';

const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Eva', 'Frank', 'Grace', 'Henry',
  'Ivy', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul',
  'Quinn', 'Rachel', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson',
  'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee',
];

const DEPARTMENTS = [
  'Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations',
  'Support', 'Design', 'Legal', 'Product',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateEmployees(count: number): Employee[] {
  const employees: Employee[] = [];

  for (let i = 1; i <= count; i++) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`;

    employees.push({
      id: i,
      name,
      email,
      department: pick(DEPARTMENTS),
      salary: Math.round(45000 + Math.random() * 85000),
      quantity: Math.floor(Math.random() * 500) + 1,
    });
  }

  return employees;
}
