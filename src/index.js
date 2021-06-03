const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;
    const customer = customers.find( customer => customer.cpf === cpf);
    if(!customer){
        return response
            .status(400)
            .json({error: "Customer not found"});
    }
    request.customer = customer;
    return next();
}


app.get('/', (request, response) => {
    return response.json({ok: 'true!'})
});

app.post('/account', (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some(
        customer => customer.cpf === cpf
    );

    if(customerAlreadyExists) {
        return response.status(400).json({
            error: "Customer already exists!"
        });
    }

    customers.push({
        id: uuidv4(),
        cpf,
        name,
        statement: []
    });
    return response.status(201).send();
});

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer.statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
   const { amount, description } = request.body;
   const { customer } = request;

   const statementOperation = {
        amount,
        description,    
        created_at: new Date(),
        type: 'credito'
    }
    customer.statement.push(statementOperation);
    return response.status(201).send();
});

app.listen('3333');