const { prompt } = require('inquirer');
const mysql = require("mysql2");
require('console.table');
require('dotenv').config();

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.SQL_PASSWORD,
  database: "employees_db"
});

connection.connect(function (err) {
  if (err) throw err;
});

postConnection();

function postConnection() {
    console.log("***********************************")
    console.log("*                                 *")
    console.log("*        EMPLOYEE MANAGER         *")
    console.log("*                                 *")
    console.log("***********************************")
    initialPrompt();
};

function initialPrompt() {
    prompt({
        type: 'list',
        name: 'choice',
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
            const { choices } = answer;

            if (choices === "View all departments") {
                allDepartments();
            }

            if (choices === "View all roles") {
                allRoles();
            }

            if (choices === "View all employees") {
                allEmployees();
            }

            if (choices === "Add a department") {
                addDepartment();
            }

            if (choices === "Add a role") {
                addRole();
            }

            if (choices === "Add an employee") {
                addEmployee();
            }

            if (choices === "Update an employee role") {
                updateRole();
            }

            if (choices === "Quit") {
                connection.end();
            };
        });
};

allDepartments = () => {
    console.log('All departments \n');
    const sql = `SELECT department.id AS id, department.name AS department FROM department`;

    connection.promise().query(sql, (error, rows) => {
        if (error) throw error;
        console.table(rows);
        initialPrompt();
    });
};

allRoles = () => {
    console.log('All roles \n');
    const sql = `SELECT role.id, role.title, department.department_name AD department
                    FROM role
                    INNER JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (error, rows) => {
        if (error) throw error;
        console.table(rows);
        initialPrompt();
    });
};

allEmployees = () => {
    const sql = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AD department, role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager 
    FROM employee
    LEFT JOIN employee manager on manager.id = employee.manager_id
    INNER JOIN role ON (role.id = employee.role_id)
    INNER JOIN department ON (department.id = role.department_id)
    ORDER BY employee.id`;

    connection.promoise().query(sql, (error, rows) => {
        if (error) throw error;
        console.table(rows);
        initialPrompt();
    });
};

addDepartment = () => {
    prompt([
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

            connection.query(sql, answer.addDept, (error, result) => {
                if (error) throw error;
                console.log('Added ' + answer.addDept + 'to departments.');

                allDepartments();
            });

        });
};

addRole = () => {
    prompt([
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

            connection.promise().query(sqlRole, (error, data) => {
                if (error) throw error;

                const dept = data.map(({ name, id }) => ({ name: name, value: id }));

                prompt([
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

                        connection.query(sql, params, (error, results) => {
                            if (error) throw error;
                            console.log('Added ' + answer.role + ' to roles.');

                            allRoles();
                        });
                    });
            });
        });
};

addEmployee = () => {
    prompt([
        {
            type: 'input',
            name: 'firstName',
            message: "What is the employee's first name?",
            validate: addFirst => {
                return (addFirst ? true : console.log('Please enter the first name'));
            }
        },
        {
            type: 'input',
            name: 'surName',
            message: "What is the employee's last name?",
            validate: addSurname => {
                return (addSurname ? true : console.log('Please enter the last name'));
            }
        }
    ])
    .then(answer => {
        const params = [answer.firstName, answer.surName]

        const roleSql = `SELECT role.id, role.title FROM role`;

        connection.promise().query(roleSql, (error, data) => {
            if (error) throw error;

            const roles = data.map(({ id, title}) => ({ name: title, value: id }));

            prompt([
                {
                    type: 'list',
                    name: 'role',
                    message: "What's the employee's role?",
                    choices: roles
                }
            ])
            .then(roleChoice => {
                const role = roleChoice.role;
                params.push(role);

                const managerSql = `SELECT * FROM employee`;

                connection.promise().query(managerSql, (error, data) => {
                    if (error) throw error;

                    const managers = data.map(({ id, first_name, last_name }) => ({ name: first_name + " "+ last_name, value: id }));

                    prompt([
                        {
                            type: 'list',
                            name: 'manager',
                            message: "Who is this employee's manager?",
                            choices: managers
                        }
                    ])
                    .then(managerChoice => {
                        const manager = managerChoice.manager;
                        params.push(manager);

                        const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                        VALUES (?, ?, ?, ?)`;

                        connection.query(sql, params, (error, result) => {
                            if (error) throw error;
                            console.log("Employee added.")

                            allEmployees();
                        });
                    });
                });
            });
        });
    });
};

