const inquirer = require('inquirer');
const table = require('console.table');
const mysql = require('mysql2');


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employees_db'
    }
);

db.connect(error => {
    if (error) throw error;
    console.log('Connected as id ' + connection.threadId);
    postConnection();
  });

postConnection = () => {
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE MANAGER         *")
    console.log("*                                 *")
    console.log("***********************************")
    promptUser();
  };

const initialPrompt = () => {
    inquirer.prompt({
        name: 'initiate',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
            'View all departments',
            'View all roles',
            'View all employees',
            'Add a department',
            'Add a role',
            'Add an employee',
            'Update an employee role',
            'Quit'
        ]
    })
        .then(answer => {
            const { selection } = answer;

            if (selection === 'View all departments') {
                viewAllDepartments();
            }

            if (selection === 'View all roles') {
                viewAllRoles();
            }

            if (selection === 'View all employees') {
                viewAllEmployees();
            }

            if (selection === 'Add a department') {
                addDepartment();
            }

            if (selection === 'Add a role') {
                addRole();
            }

            if (selection === 'Add an employee') {
                addEmployee();
            }

            if (selection === 'Update an employee role') {
                updateRole();
            }

            if (selection === 'Quit') {
                db.end();
            };
        });
};

const viewAllDepartments = () => {
    console.log('All departments \n');
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;

    db.promise().query(sql, (error, rows) => {
        (error) ? console.log(error) : console.table(rows);
        initialPrompt();
    });
};

const viewAllRoles = () => {
    console.log('All roles \n');
    const sql = `SELECT role.id, role.title, department.department_name AD department
                    FROM role
                    INNER JOIN department ON role.department_id = department.id`;
    db.promise().query(sql, (error, rows) => {
        (error) ? console.log(error) : console.table(rows);
        initialPrompt();
    });
};

const viewAllEmployees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AD department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id`;

    db.promoise().query(sql, (error, rows) => {
        (error) ? console.log(error) : console.table(rows);
        initialPrompt();
    });
};

const addDepartment = () => {
    inquirer.prompt([
        {
            type: "input",
            name: "addDept",
            message: "Enter the department you wish to add.",
            validate: addDept => {
                return (addDept ? true : console.log('Please enter a department'));
            }
        }
    ])
        .then(answer => {
            const sql = `INSERT INTO department (name)
                    VALUES (?)`;

            db.query(sql, answer.addDept, (error, result) => {
                (error) ? error : console.log('Added ' + answer.addDept + 'to departments.');

                viewAllDepartments();
            });

        });
};

const addRole = () => {
    inquirer.prompt([
        {
            type: 'input',
            name: 'role',
            message: 'Enter role you wish to add.',
            validate: addRole => {
                return (addRole ? true : console.log('Please enter the role you want to add.'));
            }
        },
        {
            type: 'input',
            name: 'salary',
            message: 'Enter the salary for the role.',
            validate: addSalary => {
                return (isNaN(addSalary) ? true : console.log('Please enter a salary'));
            }
        }
    ])
        .then(answer => {
            const params = [answer.role, answer.salary];

            const sqlRole = `SELECT name, id FROM department`;

            db.promise().query(sqlRole, (error, data) => {
                if (error) throw error;

                const dept = data.map(({ name, id }) => ({ name: name, value: id }));

                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'dept',
                        message: 'What department is this role in?',
                        choices: dept
                    }
                ])
                    .then(deptChoices => {
                        const dept = deptChoices.dept;
                        params.push(dept);

                        const sql = `INSERT INTO role (title, salary, department_id)
                            VALUES (?, ?, ?)`;

                        db.query(sql, params, (error, results) => {
                            error ? error : console.log('Added ' + answer.role + ' to roles.');

                            viewAllRoles();
                        });
                    });
            });
        });
};