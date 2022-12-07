const inquirer = require('inquirer');
const table = require('console.table');


const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'employees'
    },
);

connection.connect((error) => {
    error ? console.log(error) : initialPrompt()
});

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
        const {selection} = answer;

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
            connection.end();
        };
    });
};

const viewAllDepartments = () => {
    const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
    connection.promise().query(sql, (error, response) => {
        (error) ? console.log(error) : console.table(response);
        initialPrompt();
    });
};



const viewAllRoles = () => {
    const sql =     `SELECT role.id, role.title, department.department_name AD department
                    FROM role
                    INNER JOIN department ON role.department_id = department.id`;
    connection.promise().query(sql, (error, response) => {
        (error) ? console.log(error) : response.forEach((role) => {console.log(role.title);});
        initialPrompt();
    });
};